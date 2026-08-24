import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const DEFAULT_NAVBAR_ITEMS = [
  { id: 'nav-1', name: 'বাংলাদেশ', url: '/bangladesh', order: 1, subItems: [] },
  {
    id: 'nav-2',
    name: 'খুলনাঞ্চল',
    url: '/khulnanchal',
    order: 2,
    subItems: [
      { id: 'nav-2-1', name: 'খুলনা', url: '/khulnanchal/khulna', order: 1 },
      { id: 'nav-2-2', name: 'কুষ্টিয়া', url: '/khulnanchal/kushtia', order: 2 },
      { id: 'nav-2-3', name: 'চুয়াডাঙ্গা', url: '/khulnanchal/chuadanga', order: 3 },
      { id: 'nav-2-4', name: 'ঝিনাইদহ', url: '/khulnanchal/jhenaidah', order: 4 },
      { id: 'nav-2-5', name: 'নড়াইল', url: '/khulnanchal/narail', order: 5 },
      { id: 'nav-2-6', name: 'বাগেরহাট', url: '/khulnanchal/bagerhat', order: 6 },
      { id: 'nav-2-7', name: 'মাগুরা', url: '/khulnanchal/magura', order: 7 },
      { id: 'nav-2-8', name: 'মেহেরপুর', url: '/khulnanchal/meherpur', order: 8 },
      { id: 'nav-2-9', name: 'যশোর', url: '/khulnanchal/jessore', order: 9 },
      { id: 'nav-2-10', name: 'সাতক্ষীরা', url: '/khulnanchal/satkhira', order: 10 },
    ],
  },
  { id: 'nav-3', name: 'খেলা', url: '/sports', order: 3, subItems: [] },
  { id: 'nav-4', name: 'বিনোদন', url: '/entertainment', order: 4, subItems: [] },
  { id: 'nav-5', name: 'রাজনীতি', url: '/politics', order: 5, subItems: [] },
  { id: 'nav-6', name: 'আন্তর্জাতিক', url: '/international', order: 6, subItems: [] },
  { id: 'nav-7', name: 'অর্থনীতি', url: '/economy', order: 7, subItems: [] },
  { id: 'nav-8', name: 'শিক্ষা', url: '/education', order: 8, subItems: [] },
  { id: 'nav-9', name: 'মুক্ত ভাবনা', url: '/motamot', order: 9, subItems: [] },
  { id: 'nav-10', name: 'ইসলাম ও জীবন', url: '/islam-and-life', order: 10, subItems: [] },
  { id: 'nav-11', name: 'গেজেট এক্সক্লুসিভ', url: '/gazette-exclusive', order: 11, subItems: [] },
  {
    id: 'nav-12',
    name: 'আরও',
    url: '#',
    order: 12,
    subItems: [
      { id: 'nav-12-1', name: 'ফুটবল বিশ্বকাপ-২০২৬', url: '/sports/football-world-cup-2026', order: 1 },
      { id: 'nav-12-2', name: 'ফটো গ্যালারি', url: '/photo-gallery', order: 2 },
      { id: 'nav-12-3', name: 'ভিডিও গ্যালারি', url: '/video-gallery', order: 3 },
      { id: 'nav-12-4', name: 'ইসলাম ও জীবন', url: '/islam-and-life', order: 4 },
      { id: 'nav-12-5', name: 'আইটি', url: '/it', order: 5 },
      { id: 'nav-12-6', name: 'লাইফ স্টাইল', url: '/lifestyle', order: 6 },
      { id: 'nav-12-7', name: 'চিকিৎসা', url: '/chikitsha', order: 7 },
      { id: 'nav-12-8', name: 'সাহিত্য', url: '/sahitya', order: 8 },
      { id: 'nav-12-9', name: 'চিত্র বিচিত্র', url: '/chitra-bichitra', order: 9 },
      { id: 'nav-12-10', name: 'সোশ্যাল মিডিয়া', url: '/social-media', order: 10 },
      { id: 'nav-12-11', name: 'বিশ্ব জয়ের রোমাঞ্চকর আসর', url: '/biswa-joyer-romanchokar-asor', order: 11 },
      { id: 'nav-12-12', name: 'ফিফা বিশ্বকাপ-২০২২', url: '/fifa-world-cup-2022', order: 12 },
      { id: 'nav-12-13', name: 'নির্বাচন', url: '/election', order: 13 },
      { id: 'nav-12-14', name: 'দ্বাদশ জাতীয় সংসদ নির্বাচন- ২০২৩', url: '/election/12th-national-parliament-election-2023', order: 14 },
      { id: 'nav-12-15', name: 'খুলনা সিটি কর্পোরেশন নির্বাচন-২০২৩', url: '/election/khulna-city-corporation-election-2023', order: 15 },
    ],
  },
];

export async function GET() {
  try {
    if ((prisma as any).navbarMenu) {
      let menus = await (prisma as any).navbarMenu.findMany({
        where: {
          parentId: null,
        },
        orderBy: { order: 'asc' },
        include: {
          subItems: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!menus || menus.length === 0) {
        // Auto seed default navbar menu items into collection
        for (const item of DEFAULT_NAVBAR_ITEMS) {
          const parentNav = await (prisma as any).navbarMenu.create({
            data: {
              name: item.name,
              url: item.url,
              order: item.order,
            },
          });

          if (item.subItems && item.subItems.length > 0) {
            for (const sub of item.subItems) {
              await (prisma as any).navbarMenu.create({
                data: {
                  name: sub.name,
                  url: sub.url,
                  parentId: parentNav.id,
                  order: sub.order,
                },
              });
            }
          }
        }

        menus = await (prisma as any).navbarMenu.findMany({
          where: { parentId: null },
          orderBy: { order: 'asc' },
          include: {
            subItems: {
              orderBy: { order: 'asc' },
            },
          },
        });
      }

      if (menus && menus.length > 0) {
        return NextResponse.json(menus);
      }
    }

    return NextResponse.json(DEFAULT_NAVBAR_ITEMS);
  } catch (error: any) {
    console.error('Error fetching navbar menu:', error);
    return NextResponse.json(DEFAULT_NAVBAR_ITEMS);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { name, url, parentId, order } = await req.json();

    if (!name || !url) {
      return NextResponse.json(
        { error: 'মেনুর নাম এবং ইউআরএল আবশ্যক' },
        { status: 400 }
      );
    }

    const menuItem = await (prisma as any).navbarMenu.create({
      data: {
        name,
        url,
        parentId: parentId || null,
        order: order ? parseInt(order) : 0,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error creating navbar menu:', error);
    return NextResponse.json(
      { error: 'নেভবার মেনু আইটেম তৈরি করার সময় সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
