import Link from 'next/link';

interface BlockNewsItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  content: string;
  publishedAt: Date | string | null;
  reporterName?: string | null;
}

interface CategoryBlockProps {
  title: string;
  slug: string;
  news: BlockNewsItem[];
  variant?: 'standard' | 'sports' | 'entertainment' | 'compact';
}

export default function CategoryBlock({
  title,
  slug,
  news,
  variant = 'standard',
}: CategoryBlockProps) {
  if (!news || news.length === 0) return null;

  const lead = news[0];
  const secondary = news.slice(1, 5);

  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 90 ? text.slice(0, 90) + '...' : text;
  };

  return (
    <div className="space-y-3">
      {/* Category Section Header */}
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-1 mb-2">
        <h2 className="text-[24px] sm:text-[26px] font-bold text-[#000000]">
          {title}
        </h2>
        <Link href={`/${slug}`} className="text-xs text-red-600 font-bold hover:underline">
          আরও খবর
        </Link>
      </div>

      {/* Block Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-3 sm:p-4 rounded border border-gray-200 shadow-xs">
        {/* Featured News (Lead) */}
        <div className="lg:col-span-7 space-y-2 group border-b lg:border-b-0 lg:border-r border-gray-150 pb-3 lg:pb-0 lg:pr-4">
          {lead.featuredImage && (
            <Link
              href={`/${slug}/${lead.id}`}
              className="block aspect-video overflow-hidden rounded bg-gray-100"
            >
              <img
                src={lead.featuredImage}
                alt={lead.title}
                className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300"
              />
            </Link>
          )}
          <Link href={`/${slug}/${lead.id}`} className="block">
            <h3 className="text-[22px] sm:text-[24px] font-bold text-[#000000] group-hover:text-red-600 transition leading-snug">
              {lead.title}
            </h3>
          </Link>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed line-clamp-2 font-light">
            {getExcerpt(lead.content)}
          </p>
        </div>

        {/* Thumbnail Sub-links */}
        <div className="lg:col-span-5 space-y-2.5 pt-1 lg:pt-0">
          {secondary.map((item) => (
            <Link
              key={item.id}
              href={`/${slug}/${item.id}`}
              className="flex gap-2.5 group items-center py-1.5 border-b border-gray-100 last:border-b-0 first:pt-0 last:pb-0"
            >
              {item.featuredImage && (
                <div className="w-20 h-14 sm:w-22 sm:h-15 rounded overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}
              <h4 className="text-[17px] sm:text-[18px] font-bold text-[#000000] group-hover:text-red-600 transition leading-snug line-clamp-2 flex-1">
                {item.title}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
