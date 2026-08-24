import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const role = (session.user as any).role || 'REPORTER';
    const userId = (session.user as any).id;
    const restrictsToOwnNews = ['REPORTER', 'CONTRIBUTOR'].includes(role);

    const newsFilter = restrictsToOwnNews ? { authorId: userId } : {};

    const [pendingComments, draftNews] = await Promise.all([
      ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role)
        ? prisma.comment.count({ where: { approved: false } })
        : Promise.resolve(0),
      prisma.news.count({ where: { status: 'DRAFT', ...newsFilter } }),
    ]);

    return NextResponse.json({ pendingComments, draftNews });
  } catch (error) {
    console.error('Admin counts API error:', error);
    return NextResponse.json({ pendingComments: 0, draftNews: 0 }, { status: 500 });
  }
}
