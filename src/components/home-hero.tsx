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

export default function HomeHero({ news }: HomeHeroProps) {
  if (!news || news.length === 0) return null;

  // Layout matching user reference screenshot:
  // - news[0], news[1]: Left 2 stacked side news cards (4 cols)
  // - news[2]: Main Lead (Center featured news card with RED title - 8 cols)
  // - news[3] to news[14]: Up to 12 news cards arranged in 3-column grid rows below
  const leftLeads = news.length >= 2 ? news.slice(0, 2) : [news[0]];
  const mainLead = news.length >= 3 ? news[2] : (news.length > 2 ? news[1] : news[0]);
  const gridNews = news.length > 3 ? news.slice(3, 15) : [];

  return (
    <div className="bg-white p-3 sm:p-4 rounded border border-gray-200 shadow-2xs space-y-4">
      {/* 1. TOP HERO SECTION: Left (2 stacked cards - 4 cols) + Center (1 Main Lead card - 8 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column (4 cols): 2 Stacked News Items */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-3">
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
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                    />
                  </Link>
                ) : (
                  <div className="w-full aspect-[16/10] bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-xs">
                    খুলনা গেজেট
                  </div>
                )}
                <Link href={`/${categorySlug}/${story.id}`} className="block pt-0.5">
                  <h3 className="text-[16px] sm:text-[18px] lg:text-[19px] font-bold text-[#000000] group-hover:text-red-600 transition leading-[1.25] line-clamp-2">
                    {story.title}
                  </h3>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Center Main Lead (8 cols): Large Featured Story with RED Title */}
        {mainLead && (
          <div className="md:col-span-8 group space-y-2 flex flex-col justify-start">
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
              <h1 className="text-[21px] sm:text-[24px] lg:text-[26px] font-bold text-[#d91414] group-hover:text-red-700 transition leading-[1.2] line-clamp-2">
                ‘{mainLead.title.replace(/^[‘'“"]|[’'"”]$/g, '')}’
              </h1>
            </Link>
          </div>
        )}
      </div>

      {/* 2. GRID OF 3-COLUMN NEWS CARDS BELOW TOP HERO */}
      {gridNews.length > 0 && (
        <div className="border-t border-gray-200/90 pt-3.5">
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
