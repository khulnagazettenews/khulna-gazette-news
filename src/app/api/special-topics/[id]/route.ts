import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const topic = await prisma.specialTopic.findUnique({
      where: { id },
    });

    if (!topic) {
      return NextResponse.json({ error: 'স্পেশাল টপিক সেকশন পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('GET Special Topic Error:', error);
    return NextResponse.json(
      { error: 'তথ্য লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { id } = params;
    const data = await req.json();

    const updateData: any = { updatedAt: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.bannerSubtitle !== undefined) updateData.bannerSubtitle = data.bannerSubtitle;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.newsIds !== undefined) updateData.newsIds = data.newsIds;
    if (data.order !== undefined) updateData.order = typeof data.order === 'number' ? data.order : parseInt(data.order) || 0;

    if (data.isActive === true) {
      await prisma.specialTopic.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      });
    }

    const topic = await prisma.specialTopic.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/admin/special-topics');

    return NextResponse.json(topic);
  } catch (error) {
    console.error('PUT Special Topic Error:', error);
    return NextResponse.json(
      { error: 'আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { id } = params;
    await prisma.specialTopic.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/admin/special-topics');

    return NextResponse.json({ message: 'সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('DELETE Special Topic Error:', error);
    return NextResponse.json(
      { error: 'মুছে ফেলতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
