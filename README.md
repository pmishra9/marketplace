# Marketplace Monorepo

> Full-stack e-commerce monorepo featuring a **Node.js Express REST Backend**, a **React 19 Marketplace Storefront**, and an **AdminJS Administration Portal** connected to **PostgreSQL**.

---

## ⚡ Quick Start

```bash
# 1. Install all dependencies across all workspaces
npm install

# 2. Reset & populate PostgreSQL with dummy data (psql marketplace)
npm run db:reset

# 3. Start all services concurrently
npm run dev
```

---

## 🖥️ Services & Local Endpoints

| Service | Workspace | Local Address | Default Port | Description |
|---|---|---|---|---|
| **Marketplace Storefront** | `market` | [http://localhost:3000](http://localhost:3000) | `3000` | Customer-facing React app with search & cart |
| **AdminJS Portal** | `admin` | [http://localhost:3001/admin](http://localhost:3001/admin) | `3001` | Management console (`admin@marketplace.local` / `adminsecret`) |
| **Backend REST API** | `backend` | [http://localhost:4000](http://localhost:4000) | `4000` | Node.js Express API with CORS and JSON endpoints |
| **PostgreSQL Database** | Root / Local | `localhost:5432` | `5432` | Database `marketplace` via Prisma ORM |

---

## 🗄️ Database Commands

| Command | Action |
|---|---|
| `npm run db:reset` | **Wipes & re-imports all dummy data** into `psql marketplace` |
| `npm run db:seed` | Imports dummy categories, products, and orders into PostgreSQL |
| `npm run db:push` | Pushes the Prisma schema to sync tables in PostgreSQL |
| `npm run db:generate` | Re-generates the `@prisma/client` code |

---

## 📚 Central Documentation Hub

All detailed guides and architectural references have been centralized under `/docs`:

| Guide | Link | Overview |
|---|---|---|
| **Storefront Specifications** | [docs/specs.md](file:///Users/rabi/dev/marketplace/docs/specs.md) | Required storefront feature checklist (search, variants, PDP, auth, checkout) |
| **Getting Started** | [docs/getting-started.md](file:///Users/rabi/dev/marketplace/docs/getting-started.md) | Prerequisites, environment files, single-workspace scripts, and build steps |
| **Architecture & Topology** | [docs/architecture.md](file:///Users/rabi/dev/marketplace/docs/architecture.md) | High-level data flow diagram, service interactions, and technical design |
| **Backend REST API** | [docs/api.md](file:///Users/rabi/dev/marketplace/docs/api.md) | Complete endpoint reference, query parameters, and JSON schemas |
| **AdminJS Portal** | [docs/admin.md](file:///Users/rabi/dev/marketplace/docs/admin.md) | Dashboard setup, credentials, session configuration, and ORM adapter guides |
| **Docs Index** | [docs/README.md](file:///Users/rabi/dev/marketplace/docs/README.md) | Central documentation directory and architectural rules |

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

---

## 📋 Changelog

### [1.3.0] - Storefront Feature Specifications & Checkout Flow
- **Specs & Documentation**: Linked [docs/specs.md](file:///Users/rabi/dev/marketplace/docs/specs.md) to [docs/README.md](file:///Users/rabi/dev/marketplace/docs/README.md) and root [README.md](file:///Users/rabi/dev/marketplace/README.md).
- **Search, Sort & Filters**: Added sorting by Relevance, Price Low-to-High, Price High-to-Low, and Name (A-Z). Added brand filters and discount-only toggle.
- **Product Display Page (PDP)**: Implemented dedicated modal PDP displaying high-res imagery, description, brand, interactive variant selector, quantity stepper, "Add to Cart", "Subscribe & Save 10%", and direct "Checkout Now" actions.
- **Authentication**: Added customer Sign Up & Sign In flows with session persistence and saved payment methods.
- **Checkout Flow**: Complete checkout screen featuring cart item variants, price breakdown with discounts, calculated sales tax, total due, saved payment method selection or new card entry, order confirmation prompt modal, and automated customer receipt email generation.

### [1.2.0] - PostgreSQL & Prisma Integration with Dummy Reset
- **Database**: Configured PostgreSQL (`psql marketplace`) via Prisma ORM.
- **Models**: Created `Category`, `Product`, `Order`, and `OrderItem` schemas in [backend/prisma/schema.prisma](file:///Users/rabi/dev/marketplace/backend/prisma/schema.prisma).
- **Dummy Import & Reset**: Built automated seed and reset script [backend/prisma/seed.js](file:///Users/rabi/dev/marketplace/backend/prisma/seed.js) with `npm run db:seed` and `npm run db:reset`.
- **Backend**: Updated product and order controllers to query and persist to PostgreSQL via `@prisma/client` with graceful fallbacks.
- **AdminJS**: Registered `@adminjs/prisma` adapter to auto-expose `Category`, `Product`, `Order`, and `OrderItem` in the AdminJS console.

### [1.1.0] - Modular Documentation Architecture
- **Docs**: Decoupled exhaustive documentation from root `README.md` into dedicated `/docs/` guides:
  - Added [docs/getting-started.md](file:///Users/rabi/dev/marketplace/docs/getting-started.md) for environment setup and scripts.
  - Added [docs/api.md](file:///Users/rabi/dev/marketplace/docs/api.md) for REST API specifications and contracts.
  - Added [docs/admin.md](file:///Users/rabi/dev/marketplace/docs/admin.md) for AdminJS configuration and ORM adapters.
  - Updated [docs/README.md](file:///Users/rabi/dev/marketplace/docs/README.md) as the primary documentation directory.
- **Root**: Streamlined root `README.md` to serve as a fast-glance landing page pointing to `/docs`.

### [1.0.0] - Initial Monorepo Scaffolding
- **Root**: Configured npm workspaces linking `backend`, `market`, and `admin` with concurrent run scripts.
- **Backend**: Built Express ES-module REST API with product catalog search, category filtering, and order handling on port 4000.
- **Admin**: Configured AdminJS v7 Express server with session authentication on port 3001.
- **Market**: Scaffolding of React 19 + Vite frontend featuring dark glassmorphic design system, responsive catalog grid, interactive cart drawer, and backend proxy.
