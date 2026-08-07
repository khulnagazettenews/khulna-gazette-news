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
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { youtubeUrl, title, categoryTag, description, order } = await req.json();

    if (!youtubeUrl || !title) {
      return NextResponse.json({ error: 'শিরোনাম ও ইউটিউব লিংক আবশ্যক।' }, { status: 400 });
    }

    // A simple validation for youtube link
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      return NextResponse.json({ error: 'সঠিক ইউটিউব লিংক প্রদান করুন।' }, { status: 400 });
    }

    const dataObj: any = {
      youtubeUrl: youtubeUrl.trim(),
      title: title.trim(),
      order: order ? parseInt(order) : 0,
    };
    if (categoryTag && categoryTag.trim()) {
      dataObj.categoryTag = categoryTag.trim();
    }
    if (description && description.trim()) {
      dataObj.description = description.trim();
    }

    const video = await prisma.galleryVideo.create({
      data: dataObj,
    });

    return NextResponse.json(video);
  } catch (error: any) {
    console.error('Error saving video to gallery:', error);
    return NextResponse.json(
      { error: error?.message || 'ভিডিও সংরক্ষণ করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
