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
          <span className="bg-[#e60023] text-white font-extrabold px-3 py-1 text-xs sm:text-sm rounded-xs select-none shadow-2xs flex items-center gap-1.5 z-10">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            ব্রেকিং নিউজ
          </span>
          {/* Decorative Polygon Arrow */}
          <div className="w-0 h-0 border-y-[13px] border-y-transparent border-l-[10px] border-l-[#e60023] z-10"></div>
        </div>

        {/* Marquee Ticker with Dark Sharp Clear Text */}
        <div className="flex-1 overflow-hidden relative h-6 flex items-center">
          <div className="animate-marquee whitespace-nowrap flex gap-10 text-[16px] sm:text-[18px] font-extrabold text-[#000000] leading-normal subpixel-antialiased">
            {breakingList.map((item) => (
              <Link 
                key={item.id} 
                href={`/${item.category?.slug || 'news'}/${item.id}`} 
                className="hover:text-[#e60023] flex items-center gap-2.5 transition group"
              >
                <span className="text-[#e60023] text-[12px] select-none font-extrabold">▶</span>
                <span className="text-[#000000] group-hover:text-[#e60023] font-bold text-[16px] sm:text-[18px] transition">
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
