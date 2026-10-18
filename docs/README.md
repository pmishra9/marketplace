# Central Documentation Hub

> **Source of Truth** for the Marketplace Monorepo architecture, development workflows, API specifications, and operational guides.

---

## 📚 Documentation Directory

| Document | Topic | Description |
|---|---|---|
| [Getting Started](file:///Users/rabi/dev/marketplace/docs/getting-started.md) | Setup & Installation | Prerequisites, dependency install, running dev servers, port mapping, and build steps |
| [Architecture & Topology](file:///Users/rabi/dev/marketplace/docs/architecture.md) | System Design | High-level data flow diagram, service interactions, and tech stack rationale |
| [Backend REST API](file:///Users/rabi/dev/marketplace/docs/api.md) | API Specifications | Endpoints, query parameters, payloads, and response contracts for products & orders |
| [AdminJS Portal](file:///Users/rabi/dev/marketplace/docs/admin.md) | Administration Panel | Credentials, session authentication, and guide for connecting Prisma/Mongoose ORM adapters |
| [Root Readme](file:///Users/rabi/dev/marketplace/README.md) | Project Overview | Executive overview and quick-start summary |

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
