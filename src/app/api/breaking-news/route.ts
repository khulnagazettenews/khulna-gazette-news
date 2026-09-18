import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const TICKER_CONFIG_ID = 'custom_breaking_ticker';

const parseTitles = (raw: string | null | undefined): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
};

// GET: Fetch breaking news ticker custom settings
export async function GET() {
  try {
    const config = await prisma.specialTopic.findUnique({
      where: { id: TICKER_CONFIG_ID },
    });

    if (!config) {
      return NextResponse.json({
        isActive: false,
        titles: [],
      });
    }

    return NextResponse.json({
      isActive: config.isActive,
      titles: parseTitles(config.newsIds),
    });
  } catch (error) {
    console.error('[GET /api/breaking-news] Error:', error);
    return NextResponse.json(
      { error: 'সর্বশেষ টিকারে তথ্য লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// POST: Save breaking news ticker custom settings
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(
        (session.user as any).role
      )
    ) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { isActive, titles } = await req.json();

    const cleanTitles = Array.isArray(titles)
      ? titles.map((t: string) => t.trim()).filter(Boolean)
      : [];

    await prisma.specialTopic.upsert({
      where: { id: TICKER_CONFIG_ID },
      update: {
        title: 'কাস্টম সর্বশেষ টিকার',
        isActive: Boolean(isActive),
        newsIds: JSON.stringify(cleanTitles),
      },
      create: {
        id: TICKER_CONFIG_ID,
        title: 'কাস্টম সর্বশেষ টিকার',
        isActive: Boolean(isActive),
        newsIds: JSON.stringify(cleanTitles),
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/breaking-news');

    return NextResponse.json({
      success: true,
      isActive: Boolean(isActive),
      titles: cleanTitles,
      message: 'সর্বশেষ টিকারে টেক্সট সফলভাবে সংরক্ষিত হয়েছে।',
    });
  } catch (error) {
    console.error('[POST /api/breaking-news] Error:', error);
    return NextResponse.json(
      { error: 'সর্বশেষ টিকারে তথ্য সংরক্ষণ করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
