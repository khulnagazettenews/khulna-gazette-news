import Link from 'next/link';
import TabsWidget from './tabs-widget';
import PrayerWidget from './prayer-widget';
import AdBanner from './ad-banner';
import { ThumbsUp, Share2, Smartphone } from 'lucide-react';

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
      {/* 1. TABS WIDGET (সর্বশেষ | সর্বাধিক পঠিত) */}
      <TabsWidget latest={latestNews} popular={popularNews} />

      {/* 2. WORLD CUP / SPORTS SPECIAL PROMO BANNER */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-[#1e293b] text-white py-2.5 px-4 text-center font-black text-xs tracking-tight">
          বিশ্বকাপের রোমাঞ্চকর খবর
        </div>
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
          <img
            src="/uploads/sidebar/world_cup_promo.png"
            alt="বিশ্বকাপের খবর"
            className="w-full h-full object-cover hover:scale-105 transition duration-500"
          />
        </div>
      </div>

      {/* 3. EPAPER PROMO BANNER */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-[#1e293b] text-white py-2.5 px-4 text-center font-black text-xs tracking-tight">
          ই-পেপার সংস্করণ
        </div>
        <Link href="/epaper" className="block relative aspect-[4/3] w-full overflow-hidden bg-slate-100 group">
          <img
            src="/uploads/sidebar/epaper_promo.png"
            alt="ই-পেপার সংস্করণ"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white p-2 text-center text-xs font-bold backdrop-blur-xs">
            অনলাইনে পৃষ্ঠা উল্টে পড়ুন →
          </div>
        </Link>
      </div>

      {/* 4. GAZETTE EXCLUSIVE NEWS BOX */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-[#1e293b] text-white py-2.5 px-4 text-center font-black text-xs tracking-tight">
          গেজেট এক্সক্লুসিভ
        </div>
        <div className="p-3 divide-y divide-slate-100 space-y-2">
          {(exclusiveNews.length > 0 ? exclusiveNews : latestNews.slice(0, 3)).map((item) => (
            <div key={item.id} className="pt-2 first:pt-0 flex items-start gap-3 group">
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
              <Link
                href={`/${item.category?.slug || 'news'}/${item.id}`}
                className="text-xs font-bold text-slate-900 group-hover:text-red-650 transition leading-snug line-clamp-2 block flex-1"
              >
                {item.title}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 5. LIKE US ON FACEBOOK WIDGET */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-[#1e293b] text-white py-2.5 px-4 text-center font-black text-xs tracking-tight flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-current text-blue-400" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Like Us on Facebook</span>
        </div>
        <div className="p-4 bg-slate-50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs shrink-0">
              KG
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 leading-tight">Khulna Gazette News</h5>
              <span className="text-[10px] text-slate-500 font-medium">১০ হাজার+ ফলোয়ার</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://www.facebook.com/klngazette"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#1877f2] hover:bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded-md transition text-center flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <ThumbsUp size={13} />
              <span>Follow Page</span>
            </a>
            <a
              href="https://www.facebook.com/klngazette"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-md transition flex items-center gap-1 shrink-0"
            >
              <Share2 size={13} />
              <span>Share</span>
            </a>
          </div>
        </div>
      </div>

      {/* 6. APP DOWNLOAD BANNER */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-[#1e293b] text-white py-2.5 px-4 text-center font-black text-xs tracking-tight flex items-center justify-center gap-1.5">
          <Smartphone size={14} className="text-teal-400" />
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

      {/* 7. SIDEBAR ADVERTISEMENT */}
      <AdBanner ad={sidebarAd} fallbackText="বিজ্ঞাপন স্পেস" className="h-48" />

      {/* 8. YOUTUBE SUBSCRIBE BANNER */}
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

      {/* 9. DAILY NEWSPAPER ANNOUNCEMENT BANNER */}
      <div className="bg-[#057a55] text-white rounded-xl p-4 text-center space-y-2 border border-emerald-700 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-white text-[#057a55] font-black text-xs flex items-center justify-center mx-auto shadow-xs select-none">
          খুলনা গেজেট
        </div>
        <p className="text-xs font-black leading-snug">
          দৈনিক পত্রিকা হিসেবে তালিকাভুক্ত ও পুনঃপ্রকাশিত হচ্ছে
        </p>
        <p className="text-[11px] font-medium text-emerald-100">
          পত্রিকা পেতে অনুরোধের জন্য যোগাযোগ করুন:
        </p>
        <div className="bg-red-600 text-white py-1.5 px-2 rounded-lg text-xs font-mono font-black tracking-wider shadow-xs">
          ০১৭১৮-১৩৬৯৪০, ০১৯১৪-৬৫৬৫২৫
        </div>
      </div>

      {/* 10. PRAYER TIMES WIDGET */}
      <PrayerWidget />
    </div>
  );
}
