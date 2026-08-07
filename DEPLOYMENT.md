# Deploying ProSync

**Stack:** MongoDB Atlas (database) → Render (API) → Vercel (frontend).

The API can't go on Vercel. Socket.IO holds a connection open for the whole
session, and serverless functions are killed after each request — the Activity
Feed and Notification Center would silently fall back to polling. Render runs a
normal long-lived Node process, which is what the realtime layer needs.

Budget roughly 40 minutes end to end.

---

## Step 0 — Rotate your leaked credentials (do this first)

`server/.env` was committed in two early commits and is still readable in this
repo's git history, even though a later commit deleted the file. Anyone can run:

```bash
git show c477fc7:server/.env
```

Before you deploy, replace every value that was in it:

| Secret | Where to rotate |
| --- | --- |
| `MONGODB_URI` | Atlas → Database Access → Edit user → **Edit Password** → Autogenerate |
| `JWT_SECRET` | Generate a new one (below). This logs everyone out — that's the point. |
| `SMTP_PASS` | [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → revoke the old, create new |
| `GITHUB_TOKEN` | [github.com/settings/tokens](https://github.com/settings/tokens) → **Delete**, then generate a new one |

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Rotating is the fix. Scrubbing history with `git filter-repo` is optional
cleanup afterward — it can't help with copies people already cloned or forked.

---

## Step 1 — MongoDB Atlas

1. [cloud.mongodb.com](https://cloud.mongodb.com) → **Create** a free **M0** cluster.
2. **Database Access** → Add user. Use **Autogenerate Secure Password** and copy it.
3. **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`).
   Render's free tier has no static outbound IP, so an allowlist can't work here.
   The database is still protected by its username and password.
4. **Database → Connect → Drivers** and copy the connection string.

Insert your password and add a database name before the `?`:

```
mongodb+srv://prosync:PASSWORD@cluster0.abcde.mongodb.net/prosync?retryWrites=true&w=majority
```

> Without `/prosync`, Mongo silently writes to a database called `test`.
> If your password contains `@ # ? / : %`, URL-encode it (`@` → `%40`).

---

## Step 2 — Push your code

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

Confirm `.env` is **not** in that commit — `git status` should never list it.

---

## Step 3 — API on Render

[dashboard.render.com](https://dashboard.render.com) → **New → Web Service** → connect the repo.

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/healthz` |

Root Directory is the setting people miss. Leave it blank and Render builds the
repo root, finds no `server.js`, and fails.

Add these under **Environment** (leave `PORT` out — Render injects it):

```
NODE_ENV=production
MONGODB_URI=<your Atlas string from step 1>
JWT_SECRET=<your new secret from step 0>
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=<from Google Cloud Console>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your email>
SMTP_PASS=<your new app password>
GITHUB_TOKEN=<your new token>
GITHUB_SYNC_INTERVAL_MINUTES=3
```

`CLIENT_URL` is a placeholder for now — you don't have a Vercel URL yet. You'll
come back for it in step 5.

Deploy, then verify:

```bash
curl https://YOUR-SERVICE.onrender.com/healthz
# {"status":"ok","uptime":12.3,"timestamp":"..."}
```

The logs should show `Server running in production mode` and
`[Realtime] Socket.IO ready`. If the second line is missing, the realtime
features won't work — check that `socket.io` is in `server/package.json`
dependencies.

Copy your API URL. You need it next.

---

## Step 4 — Frontend on Vercel

[vercel.com/new](https://vercel.com/new) → import the repo.

| Setting | Value |
| --- | --- |
| Root Directory | `client` |
| Framework Preset | Vite |
| Build Command | `npm run build` *(auto)* |
| Output Directory | `dist` *(auto)* |

Environment Variables:

```
VITE_API_URL=https://YOUR-SERVICE.onrender.com
VITE_GOOGLE_CLIENT_ID=<same id as the server's GOOGLE_CLIENT_ID>
```

`VITE_API_URL` takes **no trailing slash and no `/api`** — the client appends
that itself. `https://api.onrender.com/` produces `//api/tasks`, which some
hosts redirect in a way that drops the `Authorization` header, and you get
confusing 401s.

Deploy, then copy your Vercel URL.

---

## Step 5 — Connect the two

Two settings still point at placeholders.

**Render** → Environment → set `CLIENT_URL` to your real Vercel URL:

```
CLIENT_URL=https://prosync-xxxx.vercel.app
```

This does double duty: it's the CORS allowlist *and* the base for invite links
in outgoing email. Get it wrong and either the app can't call the API, or
invite emails send people to a dead link. Save — Render restarts automatically.

**Google Cloud Console** → APIs & Services → Credentials → your OAuth client:

- **Authorized JavaScript origins:** `https://prosync-xxxx.vercel.app`
- **Authorized redirect URIs:** `https://prosync-xxxx.vercel.app`

Google rejects sign-in from any origin not listed here. Changes can take a few
minutes to propagate.

---

## Step 6 — Verify

Open your Vercel URL and walk through:

- [ ] Sign up, log out, log back in
- [ ] Sign in with Google
- [ ] Create a project and a task
- [ ] **History** tab shows "Created &lt;task&gt;"
- [ ] Bell shows a notification; the small dot on it is **green** (socket connected)
- [ ] Activity Feed says **Live**, not Offline
- [ ] `Ctrl/Cmd + K` opens the palette and finds your task
- [ ] Send yourself an invite — the link points at your Vercel domain, not localhost

The realtime check that actually proves it works: open the app in two browsers,
signed in as two members of the same project. Move a task in one; the other's
Activity Feed should update within a second, with no refresh.

---

## Troubleshooting

**CORS error in the console**
`CLIENT_URL` on Render doesn't exactly match your Vercel origin. It's an exact
string match — `https://` vs `http://`, and no trailing slash. For preview
deploys, set `ALLOW_VERCEL_PREVIEWS=true` instead of listing each one.

**Everything 404s**
`VITE_API_URL` is wrong or was added after the build. Vite bakes env vars into
the bundle at build time, so you must **redeploy** — restarting does nothing.
Check the Network tab: requests should go to `onrender.com`, not `localhost`.

**First load takes ~50 seconds**
Render's free tier spins the service down after 15 minutes idle. The next
request wakes it. Starter ($7/mo) stays always-on. A cron pinging `/healthz`
every 10 minutes works too, though it burns your free instance hours.

**Bell dot stays grey / feed says Offline**
The socket isn't connecting. REST still works, so the app is usable — it just
won't update live. Check Render logs for `[Realtime] Socket.IO ready` and
confirm `CLIENT_URL` is set; sockets use the same allowlist as REST.

**`MongooseServerSelectionError`**
Atlas Network Access isn't set to `0.0.0.0/0`, or the password in the URI is
wrong or not URL-encoded.

**Google sign-in: `origin_mismatch`**
Your Vercel URL isn't in the OAuth client's Authorized JavaScript origins.

**Invite emails not arriving**
Gmail needs an App Password, not your account password, and 2FA must be on.
Check spam.

---

## Costs

| | Free | Paid |
| --- | --- | --- |
| Atlas M0 | 512 MB, free forever | M10 ~$9/mo |
| Render | 512 MB, sleeps after 15 min | Starter $7/mo, always-on |
| Vercel | 100 GB bandwidth | Pro $20/mo |

Free works fine for a portfolio or demo. The one upgrade worth making first is
Render Starter — it removes the cold start, which is the only part of the free
tier a visitor actually notices.
