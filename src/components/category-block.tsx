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
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 90 ? text.slice(0, 90) + '...' : text;
  };

  return (
    <div className="space-y-3">
      {/* Category Section Header: Red bottom border matching khulnagazette.com */}
      <div className="flex items-center justify-between border-b-2 border-[#FF0000] pb-1">
        <h2 className="text-[22px] sm:text-[24px] font-bold text-[#000000] leading-none">
          {title}
        </h2>
        <Link href={`/${slug}`} className="text-xs text-[#e60023] font-bold hover:underline">
          আরও খবর
        </Link>
      </div>

      {/* Block Content Container */}
      <div className="bg-white">
        {variant === 'sports' || variant === 'entertainment' ? (
          /* 2x2 Grid Variant for Sports & Entertainment */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Lead Story on Left */}
            <div className="lg:col-span-6 space-y-2 group">
              {lead.featuredImage && (
                <Link
                  href={`/${slug}/${lead.id}`}
                  className="block aspect-[16/10] overflow-hidden rounded bg-gray-100"
                >
                  <img
                    src={lead.featuredImage}
                    alt={lead.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                  />
                </Link>
              )}
              <Link href={`/${slug}/${lead.id}`} className="block pt-0.5">
                <h3 className="text-[18px] sm:text-[21px] font-bold text-[#000000] group-hover:text-[#e60023] transition leading-[1.25] line-clamp-2 break-words">
                  {lead.title}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 font-normal">
                {getExcerpt(lead.content)}
              </p>
            </div>

            {/* 4 Cards: 1-col flex list on mobile, 2x2 grid on desktop */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {secondary.map((item) => (
                <div key={item.id} className="group flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-1.5 border-b border-gray-100 sm:border-b-0 pb-2.5 sm:pb-0 last:border-b-0">
                  {item.featuredImage && (
                    <Link
                      href={`/${slug}/${item.id}`}
                      className="block w-28 h-20 sm:w-full sm:h-auto sm:aspect-[16/10] shrink-0 overflow-hidden rounded bg-gray-100"
                    >
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                      />
                    </Link>
                  )}
                  <Link href={`/${slug}/${item.id}`} className="block pt-0.5 flex-1 min-w-0">
                    <h4 className="text-[18px] sm:text-[18px] font-bold text-[#000000] group-hover:text-[#e60023] transition leading-snug line-clamp-2 break-words">
                      {item.title}
                    </h4>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard Variant (Lead on left, 4 list items on right with thumbnail) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Featured Lead Story */}
            <div className="lg:col-span-6 space-y-2 group border-b lg:border-b-0 lg:border-r border-gray-200/80 pb-3 lg:pb-0 lg:pr-4">
              {lead.featuredImage && (
                <Link
                  href={`/${slug}/${lead.id}`}
                  className="block aspect-[16/10] overflow-hidden rounded bg-gray-100"
                >
                  <img
                    src={lead.featuredImage}
                    alt={lead.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                  />
                </Link>
              )}
              <Link href={`/${slug}/${lead.id}`} className="block pt-0.5">
                <h3 className="text-[21px] sm:text-[23px] font-bold text-[#000000] group-hover:text-[#e60023] transition leading-snug line-clamp-2 break-words">
                  {lead.title}
                </h3>
              </Link>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-2 font-normal">
                {getExcerpt(lead.content)}
              </p>
            </div>

            {/* 4 List Items with Thumbnail on Left */}
            <div className="lg:col-span-6 space-y-3 pt-1 lg:pt-0">
              {secondary.map((item) => (
                <Link
                  key={item.id}
                  href={`/${slug}/${item.id}`}
                  className="flex gap-3 group items-center py-1 border-b border-gray-100 last:border-b-0 first:pt-0 last:pb-0"
                >
                  {item.featuredImage && (
                    <div className="w-28 h-20 sm:w-20 sm:h-14 rounded overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
                      />
                    </div>
                  )}
                  <h4 className="text-[18px] sm:text-[18px] font-bold text-[#000000] group-hover:text-[#e60023] transition leading-snug line-clamp-2 flex-1 break-words">
                    {item.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
