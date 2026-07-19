import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const videos = await prisma.galleryVideo.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(videos);
  } catch (err) {
    return NextResponse.json({ error: 'ভিডিও গ্যালারি লোড করা সম্ভব হয়নি।' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { youtubeUrl, title, order } = await req.json();

    if (!youtubeUrl || !title) {
      return NextResponse.json({ error: 'শিরোনাম ও ইউটিউব লিংক আবশ্যক।' }, { status: 400 });
    }

    // A simple validation for youtube link
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      return NextResponse.json({ error: 'সঠিক ইউটিউব লিংক প্রদান করুন।' }, { status: 400 });
    }

    const video = await prisma.galleryVideo.create({
      data: {
        youtubeUrl,
        title,
        order: order ? parseInt(order) : 0,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ error: 'ভিডিও সংরক্ষণ করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
