import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import TabsWidget from '@/components/tabs-widget';
import PrayerWidget from '@/components/prayer-widget';
import ViewsIncrement from '@/components/views-increment';
import CommentSection from '@/components/comment-section';
import SocialShareBar from '@/components/social-share-bar';
import AppPromoBanner from '@/components/app-promo-banner';
import Link from 'next/link';
import { Calendar, User, Home, Clock } from 'lucide-react';
import AdBanner from '@/components/ad-banner';

export const revalidate = 60; // Cache for 60 seconds (ISR)

interface RouteProps {
  params: {
    category: string;
    slugAndId: string;
  };
  searchParams: {
    page?: string;
  };
}

function formatBengaliDateTime(dateInput?: Date | string | null) {
  if (!dateInput) return { dateStr: '', timeStr: '' };
  const d = new Date(dateInput);
  
  const toBengaliNumber = (num: number | string) => {
    const digits: Record<string, string> = { '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯' };
    return num.toString().split('').map(c => digits[c] || c).join('');
  };

  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  const monthName = months[d.getMonth()];
  const dayNum = toBengaliNumber(d.getDate());
  const yearNum = toBengaliNumber(d.getFullYear());

  let hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const hoursStr = toBengaliNumber(hours);
  const minutesStr = toBengaliNumber(minutes < 10 ? `0${minutes}` : minutes);

  return {
    dateStr: `${monthName} ${dayNum}, ${yearNum}`,
    timeStr: `${hoursStr}:${minutesStr} ${period}`
  };
}

