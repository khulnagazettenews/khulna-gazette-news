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
}

export default function HomeHero({ news }: HomeHeroProps) {
  if (!news || news.length === 0) return null;

  // 15 Top News Articles Layout matching Admin Dashboard Position config:
  // - news[0], news[1]: Position 1 & 2 -> Left Stacked Side Leads (3 cols)
  // - news[2]: Position 3 -> Main Featured Lead (CENTER Column - 6 cols)
  // - news[3], news[4]: Position 4 & 5 -> Right Stacked Side Leads (3 cols)
  // - news[5] to news[14]: Positions 6 to 15 -> 10 Articles Grid below (3 columns)
  const leftLeads = news.length >= 2 ? news.slice(0, 2) : [];
  const mainLead = news.length >= 3 ? news[2] : news[0];
  const rightLeads = news.length >= 5 ? news.slice(3, 5) : [];
  const gridNews = news.length > 5 ? news.slice(5, 15) : [];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-gray-200 shadow-2xs space-y-4">
      {/* 1. TOP LEAD SECTION: 3 Columns (Left 3 cols, Center Lead 6 cols, Right 3 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column (3 cols): 2 Stacked Cards */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-3.5">
          {leftLeads.map((story) => {
            const categorySlug = story.category?.slug || 'news';
            return (
              <div key={story.id} className="group space-y-1.5 flex flex-col justify-start">
                {story.featuredImage ? (
                  <Link
                    href={`/${categorySlug}/${story.id}`}
                    className="block aspect-[16/10] overflow-hidden rounded bg-gray-100"
                  >
                    <img
                      src={story.featuredImage}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                ) : (
                  <div className="w-full aspect-[16/10] bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-xs">
                    খুলনা গেজেট
                  </div>
                )}
                <Link href={`/${categorySlug}/${story.id}`} className="block">
                  <h3 className="text-[24px] sm:text-[26px] font-bold text-[#000000] group-hover:text-red-600 transition leading-[1.2] line-clamp-2">
                    {story.title}
                  </h3>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Center Column (6 cols): Main Featured Lead Story */}
        {mainLead && (
          <div className="lg:col-span-6 group space-y-2 flex flex-col justify-start">
            {mainLead.featuredImage ? (
              <Link
                href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`}
                className="block aspect-[16/10] overflow-hidden rounded bg-gray-100"
              >
                <img
                  src={mainLead.featuredImage}
                  alt={mainLead.title}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300"
                />
              </Link>
            ) : (
              <div className="w-full aspect-[16/10] bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-base">
                খুলনা গেজেট
              </div>
            )}
            <Link href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`} className="block pt-1">
              <h1 className="text-[32px] sm:text-[36px] lg:text-[40px] font-bold text-red-600 group-hover:text-red-700 transition leading-[1.18] line-clamp-2">
                {mainLead.title}
              </h1>
            </Link>
          </div>
        )}

        {/* Right Column (3 cols): 2 Stacked Cards */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-3.5">
          {rightLeads.map((story) => {
            const categorySlug = story.category?.slug || 'news';
            return (
              <div key={story.id} className="group space-y-1.5 flex flex-col justify-start">
                {story.featuredImage ? (
                  <Link
                    href={`/${categorySlug}/${story.id}`}
                    className="block aspect-[16/10] overflow-hidden rounded bg-gray-100"
                  >
                    <img
                      src={story.featuredImage}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                ) : (
                  <div className="w-full aspect-[16/10] bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-xs">
                    খুলনা গেজেট
                  </div>
                )}
                <Link href={`/${categorySlug}/${story.id}`} className="block">
                  <h3 className="text-[24px] sm:text-[26px] font-bold text-[#000000] group-hover:text-red-600 transition leading-[1.2] line-clamp-2">
                    {story.title}
                  </h3>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom 10-News Grid Section */}
      {gridNews.length > 0 && (
        <div className="border-t border-gray-200/80 pt-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 lg:gap-4">
            {gridNews.map((story) => {
              const categorySlug = story.category?.slug || 'news';
              return (
                <div key={story.id} className="group space-y-1.5">
                  {story.featuredImage ? (
                    <Link
                      href={`/${categorySlug}/${story.id}`}
                      className="block aspect-[16/10] overflow-hidden rounded bg-gray-100"
                    >
                      <img
                        src={story.featuredImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </Link>
                  ) : (
                    <div className="w-full aspect-[16/10] bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-xs">
                      খুলনা গেজেট
                    </div>
                  )}
                  <Link href={`/${categorySlug}/${story.id}`} className="block">
                    <h4 className="text-[22px] sm:text-[24px] font-bold text-[#000000] group-hover:text-red-600 transition leading-[1.25] line-clamp-2">
                      {story.title}
                    </h4>
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
