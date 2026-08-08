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
    <div className="bg-[#f8f9fa] border-y border-gray-200 py-1.5 font-sans overflow-hidden shadow-2xs">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 flex items-center gap-3">
        {/* Left Red Badge with triangle arrow indicator */}
        <div className="relative shrink-0 flex items-center">
          <span className="bg-[#ed0022] text-white font-extrabold px-3 py-1 text-xs sm:text-sm rounded-xs select-none shadow-2xs flex items-center gap-1.5 z-10">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            ব্রেকিং
          </span>
          {/* Decorative Polygon Arrow */}
          <div className="w-0 h-0 border-y-[13px] border-y-transparent border-l-[10px] border-l-[#ed0022] z-10"></div>
        </div>

        {/* Marquee Ticker with Larger Normal Text & Play Symbol */}
        <div className="flex-1 overflow-hidden relative h-6.5 flex items-center">
          <div className="animate-marquee whitespace-nowrap flex gap-10 text-[17px] sm:text-[19px] text-[#111827] leading-normal font-normal">
            {breakingList.map((item) => (
              <Link
                key={item.id}
                href={`/${item.category?.slug || 'news'}/${item.id}`}
                className="hover:text-[#ed0022] flex items-center gap-2.5 transition group"
              >
                <span className="text-[#ed0022] text-[12px] select-none font-bold">▶</span>
                <span className="text-[#111827] group-hover:text-[#ed0022] font-normal text-[17px] sm:text-[19px] transition">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
