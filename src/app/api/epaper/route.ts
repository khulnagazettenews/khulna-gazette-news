import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const issues = await prisma.epaperIssue.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(issues);
  } catch (err) {
    return NextResponse.json({ error: 'ই-পেপার লোড করা সম্ভব হয়নি।' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { date, pdfUrl, imageUrl, imageUrls } = await req.json();

    if (!date) {
      return NextResponse.json({ error: 'তারিখ নির্বাচন আবশ্যক।' }, { status: 400 });
    }

    const targetDate = new Date(date);
    const cleanDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const finalImageUrls = Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls
      : (imageUrl ? [imageUrl] : []);

    const coverImage = imageUrl || (finalImageUrls.length > 0 ? finalImageUrls[0] : null);

    const issue = await prisma.epaperIssue.upsert({
      where: { date: cleanDate },
      update: { 
        pdfUrl, 
        imageUrl: coverImage, 
        imageUrls: finalImageUrls 
      },
      create: { 
        date: cleanDate, 
        pdfUrl, 
        imageUrl: coverImage, 
        imageUrls: finalImageUrls 
      },
    });

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Upsert epaper error:', error);
    return NextResponse.json({ error: 'ই-পেপার সংরক্ষণ করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
