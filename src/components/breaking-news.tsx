import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function BreakingNewsTicker() {
  const breakingList = await prisma.news.findMany({
    where: {
      status: 'PUBLISHED',
      isBreaking: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 5,
    include: {
      category: true
    }
  });

  if (breakingList.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-2 border-y border-red-700 overflow-hidden shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <span className="shrink-0 bg-white text-red-600 font-extrabold px-2.5 py-0.5 rounded text-xs select-none shadow">
          ব্রেকিং নিউজ
        </span>
        <div className="flex-1 overflow-hidden relative h-5 flex items-center">
          {/* Marquee Ticker */}
          <div className="animate-marquee whitespace-nowrap flex gap-12 text-sm font-semibold">
            {breakingList.map((item) => (
              <Link 
                key={item.id} 
                href={`/${item.category?.slug || 'news'}/${item.slug}-${item.id}`} 
                className="hover:underline flex items-center gap-1.5"
              >
                <span>✦</span>
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
