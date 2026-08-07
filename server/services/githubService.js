/**
 * githubService.js
 * ----------------
 * Thin, dependency-free wrapper around the GitHub REST API (v3).
 *
 * Auth: a single server-side Personal Access Token read from process.env.GITHUB_TOKEN.
 *       Without it the API still works but is capped at 60 requests/hour per IP,
 *       so we surface that clearly rather than failing mysteriously.
 *
 * Everything here returns plain, already-normalised objects shaped for our
 * Mongo schemas — controllers never see raw GitHub payloads.
 */

const GITHUB_API = 'https://api.github.com';
const USER_AGENT = 'ProSync-Integration';

// ---------------------------------------------------------------------------
// Tiny in-memory response cache. Keeps the polling engine from hammering the
// API when several projects point at the same repo.
// ---------------------------------------------------------------------------
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000;

const cacheGet = (key) => {
    const hit = cache.get(key);
    if (!hit) return null;
    if (Date.now() - hit.at > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    return hit.value;
};

const cacheSet = (key, value) => {
    cache.set(key, { value, at: Date.now() });
    // Cheap bound so a long-running process can't grow forever.
    if (cache.size > 500) {
        const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 100);
        oldest.forEach(([k]) => cache.delete(k));
    }
};

const clearCacheFor = (owner, repo) => {
    // Keys are `${method} ${path}`, so match on the path segment rather than
    // the start of the key.
    const needle = `/repos/${owner}/${repo}`;
    [...cache.keys()].forEach(k => { if (k.includes(needle)) cache.delete(k); });
};

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
class GitHubError extends Error {
    constructor(message, status, details) {
        super(message);
        this.name = 'GitHubError';
        this.status = status || 502;
        this.details = details;
    }
}

const hasToken = () => !!process.env.GITHUB_TOKEN;

// ---------------------------------------------------------------------------
// Core request
// ---------------------------------------------------------------------------
const request = async (path, { method = 'GET', useCache = true, raw = false } = {}) => {
    const cacheKey = `${method} ${path}`;
    if (method === 'GET' && useCache) {
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
    }

    const headers = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': USER_AGENT,
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    let response;
    try {
        response = await fetch(`${GITHUB_API}${path}`, { method, headers });
    } catch (err) {
        throw new GitHubError('Could not reach GitHub. Check your network connection.', 503, err.message);
    }

    if (response.status === 404) {
        throw new GitHubError('Not found on GitHub. Check the name and that the repository is public.', 404);
    }

    if (response.status === 401) {
        throw new GitHubError('GitHub rejected the configured token. Check GITHUB_TOKEN in server/.env.', 401);
    }

    if (response.status === 403 || response.status === 429) {
        const remaining = response.headers.get('x-ratelimit-remaining');
        const reset = response.headers.get('x-ratelimit-reset');
        if (remaining === '0') {
            const resetAt = reset ? new Date(Number(reset) * 1000) : null;
            const when = resetAt ? ` Resets at ${resetAt.toLocaleTimeString()}.` : '';
            const hint = hasToken()
                ? ''
                : ' Add a GITHUB_TOKEN to server/.env to raise the limit from 60 to 5,000 requests/hour.';
            throw new GitHubError(`GitHub rate limit reached.${when}${hint}`, 429);
        }
        throw new GitHubError('GitHub denied the request. The repository may be private.', 403);
    }

    // GitHub answers 409 for commit endpoints when the repository is empty or
    // the requested branch has no history. That's a legitimate state, not a
    // failure, so it gets its own flag for callers to handle.
    if (response.status === 409) {
        const err = new GitHubError(
            'This repository has no commits yet.',
            409
        );
        err.isEmptyRepository = true;
        throw err;
    }

    if (!response.ok) {
        let detail = '';
        try {
            const body = await response.json();
            detail = body?.message || '';
        } catch { /* body wasn't json — ignore */ }
        throw new GitHubError(detail || `GitHub request failed (${response.status}).`, response.status);
    }

    const payload = raw
        ? { data: await response.json(), headers: response.headers }
        : await response.json();

    if (method === 'GET' && useCache) cacheSet(cacheKey, payload);
    return payload;
};

