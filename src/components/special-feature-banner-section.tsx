import Link from 'next/link';

interface SpecialFeatureItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  content?: string;
  publishedAt: string | Date | null;
  category: { name: string; slug: string };
  isBreaking?: boolean;
}

interface SpecialFeatureBannerSectionProps {
  title?: string;
  bannerSubtitle?: string;
  news: SpecialFeatureItem[];
}

export default function SpecialFeatureBannerSection({
  title = 'বিশেষ কভার স্টোরি',
  bannerSubtitle = 'বিস্তারিত দেখতে এখানে ক্লিক করুন',
  news,
}: SpecialFeatureBannerSectionProps) {
  if (!news || news.length < 5) return null;

  const item1 = news[0]; // Left text lead
  const item2 = news[1]; // Center photo lead
  const item3 = news[2]; // Mid right top
  const item4 = news[3]; // Mid right bottom
  const item5 = news[4]; // Far right top
  const item6 = news[5] || news[0]; // Far right bottom

  const getExcerpt = (html?: string) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 110 ? text.slice(0, 110) + '...' : text;
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
    <section className="my-8 rounded-2xl overflow-hidden shadow-md border border-teal-200/70 bg-[#d8ecec]/90">
      {/* 1. Colorful Top Banner Bar */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-600 to-sky-700 p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-ping shrink-0" />
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow">
              {title}
            </h3>
            <p className="text-xs text-cyan-100 font-medium">
              {bannerSubtitle}
            </p>
          </div>
        </div>

        <Link
          href={`/${item1.category?.slug || 'news'}`}
          className="relative z-10 inline-flex items-center gap-2 bg-white text-teal-800 hover:bg-slate-100 font-extrabold text-xs px-5 py-2 rounded-full shadow transition shrink-0"
        >
          <span>বিস্তারিত দেখুন</span>
          <span>↗</span>
        </Link>
      </div>

      {/* 2. Light Teal/Mint Content Container (4 Columns Layout matching screenshot) */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Column 1 (Left Text Lead - 3 cols on LG) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-3 lg:border-r border-teal-200/70 lg:pr-5">
            <Link
              href={`/${item1.category?.slug || 'news'}/${item1.slug}-${item1.id}`}
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
          <div className="lg:col-span-3 flex flex-col justify-center lg:border-r border-teal-200/70 lg:pr-5">
            <Link
              href={`/${item2.category?.slug || 'news'}/${item2.slug}-${item2.id}`}
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
          <div className="lg:col-span-3 space-y-4 flex flex-col justify-between lg:border-r border-teal-200/70 lg:pr-5">
            {/* Card 3 */}
            <Link
              href={`/${item3.category?.slug || 'news'}/${item3.slug}-${item3.id}`}
              className="flex gap-3 group items-start border-b border-teal-200/50 pb-3"
            >
              <div className="flex-1 space-y-1.5">
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
              href={`/${item4.category?.slug || 'news'}/${item4.slug}-${item4.id}`}
              className="flex gap-3 group items-start"
            >
              <div className="flex-1 space-y-1.5">
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
          <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
            {/* Card 5 */}
            <Link
              href={`/${item5.category?.slug || 'news'}/${item5.slug}-${item5.id}`}
              className="flex gap-3 group items-start border-b border-teal-200/50 pb-3"
            >
              <div className="flex-1 space-y-1.5">
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
              href={`/${item6.category?.slug || 'news'}/${item6.slug}-${item6.id}`}
              className="flex gap-3 group items-start"
            >
              <div className="flex-1 space-y-1.5">
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
      </div>
    </section>
  );
}
