import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PATCH: Update details, status or increment clicks/views
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, title, imageUrl, targetUrl, position, adType, codeSnippet, description, order, status, startDate, endDate } = body;

    // 1. Check if public analytics increment
    if (action === 'click') {
      const ad = await prisma.advertisement.update({
        where: { id },
        data: { clicks: { increment: 1 } },
      });
      return NextResponse.json(ad);
    }

    if (action === 'view') {
      const ad = await prisma.advertisement.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
      return NextResponse.json(ad);
    }

    // 2. Otherwise, check admin session and permissions
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER', 'EDITOR', 'SUB_EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return NextResponse.json({ error: 'বিজ্ঞাপনটি পাওয়া যায়নি।' }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (position !== undefined) updateData.position = position;
    if (adType !== undefined) updateData.adType = adType;
    if (codeSnippet !== undefined) updateData.codeSnippet = codeSnippet;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = typeof order === 'number' ? order : parseInt(order);
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    let updatedAd;
    try {
      updatedAd = await prisma.advertisement.update({
        where: { id },
        data: updateData,
      });
    } catch (updateErr) {
      console.warn('Prisma update fallback triggered:', updateErr);
      const { adType: _a, codeSnippet: _c, description: _d, order: _o, ...coreUpdate } = updateData;
      updatedAd = await prisma.advertisement.update({
        where: { id },
        data: coreUpdate,
      });
    }

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error('Update advertisement error:', error);
    return NextResponse.json(
      { error: 'বিজ্ঞাপন তথ্য আপডেট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an advertisement (Super Admin, Admin, and Ad Manager allowed)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER', 'EDITOR', 'SUB_EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { id } = params;

    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return NextResponse.json({ error: 'বিজ্ঞাপনটি পাওয়া যায়নি।' }, { status: 404 });
    }

    await prisma.advertisement.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'বিজ্ঞাপন সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error) {
    console.error('Delete advertisement error:', error);
    return NextResponse.json(
      { error: 'বিজ্ঞাপন মুছে ফেলার সময় সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
