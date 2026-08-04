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

  return (
    <div className="bg-white border border-gray-300 rounded-none shadow-2xs font-sans overflow-hidden">
      {/* 2 Tabs Header: 100% Exact Match with khulnagazette.com reference screenshot */}
      <div className="grid grid-cols-2 bg-[#2b333e] text-white select-none border-b border-gray-300">
        <button
          type="button"
          onClick={() => setActiveTab('latest')}
          className={`py-2.5 px-3 text-[17px] sm:text-[18px] font-bold text-center tracking-tight transition cursor-pointer ${
            activeTab === 'latest'
              ? 'bg-[#000000] text-white'
              : 'bg-[#2b333e] text-[#d1d5db] hover:text-white hover:bg-[#232a34]'
          }`}
        >
          সর্বশেষ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('popular')}
          className={`py-2.5 px-3 text-[17px] sm:text-[18px] font-bold text-center tracking-tight transition border-l border-gray-700 cursor-pointer ${
            activeTab === 'popular'
              ? 'bg-[#000000] text-white'
              : 'bg-[#2b333e] text-[#d1d5db] hover:text-white hover:bg-[#232a34]'
          }`}
        >
          সর্বাধিক পঠিত
        </button>
      </div>

      {/* List Items Container matching exact scrollbar & spacing from screenshot */}
      <div className="max-h-[390px] overflow-y-auto kg-tab-scrollbar bg-white">
        {list.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400 font-medium">কোনো খবর পাওয়া যায়নি।</div>
        ) : (
          <div className="divide-y divide-gray-200/90">
            {list.slice(0, 15).map((item) => (
              <div key={item.id} className="p-3 flex items-start gap-3 group hover:bg-slate-50/60 transition">
                {/* Left Thumbnail Image */}
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="w-[110px] sm:w-[120px] h-[70px] sm:h-[75px] shrink-0 overflow-hidden bg-gray-100 block relative border border-gray-100"
                >
                  {item.featuredImage ? (
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                      খুলনা গেজেট
                    </div>
                  )}
                </Link>

                {/* Right Title Text (Exact Match with user screenshot) */}
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="text-[16px] sm:text-[17px] font-bold text-[#111111] group-hover:text-[#e60023] transition leading-[1.3] line-clamp-3 block flex-1 font-sans pt-0.5"
                >
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
