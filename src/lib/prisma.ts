import { PrismaClient } from '@prisma/client';

// Safe Prisma provider: only instantiate Prisma when DATABASE_URL looks valid for supported providers.
// This prevents dev servers and serverless hosts without DB configured from crashing.
let prisma: PrismaClient | null = null;

try {
  const url = process.env.DATABASE_URL || '';
  const normalized = url.trim();
  const isSqlite = normalized.startsWith('file:');
  const isPg = normalized.startsWith('postgres') || normalized.startsWith('postgresql:');

  if (normalized && (isSqlite || isPg)) {
    prisma = new PrismaClient();
  } else {
    // No valid DATABASE_URL set; leave prisma null so callers can fallback
    console.warn('Prisma disabled: DATABASE_URL not set to sqlite or postgres. Falling back to demo/resilient behavior.');
  }
} catch (err) {
  console.warn('Failed to initialize Prisma client:', err);
  prisma = null;
}

export { prisma };
