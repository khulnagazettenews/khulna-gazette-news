import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const photos = await prisma.galleryPhoto.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(photos);
  } catch (err) {
    return NextResponse.json({ error: 'ফটো গ্যালারি লোড করা সম্ভব হয়নি।' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { imageUrl, caption, credit, order } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'ছবির লিংক আবশ্যক।' }, { status: 400 });
    }

    const photo = await prisma.galleryPhoto.create({
      data: {
        imageUrl,
        caption: caption || null,
        credit: credit || null,
        order: order ? parseInt(order) : 0,
      },
    });

    return NextResponse.json(photo);
  } catch (error) {
    return NextResponse.json({ error: 'ফটো সংরক্ষণ করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
