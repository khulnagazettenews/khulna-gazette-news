import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import BreakingNewsTicker from '@/components/breaking-news';
import PublicFooter from '@/components/public-footer';
import HomeHero from '@/components/home-hero';
import TabsWidget from '@/components/tabs-widget';
import PrayerWidget from '@/components/prayer-widget';
import CategoryBlock from '@/components/category-block';
import Link from 'next/link';
import { Camera, Video, Play, Phone, Mail } from 'lucide-react';
import AdBanner from '@/components/ad-banner';

export const revalidate = 90; // Revalidate home page every 90 seconds (ISR)

export default async function HomePage() {
  // 1. Fetch Featured articles for Hero (Lead is first)
  const featuredNews = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [
      { isFeatured: 'desc' },
      { publishedAt: 'desc' }
    ],
    take: 4,
    include: {
      category: true,
    },
  });

  // 2. Fetch Latest Articles for tabs
  const latestNews = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    include: {
      category: true,
    },
  });

  // 3. Fetch Popular Articles for tabs
  const popularNews = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { viewCount: 'desc' },
    take: 6,
    include: {
      category: true,
    },
  });

  // Helper to serialize Date objects for client components props
  const serializeList = (list: any[]) => {
    return list.map((item) => ({
      ...item,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  };

  // 4. Fetch Category blocks data
  const mainBlockCategories = [
    { name: 'বাংলাদেশ', slug: 'bangladesh' },
    { name: 'খুলনাঞ্চল', slug: 'khulnanchal' },
    { name: 'রাজনীতি', slug: 'politics' },
    { name: 'অর্থনীতি', slug: 'economy' },
    { name: 'আন্তর্জাতিক', slug: 'international' },
    { name: 'খেলা', slug: 'sports' },
    { name: 'বিনোদন', slug: 'entertainment' },
    { name: 'ইসলাম ও জীবন', slug: 'islam-and-life' },
  ];

  const categoryBlocks = await Promise.all(
    mainBlockCategories.map(async (cat) => {
      const items = await prisma.news.findMany({
        where: {
          category: { slug: cat.slug },
          status: 'PUBLISHED',
        },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      });
      return {
        ...cat,
        news: items.map((item) => ({
          ...item,
          publishedAt: item.publishedAt,
        })),
      };
    })
  );

  // 5. Fetch Photos and Videos
  const photos = await prisma.galleryPhoto.findMany({
    orderBy: { order: 'asc' },
    take: 4,
  });

  const videos = await prisma.galleryVideo.findMany({
    orderBy: { order: 'asc' },
    take: 3,
  });

  // 6. Fetch active advertisements
  const advertisements = await prisma.advertisement.findMany({
    where: { status: 'ACTIVE' },
  });
  const topAd = advertisements.find((a) => a.position === 'top_banner');
  const sidebarAd = advertisements.find((a) => a.position === 'sidebar_banner');

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <BreakingNewsTicker />

      {/* Main Home Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Ad slot 1 */}
        <AdBanner ad={topAd} fallbackText="বিজ্ঞাপন ব্যানার স্লট" className="h-24" />

        {/* Home Hero banner */}
        <HomeHero news={featuredNews} />

        {/* Two column grid: Main news columns + Sidebar widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Category listings blocks */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categoryBlocks.map((block) => (
                <div key={block.slug} className="h-fit">
                  <CategoryBlock 
                    title={block.name} 
                    slug={block.slug} 
                    news={block.news as any} 
                  />
                </div>
              ))}
            </div>

            {/* Photo Gallery Grid Widget */}
            {photos.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-t-2 border-red-600 pt-2.5">
                  <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                    <Camera size={20} className="text-red-600" />
                    <span>ফটো গ্যালারি</span>
                  </h3>
                  <Link href="/photo-gallery" className="text-xs text-red-600 font-bold hover:underline">
                    সব ছবি দেখুন
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  {photos.map((ph) => (
                    <div key={ph.id} className="relative aspect-video rounded-lg overflow-hidden group shadow-sm border border-gray-100">
                      <img src={ph.imageUrl} alt={ph.caption || 'Gallery image'} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      {ph.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-2 text-[10px] truncate leading-tight select-none">
                          {ph.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Gallery Grid Widget */}
            {videos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-t-2 border-red-600 pt-2.5">
                  <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                    <Video size={20} className="text-red-600" />
                    <span>ভিডিও গ্যালারি</span>
                  </h3>
                  <Link href="/video-gallery" className="text-xs text-red-600 font-bold hover:underline">
                    সব ভিডিও দেখুন
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {videos.map((vid) => {
                    const ytId = getYoutubeId(vid.youtubeUrl);
                    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '';
                    return (
                      <div key={vid.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between group">
                        <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                          {thumb && <img src={thumb} alt={vid.title} className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-300" />}
                          <a 
                            href={vid.youtubeUrl} 
                            target="_blank" 
                            className="absolute w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-750 transition shadow-lg"
                          >
                            <Play size={16} className="ml-0.5 fill-current" />
                          </a>
                        </div>
                        <div className="p-3 text-left">
                          <a 
                            href={vid.youtubeUrl} 
                            target="_blank" 
                            className="text-xs font-bold text-gray-800 hover:text-red-600 transition leading-snug line-clamp-2 block"
                          >
                            {vid.title}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar Widgets */}
          <div className="space-y-6">
            
            {/* Latest & Popular Tabs Widget */}
            <TabsWidget 
              latest={serializeList(latestNews)} 
              popular={serializeList(popularNews)} 
            />

            {/* Prayer time panel */}
            <PrayerWidget />

            {/* Facebook page iframe dummy wrapper */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 text-sm border-l-4 border-red-600 pl-2.5">আমাদের ফেসবুক পেজ</h3>
              <div className="w-full bg-slate-100 aspect-video rounded-lg flex flex-col items-center justify-center text-gray-400 text-xs gap-2 select-none border border-slate-200">
                <span className="font-semibold text-slate-500">Facebook Page Plugin Widget</span>
                <span className="text-[10px]">facebook.com/khulnagazette</span>
              </div>
            </div>

            {/* Google Play Store Banner */}
            <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-xl p-6 text-white text-center space-y-4 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-xl" />
              <h3 className="font-black text-base sm:text-lg">খুলনা গেজেট মোবাইল অ্যাপ</h3>
              <p className="text-xs text-slate-400">প্রতি মুহূর্তের সংবাদ হাতের মুঠোয় রাখতে ডাউনলোড করুন আমাদের অফিসিয়াল অ্যান্ড্রয়েড অ্যাপ।</p>
              <a 
                href="https://play.google.com" 
                target="_blank" 
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition text-xs shadow-md shadow-red-600/20 w-full justify-center"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>অ্যাপ ডাউনলোড করুন</span>
              </a>
            </div>
            
            {/* Side Ad slot 2 */}
            <AdBanner ad={sidebarAd} fallbackText="বিজ্ঞাপন ব্যানার (Sidebar)" className="h-60" />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
