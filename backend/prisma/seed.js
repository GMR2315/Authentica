import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Optional seed: single admin (developer can also insert manually)
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'Admin123!';

async function main() {
  const existing = await prisma.admin.findUnique({
    where: { username: DEFAULT_ADMIN_USERNAME },
  });

  if (existing) {
    console.log('Admin already exists:', DEFAULT_ADMIN_USERNAME);
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await prisma.admin.create({
    data: {
      username: DEFAULT_ADMIN_USERNAME,
      password: hashedPassword,
    },
  });

  console.log('Created default admin:', DEFAULT_ADMIN_USERNAME, '(password: ' + DEFAULT_ADMIN_PASSWORD + ')');
  console.log('Change the password in production.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
