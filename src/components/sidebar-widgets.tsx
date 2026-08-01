import Link from 'next/link';
import TabsWidget from './tabs-widget';
import CalendarArchiveWidget from './calendar-archive-widget';
import PrayerWidget from './prayer-widget';
import AdBanner from './ad-banner';
import { Smartphone } from 'lucide-react';
import FacebookWidget from './facebook-widget';

interface SidebarWidgetsProps {
  latestNews: any[];
  popularNews: any[];
  exclusiveNews?: any[];
  sidebarAd?: any;
}

export default function SidebarWidgets({
  latestNews,
  popularNews,
  exclusiveNews = [],
  sidebarAd,
}: SidebarWidgetsProps) {
  return (
    <div className="space-y-5">
      {/* 1. TABS WIDGET (সর্বশেষ | সর্বাধিক পঠিত - TOP POS) */}
      <TabsWidget latest={latestNews} popular={popularNews} />

      {/* 2. GAZETTE EXCLUSIVE NEWS BOX (2ND POS) */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-xs">
        <div className="bg-[#2b354f] text-white py-2.5 px-4 text-center font-bold text-[18px] sm:text-[20px] tracking-tight">
          গেজেট এক্সক্লুসিভ
        </div>
        <div className="p-3 divide-y divide-gray-200 space-y-1">
          {(exclusiveNews.length > 0 ? exclusiveNews : latestNews.slice(0, 3)).map((item) => (
            <div key={item.id} className="py-3 flex items-start gap-3.5 group first:pt-1 last:pb-1">
              <Link
                href={`/${item.category?.slug || 'news'}/${item.id}`}
                className="w-24 h-16 shrink-0 overflow-hidden rounded bg-gray-100 block aspect-[4/3] relative shadow-2xs"
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
              <Link
                href={`/${item.category?.slug || 'news'}/${item.id}`}
                className="text-[16px] sm:text-[18px] font-bold text-[#000000] group-hover:text-[#e60023] transition leading-[1.3] line-clamp-2 block flex-1"
              >
                {item.title}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 3. EPAPER PROMO BANNER (ই-পেপার সংস্করণ) */}
      <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden font-sans">
        <div className="bg-[#2b354f] text-white py-2.5 px-4 text-center font-bold text-[20px] sm:text-[22px] tracking-tight">
          ই-পেপার সংস্করণ
        </div>
        <Link href="/epaper" className="block relative aspect-[4/3] w-full overflow-hidden bg-[#243c3b] group p-2">
          <img
            src="/uploads/sidebar/epaper_promo.jpg"
            alt="ই-পেপার সংস্করণ"
            className="w-full h-full object-cover object-top rounded-xs group-hover:scale-105 transition duration-500 shadow-md"
          />
          <div className="absolute inset-x-0 bottom-0 bg-[#0f172a]/90 text-white py-2 px-3 text-center text-xs font-bold backdrop-blur-xs flex items-center justify-center gap-1">
            <span>অনলাইনে পৃষ্ঠা উল্টে পড়ুন</span>
            <span className="text-amber-400">➔</span>
          </div>
        </Link>
      </div>

      {/* 4. PRAYER TIMES WIDGET */}
      <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
        <div className="bg-[#2b354f] text-white py-3 px-4 text-center font-bold text-[22px] sm:text-[24px] tracking-tight">
          নামাজের সময়সূচি
        </div>
        <div className="p-3">
          <PrayerWidget />
        </div>
      </div>

      {/* 5. CALENDAR ARCHIVE WIDGET (নামাজের সময়সূচির নিচে আর্কাইভ) */}
      <CalendarArchiveWidget />

      {/* 6. LIKE US ON FACEBOOK WIDGET */}
      <FacebookWidget />

      {/* 7. APP DOWNLOAD BANNER */}
      <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
        <div className="bg-[#2b354f] text-white py-2.5 px-2 text-center font-bold text-[16px] sm:text-[18px] tracking-tight flex items-center justify-center gap-1.5 whitespace-nowrap">
          <Smartphone size={18} className="text-teal-400 shrink-0" />
          <span>খুলনা গেজেটের app পেতে ক্লিক করুন</span>
        </div>
        <a
          href="https://play.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-[16/9] w-full overflow-hidden bg-slate-100 group"
        >
          <img
            src="/uploads/sidebar/app_promo.png"
            alt="খুলনা গেজেট অ্যাপ ডাউনলোড"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </a>
      </div>

      {/* 8. SIDEBAR ADVERTISEMENT */}
      <AdBanner ad={sidebarAd} fallbackText="বিজ্ঞাপন স্পেস" className="h-48" />

      {/* 9. YOUTUBE SUBSCRIBE BANNER */}
      <a
        href="https://www.youtube.com/@khulnagazette"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#c40404] hover:bg-red-700 text-white py-3 px-4 rounded-xl shadow-xs transition font-black text-xs flex items-center justify-center gap-2 border border-red-800"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <span>ইউটিউব চ্যানেলে সাবস্ক্রাইব করুন</span>
      </a>

      {/* 10. DAILY NEWSPAPER ANNOUNCEMENT BANNER IMAGE */}
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden">
        <img
          src="/uploads/sidebar/newspaper_announcement.png"
          alt="দৈনিক পত্রিকা হিসেবে নিয়মিত ৪ পৃষ্ঠা ৪ রঙে প্রকাশিত হচ্ছে"
          className="w-full h-auto object-cover block"
        />
      </div>
    </div>
  );
}
