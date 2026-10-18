# Getting Started Guide

This guide covers environment prerequisites, initial installation, running development servers, and common setup configurations.

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

Template environment files are provided for the root and each workspace:

```bash
# Optional root template
cp .env.example .env

# Backend configuration
cp backend/.env.example backend/.env

# AdminJS configuration
cp admin/.env.example admin/.env
```

### Key Defaults
| Setting | Variable | Default | Notes |
|---|---|---|---|
| Database Connection | `DATABASE_URL` | Set in `backend/.env` | Use the PostgreSQL role and password configured on your machine |
| Backend Port | `PORT` (in `backend/.env`) | `4000` | Avoids port 5000 (macOS AirPlay collision) |
| Admin Port | `ADMIN_PORT` (in `admin/.env`) | `3001` | Admin portal server |
| Admin User | `ADMIN_EMAIL` | `admin@marketplace.local` | Initial admin login |
| Admin Pass | `ADMIN_PASSWORD` | `adminsecret` | Initial admin password |
| Frontend Dev Port | Vite configuration | `3000` | Proxies `/api` calls to `:4000` |

---

## 🗄️ PostgreSQL Database & Dummy Import

The monorepo uses Prisma ORM connected to your local `marketplace` database (`psql marketplace`).

After copying `backend/.env.example`, replace `USER` and `PASSWORD` in `DATABASE_URL` with your local PostgreSQL credentials. The template deliberately does not assume a machine-specific database role.

The development customer login is `rabi` / `rabi`. After syncing the schema, seed or refresh just this account with:

```bash
npm run db:push
npm run db:seed:auth
```

The full `npm run db:reset` flow also creates the account along with the sample catalog and orders.

### 1. Initialize / Push Schema to DB
Synchronize the Prisma models (`Category`, `Product`, `Order`, `OrderItem`) to PostgreSQL:
```bash
npm run db:push
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
Start all three applications (`backend`, `admin`, and `market`) together:

```bash
npm run dev
```

### 2. Run Services Individually
You can start any individual service directly from the root:

```bash
# Start Node.js Express backend (watches for file changes)
npm run dev:backend

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

Build production bundles for all workspaces:

```bash
npm run build
```
