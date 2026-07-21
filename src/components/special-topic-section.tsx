import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

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

  // 5 news items mapping without duplicates
  const itemCenter = news[0]; // Center main lead
  const itemLeft1 = news[1];  // Left top card
  const itemLeft2 = news[2];  // Left bottom card
  const itemRight1 = news[3]; // Right top card
  const itemRight2 = news[4]; // Right bottom card

  const hasLeft = Boolean(itemLeft1 || itemLeft2);
  const hasRight = Boolean(itemRight1 || itemRight2);

  let centerSpan = "lg:col-span-12";
  if (hasLeft && hasRight) {
    centerSpan = "lg:col-span-6";
  } else if (hasLeft || hasRight) {
    centerSpan = "lg:col-span-9";
  }

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
    return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="mt-1 mb-6 shadow-md rounded-3xl overflow-hidden border border-teal-200/70 bg-[#eef5f5]">
      {/* ================= CAMPAIGN BANNER HEADER ================= */}
      <div className="relative w-full bg-[#006070] text-white px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="hidden sm:block w-32 shrink-0" />

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
          href={`/${itemCenter?.category?.slug || 'news'}`}
          className="inline-flex items-center gap-1.5 bg-white text-[#006070] hover:bg-slate-100 font-extrabold text-xs px-4 py-2 rounded-full shadow-xs transition shrink-0"
        >
          <span>বিস্তারিত দেখুন</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ================= DYNAMIC CARDS GRID ================= */}
      <section className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* 1. LEFT COLUMN (3 Cols on LG): Render only if itemLeft1 or itemLeft2 exists */}
          {hasLeft && (
            <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
              {/* Top Left Card */}
              {itemLeft1 && (
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3 flex flex-col justify-between h-full group hover:shadow-md transition">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                      <span>{itemLeft1.category?.name || 'বিশেষ সংবাদ'}</span>
                    </div>

                    <Link href={`/${itemLeft1.category?.slug || 'news'}/${itemLeft1.id}`}>
                      <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-[#006070] transition leading-snug line-clamp-2">
                        {itemLeft1.title}
                      </h4>
                    </Link>

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
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100">
                    <Calendar size={12} className="text-gray-400" />
                    <span>{getTimeAgo(itemLeft1.publishedAt)}</span>
                  </div>
                </div>
              )}

              {/* Bottom Left Card */}
              {itemLeft2 && (
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3 flex flex-col justify-between h-full group hover:shadow-md transition">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                      <span>{itemLeft2.category?.name || 'বিশেষ সংবাদ'}</span>
                    </div>

                    <Link href={`/${itemLeft2.category?.slug || 'news'}/${itemLeft2.id}`}>
                      <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-[#006070] transition leading-snug line-clamp-2">
                        {itemLeft2.title}
                      </h4>
                    </Link>

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
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100">
                    <Calendar size={12} className="text-gray-400" />
                    <span>{getTimeAgo(itemLeft2.publishedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. CENTER COLUMN: Main Lead Featured White Card */}
          {itemCenter && (
            <div className={`${centerSpan} bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between group hover:shadow-md transition space-y-4`}>
              <div>
                <div className="text-center mb-3">
                  <span className="bg-[#006070] text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full inline-block">
                    {itemCenter.category?.name || 'বিশেষ প্রতিবেদন'}
                  </span>
                </div>

                <Link href={`/${itemCenter.category?.slug || 'news'}/${itemCenter.id}`} className="block text-center mb-3.5">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 group-hover:text-[#006070] transition leading-snug">
                    {itemCenter.title}
                  </h3>
                </Link>

                <Link
                  href={`/${itemCenter.category?.slug || 'news'}/${itemCenter.id}`}
                  className="block aspect-[16/10] sm:aspect-[16/9.5] overflow-hidden rounded-2xl bg-slate-100 mb-4"
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

                {itemCenter.content && (
                  <Link href={`/${itemCenter.category?.slug || 'news'}/${itemCenter.id}`} className="block">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {getExcerpt(itemCenter.content)}
                    </p>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500 font-medium pt-3 border-t border-gray-100">
                <Calendar size={13} className="text-gray-400" />
                <span>{getTimeAgo(itemCenter.publishedAt)}</span>
              </div>
            </div>
          )}

          {/* 3. RIGHT COLUMN: Render only if itemRight1 or itemRight2 exists */}
          {hasRight && (
            <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
              {/* Top Right Card */}
              {itemRight1 && (
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3 flex flex-col justify-between h-full group hover:shadow-md transition">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                      <span>{itemRight1.category?.name || 'সর্বশেষ'}</span>
                    </div>

                    <Link href={`/${itemRight1.category?.slug || 'news'}/${itemRight1.id}`}>
                      <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-[#006070] transition leading-snug line-clamp-2">
                        {itemRight1.title}
                      </h4>
                    </Link>

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
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100">
                    <Calendar size={12} className="text-gray-400" />
                    <span>{getTimeAgo(itemRight1.publishedAt)}</span>
                  </div>
                </div>
              )}

              {/* Bottom Right Card */}
              {itemRight2 && (
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3 flex flex-col justify-between h-full group hover:shadow-md transition">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                      <span>
                        {itemRight2.category?.name}
                        {itemRight2.subCategory && ` - ${itemRight2.subCategory.name}`}
                      </span>
                    </div>

                    <Link href={`/${itemRight2.category?.slug || 'news'}/${itemRight2.id}`}>
                      <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-[#006070] transition leading-snug line-clamp-2">
                        {itemRight2.title}
                      </h4>
                    </Link>

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
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100">
                    <Calendar size={12} className="text-gray-400" />
                    <span>{getTimeAgo(itemRight2.publishedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
