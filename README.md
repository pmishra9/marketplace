# Marketplace Monorepo

> A full-stack monorepo featuring a **NodeJS REST Backend**, a modern **React 19 Marketplace Storefront**, and an **AdminJS Management Portal**.

📖 **Central Documentation & Architecture**: See [docs/README.md](file:///Users/rabi/dev/marketplace/docs/README.md) and [docs/architecture.md](file:///Users/rabi/dev/marketplace/docs/architecture.md) for the source of truth.

---

## 🏗️ Repository Architecture

This repository uses **npm workspaces** with three core sub-projects:

```
marketplace/
├── admin/                     # AdminJS portal (Port 3001)
│   ├── src/
│   │   └── server.js          # AdminJS + Express server with authenticated router
│   ├── .env.example
│   └── package.json
│
├── backend/                   # Node.js Express REST API (Port 4000)
│   ├── src/
│   │   ├── controllers/       # Product and order business logic
│   │   ├── data/              # Mock catalog, categories & orders data
│   │   ├── routes/            # Express route definitions (/api/products, /api/orders)
│   │   └── server.js          # Express app entry point & middleware
│   ├── .env.example
│   └── package.json
│
├── market/                    # Marketplace React Storefront (Port 3000)
│   ├── src/
│   │   ├── App.jsx            # Interactive catalog, search, filters & cart drawer
│   │   ├── index.css          # Glassmorphism dark-theme design tokens
│   │   └── main.jsx           # React DOM root mounting
│   ├── index.html             # SEO meta tags, Google Fonts (Plus Jakarta Sans & Space Grotesk)
│   ├── vite.config.js         # Vite dev server with proxy to backend port 4000
│   └── package.json
│
├── docs/                      # Central documentation source of truth
│   ├── README.md              # Project principles and workspace roadmap
│   └── architecture.md        # Technical architecture and data flow diagrams
│
├── .env.example               # Unified environment variable template
├── package.json               # Root monorepo workspace configuration
└── README.md                  # This file
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+ (tested on Node 20 LTS and Node 23)
- **npm** v8+

### 2. Installation
Install all dependencies across all workspaces with a single command from the root directory:

```bash
npm install
```

### 3. Run Everything Concurrently
Launch all three services simultaneously (backend on `:4000`, admin on `:3001`, and frontend on `:3000`):

```bash
npm run dev
```

---

## 🖥️ Services & Endpoints

| Service | Workspace | URL | Default Port | Description |
|---|---|---|---|---|
| **Marketplace Frontend** | `market` | [http://localhost:3000](http://localhost:3000) | `3000` | E-commerce web app with search, category filtering & cart drawer |
| **AdminJS Portal** | `admin` | [http://localhost:3001/admin](http://localhost:3001/admin) | `3001` | Management dashboard for products and orders |
| **Node.js Backend** | `backend` | [http://localhost:4000](http://localhost:4000) | `4000` | REST API service with CORS, logging & JSON endpoints |

### Default AdminJS Credentials
- **URL**: [http://localhost:3001/admin](http://localhost:3001/admin)
- **Email**: `admin@marketplace.local`
- **Password**: `adminsecret`

*(Configurable via `admin/.env` or root `.env`)*

---

## 🛠️ Individual Workspace Scripts

You can run, test, or build individual packages from the root:

| Command | Action |
|---|---|
| `npm run dev:backend` | Starts the Express API with `node --watch` on port 4000 |
| `npm run dev:admin` | Starts the AdminJS portal on port 3001 |
| `npm run dev:market` | Starts the Vite React development server on port 3000 |
| `npm run build` | Builds all production bundles across workspaces |

---

## 📡 REST API Reference

The backend exposes the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and timestamp |
| `GET` | `/api/products` | Retrieve catalog with optional query filters (`?q=`, `?category=`, `?sort=`) |
| `GET` | `/api/products/:id` | Fetch product details by ID |
| `POST` | `/api/products` | Create a new product |
| `GET` | `/api/products/categories` | Retrieve available category taxonomy |
| `GET` | `/api/orders` | List existing orders |
| `POST` | `/api/orders` | Place a new customer order |

---

## 🔧 Environment Configuration

Copy the template files to configure your environment variables:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp admin/.env.example admin/.env
```

Key environment settings:
- `PORT` (backend): default `4000` *(avoiding macOS AirPlay port 5000)*
- `PORT` (admin): default `3001`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: Credentials for the AdminJS dashboard
- `SESSION_SECRET`: Secret key for session cookie encryption

---

## 📋 Changelog

### [1.0.0] - Initial Monorepo Scaffolding
- **Root**: Configured npm workspaces linking `backend`, `market`, and `admin` with concurrent run scripts.
- **Backend**: Built Express ES-module REST API with product catalog search, category filtering, and order handling on port 4000.
- **Admin**: Configured AdminJS v7 Express server with session authentication on port 3001.
- **Market**: Scaffolding of React 19 + Vite frontend featuring dark glassmorphic design system, responsive catalog grid, interactive cart drawer, and backend proxy.
- **Docs**: Created central documentation repository in `/docs/README.md` and `/docs/architecture.md` according to documentation protocol.
