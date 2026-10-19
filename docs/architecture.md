# Architecture & Technical Overview

This document details the design choices, service communications, and integration points for the Marketplace Monorepo.

---

## High-Level Topology

```
                  +-----------------------------+
                  |     Customer Web Browser    |
                  +--------------+--------------+
                                 |
                     Port 3000   | (Vite Proxy: /api -> 4000)
                                 v
+------------------+     +-------------------+     +------------------+
|      market      |     |      backend      |     |      admin       |
|  React 19 + Vite |     |  Node.js Express  |     |   AdminJS v7     |
|   (Port 3000)    |     |    (Port 4000)    |     |   (Port 3001)    |
+------------------+     +---------+---------+     +---------+--------+
                                   |                         |
                                   +------------+------------+
                                                |
                                    (Prisma ORM Client)
                                                |
                                                v
                                  +---------------------------+
                                  |   PostgreSQL Database     |
                                  |    (psql marketplace)     |
                                  +---------------------------+
```

---

## Component Breakdown

### 1. `backend/` (Node.js REST Service)
- **Runtime**: Node.js (v20.19+ or v22.12+; required by Vite 8)
- **Framework**: Express.js
- **Module System**: ECMAScript Modules (`"type": "module"`)
- **Key Modules**:
  - `src/server.js`: Server lifecycle, CORS, body parsing, health checks, route mounting.
  - `src/controllers/productController.js`: Full-text search filtering, category sorting, product retrieval and creation.
  - `src/controllers/orderController.js`: Order creation and history.
  - `src/data/mockData.js`: Fallback catalog and order data used when database calls fail.

### 2. `admin/` (AdminJS Management Panel)
- **Framework**: AdminJS v7 + `@adminjs/express`
- **Port**: `3001`
- **Authentication**: `AdminJSExpress.buildAuthenticatedRouter`
- **Default Credentials**: `admin@marketplace.local` / `adminsecret`
- **Key Files**:
  - `src/server.js`: Express app mounting AdminJS router at `/admin`, with session cookies, healthcheck, and automatic root redirection.

### 3. `market/` (Storefront Frontend)
- **Framework**: React 19 bootstrapped with Vite
- **Port**: `3000`
- **Styling**: Vanilla CSS design tokens (`src/index.css`) featuring deep obsidian backgrounds, glassmorphism, glowing accents, and fluid responsiveness.
- **Key Features**:
  - Live search with instant filtering.
  - Category selection pills (All, Electronics, Audio, Wearables, Accessories, Smart Home).
  - Search relevance ranking, price ascending/descending, and name sorting.
  - Slide-out Cart Drawer with item increment/decrement and live subtotal calculations.
  - Checkout dispatching orders to backend `/api/orders`.
  - Resilience: Automatically falls back to seed data if backend is offline.

---

## Technical Debt & Recommended Next Steps

1. **Email Delivery**: Connect a mail provider so generated receipts are delivered to customers; the current backend writes receipt details to its log only.
2. **Recurring Billing (TODO)**: Checkout currently charges each order once. Add subscription records and a scheduled backend worker that charges a customer only when their subscription is active and due for renewal. Save a Stripe payment method with the customer's consent for off-session use, and make renewal charges idempotent. Handle payment failures/retries, cancellation, and Stripe webhook updates before enabling recurring charges. Consider Stripe Billing subscriptions to manage renewals and retries instead of implementing those rules in a custom worker.
3. **Customer Sessions**: Replace the demo account state with a server-backed session or token flow so sign-in persists safely across reloads.
