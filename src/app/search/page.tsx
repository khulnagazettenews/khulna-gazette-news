import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import TabsWidget from '@/components/tabs-widget';
import PrayerWidget from '@/components/prayer-widget';
import Link from 'next/link';

export const revalidate = 0; // Live queries for search

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  // Search logic
  const where = {
    status: 'PUBLISHED',
    OR: [
      { title: { contains: query } },
      { subtitle: { contains: query } },
      { content: { contains: query } },
    ],
  };

  const [articles, total] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: { category: true },
    }),
    prisma.news.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Sidebar widget details load
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
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <PublicHeader />
      
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main search results listing (9 Cols) */}
          <div className="lg:col-span-9 space-y-6">
            <div className="border-b-2 border-[#FF0000] pb-1.5 mb-6">
              <h1 className="text-[22px] sm:text-[26px] font-bold text-[#000000]">
                অনুসন্ধান ফলাফল: "{query}" ({total}টি খবর পাওয়া গেছে)
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-x-6 sm:gap-y-7">
              {articles.map((item) => (
                <div key={item.id} className="group flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 border-b border-gray-150 sm:border-b-0 pb-3 sm:pb-0 last:border-b-0">
                  {item.featuredImage ? (
                    <Link href={`/${item.category?.slug || 'news'}/${item.id}`} className="block w-28 h-20 sm:w-full sm:h-auto sm:aspect-[16/10] shrink-0 overflow-hidden bg-gray-100 rounded">
                      <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </Link>
                  ) : (
                    <div className="w-28 h-20 sm:w-full sm:h-auto sm:aspect-[16/10] shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                      খুলনা গেজেট
                    </div>
                  )}
                  <Link href={`/${item.category?.slug || 'news'}/${item.id}`} className="block flex-1 min-w-0">
                    <h2 className="text-[18px] sm:text-[19px] font-bold text-[#000000] group-hover:text-[#e60023] transition leading-[1.28] line-clamp-2 sm:line-clamp-3 break-words">
                      {item.title}
                    </h2>
                  </Link>
                </div>
              ))}
            </div>

            {articles.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-base font-medium">
                দুঃখিত, কোনো সংবাদ পাওয়া যায়নি। ভিন্ন কিছু লিখে অনুসন্ধান করুন।
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 pt-8 text-[13px] text-[#444444] font-medium flex-wrap select-none">
                <span className="mr-1 text-gray-600 font-semibold">পৃষ্ঠা সমূহ :</span>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
                    className={`px-2.5 py-1 text-sm font-semibold rounded transition ${
                      p === page
                        ? 'bg-[#888888] text-white'
                        : 'bg-[#eeeeee] text-[#333333] hover:bg-[#e60023] hover:text-white'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className="bg-[#eeeeee] text-[#333333] hover:bg-[#e60023] hover:text-white px-2.5 py-1 text-sm font-semibold rounded transition ml-1"
                  >
                    »
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar (3 Cols) */}
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
