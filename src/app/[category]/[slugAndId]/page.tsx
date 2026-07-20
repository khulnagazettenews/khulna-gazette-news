import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import TabsWidget from '@/components/tabs-widget';
import PrayerWidget from '@/components/prayer-widget';
import ViewsIncrement from '@/components/views-increment';
import CommentSection from '@/components/comment-section';
import Link from 'next/link';
import { Calendar, Eye, User, Home } from 'lucide-react';
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
    // Fetch 12 related / more news items by category
    let relatedNews = await prisma.news.findMany({
      where: {
        categoryId: news.categoryId,
        status: 'PUBLISHED',
        NOT: { id: news.id },
      },
      take: 12,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
      },
    });

    // Fallback to latest published news if category has fewer articles
    if (relatedNews.length < 12) {
      const additional = await prisma.news.findMany({
        where: {
          status: 'PUBLISHED',
          NOT: { id: news.id },
        },
        take: 12 - relatedNews.length,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: true,
        },
      });
      relatedNews = [...relatedNews, ...additional];
    }

    // Sidebar details
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

    const sidebarAd = await prisma.advertisement.findFirst({
      where: { position: 'sidebar_banner', status: 'ACTIVE' },
    });

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
        'name': news.reporterName || news.author.name,
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

    return (
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <PublicHeader />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ViewsIncrement newsId={news.id} />

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Breadcrumb Bar */}
          <div className="text-xs text-gray-500 flex items-center gap-1.5 select-none border-b border-gray-200 pb-3">
            <Link href="/" className="hover:text-red-650 flex items-center gap-1">
              <Home size={14} className="text-gray-600" />
            </Link>
            <span>›</span>
            <Link href={`/${news.category?.slug || 'news'}`} className="hover:text-red-650 font-semibold text-gray-700">
              {news.category?.name || 'সংবাদ'}
            </Link>
            {news.subCategory && (
              <>
                <span>›</span>
                <span className="text-gray-600">{news.subCategory.name}</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Article Details + Share Bar + Content + More News Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-5 sm:p-7 rounded-xl border border-gray-200 shadow-xs space-y-5">
                
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-snug sm:leading-tight">
                  {news.title}
                </h1>

                {news.subtitle && (
                  <p className="text-base sm:text-lg font-bold text-gray-600 leading-relaxed">
                    {news.subtitle}
                  </p>
                )}

                {/* Author & Timestamp + Social Share Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-gray-150 py-3 text-xs text-gray-600 gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-gray-900">
                      {news.reporterName || 'নিজস্ব প্রতিবেদক'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-[11px]">
                      <span>খুলনা গেজেট</span>
                      <span>•</span>
                      <span>
                        {news.publishedAt && new Date(news.publishedAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Social Share Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Facebook */}
                    <a
                      href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-[#1877F2] hover:bg-blue-700 text-white flex items-center justify-center transition shadow-xs"
                      title="Facebook-এ শেয়ার করুন"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                      </svg>
                    </a>

                    {/* Twitter */}
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-[#1DA1F2] hover:bg-sky-600 text-white flex items-center justify-center transition shadow-xs"
                      title="Twitter-এ শেয়ার করুন"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>

                    {/* Instagram */}
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center transition shadow-xs"
                      title="Instagram"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(articleUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-[#25D366] hover:bg-emerald-600 text-white flex items-center justify-center transition shadow-xs"
                      title="WhatsApp-এ শেয়ার করুন"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Featured Image with Watermark */}
                {news.featuredImage && (
                  <div className="space-y-2">
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden shadow-xs border border-gray-200 relative group">
                      <img src={news.featuredImage} alt={news.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white font-extrabold text-[10px] px-2.5 py-1 rounded backdrop-blur-xs select-none">
                        খুলনা গেজেট
                      </div>
                    </div>
                    {(news.imageCaption || news.photoCredit) && (
                      <div className="text-[11px] text-gray-500 leading-tight flex justify-between gap-4 px-1">
                        <span>{news.imageCaption}</span>
                        {news.photoCredit && <span className="font-bold shrink-0">ছবি: {news.photoCredit}</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* Article Content */}
                <div 
                  className="prose max-w-none text-gray-900 leading-relaxed text-base sm:text-lg [&_p]:mb-5 [&_p]:text-gray-900 [&_p]:leading-[1.8] [&_strong]:font-bold [&_b]:font-bold"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />

                {/* Tags */}
                {news.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-150">
                    {news.tags.map((t) => (
                      <span key={t.id} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-md border border-slate-200 font-medium">
                        # {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* "আরও সংবাদ" (More News) Grid Section */}
              {relatedNews.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between border-t-2 border-red-600 pt-2.5">
                    <h3 className="text-base sm:text-lg font-black text-gray-900">
                      আরও সংবাদ
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {relatedNews.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between group hover:shadow-md transition duration-200 p-3 space-y-3">
                        <div>
                          {item.featuredImage ? (
                            <Link href={`/${item.category?.slug || 'news'}/${item.id}`} className="block aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 mb-2.5">
                              <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            </Link>
                          ) : (
                            <div className="aspect-[16/10] w-full rounded-lg bg-slate-100 flex items-center justify-center text-gray-400 text-xs font-bold mb-2.5">
                              খুলনা গেজেট
                            </div>
                          )}
                          <Link href={`/${item.category?.slug || 'news'}/${item.id}`}>
                            <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-red-650 transition leading-snug line-clamp-3">
                              {item.title}
                            </h4>
                          </Link>
                        </div>

                        <div className="text-[10px] text-gray-400 font-medium border-t border-gray-100 pt-2">
                          {item.publishedAt && new Date(item.publishedAt).toLocaleDateString('bn-BD', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <CommentSection newsId={news.id} />
            </div>

            {/* Right Column: Sidebar Widgets & App Banner */}
            <div className="space-y-6">
              <TabsWidget latest={serializeList(latestNews)} popular={serializeList(popularNews)} />

              {/* App Banner Widget */}
              <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-xl p-5 text-white text-center space-y-3 shadow-sm border border-slate-700">
                <h4 className="font-black text-base">খুলনা গেজেট মোবাইল অ্যাপ</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  লাইভ সংবাদ পড়তে এখনই অ্যান্ড্রয়েড অ্যাপ ডাউনলোড করুন।
                </p>
                <a 
                  href="https://play.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition text-xs shadow w-full"
                >
                  অ্যাপ ইনস্টল করুন
                </a>
              </div>

              <AdBanner ad={sidebarAd} fallbackText="বিজ্ঞাপন ব্যানার (Sidebar)" className="h-60" />
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
