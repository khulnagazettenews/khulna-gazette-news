import Link from 'next/link';

interface SpecialNewsItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  content?: string;
  category: { name: string; slug: string };
  publishedAt?: string | Date | null;
}

interface SpecialTopicSectionProps {
  title?: string;
  bannerSubtitle?: string;
  news: SpecialNewsItem[];
}

export default function SpecialTopicSection({
  title = 'বিশ্বকাপ ফুটবল ও বিশেষ আন্তর্জাতিক আয়োজন',
  bannerSubtitle = 'বিস্তারিত দেখতে কভার খবরের যেকোনো একটিতে ক্লিক করুন',
  news,
}: SpecialTopicSectionProps) {
  if (!news || news.length === 0) return null;

  // 5-6 news items layout (2nd Image Design)
  const item1 = news[0]; // Left text lead
  const item2 = news[1] || news[0]; // Center photo lead
  const item3 = news[2] || news[0]; // Mid right top
  const item4 = news[3] || news[1]; // Mid right bottom
  const item5 = news[4] || news[2]; // Far right top
  const item6 = news[5] || news[3]; // Far right bottom

  const getExcerpt = (html?: string) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 100 ? text.slice(0, 100) + '...' : text;
  };

  const getTimeAgo = (dateVal?: string | Date | null) => {
    if (!dateVal) return 'সদ্য প্রকাশিত';
    const date = new Date(dateVal);
    const diffMin = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (diffMin < 60) return `${diffMin} মিনিট আগে`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    return date.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="mt-1 mb-6 shadow-md rounded-2xl overflow-hidden border border-teal-200/80 bg-[#d8ecec]">
      {/* ================= CAMPAIGN BANNER HEADER ================= */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-teal-700 via-cyan-600 to-sky-700 text-white p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-teal-300/60 shadow-sm">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-full bg-white text-teal-700 flex items-center justify-center font-black text-base shadow-md shrink-0">
            ★
          </div>
          <div>
            <h4 className="text-lg sm:text-2xl font-black tracking-tight text-white drop-shadow">
              {title}
            </h4>
            <p className="text-xs text-teal-100 font-medium">
              {bannerSubtitle}
            </p>
          </div>
        </div>

        <Link
          href={`/${item1.category?.slug || 'news'}`}
          className="relative z-10 inline-flex items-center gap-2 bg-white text-teal-800 hover:bg-slate-100 font-extrabold text-xs px-4 py-1.5 rounded-full shadow transition shrink-0"
        >
          <span>বিস্তারিত দেখুন</span>
          <span>↗</span>
        </Link>
      </div>

      {/* ================= LIGHT TEAL 5-NEWS POSTS SECTION ================= */}
      <section className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Column 1 (Left Text Lead - 3 cols on LG) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-3 lg:border-r border-teal-200/70 lg:pr-4">
            <Link
              href={`/${item1.category?.slug || 'news'}/${item1.id}`}
              className="block group space-y-2.5"
            >
              <h4 className="text-base sm:text-lg font-black text-gray-900 group-hover:text-red-650 transition leading-snug">
                {item1.title}
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed font-normal">
                {getExcerpt(item1.content)}
              </p>
            </Link>
            <div className="text-[11px] text-gray-500 font-bold pt-2">
              {getTimeAgo(item1.publishedAt)}
            </div>
          </div>

          {/* Column 2 (Center Main Photo Lead - 3 cols on LG) */}
          <div className="lg:col-span-3 flex flex-col justify-center lg:border-r border-teal-200/70 lg:pr-4">
            <Link
              href={`/${item2.category?.slug || 'news'}/${item2.id}`}
              className="block aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 shadow-sm group"
            >
              {item2.featuredImage ? (
                <img
                  src={item2.featuredImage}
                  alt={item2.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                  খুলনা গেজেট
                </div>
              )}
            </Link>
          </div>

          {/* Column 3 (Middle Right - 2 Stacked Cards - 3 cols on LG) */}
          <div className="lg:col-span-3 space-y-3 flex flex-col justify-between lg:border-r border-teal-200/70 lg:pr-4">
            {/* Card 3 */}
            <Link
              href={`/${item3.category?.slug || 'news'}/${item3.id}`}
              className="flex gap-3 group items-start border-b border-teal-200/50 pb-2.5"
            >
              <div className="flex-1 space-y-1">
                <h5 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-red-650 transition leading-snug line-clamp-3">
                  {item3.title}
                </h5>
                <span className="text-[10px] text-gray-500 font-medium block">
                  {getTimeAgo(item3.publishedAt)}
                </span>
              </div>
              {item3.featuredImage && (
                <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                  <img
                    src={item3.featuredImage}
                    alt={item3.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}
            </Link>

            {/* Card 4 */}
            <Link
              href={`/${item4.category?.slug || 'news'}/${item4.id}`}
              className="flex gap-3 group items-start"
            >
              <div className="flex-1 space-y-1">
                <h5 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-red-650 transition leading-snug line-clamp-3">
                  {item4.title}
                </h5>
                <span className="text-[10px] text-gray-500 font-medium block">
                  {getTimeAgo(item4.publishedAt)}
                </span>
              </div>
              {item4.featuredImage && (
                <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                  <img
                    src={item4.featuredImage}
                    alt={item4.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}
            </Link>
          </div>

          {/* Column 4 (Far Right - 2 Stacked Cards with Red Badges - 3 cols on LG) */}
          <div className="lg:col-span-3 space-y-3 flex flex-col justify-between">
            {/* Card 5 */}
            <Link
              href={`/${item5.category?.slug || 'news'}/${item5.id}`}
              className="flex gap-3 group items-start border-b border-teal-200/50 pb-2.5"
            >
              <div className="flex-1 space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span>সরাসরি</span>
                  <span className="text-gray-400">• {item5.category?.name}</span>
                </span>
                <h5 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-red-650 transition leading-snug line-clamp-2">
                  {item5.title}
                </h5>
              </div>
              {item5.featuredImage && (
                <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                  <img
                    src={item5.featuredImage}
                    alt={item5.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}
            </Link>

            {/* Card 6 */}
            <Link
              href={`/${item6.category?.slug || 'news'}/${item6.id}`}
              className="flex gap-3 group items-start"
            >
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold text-red-600 block">
                  বিশেষ সংবাদ • {item6.category?.name}
                </span>
                <h5 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-red-650 transition leading-snug line-clamp-2">
                  {item6.title}
                </h5>
                <span className="text-[10px] text-gray-500 font-medium block">
                  {getTimeAgo(item6.publishedAt)}
                </span>
              </div>
              {item6.featuredImage && (
                <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                  <img
                    src={item6.featuredImage}
                    alt={item6.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
