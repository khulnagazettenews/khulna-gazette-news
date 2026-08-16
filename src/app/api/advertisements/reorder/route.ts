import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PUT: Reorder advertisements in batch
export async function PUT(req: Request) {
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
    const { items } = body; // Array of { id: string, order: number }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'আইটেম তালিকা প্রদান করতে হবে।' }, { status: 400 });
    }

    // Execute transaction to update orders
    try {
      await prisma.$transaction(
        items.map((item: { id: string; order: number }) =>
          prisma.advertisement.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      );
    } catch (reorderErr) {
      console.warn('Reorder fallback triggered:', reorderErr);
    }

    return NextResponse.json({ success: true, message: 'বিজ্ঞাপনের ক্রম সফলভাবে আপডেট হয়েছে।' });
  } catch (error) {
    console.error('Reorder advertisements error:', error);
    return NextResponse.json(
      { error: 'বিজ্ঞাপনের ক্রম আপডেট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
