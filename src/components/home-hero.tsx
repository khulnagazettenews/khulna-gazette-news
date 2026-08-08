import Link from 'next/link';

interface HeroNewsItem {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  featuredImage?: string | null;
  content: string;
  publishedAt: Date | string | null;
  category: { name: string; slug: string } | any;
  reporterName?: string | null;
}

interface HomeHeroProps {
  news: HeroNewsItem[];
  latestNews?: any[];
  popularNews?: any[];
}

function getExcerpt(content: string) {
  if (!content) return '';
  return content.replace(/<[^>]+>/g, '').trim();
}

export default function HomeHero({ news }: HomeHeroProps) {
  if (!news || news.length === 0) return null;

  // Main Lead news takes news[0], remaining items go to 3-column grid below
  const mainLead = news[0];
  const gridNews = news.length > 1 ? news.slice(1, 13) : [];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. TOP HERO MAIN LEAD SECTION: Exact Match with User Reference Image */}
      {mainLead && (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 border border-gray-200/80 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">
            {/* Left Side: Large Red Heading + Description + Bottom Link (6 cols on MD / 50%) */}
            <div className="order-2 md:order-1 md:col-span-6 flex flex-col justify-between h-full space-y-3.5 py-0.5">
              <div className="space-y-3 sm:space-y-4">
                <Link href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`} className="group block -mt-1.5 sm:-mt-2">
                  <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-bold text-[#e60023] group-hover:text-red-700 transition leading-[1.28]">
                    ‘{mainLead.title.replace(/^[‘'“"]|[’'"”]$/g, '')}’
                  </h1>
                </Link>

                {mainLead.content && (
                  <p className="text-[16px] sm:text-[17px] lg:text-[18px] text-[#222222] leading-[1.65] sm:leading-[1.75] font-normal line-clamp-5 sm:line-clamp-7">
                    {getExcerpt(mainLead.content)}...
                  </p>
                )}
              </div>

              {/* Bottom metadata / read more link aligning with exact bottom edge of image */}
              <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-sm sm:text-base font-bold text-[#e60023] shrink-0">
                <span className="text-[#e60023] font-extrabold text-sm sm:text-base">
                  {mainLead.category?.name || 'বিশেষ সংবাদ'}
                </span>
                <Link
                  href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`}
                  className="text-[#e60023] font-bold hover:underline inline-flex items-center gap-1.5"
                >
                  <span>বিস্তারিত</span>
                  <span className="text-base sm:text-lg font-bold">→</span>
                </Link>
              </div>
            </div>

            {/* Right Side: Featured Image (6 cols on MD / 50%) */}
            <div className="order-1 md:order-2 md:col-span-6 group flex flex-col h-full">
              {mainLead.featuredImage ? (
                <Link
                  href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`}
                  className="block w-full h-full aspect-[16/10] md:aspect-auto min-h-[250px] sm:min-h-[300px] overflow-hidden rounded-none bg-slate-100 shadow-xs relative"
                >
                  <img
                    src={mainLead.featuredImage}
                    alt={mainLead.title}
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300 rounded-none"
                  />
                </Link>
              ) : (
                <div className="w-full h-full min-h-[250px] sm:min-h-[300px] bg-gray-100 rounded-none flex items-center justify-center text-gray-400 font-bold text-base">
                  খুলনা গেজেট
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. GRID OF NEWS CARDS BELOW TOP HERO (1-col on mobile list, 3-cols on desktop grid) */}
      {gridNews.length > 0 && (
        <div className="pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-x-4 sm:gap-y-5">
            {gridNews.map((story, index) => {
              const categorySlug = story.category?.slug || 'news';
              const isFirstRow = index < 3;
              return (
                <div 
                  key={story.id} 
                  className={`group flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 border-b border-gray-100 sm:border-b-0 pb-3 sm:pb-0 last:border-b-0 ${!isFirstRow ? 'sm:border-t sm:border-gray-200/80 sm:pt-3.5' : ''}`}
                >
                  {story.featuredImage ? (
                    <Link
                      href={`/${categorySlug}/${story.id}`}
                      className="block w-28 h-20 sm:w-full sm:h-auto sm:aspect-[16/10] shrink-0 overflow-hidden rounded bg-gray-100"
                    >
                      <img
                        src={story.featuredImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                      />
                    </Link>
                  ) : (
                    <div className="w-28 h-20 sm:w-full sm:h-auto sm:aspect-[16/10] shrink-0 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-xs">
                      খুলনা গেজেট
                    </div>
                  )}
                  <Link href={`/${categorySlug}/${story.id}`} className="block pt-0.5 flex-1 min-w-0">
                    <h3 className="text-[18px] sm:text-[18px] lg:text-[19px] font-bold text-[#000000] group-hover:text-red-600 transition leading-snug sm:leading-[1.25] line-clamp-2 break-words">
                      {story.title}
                    </h3>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
