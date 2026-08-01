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
    <div className="bg-[#e60023] text-white py-2.5 border-y border-red-700 overflow-hidden shadow-sm">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <span className="shrink-0 bg-white text-[#e60023] font-black px-3 py-1 rounded text-sm sm:text-base select-none shadow-sm">
          ব্রেকিং নিউজ
        </span>
        <div className="flex-1 overflow-hidden relative h-7 flex items-center">
          {/* Marquee Ticker */}
          <div className="animate-marquee whitespace-nowrap flex gap-12 text-base sm:text-lg lg:text-[20px] font-bold tracking-tight">
            {breakingList.map((item) => (
              <Link 
                key={item.id} 
                href={`/${item.category?.slug || 'news'}/${item.id}`} 
                className="hover:underline flex items-center gap-2"
              >
                <span className="text-yellow-300">✦</span>
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
