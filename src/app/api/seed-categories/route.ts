import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Post Categories Tree
    const categoryTree = [
      { name: 'টপ নিউজ', slug: 'top-news', order: 1 },
      { name: 'যশোর', slug: 'jessore-news', order: 2 },
      { name: 'বাংলাদেশ', slug: 'bangladesh', order: 3 },
      { name: 'epaper', slug: 'epaper', order: 3 },
      { name: 'Uncategorized', slug: 'uncategorized', order: 4 },
      { name: 'অর্থনীতি', slug: 'economy', order: 5 },
      { name: 'আইটি', slug: 'it', order: 6 },
      { name: 'আন্তর্জাতিক', slug: 'international', order: 7 },
      { name: 'ইসলাম ও জীবন', slug: 'islam-and-life', order: 8 },
      { name: 'উদ্বোধনী ক্রোড়পত্র', slug: 'udbodhoni-krorpotro', order: 9 },
      { name: 'করোনা', slug: 'corona', order: 10 },
      {
        name: 'খুলনাঞ্চল',
        slug: 'khulnanchal',
        order: 11,
        subs: [
          { name: 'কুষ্টিয়া', slug: 'kushtia', order: 1 },
          { name: 'খুলনা', slug: 'khulna', order: 2 },
          { name: 'চুয়াডাঙ্গা', slug: 'chuadanga', order: 3 },
          { name: 'ঝিনাইদহ', slug: 'jhenaidah', order: 4 },
          { name: 'নড়াইল', slug: 'narail', order: 5 },
          { name: 'বাগেরহাট', slug: 'bagerhat', order: 6 },
          { name: 'মাগুরা', slug: 'magura', order: 7 },
          { name: 'মেহেরপুর', slug: 'meherpur', order: 8 },
          { name: 'যশোর', slug: 'jessore', order: 9 },
          { name: 'সাতক্ষীরা', slug: 'satkhira', order: 10 },
        ],
      },
      {
        name: 'খেলা',
        slug: 'sports',
        order: 12,
        subs: [
          { name: 'ফুটবল বিশ্বকাপ-২০২৬', slug: 'football-world-cup-2026', order: 1 },
        ],
      },
      { name: 'গেজেট এক্সক্লুসিভ', slug: 'gazette-exclusive', order: 13 },
      { name: 'চিকিৎসা', slug: 'chikitsha', order: 14 },
      { name: 'চিত্র বিচিত্র', slug: 'chitra-bichitra', order: 15 },
      { name: 'দৈনিক খুলনা গেজেট', slug: 'dainik-khulna-gazette', order: 16 },
      {
        name: 'নির্বাচন',
        slug: 'election',
        order: 17,
        subs: [
          { name: 'খুলনা সিটি কর্পোরেশন নির্বাচন-২০২৩', slug: 'khulna-city-corporation-election-2023', order: 1 },
          { name: 'দ্বাদশ জাতীয় সংসদ নির্বাচন- ২০২৩', slug: '12th-national-parliament-election-2023', order: 2 },
        ],
      },
      { name: 'ফটো গ্যালারি', slug: 'photo-gallery', order: 18 },
      { name: 'ফিচার', slug: 'feature', order: 19 },
      { name: 'ফিফা বিশ্বকাপ-২০২২', slug: 'fifa-world-cup-2022', order: 20 },
      { name: 'বিনোদন', slug: 'entertainment', order: 21 },
      { name: 'বিশ্ব জয়ের রোমাঞ্চকর আসর', slug: 'biswa-joyer-romanchokar-asor', order: 22 },
      { name: 'ব্রেকিং নিউজ', slug: 'breaking-news', order: 23 },
      { name: 'ভিডিও গ্যালারি', slug: 'video-gallery', order: 24 },
      { name: 'মুক্ত ভাবনা', slug: 'motamot', order: 25 },
      { name: 'রাজনীতি', slug: 'politics', order: 26 },
      { name: 'লাইফ স্টাইল', slug: 'lifestyle', order: 27 },
      { name: 'শিক্ষা', slug: 'education', order: 28 },
      { name: 'সাহিত্য', slug: 'sahitya', order: 29 },
      { name: 'সোশ্যাল মিডিয়া', slug: 'social-media', order: 30 },
    ];

    let createdCount = 0;

    for (const item of categoryTree) {
      let parentCat = await prisma.category.findUnique({
        where: { slug: item.slug },
      });

      if (!parentCat) {
        parentCat = await prisma.category.create({
          data: {
            name: item.name,
            slug: item.slug,
            order: item.order,
          },
        });
        createdCount++;
      } else {
        await prisma.category.update({
          where: { id: parentCat.id },
          data: { name: item.name, order: item.order },
        });
      }

      if (item.subs && item.subs.length > 0) {
        for (const subItem of item.subs) {
          const existingSub = await prisma.category.findUnique({
            where: { slug: subItem.slug },
          });

          if (!existingSub) {
            await prisma.category.create({
              data: {
                name: subItem.name,
                slug: subItem.slug,
                parentId: parentCat.id,
                order: subItem.order,
              },
            });
            createdCount++;
          } else {
            await prisma.category.update({
              where: { id: existingSub.id },
              data: {
                name: subItem.name,
                parentId: parentCat.id,
                order: subItem.order,
              },
            });
          }
        }
      }
    }

    // 2. Initialize Navbar Menu items if empty
    const existingNavbarItems = await (prisma as any).navbarMenu.count({
      where: { parentId: null }
    });
    if (existingNavbarItems === 0) {
      const defaultNavItems = [
        { name: 'বাংলাদেশ', url: '/bangladesh', order: 1 },
        {
          name: 'খুলনাঞ্চল',
          url: '/khulnanchal',
          order: 2,
          subs: [
            { name: 'কুষ্টিয়া', url: '/khulnanchal/kushtia', order: 1 },
            { name: 'খুলনা', url: '/khulnanchal/khulna', order: 2 },
            { name: 'চুয়াডাঙ্গা', url: '/khulnanchal/chuadanga', order: 3 },
            { name: 'ঝিনাইদহ', url: '/khulnanchal/jhenaidah', order: 4 },
            { name: 'নড়াইল', url: '/khulnanchal/narail', order: 5 },
            { name: 'বাগেরহাট', url: '/khulnanchal/bagerhat', order: 6 },
            { name: 'মাগুরা', url: '/khulnanchal/magura', order: 7 },
            { name: 'মেহেরপুর', url: '/khulnanchal/meherpur', order: 8 },
            { name: 'যশোর', url: '/khulnanchal/jessore', order: 9 },
            { name: 'সাতক্ষীরা', url: '/khulnanchal/satkhira', order: 10 },
          ],
        },
        { name: 'রাজনীতি', url: '/politics', order: 3 },
        { name: 'অর্থনীতি', url: '/economy', order: 4 },
        { name: 'আন্তর্জাতিক', url: '/international', order: 5 },
        {
          name: 'খেলা',
          url: '/sports',
          order: 6,
          subs: [
            { name: 'ফুটবল বিশ্বকাপ-২০২৬', url: '/sports/football-world-cup-2026', order: 1 },
          ],
        },
        { name: 'বিনোদন', url: '/entertainment', order: 7 },
        { name: 'শিক্ষা', url: '/education', order: 8 },
        { name: 'মুক্ত ভাবনা', url: '/motamot', order: 9 },
        { name: 'ইসলাম ও জীবন', url: '/islam-and-life', order: 10 },
        { name: 'গেজেট এক্সক্লুসিভ', url: '/gazette-exclusive', order: 11 },
      ];

      for (const nav of defaultNavItems) {
        const parentNav = await (prisma as any).navbarMenu.create({
          data: {
            name: nav.name,
            url: nav.url,
            order: nav.order,
          },
        });

        if (nav.subs && nav.subs.length > 0) {
          for (const subNav of nav.subs) {
            await (prisma as any).navbarMenu.create({
              data: {
                name: subNav.name,
                url: subNav.url,
                parentId: parentNav.id,
                order: subNav.order,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'সকল পোস্ট ক্যাটাগরি এবং নেভবার মেনু সফলভাবে ডাটাবেজে সিড করা হয়েছে।',
    });
  } catch (error: any) {
    console.error('Error seeding categories:', error);
    return NextResponse.json({ error: error?.message, stack: error?.stack }, { status: 500 });
  }
}