export default async function DynamicRouteResolver({ params, searchParams }: RouteProps) {
  const { category, slugAndId } = params;

  // Extract candidate ID from slugAndId (A UUID is 36 characters long)
  let candidateId = slugAndId;
  if (slugAndId.length >= 36) {
    candidateId = slugAndId.slice(-36);
  }

  // 1. Attempt to fetch published news by ID or Slug
  const news = await prisma.news.findFirst({
    where: {
      OR: [
        { id: candidateId },
        { id: slugAndId },
        { slug: slugAndId },
      ],
    },
    include: {
      category: true,
      subCategory: true,
      author: true,
      tags: true,
    },
  });

  if (news && news.status === 'PUBLISHED') {
    // Run all supporting queries in PARALLEL via Promise.all for instant speed
    const [relatedNewsFetched, latestNews, popularNews, sidebarAd] = await Promise.all([
      prisma.news.findMany({
        where: {
          categoryId: news.categoryId,
          status: 'PUBLISHED',
          NOT: { id: news.id },
        },
        take: 12,
        orderBy: { publishedAt: 'desc' },
        include: { category: true },
      }),
      prisma.news.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: 6,
        include: { category: true },
      }),
      prisma.news.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { viewCount: 'desc' },
        take: 6,
        include: { category: true },
      }),
      prisma.advertisement.findFirst({
        where: { position: 'sidebar_banner', status: 'ACTIVE' },
      }),
    ]);

    let relatedNews = relatedNewsFetched;
    if (relatedNews.length < 12) {
      const additional = await prisma.news.findMany({
        where: {
          status: 'PUBLISHED',
          NOT: { id: news.id },
        },
        take: 12 - relatedNews.length,
        orderBy: { publishedAt: 'desc' },
        include: { category: true },
      });
      relatedNews = [...relatedNews, ...additional];
    }

    const serializeList = (list: any[]) => {
      return list.map((item) => ({
        ...item,
        publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));
    };

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      'headline': news.title,
      'description': news.metaDescription || news.subtitle || news.title,
      'image': news.featuredImage ? [news.featuredImage] : [],
      'datePublished': news.publishedAt?.toISOString(),
      'dateModified': news.updatedAt.toISOString(),
      'author': [{
        '@type': 'Person',
        'name': news.reporterName || news.author?.name || 'খুলনা গেজেট',
      }],
      'publisher': {
        '@type': 'Organization',
        'name': 'খুলনা গেজেট',
        'logo': {
          '@type': 'ImageObject',
          'url': `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/logo.png`,
        }
      }
    };

    const articleUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${news.category?.slug || 'news'}/${news.id}`;

    const { dateStr, timeStr } = formatBengaliDateTime(news.publishedAt);

    return (
      <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
        <PublicHeader />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ViewsIncrement newsId={news.id} />

        <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
          {/* Breadcrumb Bar */}
          <div className="text-xs text-gray-600 flex items-center gap-1.5 select-none border-b border-gray-200 pb-2.5">
            <Link href="/" className="hover:text-red-600 flex items-center gap-1">
              <i className="fa fa-home text-gray-700 text-sm"></i>
            </Link>
            <span className="text-gray-400">›</span>
            <Link href={`/${news.category?.slug || 'news'}`} className="hover:text-red-600 font-bold text-gray-800">
              {news.category?.name || 'সংবাদ'}
            </Link>
            {news.subCategory && (
              <>
                <span className="text-gray-400">›</span>
                <span className="text-gray-600 font-medium">{news.subCategory.name}</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Article Details + Share Bar + Content + More News Grid */}
            <div className="lg:col-span-8 space-y-5">
              <div className="space-y-3">
                
                {/* Title */}
                <h1 className="text-[28px] sm:text-[32px] lg:text-[34px] font-bold text-[#000000] leading-[1.25] tracking-tight">
                  {news.title}
                </h1>

                {/* Reporter Tagline */}
                <div className="text-[15px] font-bold text-[#444444]">
                  {news.subtitle || news.reporterName || 'গেজেট প্রতিবেদন'}
                </div>

                {/* Author & Timestamp + Social Share Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-gray-200 py-2 text-[14px] text-[#555555] gap-3 my-2 font-light">
                  <div className="flex flex-wrap items-center gap-3 font-light">
                    <span className="flex items-center gap-1.5 text-[#333333] font-light">
                      <i className="fa fa-user text-gray-500"></i>
                      <span>{news.reporterName || news.author?.name || 'খুলনা গেজেট'}</span>
                    </span>
                    {dateStr && (
                      <span className="flex items-center gap-1.5 text-[#555555] font-light">
                        <i className="fa fa-calendar text-gray-400"></i>
                        <span>{dateStr}</span>
                      </span>
                    )}
                    {timeStr && (
                      <span className="flex items-center gap-1.5 text-[#555555] font-light">
                        <i className="fa fa-clock-o text-gray-400"></i>
                        <span>{timeStr}</span>
                      </span>
                    )}
                  </div>

                  {/* Social Share Buttons */}
                  <SocialShareBar title={news.title} url={articleUrl} />
                </div>

                {/* Featured Image */}
                {news.featuredImage && (
                  <div className="space-y-1.5 my-3">
                    <div className="w-full rounded-none overflow-hidden border border-gray-200 relative group bg-gray-50">
                      <img
                        src={news.featuredImage}
                        alt={news.title}
                        className="w-full h-auto object-cover max-h-[520px]"
                      />
                    </div>
                    {(news.imageCaption || news.photoCredit) && (
                      <div className="text-[12px] text-gray-600 leading-tight flex justify-between gap-4 px-1 font-light">
                        <span>{news.imageCaption}</span>
                        {news.photoCredit && <span className="font-light shrink-0">ছবি: {news.photoCredit}</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* Article Main Content */}
                <div 
                  className="prose max-w-none text-[#000000] font-light leading-[1.5] text-[20px] [&_p]:mb-4 [&_p]:text-[#000000] [&_p]:leading-[1.5] [&_p]:text-[20px] [&_p]:font-light [&_strong]:font-bold [&_b]:font-bold [&_img]:rounded [&_img]:my-4"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />

                {/* Article Bottom Sign-off */}
                <div className="pt-2 text-[16px] font-light text-[#000000]">
                  খুলনা গেজেট/এএজে
                </div>

                {/* Tags */}
                {news.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-150 mt-6">
                    {news.tags.map((t) => (
                      <span key={t.id} className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded border border-gray-200 font-bold">
                        # {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* "আরও সংবাদ" (More News) Grid Section */}
              {relatedNews.length > 0 && (
                <div className="space-y-4 pt-4 mt-6">
                  <div className="border-b-2 border-red-600 pb-1">
                    <h2 className="text-[24px] sm:text-[26px] font-light text-[#000000]">
                      আরও সংবাদ
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedNews.map((item) => (
                      <div key={item.id} className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col justify-between group p-2.5 space-y-2 hover:shadow-xs transition">
                        <div>
                          {item.featuredImage ? (
                            <Link href={`/${item.category?.slug || 'news'}/${item.id}`} className="block aspect-[16/10] overflow-hidden rounded bg-gray-100 mb-2">
                              <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            </Link>
                          ) : (
                            <div className="aspect-[16/10] w-full rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold mb-2">
                              খুলনা গেজেট
                            </div>
                          )}
                          <Link href={`/${item.category?.slug || 'news'}/${item.id}`}>
                            <h5 className="text-[18px] sm:text-[20px] font-light text-[#000000] group-hover:text-red-600 transition leading-snug line-clamp-3">
                              {item.title}
                            </h5>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="pt-6 border-t border-gray-200">
                <CommentSection newsId={news.id} />
              </div>
            </div>

            {/* Right Column: Sidebar Widgets & App Banner */}
            <div className="lg:col-span-4 space-y-6">
              {/* Latest / Most Read Tabs Widget */}
              <TabsWidget latest={serializeList(latestNews)} popular={serializeList(popularNews)} />

              {/* Mobile App Download Banner */}
              <AppPromoBanner />

              {/* Sidebar Advertisement */}
              <AdBanner ad={sidebarAd} fallbackText="বিজ্ঞাপন ব্যানার" className="h-60" />

              {/* Prayer Times Widget */}
              <PrayerWidget />
            </div>
          </div>
        </main>

        <PublicFooter />
      </div>
    );
  }

  // =========================================================================
  // CASE B: RENDER SUBCATEGORY LIST PAGE
  // =========================================================================
  const parentCat = await prisma.category.findUnique({
    where: { slug: category },
  });

  if (!parentCat) {
    notFound();
  }

  const subCat = await prisma.category.findFirst({
    where: {
      slug: slugAndId,
      parentId: parentCat.id,
    },
  });

  if (!subCat) {
    notFound();
  }

  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    prisma.news.findMany({
      where: {
        subCategoryId: subCat.id,
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: { category: true },
    }),
    prisma.news.count({
      where: {
        subCategoryId: subCat.id,
        status: 'PUBLISHED',
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Sidebar widget details load helper
  const latestNews = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    include: { category: true },
  });

  const popularNews = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { viewCount: 'desc' },
    take: 6,
    include: { category: true },
  });

  const serializeList = (list: any[]) => {
    return list.map((item) => ({
      ...item,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <PublicHeader />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 select-none">
          <Link href="/" className="hover:text-red-650 flex items-center gap-1">
            <Home size={14} />
            <span>হোম</span>
          </Link>
          <span>/</span>
          <Link href={`/${parentCat.slug}`} className="hover:text-red-650">{parentCat.name}</Link>
          <span>/</span>
          <span className="font-semibold text-gray-700">{subCat.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 border-l-4 border-red-600 pl-2.5 mb-6">
              {parentCat.name} &gt; {subCat.name} ({total}টি খবর)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {articles.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between group">
                  <div>
                    {item.featuredImage && (
                      <Link href={`/${category}/${item.id}`} className="block aspect-video overflow-hidden bg-gray-50">
                        <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </Link>
                    )}
                    <div className="p-4 space-y-2">
                      <Link href={`/${category}/${item.id}`}>
                        <h3 className="text-sm font-bold text-gray-900 hover:text-red-600 transition leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {item.content.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                    <span>{item.reporterName || 'স্টাফ রিপোর্টার'}</span>
                    <span>
                      {item.publishedAt && new Date(item.publishedAt).toLocaleDateString('bn-BD', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {articles.length === 0 && (
              <div className="text-center py-12 text-gray-400">এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।</div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-6">
                {page > 1 && (
                  <Link
                    href={`/${category}/${slugAndId}?page=${page - 1}`}
                    className="bg-white border border-gray-300 text-gray-600 text-xs px-4 py-2 rounded-lg hover:bg-gray-150 transition"
                  >
                    পূর্ববর্তী
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/${category}/${slugAndId}?page=${page + 1}`}
                    className="bg-white border border-gray-300 text-gray-600 text-xs px-4 py-2 rounded-lg hover:bg-gray-150 transition"
                  >
                    পরবর্তী
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <TabsWidget latest={serializeList(latestNews)} popular={serializeList(popularNews)} />
            <PrayerWidget />
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
