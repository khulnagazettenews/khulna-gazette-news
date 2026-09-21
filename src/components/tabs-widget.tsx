'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/safe-image';

interface TabNewsItem {
  id: string;
  title: string;
  category: { name: string; slug: string };
  slug: string;
  featuredImage?: string | null;
  publishedAt: string | null;
}

interface TabsWidgetProps {
  latest: TabNewsItem[];
  popular: TabNewsItem[];
}

export default function TabsWidget({ latest: initialLatest, popular: initialPopular }: TabsWidgetProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');
  const [latestList, setLatestList] = useState<TabNewsItem[]>(initialLatest);
  const [popularList, setPopularList] = useState<TabNewsItem[]>(initialPopular);

  useEffect(() => {
    // Background live 5-second polling for instant live sidebar news update
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/public/latest-news', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.latest && data.latest.length > 0) {
            setLatestList(data.latest);
          }
          if (data.popular && data.popular.length > 0) {
            setPopularList(data.popular);
          }
        }
      } catch (err) {
        // Silent catch for smooth uninterrupted user experience
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const rawList = activeTab === 'popular' ? popularList : latestList;
  const list = activeTab === 'popular' ? rawList.slice(0, 10) : rawList.slice(0, 20);

  return (
    <div className="bg-white border border-gray-200 rounded shadow-2xs font-sans overflow-hidden">
      {/* 2 Tabs Header: Thinner sleek bar */}
      <div className="grid grid-cols-2 bg-[#343e56] text-white select-none border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('latest')}
          className={`w-full py-1 px-2 text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'latest'
              ? 'bg-[#000000] text-white font-normal'
              : 'bg-[#343e56] text-white font-normal hover:bg-[#283145]'
          }`}
          style={{
            fontFamily: 'Bangla, sans-serif',
            fontSize: '20px',
            fontWeight: 400,
            lineHeight: '22px',
            letterSpacing: '-0.2px',
            textAlign: 'center',
          }}
        >
          <span>সর্বশেষ</span>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('popular')}
          className={`w-full py-1 px-2 text-center transition cursor-pointer flex items-center justify-center ${
            activeTab === 'popular'
              ? 'bg-[#000000] text-white font-normal'
              : 'bg-[#343e56] text-white font-normal hover:bg-[#283145]'
          }`}
          style={{
            fontFamily: 'Bangla, sans-serif',
            fontSize: '20px',
            fontWeight: 400,
            lineHeight: '22px',
            letterSpacing: '-0.2px',
            textAlign: 'center',
          }}
        >
          সর্বাধিক পঠিত
        </button>
      </div>

      {/* List Items Container matching exact screenshot layout */}
      <div className="max-h-[550px] overflow-y-auto kg-tab-scrollbar bg-white p-3">
        {list.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400 font-medium">কোনো খবর পাওয়া যায়নি।</div>
        ) : (
          <div className="space-y-3.5 divide-y divide-gray-100">
            {list.map((item, index) => (
              <div key={item.id} className={`flex items-start gap-3 group ${index > 0 ? 'pt-3.5' : ''}`}>
                {/* Left Thumbnail Image */}
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

                {/* Right Title Text */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <Link
                    href={`/${item.category?.slug || 'news'}/${item.id}`}
                    className="text-[21px] font-normal text-[#000000] group-hover:text-[rgb(0,86,179)] hover:text-[rgb(0,86,179)] transition leading-[22px] text-left line-clamp-3 block tracking-[-0.2px]"
                    style={{
                      fontFamily: 'Bangla, sans-serif',
                      fontSize: '21px',
                      fontWeight: 400,
                      lineHeight: '22px',
                      letterSpacing: '-0.2px',
                      textAlign: 'left',
                      WebkitFontSmoothing: 'antialiased',
                    }}
                  >
                    {item.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
