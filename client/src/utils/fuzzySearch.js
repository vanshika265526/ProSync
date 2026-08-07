/**
 * Subsequence fuzzy matcher for the command palette.
 *
 * Deliberately not Fuse.js: the palette scores at most a few hundred items on
 * every keystroke, and a hand-rolled matcher keeps that under a millisecond
 * with no dependency and no index to rebuild.
 *
 * The scoring model rewards the things that make a match *feel* right:
 *   - an exact or prefix hit beats anything scattered
 *   - characters that land on word boundaries ("Invite Member" for "im")
 *   - runs of consecutive characters
 *   - shorter targets, so "Notes" outranks "Project Notes Archive" for "not"
 */

const WORD_BOUNDARY = /[\s\-_/.:]/;

/**
 * Score one candidate against a query.
 * @returns {{score: number, indices: number[]}|null} null when it doesn't match
 */
export const fuzzyMatch = (query, target) => {
    if (!query) return { score: 1, indices: [] };
    if (!target) return null;

    const q = query.toLowerCase().trim();
    const t = target.toLowerCase();

    // --- Fast paths, scored well above any scattered match ---
    if (t === q) return { score: 1000, indices: [...Array(target.length).keys()] };

    if (t.startsWith(q)) {
        return { score: 900 - target.length, indices: [...Array(q.length).keys()] };
    }

    const wordStart = t.indexOf(q);
    if (wordStart > 0 && WORD_BOUNDARY.test(t[wordStart - 1])) {
        return {
            score: 800 - target.length,
            indices: Array.from({ length: q.length }, (_, i) => wordStart + i),
        };
    }

    if (wordStart > 0) {
        return {
            score: 700 - target.length - wordStart,
            indices: Array.from({ length: q.length }, (_, i) => wordStart + i),
        };
    }

    // --- Subsequence walk ---
    const indices = [];
    let score = 0;
    let ti = 0;
    let consecutive = 0;

    for (let qi = 0; qi < q.length; qi++) {
        const char = q[qi];
        let found = -1;

        while (ti < t.length) {
            if (t[ti] === char) { found = ti; break; }
            ti++;
        }

        // A character with nowhere to go means this isn't a match at all.
        if (found === -1) return null;

        let charScore = 10;
        if (found === 0 || WORD_BOUNDARY.test(t[found - 1])) charScore += 25;   // word boundary
        if (indices.length && found === indices[indices.length - 1] + 1) {
            consecutive++;
            charScore += 15 + consecutive * 5;                                  // run bonus
        } else {
            consecutive = 0;
            // Penalise how far we had to skip, but never below zero.
            charScore -= Math.min(10, found - (indices[indices.length - 1] ?? -1) - 1);
        }

        score += charScore;
        indices.push(found);
        ti = found + 1;
    }

    // Prefer tighter targets when scores are otherwise close.
    score -= Math.min(30, target.length - q.length) * 0.5;

    return { score, indices };
};

/**
 * Score a candidate across several fields, keeping the best hit.
 * Later fields are weighted down so a title match always beats a subtitle one.
 */
export const fuzzyMatchFields = (query, fields = []) => {
    let best = null;

    fields.forEach((field, i) => {
        const result = fuzzyMatch(query, field);
        if (!result) return;
        const weighted = { ...result, score: result.score * (i === 0 ? 1 : 0.6), field: i };
        if (!best || weighted.score > best.score) best = weighted;
    });

    return best;
};

/**
 * Filter + rank a list.
 *
 * @param {string}   query
 * @param {Array}    items
 * @param {Function} getFields  item => string[] (most important first)
 * @param {Object}   [opts]
 * @param {number}   [opts.limit]
 */
export const fuzzyFilter = (query, items = [], getFields, { limit } = {}) => {
    if (!query) return limit ? items.slice(0, limit) : items;

    const scored = [];
    for (const item of items) {
        const match = fuzzyMatchFields(query, getFields(item).filter(Boolean));
        if (match) scored.push({ item, ...match });
    }

    scored.sort((a, b) => b.score - a.score);
    const ranked = scored.map(({ item, indices, score, field }) => ({
        ...item,
        _matchIndices: field === 0 ? indices : [],
        _matchScore: score,
    }));

    return limit ? ranked.slice(0, limit) : ranked;
};

/**
 * Split a string into highlighted / plain runs for rendering.
 * @returns {{text: string, match: boolean}[]}
 */
export const highlightSegments = (text = '', indices = []) => {
    if (!indices?.length) return [{ text, match: false }];

    const set = new Set(indices);
    const segments = [];
    let buffer = '';
    let bufferMatch = set.has(0);

    for (let i = 0; i < text.length; i++) {
        const isMatch = set.has(i);
        if (isMatch !== bufferMatch) {
            if (buffer) segments.push({ text: buffer, match: bufferMatch });
            buffer = '';
            bufferMatch = isMatch;
        }
        buffer += text[i];
    }
    if (buffer) segments.push({ text: buffer, match: bufferMatch });

    return segments;
};

export default fuzzyFilter;
