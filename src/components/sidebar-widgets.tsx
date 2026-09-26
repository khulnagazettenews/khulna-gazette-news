import Link from 'next/link';
import TabsWidget from '@/components/tabs-widget';
import SafeImage from '@/components/safe-image';
import CalendarArchiveWidget from './calendar-archive-widget';
import PrayerWidget from './prayer-widget';
import AdBanner from './ad-banner';
import { Smartphone } from 'lucide-react';
import FacebookWidget from './facebook-widget';
import GazetteExclusiveTicker from './gazette-exclusive-ticker';

interface SidebarWidgetsProps {
  latestNews: any[];
  popularNews: any[];
  exclusiveNews?: any[];
  sidebarAd?: any;
  sidebarAds?: any[];
  isEpaperPage?: boolean;
  availableDates?: string[];
  specialTopic?: any;
  specialTopicNews?: any[];
}

function RenderAdItem({ ad }: { ad: any }) {
  if (!ad) return null;

  if (ad.adType === 'HTML_SCRIPT') {
    return (
      <div className="bg-white rounded border border-gray-200 shadow-2xs overflow-hidden p-2 my-2">
        <div dangerouslySetInnerHTML={{ __html: ad.codeSnippet || '' }} />
      </div>
    );
  }

  if (ad.adType === 'TEXT_IMAGE') {
    return (
      <div className="bg-white rounded border border-gray-200 shadow-2xs overflow-hidden p-3.5 space-y-2.5 font-sans my-2">
        <h4 className="font-bold text-[17px] text-slate-900 leading-snug">{ad.title}</h4>
        {ad.imageUrl && (
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto rounded-xs object-cover" />
        )}
        {ad.description && (
          <p className="text-slate-600 text-xs leading-relaxed font-medium">{ad.description}</p>
        )}
        {ad.targetUrl && (
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-[#0056b3] text-white font-bold text-xs py-1.5 px-3 rounded-md hover:bg-blue-700 transition"
          >
            <span>বিস্তারিত দেখুন</span>
            <span>➔</span>
          </a>
        )}
      </div>
    );
  }

  // Default IMAGE type
  return (
    <div className="bg-white rounded border border-gray-200 shadow-2xs overflow-hidden font-sans my-2">
      {ad.title && ad.title !== 'বিজ্ঞাপন ব্যানার' && (
        <div className="bg-[#353d4c] text-white py-1 px-2.5 text-center font-normal text-[15px] border-b border-gray-200 truncate">
          {ad.title}
        </div>
      )}
      <a
        href={ad.targetUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full overflow-hidden bg-slate-100 group"
      >
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-auto object-cover group-hover:scale-105 transition duration-500 block"
        />
      </a>
    </div>
  );
}

export default function SidebarWidgets({
  latestNews,
  popularNews,
  exclusiveNews = [],
  sidebarAd,
  sidebarAds = [],
  isEpaperPage = false,
  availableDates = [],
  specialTopic,
  specialTopicNews = [],
}: SidebarWidgetsProps) {
  const topAds = sidebarAds.filter(a => a.position === 'sidebar_widget_top');
  const middleAds = sidebarAds.filter(a => a.position === 'sidebar_widget_middle');
  const bottomAds = sidebarAds.filter(a => a.position === 'sidebar_widget_bottom' || a.position === 'sidebar_banner');
  return (
    <div className="space-y-5">
      {/* 1. TABS WIDGET (সর্বশেষ | সর্বাধিক পঠিত - 1st) */}
      <TabsWidget latest={latestNews} popular={popularNews} />

      {/* 1.5 SPECIAL TOPIC / FEATURED SECTION (Right below TabsWidget - সর্বশেষ এর নিচে) */}
      {specialTopic?.isActive && specialTopicNews.length > 0 && (
        <div className="bg-[#f3f7f6] rounded-2xl p-2 border border-gray-200/80 shadow-xs">
          <div className="bg-[#02474d] text-white px-3.5 py-2 rounded-xl flex items-center justify-between gap-2 shadow-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-300 font-bold text-sm">★</span>
              <h4 className="text-sm font-bold text-white tracking-tight">{specialTopic.title}</h4>
            </div>
            {specialTopicNews[0] && (
              <Link
                href={`/${specialTopicNews[0].category?.slug || 'news'}/${specialTopicNews[0].id}`}
                className="text-[11px] font-bold bg-white text-[#02474d] px-2.5 py-1 rounded-full hover:bg-slate-100 transition"
              >
                বিস্তারিত
              </Link>
            )}
          </div>

          <div className="space-y-2">
            {specialTopicNews.slice(0, 5).map((item, idx) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg p-2 border border-gray-200/60 shadow-2xs flex items-center gap-2.5 group hover:shadow-xs transition"
              >
                <div className="w-6 h-6 rounded-full bg-[#02474d]/10 text-[#02474d] font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                {item.featuredImage && (
                  <Link href={`/${item.category?.slug || 'news'}/${item.id}`} className="block w-14 h-10 shrink-0 overflow-hidden rounded bg-gray-100">
                    <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/${item.category?.slug || 'news'}/${item.id}`}>
                    <h5 className="text-xs font-bold text-gray-900 group-hover:text-[#02474d] transition line-clamp-2 leading-tight">
                      {item.title}
                    </h5>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CALENDAR ARCHIVE WIDGET (আর্কাইভ / ই-পেপার আর্কাইভ - Right below TabsWidget) */}
      <CalendarArchiveWidget
        title={isEpaperPage ? 'ই-পেপার আর্কাইভ' : 'আর্কাইভ'}
        targetPath={isEpaperPage ? '/epaper' : '/archive'}
        availableDates={availableDates}
      />

      {/* 2. APP DOWNLOAD BANNER (খুলনা গেজেটের app পেতে ক্লিক করুন - Right under TabsWidget) */}
      <div className="bg-white rounded border border-[#1e293b]/30 shadow-xs overflow-hidden">
        <div 
          className="bg-[#243048] text-white py-2 px-3 text-center font-normal flex items-center justify-center gap-2 whitespace-nowrap"
          style={{
            fontFamily: 'Bangla, sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: '22px',
            letterSpacing: '-0.2px',
          }}
        >
          <Smartphone size={20} className="text-[#00d2b5] shrink-0" />
          <span>খুলনা গেজেটের app পেতে ক্লিক করুন</span>
        </div>
        <a
          href="https://play.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block relative w-full overflow-hidden bg-slate-100 group p-1 border-t border-gray-200"
        >
          <img
            src="/uploads/sidebar/app_banner.jpg"
            alt="খুলনা গেজেট অ্যাপ ডাউনলোড"
            className="w-full h-auto object-cover block group-hover:scale-[1.01] transition duration-300"
          />
        </a>
      </div>

      {/* 2. EPAPER PROMO BANNER (ই-পেপার সংস্করণ - অনলাইনে পৃষ্ঠা উল্টে পড়ুন - Hidden when already on /epaper page) */}
      {!isEpaperPage && (
        <div className="bg-white rounded border border-gray-200 shadow-2xs overflow-hidden font-sans">
          <div 
            className="bg-[#353d4c] text-white py-1 px-2 text-center font-normal border-b border-gray-200"
            style={{
              fontFamily: 'Bangla, sans-serif',
              fontSize: '20px',
              fontWeight: 400,
              lineHeight: '22px',
              letterSpacing: '-0.2px',
              textAlign: 'center',
            }}
          >
            ই-পেপার সংস্করণ
          </div>
          <Link href="/epaper" className="block relative aspect-[4/3] w-full overflow-hidden bg-[#243c3b] group p-1.5 rounded-xs">
            <img
              src="/uploads/sidebar/epaper_promo.jpg"
              alt="ই-পেপার সংস্করণ"
              className="w-full h-full object-cover object-top rounded-xs group-hover:scale-105 transition duration-500 shadow-md"
            />
            <div 
              className="absolute inset-x-0 bottom-0 bg-[#353d4c]/95 text-white py-1.5 px-2 text-center flex items-center justify-center gap-1.5"
              style={{
                fontFamily: 'Bangla, sans-serif',
                fontSize: '17px',
                fontWeight: 400,
                lineHeight: '22px',
                letterSpacing: '-0.2px',
              }}
            >
              <span>অনলাইনে পৃষ্ঠা উল্টে পড়ুন</span>
              <span className="text-amber-400 font-bold text-base">➔</span>
            </div>
          </Link>
        </div>
      )}

      {/* 2.5. UDBODHONI CRODPOTRO WIDGET (উদ্বোধনী ক্রোড়পত্র) */}
      <div className="bg-white rounded border border-gray-200 shadow-2xs overflow-hidden font-sans">
        <div 
          className="bg-[#353d4c] text-white py-1 px-2 text-center font-normal border-b border-gray-200"
          style={{
            fontFamily: 'Bangla, sans-serif',
            fontSize: '20px',
            fontWeight: 400,
            lineHeight: '22px',
            letterSpacing: '-0.2px',
            textAlign: 'center',
          }}
        >
          উদ্বোধনী ক্রোড়পত্র
        </div>
        <Link href="/udbodhoni-crodpotro" className="block relative w-full overflow-hidden bg-slate-900 group p-1.5 rounded-xs">
          <img
            src="/uploads/sidebar/udbodhoni_promo.jpg"
            alt="উদ্বোধনী ক্রোড়পত্র"
            className="w-full h-auto object-cover rounded-xs group-hover:scale-105 transition duration-500 shadow-md block"
          />
        </Link>
      </div>

      {/* 3. GAZETTE EXCLUSIVE NEWS BOX (গেজেট এক্সক্লুসিভ - 3rd) */}
      <GazetteExclusiveTicker exclusiveNews={exclusiveNews} />

      {/* DYNAMIC TOP SIDEBAR ADS */}
      {topAds.map(ad => (
        <RenderAdItem key={ad.id} ad={ad} />
      ))}

      {/* 4. PRAYER TIMES WIDGET (নামাজের সময়সূচি - 4th) */}
      <PrayerWidget />

      {/* DYNAMIC MIDDLE SIDEBAR ADS */}
      {middleAds.map(ad => (
        <RenderAdItem key={ad.id} ad={ad} />
      ))}

      {/* 6. LIKE US ON FACEBOOK WIDGET (6th) */}
      <FacebookWidget />

      {/* DYNAMIC BOTTOM SIDEBAR ADS */}
      {bottomAds.map(ad => (
        <RenderAdItem key={ad.id} ad={ad} />
      ))}

      {/* 8. SIDEBAR ADVERTISEMENT */}
      <AdBanner ad={sidebarAd} fallbackText="বিজ্ঞাপন স্পেস" className="h-48" />

      {/* 9. YOUTUBE SUBSCRIBE BANNER WITH CIRCULAR LOTTIE GLOBE ANIMATION */}
      <a
        href="https://www.youtube.com/@khulnagazette"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-gradient-to-r from-[#d90429] via-[#ef233c] to-[#b7094c] hover:from-[#c10324] hover:to-[#a00742] text-white py-3 px-4 rounded-none shadow-[0_4px_16px_rgba(217,4,41,0.35)] hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-bold flex items-center justify-center gap-2.5 border border-red-400/50 group relative overflow-hidden"
        style={{
          fontFamily: 'Bangla, sans-serif',
          fontSize: '18px',
          fontWeight: 700,
          lineHeight: '22px',
          letterSpacing: '-0.2px',
        }}
      >
        {/* Network Grid Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: '14px 14px',
          }}
        />

        {/* Circular Animated Lottie Radar Globe Node */}
        <div className="relative w-7 h-7 shrink-0 flex items-center justify-center select-none z-10">
          {/* Outer Spinning Orbit Ring */}
          <div className="absolute inset-0 border border-dashed border-white/80 rounded-full animate-[spin_8s_linear_infinite]" />
          {/* Pulsing Signal Wave */}
          <div className="absolute inset-0.5 border border-yellow-300/90 rounded-full animate-ping opacity-75" style={{ animationDuration: '2s' }} />
          {/* White Play Circle Node */}
          <div className="w-5 h-5 bg-white text-[#d90429] rounded-full flex items-center justify-center shadow-md relative z-10">
            <svg className="w-3 h-3 fill-current ml-0.5 animate-pulse" style={{ animationDuration: '1.5s' }} viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <span className="relative z-10 font-black text-base sm:text-lg tracking-normal antialiased">ইউটিউব চ্যানেলে সাবস্ক্রাইব করুন</span>
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
