import Link from 'next/link';
import { Calendar } from 'lucide-react';

interface SpecialNewsItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  content?: string;
  category: { name: string; slug: string };
  subCategory?: { name: string; slug: string } | null;
  publishedAt?: string | Date | null;
}

interface SpecialTopicSectionProps {
  title?: string;
  bannerSubtitle?: string;
  news: SpecialNewsItem[];
}

export default function SpecialTopicSection({
  title = 'বিশেষ প্রতিবেদন ও আন্তর্জাতিক সংবাদ',
  bannerSubtitle = 'বিস্তারিত দেখতে কভার খবরের যেকোনো একটিতে ক্লিক করুন',
  news,
}: SpecialTopicSectionProps) {
  if (!news || news.length === 0) return null;

  // 5 news items layout according to reference design
  const itemCenter = news[0]; // Center main lead
  const itemLeft1 = news[1] || news[0]; // Left top card
  const itemLeft2 = news[2] || news[0]; // Left bottom card
  const itemRight1 = news[3] || news[1]; // Right top card
  const itemRight2 = news[4] || news[2]; // Right bottom card

  const getExcerpt = (html?: string) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 130 ? text.slice(0, 130) + '...' : text;
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
    <div className="mt-1 mb-6 shadow-md rounded-3xl overflow-hidden border border-teal-200/70 bg-[#eaf3f3]">
      {/* ================= CAMPAIGN BANNER HEADER ================= */}
      <div className="relative w-full bg-[#006070] text-white px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="hidden sm:block w-28 shrink-0" />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <div className="w-9 h-9 rounded-full bg-white text-[#006070] flex items-center justify-center font-black text-base shadow-xs shrink-0 select-none">
            ★
          </div>
          <div>
            <h4 className="text-lg sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
              {title}
            </h4>
            <p className="text-xs text-teal-100 font-medium mt-0.5">
              {bannerSubtitle}
            </p>
          </div>
        </div>

        <Link
          href={`/${itemCenter.category?.slug || 'news'}`}
          className="inline-flex items-center gap-1.5 bg-white text-[#006070] hover:bg-slate-100 font-extrabold text-xs px-4 py-2 rounded-full shadow-xs transition shrink-0"
        >
          <span>বিস্তারিত দেখুন</span>
          <span>↗</span>
        </Link>
      </div>

      {/* ================= 3-COLUMN WHITE CARDS GRID ================= */}
      <section className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* 1. LEFT COLUMN (3 Cols on LG): 2 Stacked White Cards */}
          <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
            {/* Top Left Card */}
            <div className="bg-white rounded-2xl p-4 border border-teal-100/80 shadow-xs space-y-3 flex flex-col justify-between h-full group hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>{itemLeft1.category?.name || 'আন্তর্জাতিক সংবাদ'}</span>
                </div>

                {itemLeft1.featuredImage && (
                  <Link
                    href={`/${itemLeft1.category?.slug || 'news'}/${itemLeft1.id}`}
                    className="block aspect-[16/10] overflow-hidden rounded-xl bg-slate-100"
                  >
                    <img
                      src={itemLeft1.featuredImage}
                      alt={itemLeft1.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                )}

                <Link href={`/${itemLeft1.category?.slug || 'news'}/${itemLeft1.id}`}>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-[#006070] transition leading-snug line-clamp-2">
                    {itemLeft1.title}
                  </h4>
                </Link>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100">
                <Calendar size={12} className="text-gray-400" />
                <span>{getTimeAgo(itemLeft1.publishedAt)}</span>
              </div>
            </div>

            {/* Bottom Left Card */}
            <div className="bg-white rounded-2xl p-4 border border-teal-100/80 shadow-xs space-y-3 flex flex-col justify-between h-full group hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>{itemLeft2.category?.name || 'বিশেষ সংবাদ'}</span>
                </div>

                {itemLeft2.featuredImage && (
                  <Link
                    href={`/${itemLeft2.category?.slug || 'news'}/${itemLeft2.id}`}
                    className="block aspect-[16/10] overflow-hidden rounded-xl bg-slate-100"
                  >
                    <img
                      src={itemLeft2.featuredImage}
                      alt={itemLeft2.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                )}

                <Link href={`/${itemLeft2.category?.slug || 'news'}/${itemLeft2.id}`}>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-[#006070] transition leading-snug line-clamp-2">
                    {itemLeft2.title}
                  </h4>
                </Link>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100">
                <Calendar size={12} className="text-gray-400" />
                <span>{getTimeAgo(itemLeft2.publishedAt)}</span>
              </div>
            </div>
          </div>

          {/* 2. CENTER COLUMN (6 Cols on LG): Large Featured White Card Container */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-5 border border-teal-100/80 shadow-xs flex flex-col justify-between group hover:shadow-md transition space-y-4">
            <div>
              {/* Big Featured Image on Top */}
              <Link
                href={`/${itemCenter.category?.slug || 'news'}/${itemCenter.id}`}
                className="block aspect-[16/10] sm:aspect-[16/9.5] overflow-hidden rounded-xl bg-slate-100 mb-4"
              >
                {itemCenter.featuredImage ? (
                  <img
                    src={itemCenter.featuredImage}
                    alt={itemCenter.title}
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                    খুলনা গেজেট
                  </div>
                )}
              </Link>

              {/* Category Pill Badge */}
              <div className="mb-2.5">
                <span className="bg-[#006070] text-white text-[11px] font-extrabold px-3 py-1 rounded-full inline-block">
                  {itemCenter.category?.name || 'বিশেষ প্রতিবেদন'}
                </span>
              </div>

              {/* Title & Excerpt below Image */}
              <Link href={`/${itemCenter.category?.slug || 'news'}/${itemCenter.id}`} className="block space-y-2">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 group-hover:text-[#006070] transition leading-tight">
                  {itemCenter.title}
                </h3>
                {itemCenter.content && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {getExcerpt(itemCenter.content)}
                  </p>
                )}
              </Link>
            </div>

            {/* Footer Date Line */}
            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium pt-3 border-t border-gray-100">
              <Calendar size={13} className="text-gray-400" />
              <span>{getTimeAgo(itemCenter.publishedAt)}</span>
            </div>
          </div>

          {/* 3. RIGHT COLUMN (3 Cols on LG): 2 Stacked White Cards */}
          <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
            {/* Top Right Card */}
            <div className="bg-white rounded-2xl p-4 border border-teal-100/80 shadow-xs space-y-3 flex flex-col justify-between h-full group hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>{itemRight1.category?.name || 'সর্বশেষ'}</span>
                </div>

                {itemRight1.featuredImage && (
                  <Link
                    href={`/${itemRight1.category?.slug || 'news'}/${itemRight1.id}`}
                    className="block aspect-[16/10] overflow-hidden rounded-xl bg-slate-100"
                  >
                    <img
                      src={itemRight1.featuredImage}
                      alt={itemRight1.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                )}

                <Link href={`/${itemRight1.category?.slug || 'news'}/${itemRight1.id}`}>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-[#006070] transition leading-snug line-clamp-2">
                    {itemRight1.title}
                  </h4>
                </Link>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100">
                <Calendar size={12} className="text-gray-400" />
                <span>{getTimeAgo(itemRight1.publishedAt)}</span>
              </div>
            </div>

            {/* Bottom Right Card */}
            <div className="bg-white rounded-2xl p-4 border border-teal-100/80 shadow-xs space-y-3 flex flex-col justify-between h-full group hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>
                    {itemRight2.category?.name}
                    {itemRight2.subCategory && ` • ${itemRight2.subCategory.name}`}
                  </span>
                </div>

                {itemRight2.featuredImage && (
                  <Link
                    href={`/${itemRight2.category?.slug || 'news'}/${itemRight2.id}`}
                    className="block aspect-[16/10] overflow-hidden rounded-xl bg-slate-100"
                  >
                    <img
                      src={itemRight2.featuredImage}
                      alt={itemRight2.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                )}

                <Link href={`/${itemRight2.category?.slug || 'news'}/${itemRight2.id}`}>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-[#006070] transition leading-snug line-clamp-2">
                    {itemRight2.title}
                  </h4>
                </Link>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100">
                <Calendar size={12} className="text-gray-400" />
                <span>{getTimeAgo(itemRight2.publishedAt)}</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
