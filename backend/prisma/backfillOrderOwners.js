import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { users as demoUsers } from '../src/data/mockData.js';
import { hashPassword } from '../src/utils/passwords.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const prisma = new PrismaClient();
const demoUsersByEmail = new Map(demoUsers.map((user) => [user.email.toLowerCase(), user]));

try {
  await prisma.$transaction(async (tx) => {
    const ownerlessOrders = await tx.$queryRaw`
      SELECT id, "customerEmail"
      FROM "Order"
      WHERE "userId" IS NULL
    `;
    const unrecognizedOrders = [];

    for (const order of ownerlessOrders) {
      const email = order.customerEmail.toLowerCase();
      const existingUsers = await tx.$queryRaw`
        SELECT id FROM "User" WHERE LOWER(email) = ${email} LIMIT 1
      `;
      if (existingUsers.length === 0 && !demoUsersByEmail.has(email)) {
        unrecognizedOrders.push(order.id);
      }
    }

    if (unrecognizedOrders.length > 0) {
      throw new Error(`Cannot assign owner to legacy orders with no matching account: ${unrecognizedOrders.join(', ')}`);
    }

    for (const user of demoUsers) {
      const existingUsers = await tx.$queryRaw`
        SELECT id FROM "User" WHERE LOWER(email) = ${user.email.toLowerCase()} LIMIT 1
      `;
      if (existingUsers.length > 0) continue;

      const usernameConflicts = await tx.$queryRaw`
        SELECT id FROM "User" WHERE LOWER(username) = ${user.username.toLowerCase()} LIMIT 1
      `;
      if (usernameConflicts.length > 0) {
        throw new Error(`Cannot create demo account ${user.username}: its username is already assigned to another account.`);
      }

      await tx.$executeRaw`
        INSERT INTO "User" (id, name, username, email, password, "createdAt", "updatedAt")
        VALUES (${`legacy-${randomUUID()}`}, ${user.name}, ${user.username.toLowerCase()}, ${user.email.toLowerCase()}, ${await hashPassword(user.password)}, NOW(), NOW())
      `;
    }

    await tx.$executeRaw`
      UPDATE "Order" AS orders
      SET "userId" = users.id
      FROM "User" AS users
      WHERE orders."userId" IS NULL
        AND LOWER(orders."customerEmail") = LOWER(users.email)
    `;

    const remainingOrders = await tx.$queryRaw`
      SELECT id FROM "Order" WHERE "userId" IS NULL
    `;
    if (remainingOrders.length > 0) {
      throw new Error(`Order owner backfill left unassigned orders: ${remainingOrders.map((order) => order.id).join(', ')}`);
    }
    console.log(`Assigned owners to ${ownerlessOrders.length} legacy order(s).`);
  });
} finally {
  await prisma.$disconnect();
}
