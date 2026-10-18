import { PrismaClient } from '@prisma/client';
import { categories, products, orders, users } from '../src/data/mockData.js';
import { hashPassword } from '../src/utils/passwords.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const prisma = new PrismaClient();

export async function resetAndSeedDatabase() {
  console.log('🔄 Resetting marketplace database tables...');

  try {
    // 1. Delete existing records in dependency order
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.savedPayment.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    console.log('🧹 Cleaned existing tables in database.');

    // 2. Seed Categories
    console.log('📦 Seeding categories...');
    for (const cat of categories) {
      await prisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          icon: cat.icon || null
        }
      });
    }

    // 3. Seed Products
    console.log('📦 Seeding products with variants and brands...');
    for (const prod of products) {
      await prisma.product.create({
        data: {
          id: prod.id,
          title: prod.title,
          brand: prod.brand || 'Nexus',
          description: prod.description,
          price: prod.price,
          originalPrice: prod.originalPrice || null,
          discountPercent: prod.discountPercent || 0,
          category: prod.category,
          rating: prod.rating || 5.0,
          reviewsCount: prod.reviewsCount || 0,
          stock: prod.stock || 0,
          badge: prod.badge || null,
          image: prod.image,
          variants: prod.variants || [],
          featured: prod.featured || false
        }
      });
    }

    // 4. Seed Users and Saved Payment Methods
    console.log('📦 Seeding sample users and payment methods...');
    for (const u of users) {
      const createdUser = await prisma.user.create({
        data: {
          id: u.id,
          name: u.name,
          username: u.username || u.email.split('@')[0].toLowerCase(),
          email: u.email,
          password: await hashPassword(u.password)
        }
      });

      if (u.savedPayments && u.savedPayments.length > 0) {
        for (const p of u.savedPayments) {
          await prisma.savedPayment.create({
            data: {
              id: p.id,
              userId: createdUser.id,
              cardBrand: p.cardBrand,
              last4: p.last4,
              cardholderName: p.cardholderName,
              expMonth: p.expMonth,
              expYear: p.expYear,
              isDefault: p.isDefault || false
            }
          });
        }
      }
    }

    const rabiPassword = await hashPassword('rabi');
    await prisma.user.upsert({
      where: { username: 'rabi' },
      update: {
        name: 'Rabi',
        email: 'rabi@marketplace.local',
        password: rabiPassword
      },
      create: {
        name: 'Rabi',
        username: 'rabi',
        email: 'rabi@marketplace.local',
        password: rabiPassword
      }
    });

    // 5. Seed Orders
    console.log('📦 Seeding orders...');
    for (const ord of orders) {
      const createdOrder = await prisma.order.create({
        data: {
          id: ord.id,
          customerName: ord.customerName,
          customerEmail: ord.customerEmail,
          subtotal: ord.subtotal || ord.totalAmount,
          discountAmount: ord.discountAmount || 0,
          taxAmount: ord.taxAmount || 0,
          totalAmount: ord.totalAmount,
          paymentMethod: ord.paymentMethod || 'card',
          cardLast4: ord.cardLast4 || '4242',
          isSubscription: ord.isSubscription || false,
          receiptEmailed: ord.receiptEmailed ?? true,
          status: ord.status || 'confirmed',
          createdAt: ord.createdAt ? new Date(ord.createdAt) : new Date()
        }
      });

      if (ord.items && ord.items.length > 0) {
        for (const item of ord.items) {
          await prisma.orderItem.create({
            data: {
              orderId: createdOrder.id,
              productId: item.productId,
              variant: item.variant || null,
              quantity: item.quantity,
              price: item.price
            }
          });
        }
      }
    }

    const counts = {
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      users: await prisma.user.count(),
      savedPayments: await prisma.savedPayment.count(),
      orders: await prisma.order.count(),
      orderItems: await prisma.orderItem.count()
    };

    console.log('\n✅ Marketplace database reset & seeded successfully:');
    console.table([
      { Table: 'Categories', Count: counts.categories },
      { Table: 'Products', Count: counts.products },
      { Table: 'Users', Count: counts.users },
      { Table: 'SavedPayments', Count: counts.savedPayments },
      { Table: 'Orders', Count: counts.orders },
      { Table: 'OrderItems', Count: counts.orderItems }
    ]);

    return counts;
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resetAndSeedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
