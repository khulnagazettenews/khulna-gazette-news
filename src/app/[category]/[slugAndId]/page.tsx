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
import SidebarWidgets from '@/components/sidebar-widgets';
import AdBanner from '@/components/ad-banner';
import { Metadata } from 'next';

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
  if (isNaN(d.getTime())) return { dateStr: '', timeStr: '' };
  
  const toBengaliNumber = (num: number | string) => {
    const digits: Record<string, string> = { '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯' };
    return num.toString().split('').map(c => digits[c] || c).join('');
  };

  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  // Convert to Bangladesh Time (Asia/Dhaka timezone)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0';

  const year = parseInt(getPart('year'), 10);
  const monthIdx = parseInt(getPart('month'), 10) - 1;
  const day = parseInt(getPart('day'), 10);
  const hours = parseInt(getPart('hour'), 10);
  const minutes = parseInt(getPart('minute'), 10);

  const monthName = months[monthIdx] || '';
  const dayNum = toBengaliNumber(day);
  const yearNum = toBengaliNumber(year);

  // Determine period (পূর্বাহ্ন / অপরাহ্ন)
  const period = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
  let hours12 = hours % 12;
  if (hours12 === 0) hours12 = 12;

  const hoursStr = toBengaliNumber(hours12);
  const minutesStr = toBengaliNumber(minutes < 10 ? `0${minutes}` : minutes);

  return {
    dateStr: `${monthName} ${dayNum}, ${yearNum}`,
    timeStr: `${hoursStr}:${minutesStr} ${period}`
  };
}

