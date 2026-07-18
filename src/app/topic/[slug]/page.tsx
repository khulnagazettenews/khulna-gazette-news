import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import TabsWidget from '@/components/tabs-widget';
import PrayerWidget from '@/components/prayer-widget';
import Link from 'next/link';

export const revalidate = 60; // 60 seconds (ISR)

interface TopicPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function TopicPage({ params, searchParams }: TopicPageProps) {
  const { slug } = params;

  // 1. Fetch tag details
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) {
    notFound();
  }

  // 2. Fetch paginated news items tagged with this tag
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    prisma.news.findMany({
      where: {
        tags: { some: { slug } },
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: { category: true },
    }),
    prisma.news.count({
      where: {
        tags: { some: { slug } },
        status: 'PUBLISHED',
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // 3. Fetch Sidebar Details
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
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 border-l-4 border-red-600 pl-2.5">
              বিষয় বা টপিক: "{tag.name}" ({total}টি খবর)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {articles.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between group">
                  <div>
                    {item.featuredImage && (
                      <Link href={`/${item.category?.slug || 'news'}/${item.slug}-${item.id}`} className="block aspect-video overflow-hidden bg-gray-50">
                        <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </Link>
                    )}
                    <div className="p-4 space-y-2">
                      <Link href={`/${item.category?.slug || 'news'}/${item.slug}-${item.id}`}>
                        <h3 className="text-sm font-bold text-gray-900 hover:text-red-655 transition leading-snug line-clamp-2">
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
              <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200 shadow-sm">
                এই টপিকে কোনো সংবাদ পাওয়া যায়নি।
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-6">
                {page > 1 && (
                  <Link
                    href={`/topic/${slug}?page=${page - 1}`}
                    className="bg-white border border-gray-300 text-gray-650 text-xs px-4 py-2 rounded-lg hover:bg-gray-150 transition"
                  >
                    পূর্ববর্তী
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/topic/${slug}?page=${page + 1}`}
                    className="bg-white border border-gray-300 text-gray-650 text-xs px-4 py-2 rounded-lg hover:bg-gray-150 transition"
                  >
                    পরবর্তী
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
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
