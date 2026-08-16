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
  sidebarAds?: any[];
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
}: SidebarWidgetsProps) {
  const topAds = sidebarAds.filter(a => a.position === 'sidebar_widget_top');
  const middleAds = sidebarAds.filter(a => a.position === 'sidebar_widget_middle');
  const bottomAds = sidebarAds.filter(a => a.position === 'sidebar_widget_bottom' || a.position === 'sidebar_banner');
  return (
    <div className="space-y-5">
      {/* 1. TABS WIDGET (সর্বশেষ | সর্বাধিক পঠিত - 1st) */}
      <TabsWidget latest={latestNews} popular={popularNews} />

      {/* 2. GAZETTE EXCLUSIVE NEWS BOX (গেজেট এক্সক্লুসিভ - 2nd) */}
      <div className="bg-white rounded border border-gray-200 shadow-2xs overflow-hidden">
        <div 
          className="bg-[#353d4c] text-white py-2 px-3 text-center font-normal border-b border-gray-200"
          style={{
            fontFamily: 'Bangla, sans-serif',
            fontSize: '21px',
            fontWeight: 400,
            lineHeight: '23.1px',
            letterSpacing: '-0.2px',
            textAlign: 'center',
          }}
        >
          গেজেট এক্সক্লুসিভ
        </div>
        <div className="p-3 bg-white">
          <div className="space-y-3.5 divide-y divide-gray-100">
            {(exclusiveNews.length > 0 ? exclusiveNews.slice(0, 5) : latestNews.slice(0, 5)).map((item, index) => (
              <div key={item.id} className={`flex items-start gap-3 group ${index > 0 ? 'pt-3.5' : ''}`}>
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="w-[110px] sm:w-[115px] h-[68px] sm:h-[72px] shrink-0 overflow-hidden rounded-xs bg-gray-100 block relative shadow-2xs border border-gray-100"
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
                <div className="flex-1 min-w-0 pt-0.5">
                  <Link
                    href={`/${item.category?.slug || 'news'}/${item.id}`}
                    className="text-[21px] font-normal text-[#000000] group-hover:text-[rgb(0,86,179)] hover:text-[rgb(0,86,179)] transition leading-[22px] tracking-[-0.2px] line-clamp-3 block"
                    style={{
                      fontFamily: 'Bangla, sans-serif',
                      fontSize: '21px',
                      fontWeight: 400,
                      lineHeight: '22px',
                      letterSpacing: '-0.2px',
                      WebkitFontSmoothing: 'antialiased',
                    }}
                  >
                    {item.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. EPAPER PROMO BANNER (ই-পেপার সংস্করণ - অনলাইনে পৃষ্ঠা উল্টে পড়ুন - 3rd) */}
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

      {/* 5. CALENDAR ARCHIVE WIDGET (আর্কাইভ - 5th) */}
      <CalendarArchiveWidget />

      {/* 6. LIKE US ON FACEBOOK WIDGET (6th) */}
      <FacebookWidget />

      {/* 7. APP DOWNLOAD BANNER (খুলনা গেজেটের app পেতে ক্লিক করুন - 7th) */}
      <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
        <div 
          className="bg-[#2b354f] text-white py-2 px-2 text-center font-normal flex items-center justify-center gap-1.5 whitespace-nowrap"
          style={{
            fontFamily: 'Bangla, sans-serif',
            fontSize: '19px',
            fontWeight: 400,
            lineHeight: '22px',
            letterSpacing: '-0.2px',
          }}
        >
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

      {/* DYNAMIC BOTTOM SIDEBAR ADS */}
      {bottomAds.map(ad => (
        <RenderAdItem key={ad.id} ad={ad} />
      ))}

      {/* 8. SIDEBAR ADVERTISEMENT */}
      <AdBanner ad={sidebarAd} fallbackText="বিজ্ঞাপন স্পেস" className="h-48" />

      {/* 9. YOUTUBE SUBSCRIBE BANNER */}
      <a
        href="https://www.youtube.com/@khulnagazette"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#c40404] hover:bg-red-700 text-white py-3.5 px-4 rounded-xl shadow-xs transition font-bold text-[18px] sm:text-[20px] flex items-center justify-center gap-2.5 border border-red-800"
        style={{ fontFamily: 'Bangla, sans-serif' }}
      >
        <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
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
