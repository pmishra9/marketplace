import express from 'express';
import AdminJS from 'adminjs';
import * as AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/prisma';
import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const PORT = Number(process.env.ADMIN_PORT) || 3001;
const SESSION_SECRET = process.env.SESSION_SECRET || 'marketplace-admin-secret-session-key-dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@marketplace.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminsecret';

const startAdminServer = async () => {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));

  // Register Prisma Adapter
  AdminJS.registerAdapter({ Database, Resource });
  const prisma = new PrismaClient();

  // Load Prisma Models dynamically from DMMF
  const models = Prisma.dmmf?.datamodel?.models || [];
  const resources = models.map((model) => ({
    resource: new Resource({ model, client: prisma }),
    options: {
      navigation: { name: 'Marketplace DB' }
    }
  }));

  // AdminJS Configuration
  const admin = new AdminJS({
    rootPath: '/admin',
    branding: {
      companyName: 'Marketplace Admin',
      softwareBrothers: false,
      logo: false
    },
    resources
  });

  // Watch for asset changes in development
  if (process.env.NODE_ENV !== 'production') {
    admin.watch();
  }

  // Create session and authenticated router
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email, password) => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return { email, role: 'admin' };
        }
        return null;
      },
      cookieName: 'adminjs',
      cookiePassword: SESSION_SECRET
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      secret: SESSION_SECRET,
      cookie: {
        httpOnly: true,
        secure: false
      }
    }
  );

  app.use(admin.options.rootPath, adminRouter);

  // Redirect root to admin panel
  app.get('/', (_req, res) => {
    res.redirect('/admin');
  });

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'adminjs-portal',
      adminUrl: '/admin',
      database: 'postgresql://marketplace',
      resources: resources.map((r) => r.resource.id()),
      timestamp: new Date().toISOString()
    });
  });

  app.listen(PORT, () => {
    console.log(`🛡️  AdminJS Portal is running on http://localhost:${PORT}/admin`);
    console.log(`🔑 Default credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`📊 Registered models: ${resources.map((r) => r.resource.id()).join(', ')}`);
  });
};

startAdminServer().catch((err) => {
  console.error('Failed to start AdminJS server:', err);
  process.exit(1);
});
