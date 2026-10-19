# Central Documentation Hub

> **Source of Truth** for the Marketplace Monorepo architecture, development workflows, API specifications, and operational guides.

---

## 📚 Documentation Directory

| Document | Topic | Description |
|---|---|---|
| [Storefront Specifications](specs.md) | Feature Requirements | Storefront functional specs: search, sorting, PDP, variants, auth, and checkout flow |
| [Getting Started](getting-started.md) | Setup & Installation | Prerequisites, dependency install, running dev servers, port mapping, and build steps |
| [Production Configuration](production-configuration.md) | Vercel + Render + Supabase | Production environment variables and how Vercel forwards storefront API calls to Render |
| [Production Deployment](production-deployment.md) | Render + Vercel + Supabase | Service creation, migrations, deploy commands, and smoke checks |
| [Architecture & Topology](architecture.md) | System Design | High-level data flow diagram, service interactions, and technical design |
| [Backend REST API](api.md) | API Specifications | Endpoints, query parameters, payloads, and response contracts for products & orders |
| [AdminJS Portal](admin.md) | Administration Panel | Credentials, session authentication, and database resource configuration |
| [Root Readme](../README.md) | Project Overview | Executive overview and quick-start summary |

---

## 🏢 Workspace Layout

The repository is organized into three primary workspaces managed via npm:

```
marketplace/
├── admin/                     # AdminJS portal (Port 3001)
├── backend/                   # Node.js Express REST API (Port 4000)
├── market/                    # React 19 + Vite Storefront (Port 3000)
└── docs/                      # Central documentation repository
```

---

## 🛡️ Architectural Principles

1. **Centralized Documentation (No Silos)**: All guides, API references, and architectural debt live in `/docs/` and the root `README.md`. Sub-folders (`backend/`, `market/`, `admin/`) do not contain individual READMEs.
2. **ES Modules Standard**: Both backend and admin utilize native Node.js ES modules (`"type": "module"`).
3. **Resilience & Fallbacks**: The storefront client (`market`) automatically falls back to local seed data if the backend server is offline or unreachable.
4. **macOS Port Isolation**: The backend uses port `4000` rather than `5000` to prevent collisions with the native macOS AirPlay Receiver (`ControlCenter`).
