import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import TabsWidget from '@/components/tabs-widget';
import PrayerWidget from '@/components/prayer-widget';
import Link from 'next/link';

export const revalidate = 60; // Cache for 60 seconds (ISR)

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = params;

  // 1. Fetch current category details
  const cat = await prisma.category.findUnique({
    where: { slug: category },
    include: {
      subCategories: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!cat) {
    notFound();
  }

  // 2. Paginated Fetch of all news items in category (including direct subcategory articles)
  const page = parseInt(searchParams.page || '1');
  const limit = 18;
  const skip = (page - 1) * limit;

  // Get matching category ids (both parent and its subcategories if any)
  const matchingCatIds = [cat.id, ...cat.subCategories.map((s) => s.id)];

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

  // 2. Parallel fetch articles, count, latest news & popular news
  const [articles, total, latestNews, popularNews, sidebarAd] = await Promise.all([

    prisma.news.findMany({
      where: {
        categoryId: { in: matchingCatIds },
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      select: listSelect,
    }),
    prisma.news.count({
      where: {
        categoryId: { in: matchingCatIds },
        status: 'PUBLISHED',
      },
    }),
    prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: listSelect,
    }),
    prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: 6,
      select: listSelect,
    }),
    prisma.advertisement.findFirst({
      where: { position: 'sidebar_banner', status: 'ACTIVE' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

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
        
        {/* Content columns (Left 9 Cols + Right 3 Cols Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Category title + 3-Col News grid + Pagination */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Category Header with Red Underline */}
            <div className="border-b-2 border-[#FF0000] pb-1.5 mb-6">
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#000000] leading-none">
                {cat.name}
              </h1>
            </div>

            {/* Subcategories bar if available */}
            {cat.subCategories && cat.subCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 -mt-2 mb-4">
                <span className="text-xs text-gray-500 font-bold self-center mr-1">উপ-বিভাগ:</span>
                {cat.subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/${cat.slug}/${sub.slug}`}
                    className="text-xs font-semibold bg-gray-100 border border-gray-200 text-gray-800 hover:bg-[#e60023] hover:text-white px-3 py-1 rounded transition"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Articles List/Grid: 1-column horizontal row list on mobile, 3-column stacked grid on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-x-6 sm:gap-y-7">
              {articles.map((item) => (
                <div key={item.id} className="group flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 border-b border-gray-150 sm:border-b-0 pb-3 sm:pb-0 last:border-b-0">
                  {item.featuredImage ? (
                    <Link href={`/${item.category?.slug || category}/${item.id}`} className="block w-28 h-20 sm:w-full sm:h-auto sm:aspect-[16/10] shrink-0 overflow-hidden bg-gray-100 rounded">
                      <img 
                        src={item.featuredImage} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                    </Link>
                  ) : (
                    <div className="w-28 h-20 sm:w-full sm:h-auto sm:aspect-[16/10] shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                      খুলনা গেজেট
                    </div>
                  )}
                  
                  <Link href={`/${item.category?.slug || category}/${item.id}`} className="block flex-1 min-w-0">
                    <h2 className="text-[18px] sm:text-[19px] font-bold text-[#000000] group-hover:text-[#e60023] transition leading-[1.28] line-clamp-2 sm:line-clamp-3 break-words">
                      {item.title}
                    </h2>
                  </Link>
                </div>
              ))}
            </div>

            {articles.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-base font-medium">এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।</div>
            )}

            {/* Numeric WP-Style Pagination Bar matching exact screenshot */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 pt-8 text-[13px] text-[#444444] font-medium flex-wrap select-none">
                <span className="mr-1 text-gray-600 font-semibold">পৃষ্ঠা সমূহ :</span>
                
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/${category}?page=${p}`}
                    className={`px-2.5 py-1 text-sm font-semibold rounded transition ${
                      p === page
                        ? 'bg-[#888888] text-white'
                        : 'bg-[#eeeeee] text-[#333333] hover:bg-[#e60023] hover:text-white'
                    }`}
                  >
                    {p}
                  </Link>
                ))}

                {totalPages > 7 && (
                  <>
                    <span className="px-1 text-gray-500 font-bold">.</span>
                    <Link
                      href={`/${category}?page=${totalPages}`}
                      className="bg-[#eeeeee] text-[#333333] hover:bg-[#e60023] hover:text-white px-2.5 py-1 text-sm font-semibold rounded transition"
                    >
                      {totalPages}
                    </Link>
                  </>
                )}

                {page < totalPages && (
                  <Link
                    href={`/${category}?page=${page + 1}`}
                    className="bg-[#eeeeee] text-[#333333] hover:bg-[#e60023] hover:text-white px-2.5 py-1 text-sm font-semibold rounded transition ml-1"
                  >
                    »
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Widgets matching screenshot */}
          <div className="lg:col-span-3 space-y-6">
            <TabsWidget 
              latest={serializeList(latestNews)} 
              popular={serializeList(popularNews)} 
            />

            {/* App Download Promo Box */}
            <div className="bg-[#1f2937] text-white p-3 rounded-lg text-center font-bold text-sm tracking-wide">
              খুলনা গেজেট app পেতে ক্লিক করুন
            </div>

            <PrayerWidget />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
