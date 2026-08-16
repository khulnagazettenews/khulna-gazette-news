import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import BreakingNewsTicker from '@/components/breaking-news';
import PublicFooter from '@/components/public-footer';
import HomeHero from '@/components/home-hero';
import SidebarWidgets from '@/components/sidebar-widgets';
import CategoryBlock from '@/components/category-block';
import SpecialTopicSection from '@/components/special-topic-section';
import OpinionWidget from '@/components/opinion-widget';
import YoutubeBanner from '@/components/youtube-banner';
import AdBanner from '@/components/ad-banner';
import VideoSection from '@/components/video-section';
import PhotoSection from '@/components/photo-section';
import Link from 'next/link';
import { Camera, Video, Play } from 'lucide-react';

export const revalidate = 60; // ISR cache for 60 seconds (Super Fast Instant Loads)

export default async function HomePage() {
  // 1. Fetch Active Special Topic Configuration (very fast query, needed first to get newsIds)
  let activeSpecialTopic = await prisma.specialTopic.findFirst({
    where: { isActive: true },
    orderBy: [{ updatedAt: 'desc' }, { order: 'asc' }],
  });

  if (!activeSpecialTopic) {
    const totalSpecialTopics = await prisma.specialTopic.count();
    if (totalSpecialTopics === 0) {
      activeSpecialTopic = await prisma.specialTopic.create({
        data: {
          title: 'বিশেষ প্রতিবেদন ও আন্তর্জাতিক সংবাদ',
          bannerSubtitle: 'বিস্তারিত দেখতে কভার খবরের যেকোনো একটিতে ক্লিক করুন',
          isActive: true,
          newsIds: [],
          order: 0,
        },
      });
    }
  }

  // Define categories to fetch for category blocks matching khulnagazette.com live homepage order
  const categorySlugs = [
    'bangladesh',       // 0: বাংলাদেশ
    'politics',         // 1: রাজনীতি
    'sports',           // 2: খেলা
    'entertainment',    // 3: বিনোদন
    'khulna',           // 4: খুলনাঞ্চল
    'economy',          // 5: অর্থনীতি
    'international',    // 6: আন্তর্জাতিক
    'education',        // 7: শিক্ষা
    'islam',            // 8: ইসলাম ও জীবন
    'technology',       // 9: আইটি
    'health',           // 10: চিকিৎসা
    'literature',       // 11: সাহিত্য
    'mukto-bhabna',     // 12: মুক্ত ভাবনা
    'chitro-bichitro',  // 13: চিত্র বিচিত্র
    'social-media',     // 14: সোশ্যাল মিডিয়া
    'lifestyle',        // 15: লাইফ স্টাইল
  ];

  const slugAliases: Record<string, string[]> = {
    'bangladesh': ['bangladesh'],
    'politics': ['politics'],
    'sports': ['sports', 'khela'],
    'entertainment': ['entertainment', 'binodon'],
    'khulna': ['khulna', 'khulnanchal'],
    'economy': ['economy'],
    'international': ['international', 'antorjatik'],
    'education': ['education', 'shikkha'],
    'islam': ['islam', 'islam-and-life', 'islam-life'],
    'technology': ['technology', 'it'],
    'health': ['health', 'chikitsa'],
    'literature': ['literature', 'sahitto'],
    'mukto-bhabna': ['mukto-bhabna', 'muktobhabna', 'free-thinking'],
    'chitro-bichitro': ['chitro-bichitro', 'weird-news'],
    'social-media': ['social-media'],
    'lifestyle': ['lifestyle', 'life-style'],
  };

  // Map slugs to Prisma queries with alias support
  const categoryQueries = categorySlugs.map((slug) => {
    const aliases = slugAliases[slug] || [slug];
    return prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { category: { slug: { in: aliases } } },
          { subCategory: { slug: { in: aliases } } }
        ]
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: {
        category: true,
        author: { select: { name: true, avatar: true } },
      },
    });
  });

  // Setup special topic banner news query (if there are IDs)
  const specialTopicBannerNewsQuery = (activeSpecialTopic?.newsIds && activeSpecialTopic.newsIds.length > 0)
    ? prisma.news.findMany({
        where: { id: { in: activeSpecialTopic.newsIds } },
        include: { category: true, subCategory: true },
      })
    : Promise.resolve([]);

  // Setup Top News Hero order query
  const topNewsConfigQuery = prisma.specialTopic.findUnique({
    where: { id: 'top_news_hero_order' },
  });

  // 2. Fetch all other news, ads, media, and category listings in PARALLEL
  const [
    heroNewsFallback,
    latestNews,
    popularNews,
    photos,
    videos,
    advertisements,
    exclusiveNews,
    specialTopicBannerNewsFetched,
    topNewsConfig,
    ...initialCategoryResults
  ] = await Promise.all([
    // Hero news fallback
    prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      take: 15,
      include: { category: true },
    }),
    // Latest news for sidebar tabs
    prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      include: { category: true },
    }),
    // Popular news for sidebar tabs
    prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: 6,
      include: { category: true },
    }),
    // Photos
    prisma.galleryPhoto.findMany({
      orderBy: { order: 'asc' },
      take: 5,
    }),
    // Videos
    prisma.galleryVideo.findMany({
      orderBy: { order: 'asc' },
      take: 10,
    }),
    // Advertisements
    prisma.advertisement.findMany({
      where: { status: 'ACTIVE' },
    }),
    // Exclusive news
    prisma.news.findMany({
      where: { isFeatured: true, status: 'PUBLISHED' },
      take: 5,
      include: { category: true },
    }),
    specialTopicBannerNewsQuery,
    topNewsConfigQuery,
    ...categoryQueries,
  ]);

  // Order hero news according to topNewsConfig.newsIds
  let heroNews: any[] = [];
  if (topNewsConfig?.newsIds && topNewsConfig.newsIds.length > 0) {
    const fetchedTopArticles = await prisma.news.findMany({
      where: {
        id: { in: topNewsConfig.newsIds },
        status: 'PUBLISHED',
      },
      include: { category: true },
    });

    topNewsConfig.newsIds.forEach((id) => {
      const item = fetchedTopArticles.find((n) => n.id === id);
      if (item) heroNews.push(item);
    });

    heroNewsFallback.forEach((item) => {
      if (heroNews.length < 15 && !heroNews.some((n) => n.id === item.id)) {
        heroNews.push(item);
      }
    });
  } else {
    heroNews = heroNewsFallback;
  }

  // Helper to serialize Date objects for client components
  const serializeList = (list: any[]) => {
    return list.map((item) => ({
      ...item,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  };

  // 3. Category results map with fallback to guarantee side-by-side paired rendering
  const getCategoryNews = (index: number) => {
    const res = initialCategoryResults[index];
    if (res && res.length > 0) return res;
    // Fallback to heroNews slice so category blocks always render side-by-side
    const startIdx = (index * 2) % Math.max(1, heroNews.length - 5);
    return heroNews.slice(startIdx, startIdx + 5);
  };

  const bangladeshNews = getCategoryNews(0);
  const politicsNews = getCategoryNews(1);
  const sportsNews = getCategoryNews(2);
  const entertainmentNews = getCategoryNews(3);
  const khulnaNews = getCategoryNews(4);
  const economyNews = getCategoryNews(5);
  const internationalNews = getCategoryNews(6);
  const educationNews = getCategoryNews(7);
  const islamNews = getCategoryNews(8);
  const techNews = getCategoryNews(9);
  const healthNews = getCategoryNews(10);
  const literatureNews = getCategoryNews(11);
  const muktoBhabnaNews = getCategoryNews(12);
  const chitroBichitroNews = getCategoryNews(13);
  const socialMediaNews = getCategoryNews(14);
  const lifestyleNews = getCategoryNews(15);

  // Map special topic banner news maintaining admin ordering
  let specialTopicBannerNews: any[] = [];
  if (activeSpecialTopic?.newsIds && activeSpecialTopic.newsIds.length > 0) {
    specialTopicBannerNews = activeSpecialTopic.newsIds
      .map((id) => specialTopicBannerNewsFetched.find((n) => n.id === id))
      .filter(Boolean);
  }

  // Active advertisements extraction
  const topAd = advertisements.find((a) => a.position === 'top_banner');
  const sidebarAd = advertisements.find((a) => a.position === 'sidebar_banner');
  const middleAd = advertisements.find((a) => a.position === 'middle_banner');

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <PublicHeader />
      <BreakingNewsTicker />

      {/* Main Container ultra-wide desktop friendly max-w-[1520px] */}
      <main className="flex-grow w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pt-3.5 pb-8 space-y-4 sm:space-y-5">
        {/* Top Ad slot */}
        <AdBanner ad={topAd} fallbackText="বিজ্ঞাপন ব্যানার" className="h-20 sm:h-24" />

        {/* Main 2-Column Grid (Left Main Content 9 Cols + Right Sidebar 3 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Left Column (9 Cols on LG): Hero + Category Blocks + Media Galleries */}
          <div className="lg:col-span-9 space-y-6">
            {/* 2. Main Lead Hero Section */}
            <HomeHero news={heroNews as any} />

            {/* 3. Red YouTube Promo Strip */}
            <YoutubeBanner />

            {/* 4. Category Pair 1: বাংলাদেশ & খুলনাঞ্চল */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryBlock title="বাংলাদেশ" slug="bangladesh" news={bangladeshNews as any} />
              <CategoryBlock title="খুলনাঞ্চল" slug="khulna" news={khulnaNews as any} />
            </div>

            {/* 5. Sports Section (Main image on left + 4 mini cards on right) */}
            <CategoryBlock
              title="খেলা"
              slug="sports"
              news={sportsNews as any}
              variant="sports"
            />

            {/* 6. Entertainment Section */}
            <CategoryBlock
              title="বিনোদন"
              slug="entertainment"
              news={entertainmentNews as any}
              variant="entertainment"
            />

            {/* Middle Ad slot */}
            <AdBanner ad={middleAd} fallbackText="বিজ্ঞাপন স্পেস" className="h-20 sm:h-24" />

            {/* 7. Category Pair 2: রাজনীতি & অর্থনীতি */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryBlock title="রাজনীতি" slug="politics" news={politicsNews as any} />
              <CategoryBlock title="অর্থনীতি" slug="economy" news={economyNews as any} />
            </div>

            {/* 8. International Category */}
            <CategoryBlock title="আন্তর্জাতিক" slug="international" news={internationalNews as any} />

            {/* 9. Category Pair 3: শিক্ষা & ইসলাম ও জীবন */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryBlock title="শিক্ষা" slug="education" news={educationNews as any} />
              <CategoryBlock title="ইসলাম ও জীবন" slug="islam" news={islamNews as any} />
            </div>

            {/* 10. IT / Technology Category */}
            <CategoryBlock title="আইটি" slug="technology" news={techNews as any} />

            {/* 11. Category Pair 4: লাইফ স্টাইল & চিকিৎসা */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryBlock title="লাইফ স্টাইল" slug="lifestyle" news={lifestyleNews as any} />
              <CategoryBlock title="চিকিৎসা" slug="health" news={healthNews as any} />
            </div>

            {/* 12. Literature Category */}
            <CategoryBlock title="সাহিত্য" slug="literature" news={literatureNews as any} />

            {/* 13. Category Pair 5: চিত্র বিচিত্র & সোশ্যাল মিডিয়া */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryBlock title="চিত্র বিচিত্র" slug="chitro-bichitro" news={chitroBichitroNews as any} />
              <CategoryBlock title="সোশ্যাল মিডিয়া" slug="social-media" news={socialMediaNews as any} />
            </div>

            {/* 14. Mukto Bhabna Category */}
            <CategoryBlock title="মুক্ত ভাবনা" slug="mukto-bhabna" news={muktoBhabnaNews as any} />

            {/* 14. Gazette Exclusive Section */}
            <CategoryBlock title="গেজেট এক্সক্লুসিভ" slug="gazette-exclusive" news={exclusiveNews as any} />

            {/* Prothom Alo Style Photo Section */}
            <PhotoSection photos={serializeList(photos)} newsWithPhotos={serializeList(heroNews)} />
          </div>

          {/* Right Column (3 Cols on LG): Full Sidebar Widgets */}
          <div className="lg:col-span-3">
            <SidebarWidgets
              latestNews={serializeList(latestNews)}
              popularNews={serializeList(popularNews)}
              exclusiveNews={serializeList(exclusiveNews)}
              sidebarAd={sidebarAd}
            />
          </div>
        </div>
      </main>

      {/* Dhaka Post Style Video Section right before Footer */}
      <VideoSection videos={serializeList(videos)} />

      <PublicFooter />
    </div>
  );
}
