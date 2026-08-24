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

    const { name, url, parentId, order } = await req.json();

    const updatedItem = await (prisma as any).navbarMenu.update({
      where: { id: params.id },
      data: {
        name,
        url,
        parentId: parentId || null,
        order: order ? parseInt(order) : 0,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating navbar menu item:', error);
    return NextResponse.json(
      { error: 'নেভবার মেনু আইটেম আপডেট করার সময় সমস্যা হয়েছে' },
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

    // Delete subItems first if any
    await (prisma as any).navbarMenu.deleteMany({
      where: { parentId: params.id },
    });

    // Delete main item
    await (prisma as any).navbarMenu.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'মেনু আইটেম মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Error deleting navbar menu item:', error);
    return NextResponse.json(
      { error: 'নেভবার মেনু আইটেম মুছে ফেলার সময় সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
