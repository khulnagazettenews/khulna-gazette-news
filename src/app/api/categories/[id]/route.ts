import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
    const { name, slug, parentId, order } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'ক্যাটাগরির নাম এবং স্লাগ আবশ্যক' },
        { status: 400 }
      );
    }

    // Verify unique slug (excluding current)
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'এই স্লাগটি ইতিমধ্যে অন্য ক্যাটাগরিতে ব্যবহৃত হয়েছে' },
        { status: 400 }
      );
    }

    // Prevent making a category its own parent
    if (parentId === id) {
      return NextResponse.json(
        { error: 'ক্যাটাগরি নিজেই নিজের প্যারেন্ট হতে পারবে না' },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        parentId: parentId || null,
        order: order ? parseInt(order) : 0,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'ক্যাটাগরি আপডেট করার সময় সমস্যা হয়েছে' },
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
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'শুধুমাত্র অ্যাডমিন বা সুপার অ্যাডমিন মুছে ফেলতে পারবেন' }, { status: 403 });
    }

    const { id } = params;

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error) {
    return NextResponse.json(
      { error: 'ক্যাটাগরি মুছে ফেলার সময় সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
