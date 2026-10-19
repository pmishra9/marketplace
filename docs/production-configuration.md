# Production Configuration: Vercel, Render, and Supabase

This page explains how to connect the Vercel storefront to the Render API and configure the production services. For the step-by-step service creation and deployment flow, see [Production Deployment](production-deployment.md).

## Request flow

```text
Browser → Vercel storefront (/api/* rewrite) → Render Express API → Supabase Postgres
```

The storefront calls relative paths such as `/api/products` and `/api/auth/signin`. Vercel forwards those requests to Render, so the browser uses the Vercel domain for both the website and API. The browser does not connect to Render or Supabase directly.

## Configure the Render backend

Create a Render Web Service for this repository. The detailed build, migration, and start commands are in [Production Deployment](production-deployment.md#2-deploy-the-backend-to-render).

Set these values in the Render service's **Environment** settings:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase session pooler connection URI, including `sslmode=require` |
| `JWT_SECRET` | A long, randomly generated secret |
| `STRIPE_SECRET_KEY` | Stripe secret API key (`sk_test_...` while testing, `sk_live_...` for live payments) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for this Render webhook endpoint |
| `STRIPE_CURRENCY` | `usd` |
| `STOREFRONT_URL` | Exact Vercel storefront origin, such as `https://marketplace.example.com` |
| `PORT` | Leave unset; Render supplies it |

Use Supabase's **Session pooler** connection string for the Render service. Copy the exact host, username, and port from **Supabase → Connect → Session pooler**; the shared session pooler uses port `5432` and a username in the form `postgres.<project-ref>`. Keep the database password private. Only Render needs `DATABASE_URL`; do not add it to Vercel or the browser bundle.

Generate a JWT secret locally with `openssl rand -base64 48`, then paste the output into Render's private environment settings. Remove any legacy `PAYMENT_MODE=mock` setting from Render.

Create a webhook endpoint in Stripe for `https://<render-service>.onrender.com/api/webhooks/stripe`. Subscribe it to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `checkout.session.expired`, then copy its signing secret into `STRIPE_WEBHOOK_SECRET`. For local development, use `stripe listen --forward-to localhost:4000/api/webhooks/stripe` and put the CLI's `whsec_...` value in `backend/.env`. Stripe's [webhook docs](https://docs.stripe.com/webhooks) describe endpoint setup and signature verification.

After Render deploys, note its service origin, for example `https://marketplace-api.onrender.com`. Do not include a trailing slash or `/api` in the origin itself.

## Connect the Vercel storefront to Render

The storefront reads `VITE_API_BASE_URL` and defaults it to `/api`. The local template at `market/.env.example` sets that same path. Keep `/api` in production: the Vercel rewrite in [`market/vercel.json`](../market/vercel.json) forwards those requests to Render. Vercel does not need this variable set because the app's default is `/api`. Do not set it to the Render origin; the browser should keep making same-origin requests to Vercel.

The checkout redirects customers to Stripe Checkout, then returns them to `/checkout?session_id=...`. The storefront preserves the cart during that redirect and asks the authenticated backend to confirm the payment. The backend also receives signed webhook events, so an order can be confirmed even if the customer closes the browser before returning. Use Stripe test keys and test cards until the test-mode flow and webhook are verified; switch both Stripe keys to live mode only when ready to accept real charges. Stripe's [Checkout guide](https://docs.stripe.com/checkout/quickstart?lang=node) covers the hosted payment page flow.

The existing storefront uses a flat 8.5% estimated tax, which this integration adds to checkout as a line item. It is not Stripe Tax or a jurisdiction-specific calculation. Configure and verify the tax treatment for the business before enabling live charges; see Stripe's [Checkout Tax guide](https://docs.stripe.com/tax/checkout).

Before deploying, replace `https://YOUR-RENDER-SERVICE.onrender.com` in that file with the actual Render service origin. Keep the `/api/:path*` suffix:

```json
{
  "source": "/api/:path*",
  "destination": "https://marketplace-api.onrender.com/api/:path*"
}
```

Use your own Render origin in place of the example. This rewrite forwards API requests while preserving their paths. The following rewrite sends storefront routes such as `/products/...` and `/categories/...` to the Vite app's `index.html`; keep it after the `/api` rule.

In Vercel, connect the same Git repository and configure the project:

| Vercel setting | Value |
|---|---|
| Root Directory | `market` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

If Vercel offers **Include source files outside of the Root Directory in the Build Step**, enable it so the root npm workspace manifest and lockfile are available. No database URL or backend secret belongs in Vercel.

The backend currently enables CORS for API requests. With the Vercel rewrite, storefront requests are same-origin from the browser, so the normal storefront flow does not require a separate Vercel CORS setting. If you later make the browser call the Render origin directly, configure the backend to allow the exact production Vercel origin before switching the client to that arrangement.

## Verify the connection

After both services deploy, check the API through both origins:

```bash
curl -fsS https://marketplace-api.onrender.com/api/health
curl -fsS https://<your-vercel-domain>/api/health
curl -fsS https://<your-vercel-domain>/api/products
```

The first request checks Render. The remaining requests verify that Vercel forwards API paths to Render. Replace the example domains with your deployed domains.

If the Render health check works but the Vercel `/api/health` request fails, check the destination in `market/vercel.json` and redeploy Vercel. If both API checks fail, inspect the Render deployment, environment variables, and logs.
