import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PATCH: Approve or reject comment (Super Admin, Admin, and Editor allowed)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { approved } = body;

    if (approved === undefined) {
      return NextResponse.json({ error: 'অনুমোদন স্থিতি প্রদান করা আবশ্যক।' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ error: 'মন্তব্যটি পাওয়া যায়নি।' }, { status: 404 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { approved: !!approved },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json(
      { error: 'মন্তব্য স্থিতি পরিবর্তন করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a comment (Super Admin, Admin, and Editor allowed)
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
    if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { id } = params;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ error: 'মন্তব্যটি পাওয়া যায়নি।' }, { status: 404 });
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'মন্তব্যটি সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: 'মন্তব্যটি মুছে ফেলার সময় সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
