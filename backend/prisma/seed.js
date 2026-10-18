import { PrismaClient } from '@prisma/client';
import { categories, products, orders } from '../src/data/mockData.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Ensure .env is loaded from backend directory
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
    console.log('📦 Seeding products...');
    for (const prod of products) {
      await prisma.product.create({
        data: {
          id: prod.id,
          title: prod.title,
          description: prod.description,
          price: prod.price,
          originalPrice: prod.originalPrice || null,
          category: prod.category,
          rating: prod.rating || 5.0,
          reviewsCount: prod.reviewsCount || 0,
          stock: prod.stock || 0,
          badge: prod.badge || null,
          image: prod.image,
          featured: prod.featured || false
        }
      });
    }

    // 4. Seed Orders
    console.log('📦 Seeding orders...');
    for (const ord of orders) {
      const createdOrder = await prisma.order.create({
        data: {
          id: ord.id,
          customerName: ord.customerName,
          customerEmail: ord.customerEmail,
          totalAmount: ord.totalAmount,
          status: ord.status || 'pending',
          createdAt: ord.createdAt ? new Date(ord.createdAt) : new Date()
        }
      });

      if (ord.items && ord.items.length > 0) {
        for (const item of ord.items) {
          await prisma.orderItem.create({
            data: {
              orderId: createdOrder.id,
              productId: item.productId,
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
      orders: await prisma.order.count(),
      orderItems: await prisma.orderItem.count()
    };

    console.log('\n✅ Marketplace database reset & seeded successfully:');
    console.table([
      { Table: 'Categories', Count: counts.categories },
      { Table: 'Products', Count: counts.products },
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

// Execute if run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resetAndSeedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
