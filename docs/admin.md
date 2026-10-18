# AdminJS Portal Reference

The administration console is powered by **AdminJS v7** running on Express inside the `admin/` workspace.

---

## Accessing the Dashboard

- **URL**: [http://localhost:3001/admin](http://localhost:3001/admin)
- **Direct Redirect**: Visiting `http://localhost:3001/` automatically redirects to `/admin`.
- **Health Endpoint**: `http://localhost:3001/health`

### Default Credentials
| Parameter | Value | Config Variable |
|---|---|---|
| Email | `admin@marketplace.local` | `ADMIN_EMAIL` |
| Password | `adminsecret` | `ADMIN_PASSWORD` |
| Session Secret | *(dev key)* | `SESSION_SECRET` |

---

## Architecture & Server Configuration

The entry point is located in [admin/src/server.js](file:///Users/rabi/dev/marketplace/admin/src/server.js).

Key features:
1. **Authenticated Router**: Built using `AdminJSExpress.buildAuthenticatedRouter` with cookie session persistence.
2. **ES Modules**: Fully configured for Node.js native ESM (`"type": "module"`).
3. **Live Watch Mode**: Enabled during development via `admin.watch()` to bundle assets reactively.

---

## Active Database Integration (@adminjs/prisma)

The AdminJS portal is now **actively connected** to your PostgreSQL database (`psql marketplace`) using `@adminjs/prisma`.

The following models are registered in [admin/src/server.js](file:///Users/rabi/dev/marketplace/admin/src/server.js):
- `Category`
- `Product`
- `Order`
- `OrderItem`

You can browse, search, update, and manage records directly in the AdminJS UI on [http://localhost:3001/admin](http://localhost:3001/admin).


Register in `admin/src/server.js`:
```javascript
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';

AdminJS.registerAdapter({ Database, Resource });

const prisma = new PrismaClient();

const admin = new AdminJS({
  rootPath: '/admin',
  resources: [
    { resource: { model: prisma.product, client: prisma } },
    { resource: { model: prisma.order, client: prisma } },
  ],
});
```

### 2. Mongoose Adapter (MongoDB)
```bash
npm install @adminjs/mongoose mongoose --workspace=admin
```
```javascript
import AdminJS from 'adminjs';
import * as AdminJSMongoose from '@adminjs/mongoose';

AdminJS.registerAdapter(AdminJSMongoose);
```

### 3. TypeORM / SQL Adapter
```bash
npm install @adminjs/sql @adminjs/typeorm --workspace=admin
```

---

## Customizing Branding & Menus

You can customize branding in `admin/src/server.js`:

```javascript
const admin = new AdminJS({
  rootPath: '/admin',
  branding: {
    companyName: 'Your Marketplace Name',
    logo: '/custom-logo.svg',
    softwareBrothers: false,
    theme: {
      colors: {
        primary100: '#6366f1',
      },
    },
  },
  resources: [],
});
```
