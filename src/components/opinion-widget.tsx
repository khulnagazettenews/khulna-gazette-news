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
        <h3 className="text-base sm:text-lg font-light text-gray-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block" />
          <span>মতামত</span>
        </h3>
        <Link href="/motamot" className="text-xs text-red-600 font-light hover:underline">
          সব মতামত
        </Link>
      </div>

      {/* Grid of opinion items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        {items.map((item) => {
          const authorName = item.reporterName || item.author?.name || 'কলামিস্ট';
          const avatarUrl = item.author?.avatar;

          return (
            <div key={item.id} className="group space-y-2 flex flex-col justify-between">
              <div className="space-y-2">
                <Link href={`/${item.category?.slug || 'motamot'}/${item.id}`}>
                  <h4 className="text-sm font-light text-gray-900 group-hover:text-red-600 transition leading-snug line-clamp-3">
                    {item.title}
                  </h4>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
