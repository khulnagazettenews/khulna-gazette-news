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
    if (diffMin < 60) return `${diffMin} মিনিট আগে`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    return date.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-xs">
      {/* 2 Tabs Header in Dark Slate / Black matching khulnagazette.com */}
      <div className="grid grid-cols-2 bg-[#111827] text-white text-[16px] sm:text-[18px] font-bold text-center select-none border-b border-gray-800">
        <button
          onClick={() => setActiveTab('latest')}
          className={`py-3 transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'latest'
              ? 'bg-[#1f2937] text-white border-b-3 border-[#e60023] font-bold'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
        >
          <span>সর্বশেষ</span>
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={`py-3 transition border-l border-gray-800 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'popular'
              ? 'bg-[#1f2937] text-white border-b-3 border-[#e60023] font-bold'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
        >
          <span>সর্বাধিক পঠিত</span>
        </button>
      </div>

      {/* List Items Container matching khulnagazette.com font and layout */}
      <div className="divide-y divide-gray-200 p-3 max-h-[440px] overflow-y-auto custom-scrollbar">
        {list.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-400 font-medium">কোনো খবর পাওয়া যায়নি।</div>
        ) : (
          list.slice(0, 10).map((item) => (
            <div key={item.id} className="py-3 flex items-start gap-3.5 group first:pt-1 last:pb-1">
              <Link
                href={`/${item.category?.slug || 'news'}/${item.id}`}
                className="w-24 h-16 shrink-0 overflow-hidden rounded bg-gray-100 block relative shadow-2xs"
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

              <div className="space-y-1 flex-1 min-w-0">
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="text-[15px] sm:text-[17px] font-bold text-[#000000] group-hover:text-[#e60023] transition leading-[1.3] line-clamp-2 block"
                >
                  {item.title}
                </Link>
                {item.publishedAt && (
                  <span className="text-[13px] text-gray-500 block font-medium">
                    {getTimeAgo(item.publishedAt)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


