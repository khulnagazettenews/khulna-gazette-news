import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function BreakingNewsTicker() {
  let customTitles: string[] = [];
  let isCustomActive = false;
  let breakingList: any[] = [];

  try {
    // 1. Check if custom breaking ticker text is enabled in specialTopic
    const customConfig = await prisma.specialTopic.findUnique({
      where: { id: 'custom_breaking_ticker' },
    });

    if (customConfig && customConfig.isActive && customConfig.newsIds) {
      try {
        const parsed = JSON.parse(customConfig.newsIds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          customTitles = parsed.filter((t: any) => typeof t === 'string' && t.trim().length > 0);
          if (customTitles.length > 0) {
            isCustomActive = true;
          }
        }
      } catch {
        // Safe fallback
      }
    }

    // 2. Fetch DB news if custom titles are not enabled/empty
    if (!isCustomActive) {
      breakingList = await prisma.news.findMany({
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

      // Fallback to latest published news
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
    }
  } catch (error) {
    console.error('[BreakingNewsTicker] Failed to reach database:', error);
    return null;
  }

  if (!isCustomActive && breakingList.length === 0) return null;
  if (isCustomActive && customTitles.length === 0) return null;

  // Build marquee items
  const rawItems = isCustomActive
    ? customTitles.map((title, idx) => ({ id: `custom-${idx}`, title, isCustom: true }))
    : breakingList.map((item) => ({
        id: item.id,
        title: item.title,
        href: `/${item.category?.slug || 'news'}/${item.id}`,
        isCustom: false,
      }));

  // Duplicate for continuous seamless marquee loop with zero gaps
  const tickerItems = [...rawItems, ...rawItems, ...rawItems, ...rawItems];

  const itemStyle = {
    fontFamily:
      'solaimanLipi, SolaimanLipi, solaimanlipi, Vrinda, Bangla, "Noto Sans Bengali", "Hind Siliguri", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '25px',
    textAlign: 'start' as const,
    WebkitFontSmoothing: 'antialiased' as const,
    MozOsxFontSmoothing: 'grayscale' as const,
  };

  return (
    <div className="w-full bg-white py-1 font-sans">
      <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-stretch overflow-hidden rounded-xs shadow-2xs">
          {/* Left Black Badge "সর্বশেষ" */}
          <div
            className="bg-black text-white px-3.5 sm:px-5 py-1 flex items-center justify-center font-normal shrink-0 select-none z-10"
            style={itemStyle}
          >
            সর্বশেষ
          </div>

          {/* Right Red Ticker Bar with ultra-clear white scrolling text */}
          <div className="bg-[#cc2b2b] text-white flex-1 overflow-hidden relative flex items-center py-1 px-3">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-6 font-bold text-white">
              {tickerItems.map((item, idx) =>
                item.isCustom ? (
                  <div
                    key={`${item.id}-${idx}`}
                    className="flex items-center gap-3 text-white shrink-0 select-none"
                    style={itemStyle}
                  >
                    <span className="text-white font-normal text-[18px] leading-[25px]">
                      {item.title}
                    </span>
                    <span className="text-yellow-300 font-extrabold ml-3 select-none text-[11px]">
                      ◆
                    </span>
                  </div>
                ) : (
                  <Link
                    key={`${item.id}-${idx}`}
                    href={(item as any).href || '#'}
                    className="hover:underline flex items-center gap-3 text-white transition decoration-white underline-offset-4 shrink-0"
                    style={itemStyle}
                  >
                    <span className="text-white font-normal text-[18px] leading-[25px]">
                      {item.title}
                    </span>
                    <span className="text-yellow-300 font-extrabold ml-3 select-none text-[11px]">
                      ◆
                    </span>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


