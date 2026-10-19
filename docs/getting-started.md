# Getting Started Guide

This guide covers environment prerequisites, initial installation, running development servers, and common setup configurations.

For production environment settings and the Vercel-to-Render connection, see [Production Configuration](production-configuration.md). For deployment steps, see [Production Deployment](production-deployment.md).

---

## Prerequisites

- **Node.js**: v20.19.0+ or v22.12.0+ (required by Vite 8; Node 23 also works)
- **npm**: v8.0.0 or later

Verify versions in your terminal:
```bash
node -v
npm -v
```

---

## Installation

Install all dependencies across the entire monorepo (`backend`, `market`, and `admin`) with a single command from the repository root:

```bash
npm install
```

This leverages **npm workspaces** to link shared packages and handle hoisting automatically.

---

## Environment Setup

Backend and AdminJS each have an app-specific environment template. From the repository root, create their local environment files with:

```bash
cp -n backend/.env.example backend/.env
cp -n admin/.env.example admin/.env
cp -n market/.env.example market/.env
```

Edit each app's `.env` for its local settings. Keep these local files private; they are ignored by Git. The storefront's `VITE_API_BASE_URL` defaults to `/api`, which Vite proxies to the local backend during development and Vercel forwards to Render in production. It should not contain database credentials or other secrets.

### Key Defaults
| Setting | Variable | Default | Notes |
|---|---|---|---|
| Database Connection | `DATABASE_URL` | Set in `backend/.env` | Use the PostgreSQL role and password configured on your machine |
| Backend Port | `PORT` (in `backend/.env`) | `4000` | Avoids port 5000 (macOS AirPlay collision) |
| Admin Port | `ADMIN_PORT` (in `admin/.env`) | `3001` | Admin portal server |
| Admin User | `ADMIN_EMAIL` | `admin@marketplace.local` | Initial admin login |
| Admin Pass | `ADMIN_PASSWORD` | `adminsecret` | Initial admin password |
| Frontend Dev Port | Vite configuration | `3000` | Proxies `/api` calls to `:4000` |
| Frontend API Base | `VITE_API_BASE_URL` (in `market/.env`) | `/api` | Vite proxies this path to the backend |

---

## 🗄️ PostgreSQL Database & Dummy Import

The monorepo uses Prisma ORM connected to your local `marketplace` database (`psql marketplace`). Run the database commands in this section from `backend/`:

```bash
cd backend
```

If you have not already created `backend/.env`, copy it from `backend/.env.example`. Replace `USER` and `PASSWORD` in `DATABASE_URL` with your local PostgreSQL credentials. The template deliberately does not assume a machine-specific database role. Apply schema changes from checked-in migration files with `npm run db:migrate`.

The development customer login is `rabi` / `rabi`. After applying migrations, seed or refresh just this account with:

```bash
npm run db:migrate
npm run db:seed:auth
```

The full `npm run db:reset` flow also creates the account along with the sample catalog and orders.

### 1. Apply Database Migrations (`backend/`)
Apply checked-in Prisma schema changes to PostgreSQL:
```bash
npm run db:migrate
```

When changing `prisma/schema.prisma` during development, create a migration from `backend/` with a descriptive name:

```bash
npm run db:migrate:dev -- --name add_product_field
```

### 2. Import Dummy Data (Seed)
Populate the database with curated products, categories, and initial orders:
```bash
npm run db:seed
```

### 3. Reset Database (Wipe & Re-import Dummy Data)
At any point, completely wipe existing tables and re-populate with fresh seed data:
```bash
npm run db:reset
```


---

## Running the Applications

### 1. Run Everything Concurrently
Start all three applications (`backend`, `admin`, and `market`) together from the repository root. This command applies migrations first:

```bash
npm run dev
```

### 2. Run Services Individually

Start just the backend from the `backend/` directory. Apply migrations first when starting after a schema change:

```bash
cd backend
npm run db:migrate
npm run dev
```

The admin and storefront can be started from the repository root:

```bash
# Start AdminJS dashboard
npm run dev:admin

# Start React Marketplace frontend
npm run dev:market
```

---

## Port Allocation & Services

| Service | Workspace | Local Address |
|---|---|---|
| **Marketplace Storefront** | `market` | [http://localhost:3000](http://localhost:3000) |
| **AdminJS Portal** | `admin` | [http://localhost:3001/admin](http://localhost:3001/admin) |
| **Backend REST API** | `backend` | [http://localhost:4000](http://localhost:4000) |

---

## Production Builds

Build production bundles for all workspaces from the repository root:

```bash
npm run build
```

## Production

See [Production Configuration](production-configuration.md) for environment variables and service wiring, and [Production Deployment](production-deployment.md) for host setup and release commands. Production migrations must use `prisma migrate deploy`; do not use `db:migrate:dev` or `db:reset` against production data.
