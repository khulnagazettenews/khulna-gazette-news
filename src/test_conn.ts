import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to CockroachDB...');
  const count = await prisma.news.count();
  console.log('SUCCESS! Total news in DB:', count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
