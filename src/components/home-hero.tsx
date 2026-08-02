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
    <div className="bg-white p-3 sm:p-4 rounded border border-gray-200 shadow-2xs space-y-4">
      {/* 1. TOP HERO MAIN LEAD SECTION: Exact Match with User Reference Image */}
      {mainLead && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center border-b border-gray-200/90 pb-5">
          {/* Left Side: Large Red Heading + Description */}
          <div className="order-2 md:order-1 md:col-span-5 flex flex-col justify-center space-y-3.5 pt-2 md:pt-0">
            <Link href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`} className="group block">
              <h1 className="text-[26px] sm:text-[30px] lg:text-[34px] font-bold text-[#e60023] group-hover:text-red-700 transition leading-[1.28] line-clamp-3">
                ‘{mainLead.title.replace(/^[‘'“"]|[’'"”]$/g, '')}’
              </h1>
            </Link>
            {mainLead.content && (
              <p className="text-[16px] sm:text-[17px] text-[#222222] leading-[1.7] font-normal line-clamp-6">
                {getExcerpt(mainLead.content)}...
              </p>
            )}
          </div>

          {/* Right Side: Featured Image with rounded corners */}
          <div className="order-1 md:order-2 md:col-span-7 group">
            {mainLead.featuredImage ? (
              <Link
                href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`}
                className="block aspect-[16/10] overflow-hidden rounded-xl bg-gray-100 shadow-xs"
              >
                <img
                  src={mainLead.featuredImage}
                  alt={mainLead.title}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300 rounded-xl"
                />
              </Link>
            ) : (
              <div className="w-full aspect-[16/10] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold text-base">
                খুলনা গেজেট
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. GRID OF 3-COLUMN NEWS CARDS BELOW TOP HERO */}
      {gridNews.length > 0 && (
        <div className="pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
            {gridNews.map((story, index) => {
              const categorySlug = story.category?.slug || 'news';
              const isFirstRow = index < 3;
              return (
                <div 
                  key={story.id} 
                  className={`group space-y-1.5 ${!isFirstRow ? 'sm:border-t sm:border-gray-200/80 sm:pt-3.5' : ''}`}
                >
                  {story.featuredImage ? (
                    <Link
                      href={`/${categorySlug}/${story.id}`}
                      className="block aspect-[16/10] overflow-hidden rounded bg-gray-100"
                    >
                      <img
                        src={story.featuredImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                      />
                    </Link>
                  ) : (
                    <div className="w-full aspect-[16/10] bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-xs">
                      খুলনা গেজেট
                    </div>
                  )}
                  <Link href={`/${categorySlug}/${story.id}`} className="block pt-0.5">
                    <h3 className="text-[16px] sm:text-[17px] lg:text-[18px] font-bold text-[#000000] group-hover:text-red-600 transition leading-[1.25] line-clamp-2">
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
