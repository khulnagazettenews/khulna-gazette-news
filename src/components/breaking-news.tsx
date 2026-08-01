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
    <div className="bg-[#e60023] text-white py-0.5 border-y border-red-700 overflow-hidden shadow-2xs font-sans antialiased">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 flex items-center gap-2.5">
        <span className="shrink-0 bg-white text-[#e60023] font-black px-2 py-0.5 rounded text-xs select-none shadow-2xs">
          ব্রেকিং নিউজ
        </span>
        <div className="flex-1 overflow-hidden relative h-5 sm:h-5.5 flex items-center">
          {/* Marquee Ticker */}
          <div className="animate-marquee whitespace-nowrap flex gap-10 text-[16px] sm:text-[18px] font-black tracking-normal text-white drop-shadow-2xs">
            {breakingList.map((item) => (
              <Link 
                key={item.id} 
                href={`/${item.category?.slug || 'news'}/${item.id}`} 
                className="hover:text-yellow-200 flex items-center gap-2 transition"
              >
                <span className="text-yellow-300 text-[11px] select-none font-bold">●</span>
                <span className="text-white font-extrabold text-[16px] sm:text-[18px]">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
