import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    await prisma.galleryPhoto.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'ফটো সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error) {
    return NextResponse.json({ error: 'মুছে ফেলার সময় সমস্যা হয়েছে।' }, { status: 500 });
  }
}
