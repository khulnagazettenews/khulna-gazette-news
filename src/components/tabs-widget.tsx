'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TabNewsItem {
  id: string;
  title: string;
  category: { name: string; slug: string };
  slug: string;
  publishedAt: string | null;
}

interface TabsWidgetProps {
  latest: TabNewsItem[];
  popular: TabNewsItem[];
  discussed?: TabNewsItem[];
}

export default function TabsWidget({ latest, popular, discussed = [] }: TabsWidgetProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular' | 'discussed'>('latest');

  const getActiveList = () => {
    if (activeTab === 'popular') return popular;
    if (activeTab === 'discussed' && discussed.length > 0) return discussed;
    return latest;
  };

  const list = getActiveList();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tabs Selector */}
      <div className="flex border-b border-gray-200 text-xs sm:text-sm font-bold text-center">
        <button
          onClick={() => setActiveTab('latest')}
          className={`flex-1 py-3 transition ${
            activeTab === 'latest'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50/20'
              : 'text-gray-600 hover:text-gray-900 bg-gray-50/50'
          }`}
        >
          সর্বশেষ
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex-1 py-3 transition border-l border-gray-150 ${
            activeTab === 'popular'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50/20'
              : 'text-gray-600 hover:text-gray-900 bg-gray-50/50'
          }`}
        >
          পঠিত
        </button>
        <button
          onClick={() => setActiveTab('discussed')}
          className={`flex-1 py-3 transition border-l border-gray-150 ${
            activeTab === 'discussed'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50/20'
              : 'text-gray-600 hover:text-gray-900 bg-gray-50/50'
          }`}
        >
          আলোচিত
        </button>
      </div>

      {/* List items */}
      <div className="divide-y divide-gray-100 p-4">
        {list.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">কোনো খবর পাওয়া যায়নি।</div>
        ) : (
          list.map((item, idx) => (
            <div key={item.id} className="py-2.5 flex items-start gap-3 first:pt-0 last:pb-0">
              <span className="text-lg font-black text-gray-300 w-5 text-center select-none shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="space-y-1 flex-1">
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="text-xs sm:text-sm font-bold text-gray-850 hover:text-red-600 transition leading-snug line-clamp-2"
                >
                  {item.title}
                </Link>
                {item.publishedAt && (
                  <span className="text-[10px] text-gray-400 block font-medium">
                    {new Date(item.publishedAt).toLocaleTimeString('bn-BD', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
