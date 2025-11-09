# Deploying the SocialSync Backend on Render

This guide walks through deploying the NestJS API + BullMQ scheduler to [Render](https://render.com). It assumes the codebase already lives in GitHub (or GitLab/Bitbucket) and your frontend is deployed separately (e.g., Vercel).

---

## 1. Collect configuration values
Refer to `backend/env.example` and decide on the real values you’ll use in production:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV=production` | Enables production mode |
| `JWT_SECRET` | Long random value used to sign access tokens |
| `FRONTEND_URLS` | Comma-separated list of trusted origins (e.g. `https://<vercel-app>.vercel.app,https://app.socialsync.com`) |
| `ENABLE_HTTP` | `true` for API service, `false` for worker-only instance |
| `ENABLE_SCHEDULER` | `true` where you want the BullMQ worker running |
| `DATABASE_URL` **or** `DB_*` vars | PostgreSQL connection |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Redis connection |
| OAuth secrets (Facebook/Twitter/LinkedIn) | populate when ready |
| `OPENAI_API_KEY` | only if AI endpoints stay enabled |

> **Tip:** Render lets you reference secrets from other services, so you can provision Postgres/Redis first and then pull their URLs straight into the Web Service config.

---

## 2. Provision managed Postgres
1. Render Dashboard → **New** → **PostgreSQL**.
2. Choose name, region (match your future web service), and instance size.
3. After creation, copy the `Internal Database URL` (or host/user/password fields). You can paste this into a note; we’ll link it to the backend service later.

---

## 3. Provision managed Redis
1. Render Dashboard → **New** → **Redis**.
2. Select the same region and pick the “Standard” tier so queue data survives restarts.
3. Note the connection details (`host`, `port`, `password`).

---

## 4. Deploy the API web service
1. Render Dashboard → **New** → **Web Service**.
2. Connect the Git repository and pick the `backend/` folder as the root.
3. Set build & start commands:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
4. Add `NODE_VERSION=18.20.8` (or simply `18`).
5. In *Environment* settings, add the variables from Step 1. Render can auto-populate `DATABASE_URL` and `REDIS_URL` if you choose “Add from service”.
6. Deploy. Render will install dependencies, run `nest build`, and start the server. Logs appear in the service dashboard.

> The API listens on `PORT` provided by Render automatically. No manual setting required—`main.ts` already respects it.

---

## 5. (Optional) Run scheduler in a separate worker
You can keep the scheduler inside the API process, or split it out for resiliency.

**Option A – Single service**
- Leave `ENABLE_HTTP=true` and `ENABLE_SCHEDULER=true`.
- One Render service handles both HTTP + queue processing.

**Option B – Separate worker**
1. Duplicate the web service (Render has a “Clone” button).
2. Rename to something like `socialsync-worker`.
3. Use the same build command.
4. Change the start command to `npm run start:prod` (same binary) but set environment:
   - `ENABLE_HTTP=false`
   - `ENABLE_SCHEDULER=true`
5. For the API service, set `ENABLE_SCHEDULER=false` so only the worker processes jobs.

When `ENABLE_HTTP=false`, the app skips `app.listen()` and initializes NestJS in “worker mode”, keeping BullMQ alive without exposing an HTTP port.

---

## 6. Update the frontend
- Point `VITE_API_URL` (and any other API endpoint variables) to the Render hostname, e.g. `https://socialsync-backend.onrender.com/api`.
- Redeploy the frontend (Vercel) so it picks up the new API base URL.

---

## 7. Smoke test
After deployment:

1. `GET https://<render-app>.onrender.com/api/auth/health` (or log in from the frontend) to confirm the API responds.
2. Create a test account, create/schedule a post. Watch Render logs to ensure BullMQ jobs enqueue and complete.
3. If you split API/worker, open the worker’s logs to check queue events.
4. Verify CORS by hitting the API from both local dev and the deployed frontend. Add any missing origins to `FRONTEND_URLS`.

---

## 8. Maintenance tips
- **Migrations:** When you switch to PostgreSQL, run `npm run migration:run` (via Render shell or a cron job) whenever you ship new migrations.
- **Secrets:** Rotate `JWT_SECRET` periodically; existing sessions will force users to log back in.
- **Monitoring:** Render exposes basic metrics. Consider adding application logging to an external service (e.g., Logtail, Datadog) for better observability.
- **Backups:** Enable automatic backups on the Postgres service for disaster recovery.

That’s it! Once the backend is live, your Vercel frontend should reach it over HTTPS, and scheduled posts will execute through the managed Redis queue.
