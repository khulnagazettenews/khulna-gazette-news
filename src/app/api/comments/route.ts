import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch comments (Super Admin, Admin, and Editor allowed)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const approvedParam = searchParams.get('approved');

    const where: any = {};
    if (approvedParam !== null) {
      where.approved = approvedParam === 'true';
    }

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        news: {
          select: {
            title: true,
            slug: true,
            id: true,
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Fetch comments error:', error);
    return NextResponse.json(
      { error: 'মন্তব্য তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
