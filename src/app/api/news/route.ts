import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId) {
      where.OR = [
        { categoryId: categoryId },
        { subCategoryId: categoryId }
      ];
    }
    if (status) {
      where.status = status;
    }
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { content: { contains: query } }
      ];
    }

    const userRole = (session.user as any).role || 'REPORTER';
    if (['SUBSCRIBER', 'ADVERTISEMENT_MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    // Role protection: Reporters and Contributors can only view their own news in the admin panel
    if (['REPORTER', 'CONTRIBUTOR'].includes(userRole)) {
      where.authorId = (session.user as any).id;
    }

    const total = await prisma.news.count({ where });
    const items = await prisma.news.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        category: true,
        subCategory: true,
        author: {
          select: { name: true, email: true }
        },
        tags: true,
      }
    });

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    console.error('Fetch news API error:', error);
    return NextResponse.json(
      { error: 'সংবাদ তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }
    const userRole = (session.user as any).role || 'REPORTER';
    if (['SUBSCRIBER', 'ADVERTISEMENT_MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      subtitle,
      content,
      featuredImage,
      imageCaption,
      photoCredit,
      categoryId,
      subCategoryId,
      reporterName,
      status,
      isBreaking,
      isFeatured,
      tags = [],
      scheduledAt,
      metaTitle,
      metaDescription,
    } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'শিরোনাম, কন্টেন্ট এবং ক্যাটাগরি আবশ্যক।' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = title
      .toLowerCase()
      .replace(/[^\u0980-\u09FFa-z0-9\s]/g, '') // Keep Bengali, letters, numbers, spaces
      .trim()
      .replace(/\s+/g, '-');
    
    if (!baseSlug) {
      baseSlug = `news-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.news.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Connect or create tags
    const tagConnectOrCreate = tags.map((name: string) => {
      const sanitizedName = name.trim();
      const slugName = sanitizedName.toLowerCase().replace(/\s+/g, '-');
      return {
        where: { name: sanitizedName },
        create: { name: sanitizedName, slug: slugName },
      };
    });

    const canPublish = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole);
    const finalStatus = canPublish ? (status || 'DRAFT') : 'DRAFT';
    const finalIsBreaking = canPublish ? !!isBreaking : false;
    const finalIsFeatured = canPublish ? !!isFeatured : false;

    const news = await prisma.news.create({
      data: {
        title,
        subtitle: subtitle || null,
        slug,
        content,
        featuredImage: featuredImage || null,
        imageCaption: imageCaption || null,
        photoCredit: photoCredit || null,
        categoryId,
        subCategoryId: subCategoryId || null,
        authorId: (session.user as any).id,
        reporterName: reporterName || null,
        status: finalStatus,
        isBreaking: finalIsBreaking,
        isFeatured: finalIsFeatured,
        publishedAt: finalStatus === 'PUBLISHED' ? new Date() : null,
        scheduledAt: finalStatus === 'SCHEDULED' && scheduledAt ? new Date(scheduledAt) : null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        tags: {
          connectOrCreate: tagConnectOrCreate,
        },
      },
      include: {
        tags: true,
      },
    });

    // Revalidate on-demand if published
    if (finalStatus === 'PUBLISHED') {
      try {
        const cat = await prisma.category.findUnique({ where: { id: categoryId } });
        revalidatePath('/');
        if (cat) {
          revalidatePath(`/${cat.slug}`);
          if (subCategoryId) {
            const sub = await prisma.category.findUnique({ where: { id: subCategoryId } });
            if (sub) {
              revalidatePath(`/${cat.slug}/${sub.slug}`);
            }
          }
        }
      } catch (err) {
        console.error('Revalidation error:', err);
      }
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error('Create news API error:', error);
    return NextResponse.json(
      { error: 'সংবাদ আপলোড করার সময় সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
