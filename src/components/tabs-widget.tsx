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
      {/* 2 Tabs Header: Thinner tab bar */}
      <div className="grid grid-cols-2 bg-[#343e56] text-white select-none border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('latest')}
          className={`w-full py-1 px-2 text-[15px] sm:text-[16px] font-bold text-center transition cursor-pointer leading-tight flex items-center justify-center ${
            activeTab === 'latest'
              ? 'bg-[#000000] text-white font-extrabold'
              : 'bg-[#343e56] text-white hover:bg-[#283145]'
          }`}
        >
          সর্বশেষ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('popular')}
          className={`w-full py-1 px-2 text-[15px] sm:text-[16px] font-bold text-center transition cursor-pointer leading-tight flex items-center justify-center ${
            activeTab === 'popular'
              ? 'bg-[#000000] text-white font-extrabold'
              : 'bg-[#343e56] text-white hover:bg-[#283145]'
          }`}
        >
          সর্বাধিক পঠিত
        </button>
      </div>

      {/* List Items Container matching exact scrollbar & spacing */}
      <div className="max-h-[390px] overflow-y-auto kg-tab-scrollbar bg-white p-3">
        {list.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400 font-medium">কোনো খবর পাওয়া যায়নি।</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {list.slice(0, 15).map((item) => (
              <div key={item.id} className="py-2.5 flex items-start gap-3 group first:pt-0 last:pb-0">
                {/* Left Thumbnail Image */}
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="w-[92px] sm:w-[98px] h-[62px] sm:h-[66px] shrink-0 overflow-hidden rounded bg-gray-100 block relative border border-gray-100 shadow-2xs"
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

                {/* Right Title & Time Ago Text */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/${item.category?.slug || 'news'}/${item.id}`}
                    className="text-[15px] sm:text-[16px] font-bold text-[#111827] group-hover:text-[#e60023] transition leading-[1.3] line-clamp-2 block font-sans"
                  >
                    {item.title}
                  </Link>
                  {item.publishedAt && (
                    <span className="text-[12px] text-gray-400 block font-medium mt-1">
                      {getTimeAgo(item.publishedAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
