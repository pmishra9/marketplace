# Central Project Documentation

> **Source of Truth** for the Marketplace Monorepo architecture, workspace layout, and developer workflows.

---

## Workspace Structure

The project is structured as an npm workspaces monorepo containing three core packages:

| Workspace | Directory | Technology Stack | Default Port | Description |
|---|---|---|---|---|
| **backend** | `backend/` | Node.js, Express, ES Modules | `4000` | REST API service providing product catalog, categories, and order processing |
| **admin** | `admin/` | AdminJS v7, Express, Session Auth | `3001` | Management console with authentication, resource routing, and dashboard |
| **market** | `market/` | React 19, Vite, Vanilla CSS | `3000` | Customer-facing e-commerce storefront with reactive cart drawer and checkout |

---

## Documentation Index

- [Architecture & Data Flow](file:///Users/rabi/dev/marketplace/docs/architecture.md)
- [Root Workspace README](file:///Users/rabi/dev/marketplace/README.md)
- [Environment Configuration Guide](file:///Users/rabi/dev/marketplace/.env.example)

---

## Architectural Rules

1. **No Siloed READMEs**: Per project guidelines, sub-folders (`admin/`, `backend/`, `market/`) must **not** contain isolated READMEs. All documentation, technical debt, and setup guides live centrally in `/docs/` and the root `README.md`.
2. **ES Modules Standard**: Both backend and admin utilize native Node.js ES modules (`"type": "module"`).
3. **Graceful Fallbacks**: The frontend client (`market`) gracefully falls back to built-in seed catalog items if the backend server is offline or restarting.
4. **macOS Port Safety**: Default backend port is set to `4000` rather than `5000` to prevent collisions with the native macOS AirPlay Receiver (`ControlCenter`).

---

## Current Status & Next Milestones

- [x] Initial Monorepo scaffolding with npm workspaces
- [x] Express REST backend with search, categories, and orders
- [x] AdminJS v7 admin portal with authenticated router
- [x] React 19 + Vite storefront with reactive cart, category filters, and design system
- [ ] Database ORM integration (e.g. Prisma or Mongoose adapter for AdminJS & Backend)
- [ ] Production build and containerization (Docker Compose)
