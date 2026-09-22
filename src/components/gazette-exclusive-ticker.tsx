'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/safe-image';

interface GazetteExclusiveTickerProps {
  exclusiveNews: any[];
}

export default function GazetteExclusiveTicker({ exclusiveNews }: GazetteExclusiveTickerProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!exclusiveNews || exclusiveNews.length <= 4 || isPaused) return;

    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        setStartIndex((prev) => (prev + 1) % exclusiveNews.length);
        setIsAnimating(false);
      }, 500); // 500ms vertical slide transition
    }, 4500); // Change item set every 4.5 seconds

    return () => clearInterval(interval);
  }, [exclusiveNews, isPaused]);

  if (!exclusiveNews || exclusiveNews.length === 0) return null;

  // Get current 4 items and next item for smooth sliding transition
  const getVisibleItems = (startIdx: number) => {
    const items: any[] = [];
    const total = exclusiveNews.length;
    for (let i = 0; i < Math.min(5, total); i++) {
      items.push({
        item: exclusiveNews[(startIdx + i) % total],
        key: `${exclusiveNews[(startIdx + i) % total].id}-${startIdx + i}`
      });
    }
    return items;
  };

  const visibleItems = getVisibleItems(startIndex);
  const display4Items = visibleItems.slice(0, 4);

  return (
    <div className="bg-white rounded border border-gray-200 shadow-2xs overflow-hidden">
      <div 
        className="bg-[#353d4c] text-white py-2 px-3 text-center font-normal border-b border-gray-200"
        style={{
          fontFamily: 'Bangla, sans-serif',
          fontSize: '21px',
          fontWeight: 400,
          lineHeight: '23.1px',
          letterSpacing: '-0.2px',
          textAlign: 'center',
        }}
      >
        গেজেট এক্সক্লুসিভ
      </div>

      <div 
        className="p-3 bg-white h-[355px] relative overflow-hidden select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className={`space-y-3.5 divide-y divide-gray-100 transition-transform duration-500 ease-in-out ${
            isAnimating ? '-translate-y-[84px]' : 'translate-y-0'
          }`}
        >
          {visibleItems.map(({ item, key }, index) => (
            <div key={key} className={`flex items-start gap-3 group ${index > 0 ? 'pt-3.5' : ''}`}>
              <Link
                href={`/${item.category?.slug || 'news'}/${item.id}`}
                className="w-[110px] sm:w-[115px] h-[68px] sm:h-[72px] shrink-0 overflow-hidden rounded-xs bg-gray-100 block relative shadow-2xs border border-gray-100"
              >
                <SafeImage
                  src={item.featuredImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </Link>
              <div className="flex-1 min-w-0 pt-0.5">
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="text-[21px] font-normal text-[#000000] hover:text-[rgb(0,86,179)] transition leading-[22px] tracking-[-0.2px] line-clamp-3 block"
                  style={{
                    fontFamily: 'Bangla, sans-serif',
                    fontSize: '21px',
                    fontWeight: 400,
                    lineHeight: '22px',
                    letterSpacing: '-0.2px',
                    WebkitFontSmoothing: 'antialiased',
                  }}
                >
                  {item.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
