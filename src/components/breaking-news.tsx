import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function BreakingNewsTicker() {
  let breakingList = await prisma.news.findMany({
    where: {
      status: 'PUBLISHED',
      isBreaking: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 8,
    include: {
      category: true,
    },
  });

  // Fallback to latest news if no specific breaking news flag is set
  if (breakingList.length === 0) {
    breakingList = await prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      take: 8,
      include: {
        category: true,
      },
    });
  }

  if (breakingList.length === 0) return null;

  // Duplicate for continuous seamless marquee loop with zero gaps or jumps
  const tickerItems = [...breakingList, ...breakingList];

  return (
    <div className="w-full bg-white py-1.5 font-sans">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-stretch overflow-hidden rounded-xs shadow-2xs">
          {/* Left Black Badge "এইমাত্র" */}
          <div className="bg-black text-white px-4 sm:px-6 py-2 flex items-center justify-center font-bold text-base sm:text-lg shrink-0 select-none z-10">
            এইমাত্র
          </div>

          {/* Right Red Ticker Bar with ultra-clear white scrolling text */}
          <div className="bg-[#cc2b2b] text-white flex-1 overflow-hidden relative flex items-center py-2 px-3">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-10 text-[16px] sm:text-[18px] font-bold text-white">
              {tickerItems.map((item, idx) => (
                <Link
                  key={`${item.id}-${idx}`}
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="hover:underline flex items-center gap-2 text-white transition decoration-white underline-offset-4 shrink-0"
                >
                  <span className="text-white font-bold text-[16px] sm:text-[18px] leading-normal">{item.title}</span>
                  <span className="text-white/80 font-bold ml-6 select-none">:</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

