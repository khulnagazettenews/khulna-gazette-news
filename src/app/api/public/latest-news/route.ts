import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const listSelect = {
      id: true,
      title: true,
      featuredImage: true,
      publishedAt: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    };

    const latest = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      select: listSelect,
    });

    const popular = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: listSelect,
    });

    return NextResponse.json({ latest, popular });
  } catch (error) {
    console.error('Error in public latest news endpoint:', error);
    return NextResponse.json({ latest: [], popular: [] }, { status: 500 });
  }
}