export const revalidate = 60; // Cache for 60 seconds (ISR)

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { category, slugAndId } = params;
  let candidateId = slugAndId;
  if (slugAndId.length >= 36) {
    candidateId = slugAndId.slice(-36);
  }

  const news = await prisma.news.findFirst({
    where: {
      OR: [
        { id: candidateId },
        { id: slugAndId },
        { slug: slugAndId },
      ],
    },
    include: { category: true, author: true, tags: true },
  });

  if (!news) {
    return {
      title: 'সংবাদ পাওয়া যায়নি | খুলনা গেজেট',
      description: 'অনুরোধকৃত সংবাদটি পাওয়া যায়নি।',
    };
  }

  const articleTitle = `${news.title} | খুলনা গেজেট`;
  const description = news.metaDescription || news.subtitle || news.title;
  const imageUrl = news.featuredImage || `${process.env.NEXTAUTH_URL || 'https://khulnagazette.com'}/logo.png`;
  const canonicalUrl = `${process.env.NEXTAUTH_URL || 'https://khulnagazette.com'}/${news.category?.slug || 'news'}/${news.id}`;

  return {
    title: articleTitle,
    description: description,
    keywords: news.tags?.map(t => t.name) || [news.category?.name || 'সংবাদ', 'খুলনা গেজেট'],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: news.title,
      description: description,
      url: canonicalUrl,
      siteName: 'খুলনা গেজেট',
      type: 'article',
      publishedTime: news.publishedAt?.toISOString(),
      modifiedTime: news.updatedAt.toISOString(),
      authors: [news.reporterName || news.author?.name || 'খুলনা গেজেট'],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: description,
      images: [imageUrl],
    },
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
    // Standard lightweight select for list items (excludes heavy HTML content field)
    const listSelect = {
      id: true,
      title: true,
      featuredImage: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    };

    // Run all supporting queries in PARALLEL via Promise.all for instant speed
    const [relatedNewsFetched, latestNews, popularNews, exclusiveNews, sidebarAd] = await Promise.all([
      prisma.news.findMany({
        where: {
          categoryId: news.categoryId,
          status: 'PUBLISHED',
          NOT: { id: news.id },
        },
        take: 12,
        orderBy: { publishedAt: 'desc' },
        select: listSelect,
      }),
      prisma.news.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: 20,
        select: listSelect,
      }),
      prisma.news.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: listSelect,
      }),
      prisma.news.findMany({
        where: { isFeatured: true, status: 'PUBLISHED' },
        take: 6,
        select: listSelect,
      }),
      prisma.advertisement.findFirst({
        where: { position: 'sidebar_banner', status: 'ACTIVE' },
      }),
    ]);

    let relatedNews = relatedNewsFetched;
    if (relatedNews.length < 12) {
      const existingIds = [news.id, ...relatedNews.map((r) => r.id)];
      const additional = await prisma.news.findMany({
        where: {
          status: 'PUBLISHED',
          NOT: { id: { in: existingIds } },
        },
        take: 12 - relatedNews.length,
        orderBy: { publishedAt: 'desc' },
        select: listSelect,
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

    const { dateStr, timeStr } = formatBengaliDateTime(news.publishedAt || news.createdAt);

    return (
      <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
        <PublicHeader />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ViewsIncrement newsId={news.id} />

        <main className="flex-grow w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {/* Top Double Line Divider */}
          <div className="w-full h-1.5 border-y border-gray-200/80 bg-gray-50/50 mb-2"></div>

          {/* Breadcrumb Bar */}
          <div className="bg-[#eef2f7] px-3 sm:px-4 py-1.5 sm:py-2 rounded text-[14px] sm:text-[16px] text-gray-800 flex flex-wrap items-center gap-1.5 select-none mb-3 font-semibold border border-gray-200">
            <Link href="/" className="hover:text-red-600 flex items-center gap-1 text-gray-700">
              <Home size={16} className="text-gray-700" />
            </Link>
            <span className="text-gray-400 font-bold text-xs">/</span>
            <Link href={`/${news.category?.slug || 'news'}`} className="hover:text-red-600 text-gray-800 font-bold">
              {news.category?.name || 'সংবাদ'}
            </Link>
            {news.subCategory && (
              <>
                <span className="text-gray-400 font-bold text-xs">/</span>
                <span className="text-gray-700 font-medium">{news.subCategory.name}</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Article Details + Share Bar + Content + More News Grid */}
            <article className="lg:col-span-8 space-y-4" itemScope itemType="https://schema.org/NewsArticle">
              <meta itemProp="headline" content={news.title} />
              <meta itemProp="datePublished" content={news.publishedAt ? new Date(news.publishedAt).toISOString() : new Date(news.createdAt).toISOString()} />
              <meta itemProp="dateModified" content={new Date(news.updatedAt).toISOString()} />

              <div className="space-y-3">
                
                {/* Title */}
                <h1 itemProp="headline" className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold text-[#000000] leading-[1.3] tracking-normal mb-3 break-words">
                  {news.title}
                </h1>

                {/* News Header Metadata Box matching uploaded image */}
                <div className="w-full border-t border-b border-[#ddd] py-2.5 my-3 space-y-2">
                  {/* Tagline / Category Desk */}
                  <h2 
                    className="text-black"
                    style={{
                      fontFamily: 'Bangla, sans-serif',
                      fontSize: '22px',
                      fontWeight: 500,
                      lineHeight: '26.4px',
                      letterSpacing: '-0.2px',
                      textAlign: 'left',
                    }}
                  >
                    {news.subCategory?.name || (news.category?.name ? `${news.category.name} ডেস্ক` : (news.reporterName || news.subtitle || 'গেজেট প্রতিবেদন'))}
                  </h2>

                  {/* Metadata Row (Left: Author, Date, Time | Right: Social Share Buttons + Print) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-black">
                    <div 
                      className="flex flex-wrap items-center gap-3 text-black"
                      style={{
                        fontFamily: 'Bangla, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '17.6px',
                        letterSpacing: '-0.2px',
                        textAlign: 'left',
                      }}
                    >
                      <span className="flex items-center gap-1.5" itemProp="author" itemScope itemType="https://schema.org/Person">
                        <User size={16} className="text-black fill-black shrink-0" />
                        <span itemProp="name" className="text-black">খুলনা গেজেট</span>
                      </span>

                      {dateStr && (
                        <span className="flex items-center gap-1.5 text-black">
                          <Calendar size={16} className="text-black fill-black shrink-0" />
                          <span className="text-black">{dateStr}</span>
                        </span>
                      )}

                      {timeStr && (
                        <span className="flex items-center gap-1.5 text-black">
                          <Clock size={16} className="text-black fill-black shrink-0" />
                          <span className="text-black">{timeStr}</span>
                        </span>
                      )}
                    </div>

                    {/* Social Share Buttons */}
                    <SocialShareBar title={news.title} url={articleUrl} />
                  </div>
                </div>

                {/* Featured Image */}
                {news.featuredImage && (
                  <figure className="space-y-1.5 my-3" itemProp="image" itemScope itemType="https://schema.org/ImageObject">
                    <div className="w-full rounded overflow-hidden relative bg-gray-50 border border-gray-100 shadow-2xs">
                      <img
                        src={news.featuredImage}
                        alt={news.title}
                        itemProp="url"
                        loading="eager"
                        className="w-full h-auto object-cover max-h-[500px]"
                      />
                    </div>
                    {(news.imageCaption || news.photoCredit) && (
                      <figcaption className="text-[13px] text-gray-600 leading-tight flex justify-between gap-4 px-1 font-sans">
                        <span>{news.imageCaption}</span>
                        {news.photoCredit && <span className="shrink-0 font-medium">ছবি: {news.photoCredit}</span>}
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Article Main Content */}
                <div 
                  itemProp="articleBody"
                  className="prose max-w-none break-words [&_img]:rounded [&_img]:my-3 [&_iframe]:w-full [&_iframe]:aspect-video"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />

                {/* Article Bottom Sign-off */}
                <div className="pt-3 border-t border-gray-100 text-[14px] sm:text-[15px] font-medium text-gray-600 italic">
                  খুলনা গেজেট/এএজে
                </div>

                {/* Tags */}
                {news.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-gray-150 mt-5 sm:mt-6">
                    {news.tags.map((t) => (
                      <span key={t.id} className="text-[11px] sm:text-xs bg-gray-100 text-gray-800 px-2.5 py-0.5 sm:py-1 rounded border border-gray-200 font-bold">
                        # {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* "আরও সংবাদ" (More News) Grid Section */}
              {relatedNews.length > 0 && (
                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 mt-6 sm:mt-8">
                  <div className="border-b-2 border-red-600 pb-1">
                    <h2 className="text-[20px] sm:text-[24px] font-bold text-[#000000]">
                      আরও সংবাদ
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-x-4 sm:gap-y-5">
                    {relatedNews.map((item, idx) => {
                      const isFirstRow = idx < 3;
                      return (
                        <div 
                          key={`related-${item.id}-${idx}`} 
                          className={`bg-white group flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 border-b border-gray-100 sm:border-b-0 pb-3 sm:pb-0 last:border-b-0 ${!isFirstRow ? 'sm:border-t sm:border-gray-200/80 sm:pt-3.5' : ''}`}
                        >
                          {item.featuredImage ? (
                            <Link href={`/${item.category?.slug || 'news'}/${item.id}`} className="block w-28 aspect-[354/199] sm:w-full sm:h-auto sm:aspect-[354/199] shrink-0 overflow-hidden rounded bg-gray-100">
                              <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300" />
                            </Link>
                          ) : (
                            <div className="w-28 aspect-[354/199] sm:w-full sm:h-auto sm:aspect-[354/199] shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                              খুলনা গেজেট
                            </div>
                          )}
                          <Link href={`/${item.category?.slug || 'news'}/${item.id}`} className="block pt-0.5 flex-1 min-w-0">
                            <h3 
                              className="text-[22px] font-bold text-[#000000] hover:text-[rgb(0,0,116)] transition leading-[26.4px] tracking-[-0.2px] line-clamp-2 break-words"
                              style={{
                                fontFamily: 'Bangla, sans-serif',
                                fontSize: '22px',
                                fontWeight: 700,
                                lineHeight: '26.4px',
                                letterSpacing: '-0.2px',
                              }}
                            >
                              {item.title}
                            </h3>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="pt-6 border-t border-gray-200">
                <CommentSection newsId={news.id} />
              </div>
            </article>

            {/* Right Column: Sidebar Widgets */}
            <div className="lg:col-span-4">
              <SidebarWidgets
                latestNews={serializeList(latestNews)}
                popularNews={serializeList(popularNews)}
                exclusiveNews={serializeList(exclusiveNews)}
                sidebarAd={sidebarAd}
              />
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
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <PublicHeader />
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Breadcrumb Bar */}
        <div className="bg-[#eeeef8] px-4 py-2 rounded text-sm text-[#444455] flex items-center gap-2 select-none mb-4 font-medium border border-[#e0e4f8]">
          <Link href="/" className="hover:text-red-600 flex items-center gap-1">
            <i className="fa fa-home text-gray-800"></i>
          </Link>
          <span className="text-gray-600 font-bold">»</span>
          <Link href={`/${parentCat.slug}`} className="hover:text-red-600 font-bold text-gray-800">
            {parentCat.name}
          </Link>
          <span className="text-gray-600 font-bold">,</span>
          <span className="font-bold text-gray-900">{subCat.name}</span>
        </div>

        {/* Content Columns (9 Cols Left + 3 Cols Right Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-6">
            
            {/* Category Title Header */}
            <div className="border-b-2 border-[#FF0000] pb-1 mb-4">
              <h1 className="text-[22px] sm:text-[26px] font-bold text-[#000000]">
                {parentCat.name} › {subCat.name}
              </h1>
            </div>

            {/* 3-Column Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-x-4 sm:gap-y-5">
              {articles.map((item, index) => {
                const isFirstRow = index < 3;
                return (
                  <div 
                    key={item.id} 
                    className={`bg-white group flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 border-b border-gray-100 sm:border-b-0 pb-3 sm:pb-0 last:border-b-0 ${!isFirstRow ? 'sm:border-t sm:border-gray-200/80 sm:pt-3.5' : ''}`}
                  >
                    {item.featuredImage ? (
                      <Link href={`/${category}/${item.id}`} className="block w-28 aspect-[354/199] sm:w-full sm:h-auto sm:aspect-[354/199] shrink-0 overflow-hidden rounded bg-gray-100">
                        <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300" />
                      </Link>
                    ) : (
                      <div className="w-28 aspect-[354/199] sm:w-full sm:h-auto sm:aspect-[354/199] shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                        খুলনা গেজেট
                      </div>
                    )}
                    <Link href={`/${category}/${item.id}`} className="block pt-0.5 flex-1 min-w-0">
                      <h3 
                        className="text-[22px] font-bold text-[#000000] hover:text-[rgb(0,0,116)] transition leading-[26.4px] tracking-[-0.2px] line-clamp-2 break-words"
                        style={{
                          fontFamily: 'Bangla, sans-serif',
                          fontSize: '22px',
                          fontWeight: 700,
                          lineHeight: '26.4px',
                          letterSpacing: '-0.2px',
                        }}
                      >
                        {item.title}
                      </h3>
                    </Link>
                  </div>
                );
              })}
            </div>

            {articles.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-base font-medium">এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।</div>
            )}

            {/* Numeric Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-6 border-t border-gray-200">
                {page > 1 && (
                  <Link
                    href={`/${category}/${slugAndId}?page=${page - 1}`}
                    className="bg-white border border-gray-300 text-gray-700 text-sm font-bold px-4 py-2 rounded hover:bg-red-600 hover:text-white transition"
                  >
                    « পূর্ববর্তী
                  </Link>
                )}
                <span className="px-4 py-2 text-sm font-bold text-gray-700 select-none">
                  পৃষ্ঠা {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/${category}/${slugAndId}?page=${page + 1}`}
                    className="bg-white border border-gray-300 text-gray-700 text-sm font-bold px-4 py-2 rounded hover:bg-red-600 hover:text-white transition"
                  >
                    পরবর্তী »
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">
            <TabsWidget latest={serializeList(latestNews)} popular={serializeList(popularNews)} />
            <PrayerWidget />
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
