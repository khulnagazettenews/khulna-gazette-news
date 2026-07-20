import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import BreakingNewsTicker from '@/components/breaking-news';
import PublicFooter from '@/components/public-footer';
import HomeHero from '@/components/home-hero';
import CategoryBlock from '@/components/category-block';
import SpecialTopicSection from '@/components/special-topic-section';
import OpinionWidget from '@/components/opinion-widget';
import YoutubeBanner from '@/components/youtube-banner';
import AdBanner from '@/components/ad-banner';
import Link from 'next/link';
import { Camera, Video, Play } from 'lucide-react';

export const revalidate = 90; // Revalidate home page every 90 seconds (ISR)

export default async function HomePage() {
  // 1. Fetch Top Hero News items (up to 12 items)
  const heroNews = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
    take: 12,
    include: {
      category: true,
    },
  });

  // 2. Fetch 6 Special News items for light-teal banner section (2nd image design)
  const specialTopicBannerNews = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ isBreaking: 'desc' }, { publishedAt: 'desc' }],
    take: 6,
    include: {
      category: true,
    },
  });

  // 3. Fetch Latest Articles for tabs
  const latestNews = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    include: {
      category: true,
    },
  });

  // 4. Fetch Popular Articles for tabs
  const popularNews = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { viewCount: 'desc' },
    take: 6,
    include: {
      category: true,
    },
  });

  // Helper to serialize Date objects for client components
  const serializeList = (list: any[]) => {
    return list.map((item) => ({
      ...item,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  };

  // 5. Category Blocks fetching helper
  const fetchCategoryItems = async (slug: string, takeCount = 5) => {
    const items = await prisma.news.findMany({
      where: {
        category: { slug },
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      take: takeCount,
      include: {
        category: true,
        author: { select: { name: true, avatar: true } },
      },
    });

    // Fallback to latest published if specific category has no news yet
    if (items.length === 0) {
      const fallback = await prisma.news.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: takeCount,
        include: {
          category: true,
          author: { select: { name: true, avatar: true } },
        },
      });
      return fallback;
    }
    return items;
  };

  // Fetch categorized news sections
  const bangladeshNews = await fetchCategoryItems('bangladesh', 5);
  const internationalNews = await fetchCategoryItems('international', 5);
  const sportsNews = await fetchCategoryItems('sports', 5);
  const entertainmentNews = await fetchCategoryItems('entertainment', 5);
  const politicsNews = await fetchCategoryItems('politics', 5);
  const economyNews = await fetchCategoryItems('economy', 5);
  const crimeNews = await fetchCategoryItems('crime', 5);
  const techNews = await fetchCategoryItems('technology', 5);
  const lifestyleNews = await fetchCategoryItems('lifestyle', 5);
  const healthNews = await fetchCategoryItems('health', 5);

  // Opinion columnists articles
  const opinionNews = await fetchCategoryItems('motamot', 4);

  // Photos and Videos
  const photos = await prisma.galleryPhoto.findMany({
    orderBy: { order: 'asc' },
    take: 4,
  });

  const videos = await prisma.galleryVideo.findMany({
    orderBy: { order: 'asc' },
    take: 3,
  });

  // Active advertisements
  const advertisements = await prisma.advertisement.findMany({
    where: { status: 'ACTIVE' },
  });
  const topAd = advertisements.find((a) => a.position === 'top_banner');
  const sidebarAd = advertisements.find((a) => a.position === 'sidebar_banner');
  const middleAd = advertisements.find((a) => a.position === 'middle_banner');

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <PublicHeader />
      <BreakingNewsTicker />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6 space-y-6">
        {/* 1. Dhaka Post Style Special Featured Topic Banner Section (2nd Image Design) */}
        <SpecialTopicSection
          title="বিশেষ প্রতিবেদন ও আন্তর্জাতিক সংবাদ"
          bannerSubtitle="বিস্তারিত দেখতে কভার খবরের যেকোনো একটিতে ক্লিক করুন"
          news={specialTopicBannerNews as any}
        />

        {/* Top Ad slot */}
        <AdBanner ad={topAd} fallbackText="বিজ্ঞাপন ব্যানার" className="h-20 sm:h-24" />

        {/* 2. Prothom-Alo style Hero 3-Column Section */}
        <HomeHero
          news={heroNews as any}
          latestNews={serializeList(latestNews)}
          popularNews={serializeList(popularNews)}
          sidebarAd={sidebarAd}
        />

        {/* 3. Red YouTube Promo Strip */}
        <YoutubeBanner />

        {/* 4. Side-by-Side Category Pair 1: বাংলাদেশ & আন্তর্জাতিক */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoryBlock title="বাংলাদেশ" slug="bangladesh" news={bangladeshNews as any} />
          <CategoryBlock title="আন্তর্জাতিক" slug="international" news={internationalNews as any} />
        </div>

        {/* 5. Sports Section (Main image on left + 4 mini cards on right) */}
        <CategoryBlock
          title="খেলাধুলা"
          slug="sports"
          news={sportsNews as any}
          variant="sports"
        />

        {/* Middle Ad slot */}
        <AdBanner ad={middleAd} fallbackText="বিজ্ঞাপন স্পেস" className="h-20 sm:h-24" />

        {/* 6. Entertainment Section */}
        <CategoryBlock
          title="বিনোদন"
          slug="entertainment"
          news={entertainmentNews as any}
          variant="entertainment"
        />

        {/* 7. Side-by-Side Category Pair 2: রাজনীতি & অর্থনীতি */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoryBlock title="রাজনীতি" slug="politics" news={politicsNews as any} />
          <CategoryBlock title="অর্থনীতি" slug="economy" news={economyNews as any} />
        </div>

        {/* 8. Side-by-Side Category Pair 3: অপরাধ & প্রযুক্তি */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoryBlock title="অপরাধ" slug="crime" news={crimeNews as any} />
          <CategoryBlock title="বিজ্ঞান ও প্রযুক্তি" slug="technology" news={techNews as any} />
        </div>

        {/* 9. Opinion Columnists Section */}
        <OpinionWidget items={opinionNews as any} />

        {/* 10. Side-by-Side Category Pair 4: লাইফস্টাইল & স্বাস্থ্য */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoryBlock title="জীবনযাপন" slug="lifestyle" news={lifestyleNews as any} />
          <CategoryBlock title="স্বাস্থ্য" slug="health" news={healthNews as any} />
        </div>

        {/* 11. Photo & Video Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-t-2 border-red-600 pt-2.5">
                <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                  <Camera size={20} className="text-red-600" />
                  <span>ফটো গ্যালারি</span>
                </h3>
                <Link href="/photo-gallery" className="text-xs text-red-600 font-bold hover:underline">
                  সব ছবি দেখুন
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                {photos.map((ph) => (
                  <div key={ph.id} className="relative aspect-square rounded-lg overflow-hidden group shadow-sm border border-gray-100">
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

          {/* Video Gallery */}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                          rel="noopener noreferrer"
                          className="absolute w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-lg"
                        >
                          <Play size={15} className="ml-0.5 fill-current" />
                        </a>
                      </div>
                      <div className="p-2.5 text-left">
                        <a 
                          href={vid.youtubeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
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
      </main>

      <PublicFooter />
    </div>
  );
}
