import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        tags: true,
      },
    });

    if (!news) {
      return NextResponse.json({ error: 'সংবাদটি পাওয়া যায়নি।' }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json(
      { error: 'সংবাদ লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const { id } = params;
    
    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id },
      include: { tags: true }
    });

    if (!existingNews) {
      return NextResponse.json({ error: 'সংবাদটি পাওয়া যায়নি।' }, { status: 404 });
    }

    // Role protection: Reporters can only update their own articles
    const isReporter = (session.user as any).role === 'REPORTER';
    if (isReporter && existingNews.authorId !== (session.user as any).id) {
      return NextResponse.json({ error: 'আপনি শুধুমাত্র নিজের খবর সম্পাদনা করতে পারবেন।' }, { status: 403 });
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

    // Disconnect old tags
    await prisma.news.update({
      where: { id },
      data: {
        tags: {
          disconnect: existingNews.tags.map((t) => ({ id: t.id })),
        },
      },
    });

    // Connect or create new tags
    const tagConnectOrCreate = tags.map((name: string) => {
      const sanitizedName = name.trim();
      const slugName = sanitizedName.toLowerCase().replace(/\s+/g, '-');
      return {
        where: { name: sanitizedName },
        create: { name: sanitizedName, slug: slugName },
      };
    });

    const finalStatus = isReporter ? 'DRAFT' : (status || 'DRAFT');
    const finalIsBreaking = isReporter ? false : !!isBreaking;
    const finalIsFeatured = isReporter ? false : !!isFeatured;

    // Check if status is transitioning to PUBLISHED
    let publishedAt = existingNews.publishedAt;
    if (finalStatus === 'PUBLISHED' && existingNews.status !== 'PUBLISHED') {
      publishedAt = new Date();
    }

    const updated = await prisma.news.update({
      where: { id },
      data: {
        title,
        subtitle: subtitle || null,
        content,
        featuredImage: featuredImage || null,
        imageCaption: imageCaption || null,
        photoCredit: photoCredit || null,
        categoryId,
        subCategoryId: subCategoryId || null,
        reporterName: reporterName || null,
        status: finalStatus,
        isBreaking: finalIsBreaking,
        isFeatured: finalIsFeatured,
        publishedAt,
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

    // Revalidate paths on edit
    try {
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      revalidatePath('/');
      if (cat) {
        revalidatePath(`/${cat.slug}`);
        revalidatePath(`/${cat.slug}/${updated.slug}-${updated.id}`);
        if (subCategoryId) {
          const sub = await prisma.category.findUnique({ where: { id: subCategoryId } });
          if (sub) {
            revalidatePath(`/${cat.slug}/${sub.slug}`);
          }
        }
      }
    } catch (err) {
      console.error('Revalidation error on update:', err);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update news error:', error);
    return NextResponse.json(
      { error: 'সংবাদ আপডেট করার সময় সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const { id } = params;

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id }
    });

    if (!existingNews) {
      return NextResponse.json({ error: 'সংবাদটি পাওয়া যায়নি।' }, { status: 404 });
    }

    // Role protection
    const isReporter = (session.user as any).role === 'REPORTER';
    if (isReporter && existingNews.authorId !== (session.user as any).id) {
      return NextResponse.json({ error: 'আপনি শুধুমাত্র নিজের খবর মুছে ফেলতে পারবেন।' }, { status: 403 });
    }

    await prisma.news.delete({
      where: { id },
    });

    // Revalidate paths on delete
    try {
      const cat = await prisma.category.findUnique({ where: { id: existingNews.categoryId } });
      revalidatePath('/');
      if (cat) {
        revalidatePath(`/${cat.slug}`);
        if (existingNews.subCategoryId) {
          const sub = await prisma.category.findUnique({ where: { id: existingNews.subCategoryId } });
          if (sub) {
            revalidatePath(`/${cat.slug}/${sub.slug}`);
          }
        }
      }
    } catch (err) {
      console.error('Revalidation error on delete:', err);
    }

    return NextResponse.json({ message: 'সংবাদটি সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error) {
    return NextResponse.json(
      { error: 'সংবাদ মুছে ফেলার সময় সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
