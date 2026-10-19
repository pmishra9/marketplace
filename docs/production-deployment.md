# Production Deployment: Render, Vercel, and Supabase

This guide covers creating and deploying the Express API on Render, the Vite storefront on Vercel, and PostgreSQL on Supabase. For production environment variables and the Vercel-to-Render API connection, see [Production Configuration](production-configuration.md). The admin portal is not included in this deployment setup.

## 1. Create the Supabase production database

Create a Supabase project, then open **Connect** and copy its **Session pooler** connection string. Use the URI Supabase provides; the session pooler uses port `5432` and suits this long-running Render Node service and Prisma migrations. Keep the database password private. Supabase documents the Prisma connection options in its [Prisma guide](https://supabase.com/docs/guides/database/prisma) and [connection pooling guide](https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits).

The connection string will resemble this, but use the exact host and credentials from the dashboard:

```text
postgresql://postgres.<project-ref>:<database-password>@<session-pooler-host>:5432/postgres
```

The environment settings for Render and Vercel are in [Production Configuration](production-configuration.md). Only the Render backend needs database access; do not put `DATABASE_URL` in Vercel.

### Existing Supabase database

For a new, empty database, `prisma migrate deploy` applies the checked-in migrations. If adopting an existing database, first confirm which schema it has:

- If it has the original schema and no Prisma migration history, run `npx prisma migrate resolve --applied 20261018182000_init` once, then deploy migrations.
- If it was already synchronized to the latest schema with `prisma db push`, and you have verified that all migration changes are present (including `Order.shippingAddress`), mark all migrations as applied once:

  ```bash
  npx prisma migrate resolve --applied 20261018182000_init
  npx prisma migrate resolve --applied 20261018183000_marketplace_features
  npx prisma migrate resolve --applied 20261019120000_add_order_shipping_address
  ```

- If the database contains legacy orders without owners, run `npm run db:backfill:order-owners` before migration deployment. The migration matches remaining orders to accounts by email and fails if an owner is still unknown.

Run these adoption commands from `backend/` with `DATABASE_URL` set to the Supabase connection string. Do not use `db:reset` against a production database.

## 2. Deploy the backend to Render

Create a Render **Web Service** connected to this Git repository. Because this is an npm-workspaces monorepo and the lockfile is at the repository root, leave Render's **Root Directory** empty. Render runs commands from the repository root when no root directory is configured; see [Render monorepo support](https://render.com/docs/monorepo-support).

Set these service fields:

| Render setting | Value |
|---|---|
| Runtime | Node |
| Root Directory | Leave empty (repository root) |
| Build Command | `npm ci --include=dev` |
| Pre-Deploy Command | `npm run db:migrate --workspace=backend` |
| Start Command | `npm start --workspace=backend` |
| Health Check Path | `/api/health` |

Render recommends using a pre-deploy command for database migrations; see [Render deploy steps](https://render.com/docs/deploys). If the selected Render plan does not offer a pre-deploy command, run the same migration command once from a release job or CI step before the new backend version starts.

Configure the Render environment variables listed in [Production Configuration](production-configuration.md#configure-the-render-backend). Render provides `PORT` automatically, and the backend reads it. Render's [Node web-service setup](https://render.com/docs/deploy-node-express-app) and [environment-variable guide](https://render.com/docs/configure-environment-variables) describe these settings.

After the first successful deploy, note the API origin, for example `https://marketplace-api.onrender.com`.

## 3. Connect and deploy the Vercel storefront

Before deploying, connect Vercel to the Render API as described in [Production Configuration](production-configuration.md#connect-the-vercel-storefront-to-render). See Vercel's [external rewrites](https://vercel.com/docs/routing/rewrites) and [Vite SPA guidance](https://vercel.com/docs/frameworks/frontend/vite).

Create a Vercel project connected to the same repository and set:

| Vercel setting | Value |
|---|---|
| Root Directory | `market` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Enable **Include source files outside of the Root Directory in the Build Step** if shown, so the npm workspace manifest and root lockfile are available. Vercel documents monorepo root-directory settings in its [monorepo guide](https://vercel.com/docs/monorepos).

For Git-based deployment, merge or push the configured production branch and Vercel will build the project. To deploy with the CLI, run it from the repository root (Vercel's monorepo CLI flow expects the repository root):

```bash
npx vercel link --repo
npx vercel --prod
```

Choose the storefront Vercel project when prompted. Vercel's [CLI deploy guide](https://vercel.com/docs/cli/deploy) covers production deployments.

## 4. Verify the production services

Replace the placeholders with the deployed origins:

```bash
curl -fsS https://<render-service>.onrender.com/api/health
curl -fsS https://<vercel-domain>/api/health
curl -fsS https://<vercel-domain>/api/products
curl -fsSI https://<vercel-domain>/categories/audio
```

The first request checks Render directly; the next two check Vercel's API proxy; the final request checks Vercel's storefront route fallback.

## Subsequent production releases

1. Commit and push changes to the configured production branch.
2. Render installs from the repository root, runs `npm run db:migrate --workspace=backend` as its pre-deploy step, then starts `npm start --workspace=backend`.
3. Vercel builds the `market` project and publishes `dist`.

Use `prisma migrate dev` only to create migrations during development. Use `prisma migrate deploy` in production, and never run the seed/reset commands against production data.

## Payment configuration

Stripe Checkout is integrated, but payment remains unavailable until the Render service has Stripe keys and a configured webhook. See [Production Configuration](production-configuration.md#configure-the-render-backend). Complete checkout in Stripe test mode before switching to live keys; production charges are real payments.
