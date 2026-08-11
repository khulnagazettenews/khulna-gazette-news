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
          {/* Left Black Badge "সর্বশেষ" */}
          <div 
            className="bg-black text-white px-4 sm:px-6 py-2.5 flex items-center justify-center font-extrabold text-base sm:text-lg shrink-0 select-none z-10 tracking-wide"
            style={{
              fontFamily: 'Bangla, "Noto Sans Bengali", "Hind Siliguri", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            সর্বশেষ
          </div>

          {/* Right Red Ticker Bar with ultra-clear white scrolling text */}
          <div className="bg-[#cc2b2b] text-white flex-1 overflow-hidden relative flex items-center py-2.5 px-3">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-[17px] sm:text-[19px] font-extrabold text-white">
              {tickerItems.map((item, idx) => (
                <Link
                  key={`${item.id}-${idx}`}
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="hover:underline flex items-center gap-2 text-white transition decoration-white underline-offset-4 shrink-0 tracking-wide"
                  style={{
                    fontFamily: 'Bangla, "Noto Sans Bengali", "Hind Siliguri", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'subpixel-antialiased',
                    textRendering: 'optimizeLegibility',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  <span className="text-white font-extrabold text-[17px] sm:text-[19px] leading-normal">{item.title}</span>
                  <span className="text-white/90 font-bold ml-6 select-none text-[18px] sm:text-[20px]">:</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

