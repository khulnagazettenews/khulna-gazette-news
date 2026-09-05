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
  const tickerItems = [...breakingList, ...breakingList, ...breakingList, ...breakingList];

  return (
    <div className="w-full bg-white py-1 font-sans">
      <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-stretch overflow-hidden rounded-xs shadow-2xs">
          {/* Left Black Badge "সর্বশেষ" */}
          <div 
            className="bg-black text-white px-3.5 sm:px-5 py-1 flex items-center justify-center font-normal shrink-0 select-none z-10"
            style={{
              fontFamily: 'solaimanLipi, SolaimanLipi, solaimanlipi, Vrinda, Bangla, "Noto Sans Bengali", "Hind Siliguri", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '25px',
              textAlign: 'start',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            সর্বশেষ
          </div>

          {/* Right Red Ticker Bar with ultra-clear white scrolling text */}
          <div className="bg-[#cc2b2b] text-white flex-1 overflow-hidden relative flex items-center py-1 px-3">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-6 font-bold text-white">
              {tickerItems.map((item, idx) => (
                <Link
                  key={`${item.id}-${idx}`}
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="hover:underline flex items-center gap-3 text-white transition decoration-white underline-offset-4 shrink-0"
                  style={{
                    fontFamily: 'solaimanLipi, SolaimanLipi, solaimanlipi, Vrinda, Bangla, "Noto Sans Bengali", "Hind Siliguri", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '18px',
                    fontWeight: 400,
                    lineHeight: '25px',
                    textAlign: 'start',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                  }}
                >
                  <span className="text-white font-normal text-[18px] leading-[25px]">{item.title}</span>
                  <span className="text-yellow-300 font-extrabold ml-3 select-none text-[11px]">◆</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

