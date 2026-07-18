import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { parentId: null },
          { parentId: { isSet: false } }
        ],
      },
      orderBy: { order: 'asc' },
      include: {
        subCategories: {
          orderBy: { order: 'asc' },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'ক্যাটাগরি লোড করার সময় সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { name, slug, parentId, order } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'ক্যাটাগরির নাম এবং স্লাগ আবশ্যক' },
        { status: 400 }
      );
    }

    // Verify unique slug
    const existing = await prisma.category.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'এই স্লাগটি ইতিমধ্যে ব্যবহৃত হয়েছে' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        parentId: parentId || null,
        order: order ? parseInt(order) : 0,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'ক্যাটাগরি তৈরি করার সময় সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
