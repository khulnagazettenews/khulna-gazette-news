'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CategoryNewsItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  content?: string;
  publishedAt: string | Date | null;
  category: { name: string; slug: string };
}

interface CategoryTabData {
  name: string;
  slug: string;
  items: CategoryNewsItem[];
}

interface CategoryTabSectionProps {
  categoriesData: Record<string, CategoryTabData>;
  defaultCategorySlug?: string;
}

export default function CategoryTabSection({
  categoriesData,
  defaultCategorySlug = 'bangladesh',
}: CategoryTabSectionProps) {
  const tabsList = [
    { name: 'বাংলাদেশ', slug: 'bangladesh' },
    { name: 'খুলনাঞ্চল', slug: 'khulnanchal' },
    { name: 'রাজনীতি', slug: 'politics' },
    { name: 'অর্থনীতি', slug: 'economy' },
    { name: 'আন্তর্জাতিক', slug: 'international' },
    { name: 'খেলা', slug: 'sports' },
    { name: 'বিনোদন', slug: 'entertainment' },
    { name: 'শিক্ষা', slug: 'education' },
    { name: 'মুক্তভাবনা', slug: 'motamot' },
    { name: 'ইসলাম ও জীবন', slug: 'islam-and-life' },
    { name: 'গেজেট এক্সক্লুসিভ', slug: 'exclusive' },
  ];

  const [activeSlug, setActiveSlug] = useState<string>(defaultCategorySlug);

  // Get active items or fallback to default tab items
  const activeData = categoriesData[activeSlug] || categoriesData[defaultCategorySlug] || {
    name: 'বাংলাদেশ',
    slug: 'bangladesh',
    items: [],
  };

  // Limit to 5 cards as requested by the user
  const displayItems = activeData.items.slice(0, 5);

  const getExcerpt = (html?: string) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 70 ? text.slice(0, 70) + '...' : text;
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-5 my-6">
      {/* Scrollable Horizontal Category Bar */}
      <div className="border-b border-gray-200 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 text-xs sm:text-sm font-bold no-scrollbar">
          {tabsList.map((tab) => {
            const isActive = activeSlug === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => setActiveSlug(tab.slug)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition duration-200 select-none ${
                  isActive
                    ? 'bg-red-600 text-white font-extrabold shadow-sm'
                    : 'text-gray-700 hover:bg-slate-100 hover:text-red-600'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* More Categories Link */}
        <Link
          href={`/${activeSlug}`}
          className="text-xs text-red-600 font-bold hover:underline shrink-0 pl-2 border-l border-gray-200 flex items-center gap-1"
        >
          <span>আরও</span>
          <span>»</span>
        </Link>
      </div>

      {/* 5 News Cards Grid */}
      {displayItems.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-xs sm:text-sm">
          এই ক্যাটাগরিতে কোনো সংবাদ পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {displayItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="group bg-slate-50/70 border border-slate-150 hover:border-red-300 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Image */}
                <Link
                  href={`/${item.category?.slug || activeSlug}/${item.slug}-${item.id}`}
                  className="block aspect-[16/10] overflow-hidden bg-slate-200 relative"
                >
                  {item.featuredImage ? (
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                      খুলনা গেজেট
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wide block">
                    {item.category?.name || activeData.name}
                  </span>
                  <Link
                    href={`/${item.category?.slug || activeSlug}/${item.slug}-${item.id}`}
                    className="block"
                  >
                    <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-red-650 transition leading-snug line-clamp-3">
                      {item.title}
                    </h4>
                  </Link>
                  {item.content && (
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                      {getExcerpt(item.content)}
                    </p>
                  )}
                </div>
              </div>

              {/* Date footer */}
              {item.publishedAt && (
                <div className="px-3 pb-3 pt-2 text-[10px] text-gray-400 font-medium border-t border-slate-100">
                  {new Date(item.publishedAt).toLocaleDateString('bn-BD', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
