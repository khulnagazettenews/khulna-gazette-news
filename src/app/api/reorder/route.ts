import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// GET: Fetch ordered news list for "top_news" or specific category
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category') || 'top_news';

    // 1. Fetch all categories for selection menu
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true, slug: true },
    });

    if (categorySlug === 'top_news') {
      // Fetch saved Top News ordering
      const topNewsConfig = await prisma.specialTopic.findUnique({
        where: { id: 'top_news_hero_order' },
      });

      const savedIds: string[] = topNewsConfig?.newsIds || [];

      // Fetch published news articles
      const allPublishedNews = await prisma.news.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: 50,
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { name: true } },
        },
      });

      // Filter and order news based on savedIds
      const orderedNews: any[] = [];
      if (savedIds.length > 0) {
        savedIds.forEach((id) => {
          const item = allPublishedNews.find((n) => n.id === id);
          if (item) orderedNews.push(item);
        });
      }

      // Fill remaining items if orderedNews length < 15
      allPublishedNews.forEach((item) => {
        if (!orderedNews.some((n) => n.id === item.id)) {
          orderedNews.push(item);
        }
      });

      // Cap Top News to max 15 items
      const selectedTop15 = orderedNews.slice(0, 15);
      const poolNews = allPublishedNews;

      return NextResponse.json({
        category: 'top_news',
        categoryName: 'টপ নিউজ (হোমপেজ লিড)',
        categories,
        news: selectedTop15,
        poolNews,
      });
    }

    // Handle regular category reordering
    const targetCategory = categories.find((c) => c.slug === categorySlug);
    if (!targetCategory) {
      return NextResponse.json({ error: 'ক্যাটাগরি পাওয়া যায়নি' }, { status: 404 });
    }

    const catConfig = await prisma.specialTopic.findUnique({
      where: { id: `cat_order_${targetCategory.id}` },
    });

    const savedIds: string[] = catConfig?.newsIds || [];

    const categoryNews = await prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { categoryId: targetCategory.id },
          { subCategoryId: targetCategory.id },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 30,
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
      },
    });

    const orderedNews: any[] = [];
    if (savedIds.length > 0) {
      savedIds.forEach((id) => {
        const item = categoryNews.find((n) => n.id === id);
        if (item) orderedNews.push(item);
      });
    }

    categoryNews.forEach((item) => {
      if (!orderedNews.some((n) => n.id === item.id)) {
        orderedNews.push(item);
      }
    });

    return NextResponse.json({
      category: targetCategory.slug,
      categoryName: targetCategory.name,
      categories,
      news: orderedNews,
      poolNews: categoryNews,
    });
  } catch (error) {
    console.error('Fetch reorder API error:', error);
    return NextResponse.json(
      { error: 'সংবাদ রিঅর্ডার ডাটা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

// POST: Save ordered newsIds for "top_news" or specific category
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const body = await req.json();
    const { category, newsIds } = body;

    if (!category || !Array.isArray(newsIds)) {
      return NextResponse.json({ error: 'সঠিক তথ্য প্রদান করুন।' }, { status: 400 });
    }

    if (category === 'top_news') {
      const top15Ids = newsIds.slice(0, 15);

      await prisma.specialTopic.upsert({
        where: { id: 'top_news_hero_order' },
        update: {
          title: 'টপ নিউজ',
          newsIds: top15Ids,
          isActive: true,
        },
        create: {
          id: 'top_news_hero_order',
          title: 'টপ নিউজ',
          newsIds: top15Ids,
          isActive: true,
        },
      });

      // Revalidate homepage
      revalidatePath('/');
      revalidatePath('/admin/reorder');

      return NextResponse.json({
        success: true,
        message: 'টপ নিউজ এর নতুন ক্রম সফলভাবে সংরক্ষিত হয়েছে।',
      });
    }

    // Category reorder save
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) {
      await prisma.specialTopic.upsert({
        where: { id: `cat_order_${cat.id}` },
        update: {
          title: `ক্যাটাগরি: ${cat.name}`,
          newsIds: newsIds,
          isActive: true,
        },
        create: {
          id: `cat_order_${cat.id}`,
          title: `ক্যাটাগরি: ${cat.name}`,
          newsIds: newsIds,
          isActive: true,
        },
      });

      revalidatePath('/');
      revalidatePath(`/${cat.slug}`);
      revalidatePath('/admin/reorder');
    }

    return NextResponse.json({
      success: true,
      message: 'ক্যাটাগরির সংবাদ ক্রম সফলভাবে সংরক্ষিত হয়েছে।',
    });
  } catch (error) {
    console.error('Save reorder API error:', error);
    return NextResponse.json(
      { error: 'সংবাদের ক্রম সংরক্ষণে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
