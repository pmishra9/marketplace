import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/passwords.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const prisma = new PrismaClient();

try {
  const password = await hashPassword('rabi');
  const user = await prisma.user.upsert({
    where: { username: 'rabi' },
    update: {
      name: 'Rabi',
      email: 'rabi@marketplace.local',
      password
    },
    create: {
      name: 'Rabi',
      username: 'rabi',
      email: 'rabi@marketplace.local',
      password
    }
  });

  console.log(`Seeded customer account: ${user.username} (${user.email})`);
} finally {
  await prisma.$disconnect();
}
