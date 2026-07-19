import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import TabsWidget from '@/components/tabs-widget';
import PrayerWidget from '@/components/prayer-widget';
import ViewsIncrement from '@/components/views-increment';
import CommentSection from '@/components/comment-section';
import Link from 'next/link';
import { Calendar, Eye, User } from 'lucide-react';
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

  // 1. Check if category exists
  const parentCat = await prisma.category.findUnique({
    where: { slug: category },
  });

  if (!parentCat) {
    notFound();
  }

  // 2. Check if the second parameter is a subcategory of the parent category
  const subCat = await prisma.category.findFirst({
    where: {
      slug: slugAndId,
      parentId: parentCat.id,
    },
  });

  // Sidebar widget details load helper
  const loadSidebarDetails = async () => {
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

    return {
      latest: serializeList(latestNews),
      popular: serializeList(popularNews),
    };
  };

  const { latest, popular } = await loadSidebarDetails();

  // CASE A: Render Subcategory List Page
  if (subCat) {
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

    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <PublicHeader />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 select-none">
            <Link href="/" className="hover:text-red-650">হোম</Link>
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
                        <Link href={`/${category}/${item.slug}-${item.id}`} className="block aspect-video overflow-hidden bg-gray-50">
                          <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        </Link>
                      )}
                      <div className="p-4 space-y-2">
                        <Link href={`/${category}/${item.slug}-${item.id}`}>
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
              <TabsWidget latest={latest} popular={popular} />
              <PrayerWidget />
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // CASE B: Render Article Details Page
  // Extract ID from slugAndId (A UUID is exactly 36 characters long)
  const id = slugAndId.slice(-36);

  if (!id || id.length !== 36) {
    notFound();
  }

  const news = await prisma.news.findUnique({
    where: { id },
    include: {
      category: true,
      author: true,
      tags: true,
    },
  });

  if (!news || news.status !== 'PUBLISHED') {
    notFound();
  }

  const relatedNews = await prisma.news.findMany({
    where: {
      categoryId: news.categoryId,
      status: 'PUBLISHED',
      NOT: { id: news.id },
    },
    take: 6,
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
    },
  });

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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewsIncrement newsId={news.id} />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 select-none">
          <Link href="/" className="hover:text-red-650">হোম</Link>
          <span>/</span>
          <Link href={`/${news.category?.slug}`} className="hover:text-red-650 font-semibold text-gray-700">
            {news.category?.name}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: News details + Related news + Comments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <span className="text-xs font-black text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded w-fit block">
                {news.category?.name}
              </span>

              <h1 
                style={{ 
                  fontFamily: 'var(--font-hind-siliguri), Bangla, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  color: 'rgb(0, 0, 0)',
                  fontSize: '32px',
                  lineHeight: '38px' 
                }}
              >
                {news.title}
              </h1>

              {news.subtitle && (
                <p className="text-base sm:text-lg font-bold text-slate-500 leading-relaxed">
                  {news.subtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between border-y border-gray-150 py-3 text-xs text-gray-500 gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 font-bold text-gray-700">
                    <User size={14} className="text-red-600" />
                    <span>{news.reporterName || news.author.name}</span>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar size={14} />
                    <span>
                      {news.publishedAt && new Date(news.publishedAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </span>
                </div>
                <span className="flex items-center gap-1.5 font-semibold text-gray-600 bg-slate-100 px-2.5 py-1 rounded">
                  <Eye size={14} />
                  <span>পঠিত হয়েছে: {news.viewCount} বার</span>
                </span>
              </div>

              {news.featuredImage && (
                <div className="space-y-2.5">
                  <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm border border-gray-250">
                    <img src={news.featuredImage} alt={news.title} className="w-full h-full object-cover" />
                  </div>
                  {(news.imageCaption || news.photoCredit) && (
                    <div className="text-[11px] text-gray-500 leading-tight flex justify-between gap-4 px-2">
                      <span>{news.imageCaption}</span>
                      {news.photoCredit && <span className="font-bold shrink-0">ছবি: {news.photoCredit}</span>}
                    </div>
                  )}
                </div>
              )}

              <div 
                style={{ 
                  fontFamily: 'var(--font-hind-siliguri), Bangla, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  color: 'rgb(0, 0, 0)',
                  fontSize: '21px',
                  lineHeight: '29px' 
                }}
                className="prose max-w-none [&_p]:text-[21px] [&_p]:leading-[29px] [&_p]:font-normal [&_p]:text-black [&_p]:mb-6 [&_span]:text-[21px] [&_span]:leading-[29px] [&_li]:text-[21px] [&_li]:leading-[29px] [&_strong]:font-bold [&_strong]:text-black [&_b]:font-bold [&_b]:text-black text-black"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />

              {news.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-150">
                  {news.tags.map((t) => (
                    <span key={t.id} className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
                      # {t.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-150 pt-4 flex items-center gap-4">
                <span className="text-xs font-bold text-gray-500">শেয়ার করুন:</span>
                <div className="flex gap-2">
                  <a 
                    href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${news.category?.slug}/${news.slug}-${news.id}`
                    )}`}
                    target="_blank" 
                    className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                    </svg>
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${news.category?.slug}/${news.slug}-${news.id}`
                    )}`}
                    target="_blank" 
                    className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-655 text-white flex items-center justify-center transition"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {relatedNews.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-gray-800 border-t-2 border-red-600 pt-3">
                  আরও সংবাদ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedNews.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow transition duration-200">
                      <div>
                        {item.featuredImage && (
                          <Link href={`/${category}/${item.slug}-${item.id}`} className="block aspect-video overflow-hidden bg-gray-50">
                            <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          </Link>
                        )}
                        <div className="p-3">
                          <Link href={`/${category}/${item.slug}-${item.id}`}>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 hover:text-red-650 transition leading-snug line-clamp-3">
                              {item.title}
                            </h4>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CommentSection newsId={news.id} />
          </div>

          {/* Right Column: Sidebar Widgets & Ads */}
          <div className="space-y-6">
            <TabsWidget latest={latest} popular={popular} />
            <AdBanner ad={sidebarAd} fallbackText="বিজ্ঞাপন ব্যানার (Sidebar)" className="h-60" />
            <PrayerWidget />
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
