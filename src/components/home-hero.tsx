import Link from 'next/link';

interface HeroNewsItem {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  featuredImage?: string | null;
  content: string;
  publishedAt: Date | string | null;
  category: { name: string; slug: string };
  reporterName?: string | null;
}

interface HomeHeroProps {
  news: HeroNewsItem[];
}

export default function HomeHero({ news }: HomeHeroProps) {
  if (!news || news.length === 0) return null;

  // Distribute news items matching khulnagazette.com lead structure
  const leftColumnNews = news.slice(0, 2); // 2 stacked cards on far left
  const leadStory = news[2] || news[0]; // Main big featured story in center
  const subGridNews = news.slice(3, 7); // 4 cards under main lead

  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 140 ? text.slice(0, 140) + '...' : text;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-9 gap-5 items-start">
      {/* 1. Left Column (3 Cols on LG): 2 Stacked Cards */}
      <div className="lg:col-span-3 space-y-4">
        {leftColumnNews.map((story) => (
          <div
            key={story.id}
            className="bg-white p-2.5 rounded border border-gray-200 shadow-xs space-y-2 group"
          >
            {story.featuredImage && (
              <Link
                href={`/${story.category?.slug || 'news'}/${story.id}`}
                className="block aspect-video overflow-hidden rounded bg-gray-100 mb-2"
              >
                <img
                  src={story.featuredImage}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </Link>
            )}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-red-600 tracking-tight">
                {story.category?.name}
              </span>
              <Link href={`/${story.category?.slug || 'news'}/${story.id}`} className="block">
                <h3 className="text-[17px] sm:text-[18px] font-bold text-[#000000] group-hover:text-red-600 transition leading-snug line-clamp-3">
                  {story.title}
                </h3>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Middle Main Column (6 Cols on LG): Main Featured Lead Story + 4 Column Grid */}
      <div className="lg:col-span-6 space-y-4">
        {/* Main Lead Card */}
        {leadStory && (
          <div className="bg-white rounded border border-gray-200 overflow-hidden group p-2.5 space-y-3">
            <Link
              href={`/${leadStory.category?.slug || 'news'}/${leadStory.id}`}
              className="block relative aspect-[16/9] overflow-hidden rounded bg-gray-100"
            >
              {leadStory.featuredImage ? (
                <img
                  src={leadStory.featuredImage}
                  alt={leadStory.title}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                  খুলনা গেজেট
                </div>
              )}
              <span className="absolute bottom-2 left-2 bg-red-600 text-white font-bold text-xs px-2.5 py-0.5 rounded select-none">
                {leadStory.category?.name}
              </span>
            </Link>

            <div className="space-y-2">
              <Link
                href={`/${leadStory.category?.slug || 'news'}/${leadStory.id}`}
                className="block"
              >
                <h1 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-[#000000] group-hover:text-red-600 transition leading-tight">
                  {leadStory.title}
                </h1>
              </Link>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {getExcerpt(leadStory.content)}
              </p>
            </div>
          </div>
        )}

        {/* 4-Card Sub-Grid under Main Lead Story */}
        {subGridNews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded border border-gray-200">
            {subGridNews.map((item) => (
              <div key={item.id} className="group space-y-1.5">
                {item.featuredImage && (
                  <Link
                    href={`/${item.category?.slug || 'news'}/${item.id}`}
                    className="block aspect-[16/10] overflow-hidden rounded bg-gray-100 mb-1.5"
                  >
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                )}
                <Link
                  href={`/${item.category?.slug || 'news'}/${item.id}`}
                  className="block"
                >
                  <h4 className="text-[15px] sm:text-[16px] font-bold text-[#000000] group-hover:text-red-600 transition leading-snug line-clamp-3">
                    {item.title}
                  </h4>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
