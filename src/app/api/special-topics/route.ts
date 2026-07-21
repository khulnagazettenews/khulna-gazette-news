import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const topics = await prisma.specialTopic.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(topics);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'স্পেশাল টপিক সেকশন লোড করার সময় সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { title, bannerSubtitle, isActive, newsIds, order } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: 'সেকশনের শিরোনাম আবশ্যক' },
        { status: 400 }
      );
    }

    const activeBool = typeof isActive === 'boolean' ? isActive : true;

    if (activeBool) {
      await prisma.specialTopic.updateMany({
        data: { isActive: false },
      });
    }

    const topic = await prisma.specialTopic.create({
      data: {
        title,
        bannerSubtitle: bannerSubtitle || null,
        isActive: activeBool,
        newsIds: Array.isArray(newsIds) ? newsIds : [],
        order: typeof order === 'number' ? order : parseInt(order) || 0,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/special-topics');

    return NextResponse.json(topic);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'স্পেশাল টপিক সেকশন তৈরি করার সময় সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
