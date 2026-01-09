const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const existing = await prisma.user.findUnique({ where: { email: 'demo@local' } });
    if (existing) {
      console.log('Demo user already exists:', existing.id);
      process.exit(0);
    }

    const user = await prisma.user.create({ data: { email: 'demo@local', password: 'demo', name: 'Demo User' } });
    console.log('Created demo user with id:', user.id);
    process.exit(0);
  } catch (err) {
    console.error('Error creating demo user:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
