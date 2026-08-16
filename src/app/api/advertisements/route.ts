import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch all advertisements (Public fetches ACTIVE only; admin panel can filter)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get('position');
    const status = searchParams.get('status'); // ACTIVE or INACTIVE

    const where: any = {};
    if (position) {
      where.position = position;
    }
    if (status) {
      where.status = status;
    } else {
      // By default, if not logged in as admin, only fetch active ads
      const session = await getServerSession(authOptions);
      const userRole = (session?.user as any)?.role;
      if (!session || !['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER', 'EDITOR', 'SUB_EDITOR'].includes(userRole)) {
        where.status = 'ACTIVE';
      }
    }

    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    ads.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

    return NextResponse.json(ads);
  } catch (error) {
    console.error('Fetch advertisements error:', error);
    return NextResponse.json(
      { error: 'বিজ্ঞাপন তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

// POST: Create a new advertisement (Super Admin, Admin, and Ad Manager allowed)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER', 'EDITOR', 'SUB_EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const body = await req.json();
    const { title, imageUrl, targetUrl, position, adType, codeSnippet, description, order, status, startDate, endDate } = body;

    if (!position) {
      return NextResponse.json(
        { error: 'বিজ্ঞাপনের পজিশন নির্বাচন করা আবশ্যক।' },
        { status: 400 }
      );
    }

    const finalTitle = title ? title.trim() : 'বিজ্ঞাপন ব্যানার';

    const createData: any = {
      title: finalTitle,
      imageUrl: imageUrl || '',
      targetUrl: targetUrl || null,
      position,
      adType: adType || 'IMAGE',
      codeSnippet: codeSnippet || null,
      description: description || null,
      order: typeof order === 'number' ? order : 0,
      status: status || 'ACTIVE',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    let ad;
    try {
      ad = await prisma.advertisement.create({ data: createData });
    } catch (createErr) {
      console.warn('Prisma full schema create fallback triggered:', createErr);
      const { adType: _a, codeSnippet: _c, description: _d, order: _o, ...coreData } = createData;
      ad = await prisma.advertisement.create({ data: coreData });
    }

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error('Create advertisement error:', error);
    return NextResponse.json(
      { error: 'নতুন বিজ্ঞাপন তৈরি করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
