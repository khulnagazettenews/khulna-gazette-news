'use client';

import { useState } from 'react';
import Link from 'next/link';

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

export default function TabsWidget({ latest, popular }: TabsWidgetProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');

  const list = activeTab === 'popular' ? popular : latest;

  const getTimeAgo = (dateVal?: string | Date | null) => {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    const diffMin = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (diffMin < 1) return '০ মিনিট আগে';
    if (diffMin < 60) return `${diffMin.toLocaleString('bn-BD')} মিনিট আগে`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours.toLocaleString('bn-BD')} ঘণ্টা আগে`;
    return date.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded shadow-2xs font-sans overflow-hidden">
      {/* 2 Tabs Header: Thinner sleek bar */}
      <div className="grid grid-cols-2 bg-[#343e56] text-white select-none border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('latest')}
          className={`w-full py-1 px-2 text-center transition cursor-pointer flex items-center justify-center ${
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
          সর্বশেষ
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
      <div className="max-h-[410px] overflow-y-auto kg-tab-scrollbar bg-white p-3">
        {list.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400 font-medium">কোনো খবর পাওয়া যায়নি।</div>
        ) : (
          <div className="space-y-3.5 divide-y divide-gray-100">
            {list.slice(0, 15).map((item, index) => (
              <div key={item.id} className={`flex items-start gap-3 group ${index > 0 ? 'pt-3.5' : ''}`}>
                {/* Left Thumbnail Image */}
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="w-[110px] sm:w-[115px] h-[68px] sm:h-[72px] shrink-0 overflow-hidden rounded-xs bg-gray-100 block relative shadow-2xs border border-gray-100"
                >
                  {item.featuredImage ? (
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                      খুলনা গেজেট
                    </div>
                  )}
                </Link>

                {/* Right Title Text */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <Link
                    href={`/${item.category?.slug || 'news'}/${item.id}`}
                    className="text-[23px] font-normal text-[#000000] group-hover:text-[rgb(0,86,179)] hover:text-[rgb(0,86,179)] transition leading-[34.5px] text-start line-clamp-3 block"
                    style={{
                      fontFamily: 'solaimanLipi, SolaimanLipi, solaimanlipi, Vrinda, Bangla, "Noto Sans Bengali", "Hind Siliguri", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      fontSize: '23px',
                      fontWeight: 400,
                      lineHeight: '34.5px',
                      textAlign: 'start',
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
