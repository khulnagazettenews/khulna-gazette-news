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

  // 15 Top News Articles Layout matching khulnagazette.com:
  // - news[0]: Main Featured Lead (on right top with red title)
  // - news[1], news[2]: 2 Side Leads stacked (on left top)
  // - news[3] to news[14]: 12 Articles Grid (3 columns x 4 rows below)
  const mainLead = news[0];
  const sideLeads = news.slice(1, 3);
  const gridNews = news.slice(3, 15);

  const getExcerpt = (html?: string | null) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 180 ? text.slice(0, 180) + '...' : text;
  };

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-gray-200 shadow-2xs space-y-4">
      {/* 1. TOP LEAD SECTION: 2 Side Leads on Left (5 cols) + Main Featured Lead on Right (7 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 items-stretch">
        {/* Left Column: 2 Stacked Side Leads (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3.5">
          {sideLeads.map((story) => {
            const categorySlug = story.category?.slug || 'news';
            return (
              <div key={story.id} className="group space-y-1.5 flex flex-col justify-start">
                {story.featuredImage ? (
                  <Link
                    href={`/${categorySlug}/${story.id}`}
                    className="block aspect-[16/9.5] overflow-hidden rounded bg-gray-100"
                  >
                    <img
                      src={story.featuredImage}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                ) : (
                  <div className="w-full aspect-[16/9.5] bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-sm">
                    খুলনা গেজেট
                  </div>
                )}
                <Link href={`/${categorySlug}/${story.id}`} className="block">
                  <h3 className="text-[15px] sm:text-[16px] font-extrabold text-[#000000] group-hover:text-red-600 transition leading-snug line-clamp-2">
                    {story.title}
                  </h3>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right Column: Main Featured Lead Story (7 cols) */}
        {mainLead && (
          <div className="md:col-span-7 group flex flex-col justify-between h-full space-y-2">
            <Link
              href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`}
              className="block flex-1 w-full overflow-hidden rounded bg-gray-100 min-h-[220px] sm:min-h-[250px] relative"
            >
              {mainLead.featuredImage ? (
                <img
                  src={mainLead.featuredImage}
                  alt={mainLead.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition duration-300"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-base">
                  খুলনা গেজেট
                </div>
              )}
            </Link>
            <Link href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`} className="block shrink-0 pt-0.5">
              <h1 className="text-xl sm:text-2xl lg:text-[25px] font-extrabold text-red-600 group-hover:text-red-700 transition leading-snug line-clamp-2">
                {mainLead.title}
              </h1>
            </Link>
          </div>
        )}
      </div>

      {/* Compact Divider & Bottom 12-News Grid Section */}
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
                      className="block aspect-[16/10] overflow-hidden rounded-md bg-gray-100"
                    >
                      <img
                        src={story.featuredImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </Link>
                  ) : (
                    <div className="w-full aspect-[16/10] bg-gray-100 rounded-md flex items-center justify-center text-gray-400 font-bold text-xs">
                      খুলনা গেজেট
                    </div>
                  )}
                  <Link href={`/${categorySlug}/${story.id}`} className="block">
                    <h4 className="text-[14px] sm:text-[15px] font-extrabold text-[#000000] group-hover:text-red-600 transition leading-snug line-clamp-2">
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
