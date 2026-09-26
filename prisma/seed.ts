import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@khulnagazette.com' },
  });
  const hashedPassword = await bcrypt.hash('admin123', 10);
  let adminUser;
  if (!existingAdmin) {
    adminUser = await prisma.user.create({
      data: {
        name: 'সম্পাদক ও প্রকাশক',
        email: 'admin@khulnagazette.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        bio: 'খুলনা গেজেট-এর বার্তা সম্পাদক',
      },
    });
    console.log('Admin user created successfully.');
  } else {
    adminUser = await prisma.user.update({
      where: { email: 'admin@khulnagazette.com' },
      data: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });
    console.log('Admin user password updated successfully to admin123.');
  }

  // 2. Safe seed checks without deleting existing data

  // 3. Create Main Categories
  const mainCategoriesData = [
    { name: 'বাংলাদেশ', slug: 'bangladesh', order: 1 },
    { name: 'খুলনাঞ্চল', slug: 'khulnanchal', order: 2 },
    { name: 'রাজনীতি', slug: 'politics', order: 3 },
    { name: 'অর্থনীতি', slug: 'economy', order: 4 },
    { name: 'আন্তর্জাতিক', slug: 'international', order: 5 },
    { name: 'খেলা', slug: 'sports', order: 6 },
    { name: 'বিনোদন', slug: 'entertainment', order: 7 },
    { name: 'শিক্ষা', slug: 'education', order: 8 },
    { name: 'মুক্তভাবনা', slug: 'muktobhabna', order: 9 },
    { name: 'ইসলাম ও জীবন', slug: 'islam-and-life', order: 10 },
    { name: 'গেজেট এক্সক্লুসিভ', slug: 'gazette-exclusive', order: 11 },
    // আরও ক্যাটাগরি
    { name: 'আইটি', slug: 'it', order: 12 },
    { name: 'লাইফস্টাইল', slug: 'lifestyle', order: 13 },
    { name: 'চিকিৎসা', slug: 'health', order: 14 },
    { name: 'সাহিত্য', slug: 'literature', order: 15 },
    { name: 'চিত্রবিচিত্র', slug: 'weird-news', order: 16 },
    { name: 'সোশ্যাল মিডিয়া', slug: 'social-media', order: 17 },
  ];

  const categoriesMap: Record<string, string> = {};

  for (const cat of mainCategoriesData) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
      },
    });
    categoriesMap[cat.slug] = created.id;
  }
  console.log('Main categories created.');

  // 4. Create Subcategories under খুলনাঞ্চল (khulnanchal)
  const khulnanchalId = categoriesMap['khulnanchal'];
  const districts = [
    { name: 'খুলনা', slug: 'khulna', order: 1 },
    { name: 'কুষ্টিয়া', slug: 'kushtia', order: 2 },
    { name: 'চুয়াডাঙ্গা', slug: 'chuadanga', order: 3 },
    { name: 'ঝিনাইদহ', slug: 'jhenaidah', order: 4 },
    { name: 'নড়াইল', slug: 'narail', order: 5 },
    { name: 'বাগেরহাট', slug: 'bagerhat', order: 6 },
    { name: 'মাগুরা', slug: 'magura', order: 7 },
    { name: 'মেহেরপুর', slug: 'meherpur', order: 8 },
    { name: 'যশোর', slug: 'jessore', order: 9 },
    { name: 'সাতক্ষীরা', slug: 'satkhira', order: 10 },
  ];

  for (const dist of districts) {
    await prisma.category.create({
      data: {
        name: dist.name,
        slug: dist.slug,
        order: dist.order,
        parentId: khulnanchalId,
      },
    });
  }
  console.log('Districts categories created under খুলনাঞ্চল.');

  // 5. Create some Tags
  const tagsData = [
    { name: 'ব্রেকিং নিউজ', slug: 'breaking-news' },
    { name: 'নির্বাচন', slug: 'election' },
    { name: 'ফুটবল বিশ্বকাপ-২০২৬', slug: 'worldcup-2026' },
  ];
  for (const tag of tagsData) {
    await prisma.tag.create({
      data: tag,
    });
  }
  console.log('Tags created.');

  console.log('Mock News articles created.');

  // 7. Create Mock Prayer Times for today
  const today = new Date();
  await prisma.prayerTime.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      fajr: '০৪:১৫ মি.',
      sunrise: '০৫:৪০ মি.',
      zohr: '১২:১৫ মি.',
      asr: '০৪:৩০ মি.',
      magrib: '০৬:৫০ মি.',
      esha: '০৮:১৫ মি.',
    },
  });
  console.log('Mock prayer times seeded for today.');

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
