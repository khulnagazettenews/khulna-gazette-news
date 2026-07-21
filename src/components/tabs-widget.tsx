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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* 2 Tabs Header in Dark Slate */}
      <div className="grid grid-cols-2 bg-[#1e293b] text-white text-xs sm:text-sm font-extrabold text-center border-b border-slate-700 select-none">
        <button
          onClick={() => setActiveTab('latest')}
          className={`py-3 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'latest'
              ? 'bg-[#0f172a] text-white border-b-2 border-red-500 font-black'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <span>সর্বশেষ</span>
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={`py-3 transition border-l border-slate-700 flex items-center justify-center gap-1.5 ${
            activeTab === 'popular'
              ? 'bg-[#0f172a] text-white border-b-2 border-red-500 font-black'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <span>সর্বাধিক পঠিত</span>
        </button>
      </div>

      {/* List Items */}
      <div className="divide-y divide-slate-100 p-3 max-h-[380px] overflow-y-auto">
        {list.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">কোনো খবর পাওয়া যায়নি।</div>
        ) : (
          list.slice(0, 7).map((item) => (
            <div key={item.id} className="py-2.5 flex items-start gap-3 first:pt-1 last:pb-1 group">
              <Link
                href={`/${item.category?.slug || 'news'}/${item.id}`}
                className="w-16 h-12 shrink-0 overflow-hidden rounded-md bg-slate-100 block aspect-[4/3]"
              >
                {item.featuredImage ? (
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-500 font-bold">
                    খুলনা গেজেট
                  </div>
                )}
              </Link>

              <div className="space-y-1 flex-1 min-w-0">
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="text-xs font-bold text-slate-900 group-hover:text-red-650 transition leading-snug line-clamp-2 block"
                >
                  {item.title}
                </Link>
                {item.publishedAt && (
                  <span className="text-[10px] text-slate-400 block font-medium">
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
