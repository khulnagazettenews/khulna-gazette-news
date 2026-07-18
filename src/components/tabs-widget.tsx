'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Eye } from 'lucide-react';

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
}

export default function TabsWidget({ latest, popular }: TabsWidgetProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');

  const list = activeTab === 'latest' ? latest : popular;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tabs Selector */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('latest')}
          className={`flex-1 text-center py-3 text-sm font-bold transition ${
            activeTab === 'latest'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50/20'
              : 'text-gray-500 hover:text-gray-900 bg-gray-50/50'
          }`}
        >
          সর্বশেষ খবর
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex-1 text-center py-3 text-sm font-bold transition ${
            activeTab === 'popular'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50/20'
              : 'text-gray-500 hover:text-gray-900 bg-gray-50/50'
          }`}
        >
          সর্বাধিক পঠিত
        </button>
      </div>

      {/* List items */}
      <div className="divide-y divide-gray-100 p-4">
        {list.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">কোনো খবর পাওয়া যায়নি।</div>
        ) : (
          list.map((item, idx) => (
            <div key={item.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
              <span className="text-xl font-black text-gray-300 w-6 text-center select-none">
                {idx + 1}
              </span>
              <div className="space-y-1">
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.slug}-${item.id}`}
                  className="text-xs font-bold text-gray-800 hover:text-red-600 transition leading-snug line-clamp-2"
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
