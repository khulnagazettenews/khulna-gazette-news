import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.news.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Views increment error:', err);
    return NextResponse.json(
      { error: 'ভিউ বৃদ্ধি করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
