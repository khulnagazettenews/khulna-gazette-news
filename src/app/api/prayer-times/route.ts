import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const cleanDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const times = await prisma.prayerTime.findUnique({
      where: { date: cleanDate },
    });

    return NextResponse.json(times);
  } catch (err) {
    return NextResponse.json({ error: 'নামাজের সময়সূচি লোড করা সম্ভব হয়নি।' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { date, fajr, zohr, asr, magrib, esha, sunrise } = await req.json();

    if (!date || !fajr || !zohr || !asr || !magrib || !esha || !sunrise) {
      return NextResponse.json({ error: 'সকল তথ্য প্রদান করা আবশ্যক।' }, { status: 400 });
    }

    const targetDate = new Date(date);
    const cleanDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const times = await prisma.prayerTime.upsert({
      where: { date: cleanDate },
      update: { fajr, zohr, asr, magrib, esha, sunrise },
      create: { date: cleanDate, fajr, zohr, asr, magrib, esha, sunrise },
    });

    return NextResponse.json(times);
  } catch (error) {
    console.error('Upsert prayer times error:', error);
    return NextResponse.json({ error: 'নামাজের সময়সূচি সংরক্ষণ করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
