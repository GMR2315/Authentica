import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const globalForPrisma = globalThis;

/** @type {import('@prisma/client').PrismaClient} */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
