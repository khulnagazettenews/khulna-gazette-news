import Link from 'next/link';

interface OpinionItem {
  id: string;
  title: string;
  slug: string;
  reporterName?: string | null;
  author?: {
    name: string;
    avatar?: string | null;
  } | null;
  category: { name: string; slug: string };
  publishedAt: Date | string | null;
}

interface OpinionWidgetProps {
  items: OpinionItem[];
}

export default function OpinionWidget({ items }: OpinionWidgetProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4 my-8">
      {/* Header */}
      <div className="flex items-center justify-between border-t-2 border-red-600 pt-2.5">
        <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block" />
          <span>মতামত</span>
        </h3>
        <Link href="/motamot" className="text-xs text-red-600 font-bold hover:underline">
          সব মতামত
        </Link>
      </div>

      {/* Grid of opinion items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        {items.map((item) => {
          const authorName = item.reporterName || item.author?.name || 'কলামিস্ট';
          const avatarUrl = item.author?.avatar;

          return (
            <Link
              key={item.id}
              href={`/${item.category?.slug || 'motamot'}/${item.id}`}
              className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-150 transition group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-red-100 border border-red-200 shrink-0 flex items-center justify-center text-red-700 font-bold text-base shadow-sm">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                  ) : (
                    authorName.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 group-hover:text-red-600 transition">
                    {authorName}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium block">কলামিস্ট</span>
                </div>
              </div>

              <h5 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug line-clamp-3 group-hover:text-red-650 transition">
                {item.title}
              </h5>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
