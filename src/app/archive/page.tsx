import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import SidebarWidgets from '@/components/sidebar-widgets';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ArchivePageProps {
  searchParams?: Promise<{ date?: string; page?: string }> | { date?: string; page?: string };
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const rawDate = resolvedSearchParams.date;
  const dateStr = rawDate && typeof rawDate === 'string' && rawDate.match(/^\d{4}-\d{2}-\d{2}$/) 
    ? rawDate 
    : new Date().toISOString().split('T')[0];

  // SQLite DateTime Query using UTC bounds
  const startDate = new Date(`${dateStr}T00:00:00.000Z`);
  const endDate = new Date(`${dateStr}T23:59:59.999Z`);

  // Queries for archive articles & sidebar widgets
  const [articles, latestNews, popularNews, exclusiveNews, advertisements] =
    await Promise.all([
      prisma.news.findMany({
        where: {
          publishedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { publishedAt: 'desc' },
        include: { category: true, subCategory: true },
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
      prisma.news.findMany({
        where: { isFeatured: true, status: 'PUBLISHED' },
        take: 5,
        include: { category: true },
      }),
      prisma.advertisement.findMany({
        where: { status: 'ACTIVE' },
      }),
    ]);

  // Group articles by category
  const categoryGroupsMap: { [catId: string]: { category: any; articles: any[] } } = {};

  articles.forEach((item) => {
    const catId = item.category?.id || 'uncategorized';
    if (!categoryGroupsMap[catId]) {
      categoryGroupsMap[catId] = {
        category: item.category || { name: 'অন্যান্য', slug: 'news' },
        articles: [],
      };
    }
    categoryGroupsMap[catId].articles.push(item);
  });

  const categoryGroups = Object.values(categoryGroupsMap);

  const formatBanglaDate = (dStr: string) => {
    if (!dStr || !dStr.includes('-')) return dStr;
    const p = dStr.split('-');
    const y = parseInt(p[0], 10);
    const m = parseInt(p[1], 10) - 1;
    const d = parseInt(p[2], 10);
    const dateObj = new Date(Date.UTC(y, m, d));
    return dateObj.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const serializeList = (list: any[]) => {
    return list.map((item) => ({
      ...item,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    }));
  };

  const sidebarAd = advertisements.find((a) => a.position === 'sidebar_banner');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <PublicHeader />

      <main className="flex-grow w-full max-w-full px-4 sm:px-8 lg:px-12 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Archive Listing Column */}
          <div className="lg:col-span-9 space-y-8">
            {/* Header Banner */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 border-l-4 border-red-600 pl-3">
                সংবাদ আর্কাইভ: <span className="text-red-600">{formatBanglaDate(dateStr)}</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold">
                  {categoryGroups.length} টি ক্যাটাগরি
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                  মোট {articles.length} টি সংবাদ
                </span>
              </div>
            </div>

            {/* Render Category Blocks */}
            {categoryGroups.length > 0 ? (
              categoryGroups.map((group) => (
                <div key={group.category.id || group.category.slug} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
                    <Link
                      href={`/${group.category.slug}`}
                      className="text-lg sm:text-xl font-black text-gray-900 hover:text-red-600 transition flex items-center gap-2"
                    >
                      <span className="w-2.5 h-6 bg-red-600 rounded-xs inline-block"></span>
                      <span>{group.category.name}</span>
                    </Link>
                    <span className="text-xs font-bold text-gray-500 bg-gray-200/80 px-2.5 py-0.5 rounded-full">
                      {group.articles.length} টি সংবাদ
                    </span>
                  </div>

                  {/* Articles Grid for this category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.articles.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group"
                      >
                        {item.featuredImage ? (
                          <Link href={`/${item.category?.slug || 'news'}/${item.id}`} className="block h-44 overflow-hidden relative">
                            <img
                              src={item.featuredImage}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </Link>
                        ) : (
                          <Link href={`/${item.category?.slug || 'news'}/${item.id}`} className="block h-44 bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">
                            খুলনা গেজেট
                          </Link>
                        )}
                        <div className="p-4 flex flex-col justify-between flex-grow space-y-2">
                          <Link href={`/${item.category?.slug || 'news'}/${item.id}`}>
                            <h2 className="font-bold text-base text-gray-900 group-hover:text-red-600 transition line-clamp-2 leading-snug">
                              {item.title}
                            </h2>
                          </Link>
                          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
                            <span>{item.reporterName || 'স্টাফ রিপোর্টার'}</span>
                            <span>{new Date(item.publishedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200">
                এই তারিখে কোনো সংবাদ পাওয়া যায়নি।
              </div>
            )}
          </div>

          {/* Right Sidebar Widgets */}
          <div className="lg:col-span-3 space-y-6">
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
