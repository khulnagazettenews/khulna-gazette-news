import Link from 'next/link';

interface BlockNewsItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  content: string;
  publishedAt: Date | null;
  reporterName?: string | null;
}

interface CategoryBlockProps {
  title: string;
  slug: string;
  news: BlockNewsItem[];
}

export default function CategoryBlock({ title, slug, news }: CategoryBlockProps) {
  if (news.length === 0) return null;

  const lead = news[0];
  const listItems = news.slice(1, 5);

  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 90 ? text.slice(0, 90) + '...' : text;
  };

  return (
    <div className="space-y-4">
      {/* Category Section Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
        <h3 className="text-base sm:text-lg font-black text-gray-900 border-l-4 border-red-600 pl-2.5">
          {title}
        </h3>
        <Link href={`/${slug}`} className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline">
          আরও খবর
        </Link>
      </div>

      {/* Block Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Left Column: Featured News */}
        <div className="space-y-3 group">
          {lead.featuredImage && (
            <Link 
              href={`/${slug}/${lead.slug}-${lead.id}`}
              className="block aspect-video overflow-hidden rounded-lg bg-gray-50 relative"
            >
              <img 
                src={lead.featuredImage} 
                alt={lead.title} 
                className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
              />
            </Link>
          )}
          <Link href={`/${slug}/${lead.slug}-${lead.id}`} className="block">
            <h4 className="text-sm sm:text-base font-black text-gray-900 hover:text-red-650 transition leading-snug">
              {lead.title}
            </h4>
          </Link>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {getExcerpt(lead.content)}
          </p>
        </div>

        {/* Right Column: List of 4 Stories */}
        <div className="divide-y divide-gray-150 space-y-3 md:space-y-0">
          {listItems.map((item, idx) => (
            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5">
              <span className="text-xs font-bold text-gray-400 mt-0.5">●</span>
              <div className="space-y-1 flex-1">
                <Link 
                  href={`/${slug}/${item.slug}-${item.id}`}
                  className="text-xs font-bold text-gray-800 hover:text-red-600 transition leading-snug block line-clamp-2"
                >
                  {item.title}
                </Link>
                <span className="text-[9px] text-gray-400 block font-medium">
                  {item.publishedAt && new Date(item.publishedAt).toLocaleDateString('bn-BD', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          ))}
          {listItems.length === 0 && (
            <div className="text-center py-6 text-xs text-gray-400">কোনো অতিরিক্ত সংবাদ পাওয়া যায়নি।</div>
          )}
        </div>
      </div>
    </div>
  );
}
