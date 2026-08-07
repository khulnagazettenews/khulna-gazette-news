import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    await prisma.galleryVideo.delete({
      where: { id: params.id },
    });

    try {
      revalidatePath('/');
      revalidatePath('/video-gallery');
    } catch (revalErr) {
      console.warn('Revalidation warning:', revalErr);
    }

    return NextResponse.json({ message: 'ভিডিও সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error) {
    return NextResponse.json({ error: 'মুছে ফেলার সময় সমস্যা হয়েছে।' }, { status: 500 });
  }
}
