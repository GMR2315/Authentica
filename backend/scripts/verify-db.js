/**
 * Phase 3: Database verification script.
 * Lists public tables and confirms connection to Neon/PostgreSQL.
 * No business logic. Run after: npm run db:deploy && npm run db:generate
 */
import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function verify() {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log('Database connection: OK');
    console.log('Tables in public schema:', result.map((r) => r.tablename).join(', '));
    process.exit(0);
  } catch (err) {
    console.error('Database verification failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
