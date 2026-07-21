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

  // 1. Sports Variant Layout
  if (variant === 'sports') {
    return (
      <div className="space-y-4 my-6">
        <div className="flex items-center justify-between border-t-2 border-red-600 pt-2.5">
          <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block" />
            <span>{title}</span>
          </h3>
          <Link href={`/${slug}`} className="text-xs text-red-600 font-bold hover:underline">
            আরও খবর
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          {/* Main Sports Lead (7 cols) */}
          <div className="lg:col-span-7 space-y-3 group border-b lg:border-b-0 lg:border-r border-gray-150 pb-4 lg:pb-0 lg:pr-6">
            {lead.featuredImage && (
              <Link
                href={`/${slug}/${lead.id}`}
                className="block aspect-video overflow-hidden rounded-lg bg-slate-100"
              >
                <img
                  src={lead.featuredImage}
                  alt={lead.title}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300"
                />
              </Link>
            )}
            <Link href={`/${slug}/${lead.id}`} className="block">
              <h4 className="text-base sm:text-lg font-black text-gray-900 group-hover:text-red-650 transition leading-snug">
                {lead.title}
              </h4>
            </Link>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
              {getExcerpt(lead.content)}
            </p>
          </div>

          {/* 4 Mini Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {secondary.map((item) => (
              <Link
                key={item.id}
                href={`/${slug}/${item.id}`}
                className="flex gap-3 group items-center py-1 border-b border-gray-100 last:border-b-0"
              >
                {item.featuredImage && (
                  <div className="w-24 h-16 rounded-md overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                <h5 className="text-xs font-bold text-gray-850 group-hover:text-red-600 transition leading-snug line-clamp-2">
                  {item.title}
                </h5>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Entertainment Variant Layout
  if (variant === 'entertainment') {
    return (
      <div className="space-y-4 my-6">
        <div className="flex items-center justify-between border-t-2 border-red-600 pt-2.5">
          <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block" />
            <span>{title}</span>
          </h3>
          <Link href={`/${slug}`} className="text-xs text-red-600 font-bold hover:underline">
            আরও খবর
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          {/* Main Lead Card (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3 group border-b sm:border-b-0 border-gray-150 pb-4 sm:pb-0">
            {lead.featuredImage && (
              <Link
                href={`/${slug}/${lead.id}`}
                className="block aspect-video overflow-hidden rounded-lg bg-slate-100"
              >
                <img
                  src={lead.featuredImage}
                  alt={lead.title}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300"
                />
              </Link>
            )}
            <Link href={`/${slug}/${lead.id}`} className="block">
              <h4 className="text-base font-black text-gray-900 group-hover:text-red-650 transition leading-snug">
                {lead.title}
              </h4>
            </Link>
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {getExcerpt(lead.content)}
            </p>
          </div>

          {/* Sub cards (3 cols on lg) */}
          {secondary.map((item) => (
            <div key={item.id} className="space-y-2.5 group">
              {item.featuredImage && (
                <Link
                  href={`/${slug}/${item.id}`}
                  className="block aspect-video overflow-hidden rounded-md bg-slate-100"
                >
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </Link>
              )}
              <Link href={`/${slug}/${item.id}`} className="block">
                <h5 className="text-xs font-bold text-gray-850 group-hover:text-red-600 transition leading-snug line-clamp-3">
                  {item.title}
                </h5>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Standard & Compact Layout (Multi-column category block)
  return (
    <div className="space-y-3">
      {/* Category Section Header */}
      <div className="flex items-center justify-between border-t-2 border-red-600 pt-2.5">
        <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block" />
          <span>{title}</span>
        </h3>
        <Link href={`/${slug}`} className="text-xs text-red-600 font-bold hover:underline">
          আরও খবর
        </Link>
      </div>

      {/* Block Content Grid */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        {/* Featured News */}
        <div className="space-y-2.5 group">
          {lead.featuredImage && (
            <Link
              href={`/${slug}/${lead.id}`}
              className="block aspect-video overflow-hidden rounded-lg bg-slate-100"
            >
              <img
                src={lead.featuredImage}
                alt={lead.title}
                className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300"
              />
            </Link>
          )}
          <Link href={`/${slug}/${lead.id}`} className="block">
            <h4 className="text-base sm:text-lg font-black text-gray-900 group-hover:text-red-650 transition leading-snug">
              {lead.title}
            </h4>
          </Link>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
            {getExcerpt(lead.content)}
          </p>
        </div>

        {/* Bulleted Sub-links */}
        <div className="divide-y divide-gray-150 pt-2 border-t border-gray-100 space-y-2">
          {secondary.map((item) => (
            <div key={item.id} className="pt-2 first:pt-0 flex items-start gap-2">
              <span className="text-red-600 text-xs font-bold mt-0.5">•</span>
              <Link
                href={`/${slug}/${item.id}`}
                className="text-xs sm:text-sm font-bold text-gray-800 hover:text-red-600 transition leading-snug line-clamp-2 flex-1"
              >
                {item.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
