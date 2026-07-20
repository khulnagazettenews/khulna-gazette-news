import Link from 'next/link';
import TabsWidget from './tabs-widget';
import PrayerWidget from './prayer-widget';
import AdBanner from './ad-banner';
import { BookOpen } from 'lucide-react';

interface HeroNewsItem {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  featuredImage?: string | null;
  content: string;
  publishedAt: Date | string | null;
  category: { name: string; slug: string };
  reporterName?: string | null;
}

interface HomeHeroProps {
  news: HeroNewsItem[];
  latestNews: any[];
  popularNews: any[];
  sidebarAd?: any;
}

export default function HomeHero({ news, latestNews, popularNews, sidebarAd }: HomeHeroProps) {
  if (!news || news.length === 0) return null;

  // Distribute news items according to Prothom-Alo layout structure
  const leftColumnNews = news.slice(0, 2); // 2 cards on far left
  const leadStory = news[2] || news[0]; // Main big featured story in center
  const subGridNews = news.slice(3, 12); // 3x3 sub-grid (9 items) under main lead

  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 140 ? text.slice(0, 140) + '...' : text;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4">
      {/* 1. Left Column (2 Cols on LG): 2 Stacked Cards */}
      <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
        {leftColumnNews.map((story) => (
          <div
            key={story.id}
            className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group h-full"
          >
            {story.featuredImage && (
              <Link
                href={`/${story.category?.slug || 'news'}/${story.id}`}
                className="block aspect-video overflow-hidden rounded-lg bg-slate-100 mb-3"
              >
                <img
                  src={story.featuredImage}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </Link>
            )}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wide">
                {story.category?.name}
              </span>
              <Link href={`/${story.category?.slug || 'news'}/${story.id}`} className="block">
                <h3 className="text-sm font-black text-gray-900 group-hover:text-red-650 transition leading-snug line-clamp-3">
                  {story.title}
                </h3>
              </Link>
            </div>
            <span className="text-[10px] text-gray-400 font-medium block pt-2 border-t border-gray-100 mt-3">
              {story.publishedAt &&
                new Date(story.publishedAt).toLocaleDateString('bn-BD', {
                  month: 'short',
                  day: 'numeric',
                })}
            </span>
          </div>
        ))}
      </div>

      {/* 2. Middle Main Column (6 Cols on LG): Main Featured Lead Story + 3x3 Grid */}
      <div className="lg:col-span-6 space-y-6">
        {/* Main Lead Card */}
        {leadStory && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
            <Link
              href={`/${leadStory.category?.slug || 'news'}/${leadStory.id}`}
              className="block relative aspect-[16/9] overflow-hidden"
            >
              {leadStory.featuredImage ? (
                <img
                  src={leadStory.featuredImage}
                  alt={leadStory.title}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-gray-400 font-bold">
                  খুলনা গেজেট
                </div>
              )}
              <span className="absolute bottom-3 left-3 bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded shadow">
                {leadStory.category?.name}
              </span>
            </Link>

            <div className="p-5 space-y-3">
              <Link
                href={`/${leadStory.category?.slug || 'news'}/${leadStory.id}`}
                className="block"
              >
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 group-hover:text-red-650 transition leading-tight">
                  {leadStory.title}
                </h1>
              </Link>
              <p className="text-xs sm:text-sm text-gray-650 leading-relaxed">
                {getExcerpt(leadStory.content)}
              </p>
            </div>
          </div>
        )}

        {/* 3x3 Sub-Grid under Main Lead */}
        {subGridNews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            {subGridNews.map((item) => (
              <div key={item.id} className="group space-y-2 flex flex-col justify-between border-b sm:border-b-0 border-gray-100 pb-3 sm:pb-0">
                {item.featuredImage && (
                  <Link
                    href={`/${item.category?.slug || 'news'}/${item.id}`}
                    className="block aspect-[16/10] overflow-hidden rounded-md bg-slate-100"
                  >
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                )}
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="block"
                >
                  <h4 className="text-xs font-bold text-gray-850 group-hover:text-red-600 transition leading-snug line-clamp-3">
                    {item.title}
                  </h4>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Right Sidebar Column (3 Cols on LG): Tabs + Ad + Widgets */}
      <div className="lg:col-span-3 space-y-5">
        <TabsWidget latest={latestNews} popular={popularNews} discussed={latestNews} />
        
        <AdBanner ad={sidebarAd} fallbackText="বিজ্ঞাপন ব্যানার" className="h-48" />

        {/* Epaper mini box */}
        <div className="bg-red-50/50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-gray-900">আজকের ই-পেপার</h4>
            <p className="text-[10px] text-gray-500 font-medium">ছাপা কাগজের হুবহু ডিজিটালি পড়ুন</p>
          </div>
          <Link
            href="/epaper"
            className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg transition shadow flex items-center justify-center shrink-0"
          >
            <BookOpen size={16} />
          </Link>
        </div>

        <PrayerWidget />
      </div>
    </div>
  );
}
