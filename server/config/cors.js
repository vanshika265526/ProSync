/**
 * CORS allowlist shared by Express and Socket.IO.
 *
 * `CLIENT_URL` accepts a comma-separated list so you can run the local dev
 * server, a Vercel preview deployment and production against one API without
 * redeploying:
 *
 *   CLIENT_URL=https://prosync.vercel.app,http://localhost:5173
 *
 * In development the list is empty and everything is allowed, which keeps
 * `npm run dev` zero-config. In production an unlisted origin is refused.
 */

const parseList = (value) =>
    (value || '')
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean);

const allowlist = parseList(process.env.CLIENT_URL);

const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Vercel gives every branch and PR its own URL
 * (prosync-git-feature-you.vercel.app). Opting those in by pattern beats
 * pasting a new origin into the allowlist on every preview build.
 */
const VERCEL_PREVIEW = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const isAllowed = (origin) => {
    // Same-origin requests, curl, and server-to-server calls send no Origin.
    if (!origin) return true;

    const normalized = origin.replace(/\/+$/, '');

    if (allowlist.includes(normalized)) return true;

    // With nothing configured, don't lock the developer out of their own API.
    if (allowlist.length === 0 && !isProduction()) return true;

    if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && VERCEL_PREVIEW.test(normalized)) {
        return true;
    }

    return false;
};

/** Options object for the `cors` middleware. */
const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowed(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

/** Matching options for the Socket.IO server. */
const socketCorsOptions = {
    origin: (origin, callback) => {
        if (isAllowed(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST'],
};

/**
 * Where the browser app lives. Used to build invite and referral links, which
 * must point at the frontend, never at the API host.
 */
const clientUrl = () =>
    allowlist[0] || process.env.CLIENT_URL || 'http://localhost:5173';

module.exports = { corsOptions, socketCorsOptions, isAllowed, clientUrl, allowlist };
