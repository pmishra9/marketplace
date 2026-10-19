# Marketplace Monorepo

> Full-stack e-commerce monorepo featuring a **Node.js Express REST Backend**, a **React 19 Marketplace Storefront**, and an **AdminJS Administration Portal** connected to **PostgreSQL**.

---

## ⚡ Quick Start

```bash
# 1. Install all dependencies across all workspaces
npm install

# 2. Configure app-specific local environment files and PostgreSQL credentials
cp -n backend/.env.example backend/.env
cp -n admin/.env.example admin/.env
cp -n market/.env.example market/.env
# Edit DATABASE_URL in both files for your local PostgreSQL role; set a private JWT_SECRET in backend/.env

# 3. Reset & populate a fresh local demo database
npm run db:reset

# 4. Start all services (pending migrations are applied first)
npm run dev
```

`npm run db:reset` deletes the existing contents of the configured database before seeding it.

---

## 🖥️ Services & Local Endpoints

| Service | Workspace | Local Address | Default Port | Description |
|---|---|---|---|---|
| **Marketplace Storefront** | `market` | [http://localhost:3000](http://localhost:3000) | `3000` | Customer-facing React app with search & cart |
| **AdminJS Portal** | `admin` | [http://localhost:3001/admin](http://localhost:3001/admin) | `3001` | Management console (`admin@marketplace.local` / `adminsecret`) |
| **Backend REST API** | `backend` | [http://localhost:4000](http://localhost:4000) | `4000` | Node.js Express API with CORS and JSON endpoints |
| **PostgreSQL Database** | Root / Local | `localhost:5432` | `5432` | Database `marketplace` via Prisma ORM |

### Storefront URLs

| Page | URL pattern | Example |
|---|---|---|
| Home / all products | `/` | `http://localhost:3000/` |
| Category | `/categories/:categorySlug` | `http://localhost:3000/categories/audio` |
| Product | `/products/:productId/:productSlug` | `http://localhost:3000/products/prod-001/aura-pro-wireless-anc-headphones` |
| Checkout | `/checkout` | `http://localhost:3000/checkout` |

Category selection, product detail links, and checkout update the browser URL. These paths can be opened directly and support browser back/forward navigation.

---

## 🗄️ Database Commands

| Command | Action |
|---|---|
| `npm run db:reset` | **Wipes & re-imports all dummy data** into `psql marketplace` |
| `npm run db:seed` | Imports dummy categories, products, and orders into PostgreSQL |
| `npm run db:seed:auth` | Adds or refreshes the development customer login without resetting other data |
| `npm run db:migrate` | Applies checked-in Prisma migrations to PostgreSQL |
| `npm run db:migrate:dev` | Creates a migration from schema changes during development |
| `npm run db:generate` | Re-generates the `@prisma/client` code |

The development-only customer credentials are **username:** `rabi`, **password:** `rabi`. Run `npm run db:migrate` and then `npm run db:seed:auth` to update an existing database; `npm run db:reset` also includes this user. Sign-up and sign-in return a seven-day JWT access token; protected API requests use `Authorization: Bearer <token>`. Set `JWT_SECRET` to a strong random value outside local development. Signing out increments the user's token version and invalidates existing tokens.

Product reviews are available on product pages after a signed-in customer has a confirmed, shipped, delivered, or completed order for that product. Each customer can post one review per product. Reviews are stored and shown individually; product rating aggregates are not recalculated yet. Product UPC values are optional, unique 12-digit UPC-A codes with a verified check digit.

Orders must belong to a signed-in customer. The database requires every order to reference a user.
For an existing database with no Prisma migration history that still has the original schema, mark the baseline as applied once with `npx prisma migrate resolve --applied 20261018182000_init --schema backend/prisma/schema.prisma`, then run `npm run db:migrate`. The feature migration links orders to existing accounts by email and stops safely if any owner remains unknown; for known demo fixtures, run `npm run db:backfill:order-owners` first. If `db push` already synchronized the complete schema, including `Order.shippingAddress`, mark all three migrations as applied before running `npm run db:migrate`. `npm run db:reset` recreates the schema and seeds orders with owners; it deletes existing database contents.

Checkout redirects to Stripe Checkout for payment and shipping details. Configure Stripe test keys and a webhook signing secret in `backend/.env` for local testing; the backend does not receive or store card numbers or CVCs.

---

## 📚 Central Documentation Hub

All detailed guides and architectural references have been centralized under `/docs`:

| Guide | Link | Overview |
|---|---|---|
| **Storefront Specifications** | [docs/specs.md](docs/specs.md) | Required storefront feature checklist (search, variants, PDP, auth, checkout) |
| **Getting Started** | [docs/getting-started.md](docs/getting-started.md) | Prerequisites, environment files, single-workspace scripts, and build steps |
| **Production Configuration** | [docs/production-configuration.md](docs/production-configuration.md) | Environment variables and Vercel-to-Render API wiring |
| **Production Deployment** | [docs/production-deployment.md](docs/production-deployment.md) | Service setup, migrations, deploy commands, and smoke checks |
| **Architecture & Topology** | [docs/architecture.md](docs/architecture.md) | High-level data flow diagram, service interactions, and technical design |
| **Backend REST API** | [docs/api.md](docs/api.md) | Complete endpoint reference, query parameters, and JSON schemas |
| **AdminJS Portal** | [docs/admin.md](docs/admin.md) | Dashboard setup, credentials, session configuration, and ORM adapter guides |
| **Docs Index** | [docs/README.md](docs/README.md) | Central documentation directory and architectural rules |

---

## 🛠️ Workspaces Overview

```
marketplace/
├── admin/                     # AdminJS portal with PostgreSQL models (Port 3001)
├── backend/                   # Node.js Express REST API & Prisma (Port 4000)
├── market/                    # React 19 + Vite Storefront (Port 3000)
└── docs/                      # Central documentation hub
```

Individual service scripts (can be executed from the root directory):
- `npm run dev:backend` — Starts the backend API
- `npm run dev:admin` — Starts the AdminJS portal
- `npm run dev:market` — Starts the Vite React frontend
- `npm run build` — Compiles production bundles

For local startup, run `npm run dev`; it applies pending migrations before starting the services. To start only the backend, use `npm run db:migrate && npm run dev:backend`.

---

## 📋 Changelog

### [1.3.0] - Storefront Feature Specifications & Checkout Flow
- **Specs & Documentation**: Linked [docs/specs.md](docs/specs.md) to [docs/README.md](docs/README.md) and root [README.md](README.md).
- **Search, Sort & Filters**: Added sorting by Relevance, Price Low-to-High, Price High-to-Low, and Name (A-Z). Added brand filters and discount-only toggle.
- **Product Display Page (PDP)**: Implemented dedicated modal PDP displaying high-res imagery, description, brand, interactive variant selector, quantity stepper, "Add to Cart", "Subscribe & Save 10%", and direct "Checkout Now" actions.
- **Authentication**: Added customer Sign Up & Sign In flows and JWT sessions.
- **Checkout Flow**: Uses Stripe-hosted Checkout, with server-priced items, pending orders, signed webhooks, and an authenticated payment-return check. Receipt delivery is currently simulated by writing the receipt to the backend log; configure an email provider before claiming email delivery.

### [1.2.0] - PostgreSQL & Prisma Integration with Dummy Reset
- **Database**: Configured PostgreSQL (`psql marketplace`) via Prisma ORM.
- **Models**: Created `Category`, `Product`, `Order`, and `OrderItem` schemas in [backend/prisma/schema.prisma](backend/prisma/schema.prisma).
- **Dummy Import & Reset**: Built automated seed and reset script [backend/prisma/seed.js](backend/prisma/seed.js) with `npm run db:seed` and `npm run db:reset`.
- **Backend**: Updated product and order controllers to query and persist to PostgreSQL via `@prisma/client` with graceful fallbacks.
- **AdminJS**: Registered `@adminjs/prisma` adapter to auto-expose `Category`, `Product`, `Order`, and `OrderItem` in the AdminJS console.

### [1.1.0] - Modular Documentation Architecture
- **Docs**: Decoupled exhaustive documentation from root `README.md` into dedicated `/docs/` guides:
  - Added [docs/getting-started.md](docs/getting-started.md) for environment setup and scripts.
  - Added [docs/api.md](docs/api.md) for REST API specifications and contracts.
  - Added [docs/admin.md](docs/admin.md) for AdminJS configuration and ORM adapters.
  - Updated [docs/README.md](docs/README.md) as the primary documentation directory.
- **Root**: Streamlined root `README.md` to serve as a fast-glance landing page pointing to `/docs`.

### [1.0.0] - Initial Monorepo Scaffolding
- **Root**: Configured npm workspaces linking `backend`, `market`, and `admin` with concurrent run scripts.
- **Backend**: Built Express ES-module REST API with product catalog search, category filtering, and order handling on port 4000.
- **Admin**: Configured AdminJS v7 Express server with session authentication on port 3001.
- **Market**: Scaffolding of React 19 + Vite frontend featuring dark glassmorphic design system, responsive catalog grid, interactive cart drawer, and backend proxy.
