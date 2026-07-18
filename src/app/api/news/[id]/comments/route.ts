import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { newsId: params.id, approved: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(comments);
  } catch (err) {
    return NextResponse.json({ error: 'মন্তব্য লোড করা সম্ভব হয়নি।' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, comment } = await req.json();

    if (!name || !comment) {
      return NextResponse.json({ error: 'নাম এবং মন্তব্য আবশ্যক।' }, { status: 400 });
    }

    const created = await prisma.comment.create({
      data: {
        newsId: params.id,
        name,
        comment,
        approved: false, // Default moderation approval required
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: 'মন্তব্য জমা দিতে ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}
