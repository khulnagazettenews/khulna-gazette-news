import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { news: true }
      }
    }
  });

  console.log('Categories in DB with news count:');
  categories.forEach(c => {
    console.log(`- ${c.name} (${c.slug}): ${c._count.news} news`);
  });

  const newsWithoutCategory = await prisma.news.count({
    where: { categoryId: { equals: '' } }
  });
  console.log('News without valid categoryId:', newsWithoutCategory);
}

main().catch(console.error).finally(() => prisma.$disconnect());
