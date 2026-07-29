import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import SidebarWidgets from '@/components/sidebar-widgets';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ArchivePageProps {
  searchParams: {
    date?: string;
    page?: string;
  };
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const dateStr = searchParams.date || new Date().toISOString().split('T')[0];

  // Selected date start & end
  const startDate = new Date(dateStr);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(dateStr);
  endDate.setHours(23, 59, 59, 999);

  // Queries for archive articles & sidebar widgets
  const [articles, latestNews, popularNews, exclusiveNews, advertisements] =
    await Promise.all([
      prisma.news.findMany({
        where: {
          status: 'PUBLISHED',
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
    const d = new Date(dStr);
    return d.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const serializeList = (list: any[]) => {
    return list.map((item) => ({
      ...item,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
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

                  {/* Articles Grid for this Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {group.articles.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col justify-between group hover:shadow-md transition duration-200"
                      >
                        <div>
                          <Link
                            href={`/${group.category.slug || 'news'}/${item.id}`}
                            className="block aspect-video overflow-hidden bg-gray-100 relative"
                          >
                            {item.featuredImage ? (
                              <img
                                src={item.featuredImage}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs bg-gray-100">
                                খুলনা গেজেট
                              </div>
                            )}
                          </Link>

                          <div className="p-3.5 space-y-1.5">
                            <Link href={`/${group.category.slug || 'news'}/${item.id}`}>
                              <h2 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-red-600 transition leading-snug line-clamp-2">
                                {item.title}
                              </h2>
                            </Link>
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                              {item.content.replace(/<[^>]*>/g, '')}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium bg-gray-50/50">
                          {item.subCategory?.name ? (
                            <span className="text-slate-700 font-semibold bg-slate-200/70 px-2 py-0.5 rounded text-[10px]">
                              {item.subCategory.name}
                            </span>
                          ) : (
                            <span className="text-red-600 font-bold">{group.category.name}</span>
                          )}
                          <span>
                            {item.publishedAt &&
                              new Date(item.publishedAt).toLocaleTimeString('bn-BD', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                <p className="text-lg font-bold">এই তারিখে কোনো খবর পাওয়া যায়নি।</p>
                <p className="text-xs text-gray-400">
                  ক্যালেন্ডার থেকে অন্য যেকোনো একটি তারিখ নির্বাচন করে চেষ্টা করুন।
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
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

      <PublicFooter />
    </div>
  );
}