// ---------------------------------------------------------------------------
// Input parsing
// ---------------------------------------------------------------------------

/** Accepts "owner/repo", a full/partial GitHub URL, or a .git clone URL. */
const parseRepoInput = (input) => {
    if (!input || typeof input !== 'string') return null;

    let value = input.trim();
    if (!value) return null;

    value = value
        .replace(/^git\+/, '')
        .replace(/^git@github\.com:/, '')
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/^github\.com\//, '')
        .replace(/\.git$/, '')
        .replace(/\/+$/, '');

    const [owner, repo] = value.split('/').filter(Boolean);
    if (!owner || !repo) return null;

    const valid = /^[\w.-]+$/;
    if (!valid.test(owner) || !valid.test(repo)) return null;

    return { owner, repo };
};

/** Accepts "42", "#42", or a full PR/issue URL. Returns a number or null. */
const parseNumberInput = (input) => {
    if (input === null || input === undefined) return null;
    const value = String(input).trim();
    if (!value) return null;

    const urlMatch = value.match(/github\.com\/[\w.-]+\/[\w.-]+\/(?:pull|issues)\/(\d+)/i);
    if (urlMatch) return Number(urlMatch[1]);

    const plain = value.replace(/^#/, '');
    if (/^\d+$/.test(plain)) return Number(plain);

    return null;
};

// ---------------------------------------------------------------------------
// Normalisers — raw GitHub payload -> our schema shape
// ---------------------------------------------------------------------------

const normalizeRepo = (r) => ({
    repositoryId: r.id,
    repositoryName: r.name,
    fullName: r.full_name,
    owner: r.owner?.login,
    repositoryUrl: r.html_url,
    description: r.description || '',
    defaultBranch: r.default_branch,
    avatar: r.owner?.avatar_url,
    visibility: r.private ? 'private' : 'public',
    isPrivate: !!r.private,
    language: r.language || '',
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    watchers: r.subscribers_count ?? r.watchers_count ?? 0,
    // GitHub's open_issues_count includes PRs; the controller corrects this
    // once it knows the real open-PR count.
    openIssues: r.open_issues_count ?? 0,
    repositoryUpdatedAt: r.pushed_at || r.updated_at,
});

const normalizePR = (pr) => ({
    number: pr.number,
    title: pr.title,
    url: pr.html_url,
    author: pr.user?.login,
    authorAvatar: pr.user?.avatar_url,
    state: pr.state,
    draft: !!pr.draft,
    merged: !!pr.merged_at,
    mergedAt: pr.merged_at || null,
    mergedBy: pr.merged_by?.login || null,
    branch: pr.head?.ref,
    baseBranch: pr.base?.ref,
    additions: pr.additions ?? null,
    deletions: pr.deletions ?? null,
    changedFiles: pr.changed_files ?? null,
    commits: pr.commits ?? null,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    closedAt: pr.closed_at || null,
});

const normalizeIssue = (issue) => ({
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    creator: issue.user?.login,
    creatorAvatar: issue.user?.avatar_url,
    state: issue.state,
    stateReason: issue.state_reason || '',
    labels: (issue.labels || []).map(l =>
        typeof l === 'string' ? { name: l, color: '888888' } : { name: l.name, color: l.color }
    ),
    assignee: issue.assignee?.login || null,
    assigneeAvatar: issue.assignee?.avatar_url || null,
    comments: issue.comments ?? 0,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    closedAt: issue.closed_at || null,
});

const normalizeCommit = (c) => ({
    sha: c.sha,
    message: (c.commit?.message || '').split('\n')[0],
    author: c.author?.login || c.commit?.author?.name || 'Unknown',
    authorAvatar: c.author?.avatar_url || null,
    url: c.html_url,
    date: c.commit?.author?.date || c.commit?.committer?.date,
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const getRepository = async (owner, repo, { useCache = true } = {}) => {
    const data = await request(`/repos/${owner}/${repo}`, { useCache });
    return normalizeRepo(data);
};

const getPullRequest = async (owner, repo, number, { useCache = true } = {}) => {
    const data = await request(`/repos/${owner}/${repo}/pulls/${number}`, { useCache });
    return normalizePR(data);
};

const getIssue = async (owner, repo, number, { useCache = true } = {}) => {
    const data = await request(`/repos/${owner}/${repo}/issues/${number}`, { useCache });
    // The issues endpoint also serves PRs; reject that so "Attach Issue" stays honest.
    if (data.pull_request) {
        throw new GitHubError(
            `#${number} is a pull request, not an issue. Use "Attach Pull Request" instead.`,
            400
        );
    }
    return normalizeIssue(data);
};

/** Commits on a branch (or the default branch when branch is omitted). */
const getCommits = async (owner, repo, { branch, perPage = 20, useCache = true } = {}) => {
    const params = new URLSearchParams({ per_page: String(perPage) });
    if (branch) params.set('sha', branch);
    try {
        const data = await request(`/repos/${owner}/${repo}/commits?${params}`, { useCache });
        return (Array.isArray(data) ? data : []).map(normalizeCommit);
    } catch (error) {
        // An empty repository has no commits — that's an empty list, not an error.
        if (error.isEmptyRepository) return [];
        throw error;
    }
};

/** Commits belonging to a specific pull request. */
const getPullRequestCommits = async (owner, repo, number, { useCache = true } = {}) => {
    try {
        const data = await request(`/repos/${owner}/${repo}/pulls/${number}/commits?per_page=50`, { useCache });
        return (Array.isArray(data) ? data : []).map(normalizeCommit);
    } catch (error) {
        if (error.isEmptyRepository) return [];
        throw error;
    }
};

/**
 * Counts that GitHub only exposes via pagination headers. We ask for a single
 * item per page and read the "last" link — one cheap request instead of walking
 * every page.
 */
const getTotalCount = async (path) => {
    const joiner = path.includes('?') ? '&' : '?';
    let data, headers;
    try {
        ({ data, headers } = await request(`${path}${joiner}per_page=1`, { raw: true }));
    } catch (error) {
        if (error.isEmptyRepository) return 0;
        throw error;
    }

    const link = headers.get('link');
    if (link) {
        const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
        if (match) return Number(match[1]);
    }
    return Array.isArray(data) ? data.length : 0;
};

const getPullRequestCounts = async (owner, repo) => {
    const [open, closed] = await Promise.all([
        getTotalCount(`/repos/${owner}/${repo}/pulls?state=open`),
        getTotalCount(`/repos/${owner}/${repo}/pulls?state=closed`),
    ]);
    return { open, closed };
};

const getContributorCount = (owner, repo) =>
    getTotalCount(`/repos/${owner}/${repo}/contributors?anon=1`);

const getCommitCount = (owner, repo, branch) => {
    const params = branch ? `?sha=${encodeURIComponent(branch)}` : '';
    return getTotalCount(`/repos/${owner}/${repo}/commits${params}`);
};

const getBranches = async (owner, repo) => {
    const data = await request(`/repos/${owner}/${repo}/branches?per_page=20`);
    return (Array.isArray(data) ? data : []).map(b => ({ name: b.name, sha: b.commit?.sha }));
};

const getReleases = async (owner, repo) => {
    const data = await request(`/repos/${owner}/${repo}/releases?per_page=5`);
    return (Array.isArray(data) ? data : []).map(r => ({
        name: r.name || r.tag_name,
        tag: r.tag_name,
        url: r.html_url,
        author: r.author?.login,
        authorAvatar: r.author?.avatar_url,
        publishedAt: r.published_at,
    }));
};

/** Recently updated PRs and issues, used to build the project activity feed. */
const getRecentPullRequests = async (owner, repo, { perPage = 15 } = {}) => {
    const data = await request(
        `/repos/${owner}/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=${perPage}`
    );
    return (Array.isArray(data) ? data : []).map(normalizePR);
};

const getRecentIssues = async (owner, repo, { perPage = 15 } = {}) => {
    const data = await request(
        `/repos/${owner}/${repo}/issues?state=all&sort=updated&direction=desc&per_page=${perPage}`
    );
    return (Array.isArray(data) ? data : [])
        .filter(i => !i.pull_request)
        .map(normalizeIssue);
};

/**
 * Builds the chronological repository feed (Feature 7) from several endpoints.
 * Failures in any one source are swallowed so a single 403 doesn't blank the feed.
 */
const buildActivityFeed = async (owner, repo, defaultBranch) => {
    const settle = (p) => p.then(v => v).catch(() => []);

    const [commits, pulls, issues, releases, branches] = await Promise.all([
        settle(getCommits(owner, repo, { branch: defaultBranch, perPage: 15 })),
        settle(getRecentPullRequests(owner, repo)),
        settle(getRecentIssues(owner, repo)),
        settle(getReleases(owner, repo)),
        settle(getBranches(owner, repo)),
    ]);

    const events = [];

    commits.forEach(c => events.push({
        type: 'commit',
        action: 'pushed',
        title: c.message,
        actor: c.author,
        actorAvatar: c.authorAvatar,
        url: c.url,
        sha: c.sha,
        timestamp: c.date,
    }));

    pulls.forEach(pr => {
        const merged = pr.merged;
        const closed = pr.state === 'closed';
        events.push({
            type: 'pull_request',
            action: merged ? 'merged' : closed ? 'closed' : 'opened',
            title: pr.title,
            number: pr.number,
            actor: merged ? (pr.mergedBy || pr.author) : pr.author,
            actorAvatar: pr.authorAvatar,
            url: pr.url,
            timestamp: pr.mergedAt || pr.closedAt || pr.createdAt,
        });
    });

    issues.forEach(issue => events.push({
        type: 'issue',
        action: issue.state === 'closed' ? 'closed' : 'opened',
        title: issue.title,
        number: issue.number,
        actor: issue.creator,
        actorAvatar: issue.creatorAvatar,
        url: issue.url,
        timestamp: issue.closedAt || issue.createdAt,
    }));

    releases.forEach(r => events.push({
        type: 'release',
        action: 'created',
        title: r.name,
        actor: r.author,
        actorAvatar: r.authorAvatar,
        url: r.url,
        timestamp: r.publishedAt,
    }));

    // Branches carry no timestamp of their own, so we only surface the newest few
    // alongside their tip commit date when we happen to have it.
    branches.slice(0, 5).forEach(b => {
        if (b.name === defaultBranch) return;
        events.push({
            type: 'branch',
            action: 'created',
            title: b.name,
            url: `https://github.com/${owner}/${repo}/tree/${b.name}`,
            timestamp: null,
        });
    });

    return events
        .filter(e => e.timestamp)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 40);
};

/**
 * One-shot snapshot used by connect + the polling engine.
 * Counter lookups are best-effort so a rate-limited count never fails the sync.
 */
const getRepositorySnapshot = async (owner, repo, { useCache = false } = {}) => {
    const info = await getRepository(owner, repo, { useCache });

    const settle = (p, fallback) => p.then(v => v).catch(() => fallback);

    const [prCounts, contributors, totalCommits, commits] = await Promise.all([
        settle(getPullRequestCounts(owner, repo), { open: 0, closed: 0 }),
        settle(getContributorCount(owner, repo), 0),
        settle(getCommitCount(owner, repo, info.defaultBranch), 0),
        settle(getCommits(owner, repo, { branch: info.defaultBranch, perPage: 1, useCache }), []),
    ]);

    return {
        ...info,
        // open_issues_count from GitHub bundles PRs in — subtract them back out.
        openIssues: Math.max(0, info.openIssues - prCounts.open),
        openPullRequests: prCounts.open,
        closedPullRequests: prCounts.closed,
        contributors,
        totalCommits,
        lastCommit: commits[0] || null,
    };
};

module.exports = {
    GitHubError,
    hasToken,
    parseRepoInput,
    parseNumberInput,
    clearCacheFor,

    getRepository,
    getRepositorySnapshot,
    getPullRequest,
    getIssue,
    getCommits,
    getPullRequestCommits,
    getPullRequestCounts,
    getContributorCount,
    getCommitCount,
    getBranches,
    getReleases,
    getRecentPullRequests,
    getRecentIssues,
    buildActivityFeed,
};
