import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Super Admin User
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@khulnagazette.com' },
  });

  let adminUser;
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
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
    adminUser = existingAdmin;
    console.log('Admin user already exists.');
  }

  // 2. Clear news first (due to foreign key constraints), then other collections
  await prisma.comment.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  await prisma.category.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.prayerTime.deleteMany({});

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

  // 6. Create Mock News Articles
  const bangladeshId = categoriesMap['bangladesh'];
  const politicsId = categoriesMap['politics'];
  const gazetteExclusiveId = categoriesMap['gazette-exclusive'];

  // Let's create a breaking news, featured news, and normal news
  await prisma.news.create({
    data: {
      title: 'খুলনায় নতুন উদ্যোক্তা ও শিল্পায়নের সম্ভাবনা বাড়ছে',
      subtitle: 'বিভাগীয় ব্যবসা-বাণিজ্যে আশার আলো',
      slug: 'khulna-entrepreneurs-growth-possibility',
      content: '<p>খুলনাঞ্চল জুড়ে কুটির, ক্ষুদ্র ও মাঝারি শিল্পের প্রসার ঘটছে। যোগাযোগ ব্যবস্থার উন্নয়নে স্থানীয় উৎপাদিত পণ্যের জাতীয় পর্যায়ে বাজারজাতকরণ সহজ হয়েছে। তরুণ উদ্যোক্তারা এখন বিভিন্ন নতুন সেক্টরে বিনিয়োগ করছেন এবং খুলনাকে শিল্পনগরী হিসেবে পুনর্জীবিত করার চেষ্টা করছেন।</p><p>বিশেষজ্ঞদের মতে, সরকারি ও বেসরকারি আর্থিক প্রতিষ্ঠানের নীতি সহায়তা বাড়লে এ অঞ্চল খুব দ্রুত একটি বড় অর্থনৈতিক হাব হিসেবে আত্মপ্রকাশ করবে।</p>',
      featuredImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'শিল্প ও উদ্যোক্তা মিটিং',
      photoCredit: 'খুলনা গেজেট ফাইল ফটো',
      categoryId: khulnanchalId,
      authorId: adminUser.id,
      reporterName: 'স্টাফ রিপোর্টার, খুলনা',
      status: 'PUBLISHED',
      isBreaking: true,
      isFeatured: true,
      publishedAt: new Date(),
    },
  });

  await prisma.news.create({
    data: {
      title: 'জাতীয় রাজনীতিতে খুলনার জননেতাদের অবস্থান এবং অবদান',
      subtitle: 'আগামী নির্বাচনকে ঘিরে নানা জল্পনা-কল্পনা',
      slug: 'national-politics-khulna-leaders',
      content: '<p>জাতীয় রাজনীতিতে খুলনা অঞ্চলের সংসদ সদস্যদের ভূমিকা নিয়ে চুলচেরা বিশ্লেষণ শুরু হয়েছে। স্থানীয় কার্যালয় ও জনসভাগুলোতে রাজনৈতিক দলগুলোর তৎপরতা বেড়েছে। সাধারণ মানুষ চান যেন শান্তি, স্থিতিশীলতা ও টেকসই উন্নয়নে মনোযোগ দেওয়া হয়।</p>',
      featuredImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'রাজনৈতিক সমাবেশ',
      photoCredit: 'বিশেষ প্রতিনিধি',
      categoryId: politicsId,
      authorId: adminUser.id,
      reporterName: 'রাজনীতি প্রতিবেদক',
      status: 'PUBLISHED',
      isBreaking: false,
      isFeatured: true,
      publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
  });

  await prisma.news.create({
    data: {
      title: 'সুন্দরবনের জীববৈচিত্র্য রক্ষায় কড়া পদক্ষেপের নির্দেশ',
      subtitle: 'বন দস্যু ও চোরা শিকারিদের বিরুদ্ধে কড়া ব্যবস্থা',
      slug: 'sundarbans-wildlife-protection-orders',
      content: '<p>বিশ্বের বৃহত্তম ম্যানগ্রোভ বন সুন্দরবনের বাংলাদেশ অংশে বাঘ, হরিণ এবং জলজ সম্পদ রক্ষায় বিশেষ পাহারা ও নজরদারি জোরদার করা হয়েছে। ড্রোন দিয়ে টহল এবং বন রক্ষীদের অত্যাধুনিক সরঞ্জাম সরবরাহ করা হচ্ছে। বনের ইকোসিস্টেম সুরক্ষায় যেকোনো ধরনের অবৈধ অনুপ্রবেশ কঠোরভাবে দমন করা হবে বলে সরকারের পক্ষ থেকে জানানো হয়েছে।</p>',
      featuredImage: 'https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'সুন্দরবনের একটি দৃষ্টিনন্দন স্থান',
      photoCredit: 'আলোকচিত্রী দল',
      categoryId: bangladeshId,
      authorId: adminUser.id,
      reporterName: 'সুন্দরবন প্রতিনিধি',
      status: 'PUBLISHED',
      isBreaking: false,
      isFeatured: false,
      publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
    },
  });

  await prisma.news.create({
    data: {
      title: 'গেজেট এক্সক্লুসিভ: খুলনার রূপসা ব্রিজের ওপারে নতুন রিসোর্ট ও ট্যুরিজম জোন',
      subtitle: 'পর্যটকদের আকর্ষণ করতে নতুন নান্দনিক স্পট',
      slug: 'rupsha-bridge-exclusive-tourism',
      content: '<p>রূপসা নদীর পাড় জুড়ে তৈরি হয়েছে আকর্ষণীয় কিছু ফুড ক্যাফে ও বিনোদন কেন্দ্র। প্রতি সপ্তাহান্তে এখানে হাজারো মানুষের সমাগম হয়। নতুন করে একটি বৃহৎ পর্যটন পার্ক তৈরির নকশা প্রণয়ন করা হয়েছে, যা শীঘ্রই বাস্তবায়ন হতে যাচ্ছে।</p>',
      featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'নদীর তীরে ভ্রমণপিপাসু মানুষ',
      photoCredit: 'খুলনা গেজেট স্পেশাল',
      categoryId: gazetteExclusiveId,
      authorId: adminUser.id,
      reporterName: 'খুলনা গেজেট এক্সক্লুসিভ টিম',
      status: 'PUBLISHED',
      isBreaking: true,
      isFeatured: true,
      publishedAt: new Date(Date.now() - 10800000), // 3 hours ago
    },
  });

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
