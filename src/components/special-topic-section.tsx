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
  title = 'বিশ্বের প্রতিদিন ও আন্তর্জাতিক সংবাদ',
  bannerSubtitle = 'বিশ্বজুড়ে ঘটে যাওয়া গুরুত্বপূর্ণ ও নিরপেক্ষ সংবাদ, আপনার জন্য প্রতিদিন',
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
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > 500 ? text.slice(0, 500) + '...' : text;
  };

  const getTimeAgo = (dateVal?: string | Date | null) => {
    if (!dateVal) return '২৪ আগস্ট, ২০২৬';
    const date = new Date(dateVal);
    return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div
      style={{ fontFamily: 'Bangla, sans-serif' }}
      className="mt-1 mb-5 rounded-2xl overflow-hidden bg-[#f3f7f6] p-2 sm:p-3 border border-gray-200/80 shadow-xs"
    >
      {/* ================= CAMPAIGN BANNER HEADER ================= */}
      <div className="relative w-full bg-[#02474d] text-white px-4 sm:px-5 py-2.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="w-8 h-8 rounded-full bg-white text-[#02474d] flex items-center justify-center font-black text-sm shadow-xs shrink-0 select-none">
            ★
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-2xs">
              {title}
            </h4>
            {bannerSubtitle && (
              <p className="text-[11px] text-teal-100/90 font-medium mt-0.5">
                {bannerSubtitle}
              </p>
            )}
          </div>
        </div>

        {itemCenter && (
          <Link
            href={`/${itemCenter.category?.slug || 'news'}/${itemCenter.id}`}
            className="inline-flex items-center gap-1.5 bg-white text-[#02474d] hover:bg-slate-100 font-extrabold text-xs px-3.5 py-1 rounded-full shadow-2xs transition duration-200 shrink-0 group"
          >
            <span>বিস্তারিত দেখুন</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition duration-200" />
          </Link>
        )}
      </div>

      {/* ================= DYNAMIC CARDS GRID ================= */}
      <section className="pt-1.5 sm:pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
          
          {/* 1. LEFT COLUMN (3 Cols on LG) */}
          {hasLeft && (
            <div className="lg:col-span-3 space-y-1.5 flex flex-col justify-between">
              {/* Top Left Card */}
              {itemLeft1 && (
                <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-gray-200/60 shadow-2xs flex flex-col justify-between h-full group hover:shadow-md transition duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block shrink-0" />
                      <span>{itemLeft1.category?.name || 'স্থানীয় সংবাদ'}</span>
                    </div>

                    <Link href={`/${itemLeft1.category?.slug || 'news'}/${itemLeft1.id}`}>
                      <h4
                        style={{
                          fontFamily: 'Bangla, sans-serif',
                          fontSize: '22px',
                          fontWeight: 700,
                          lineHeight: '26.4px',
                          letterSpacing: '-0.2px',
                          textAlign: 'start',
                        }}
                        className="text-gray-900 group-hover:text-[#02474d] transition duration-200"
                      >
                        {itemLeft1.title}
                      </h4>
                    </Link>

                    {itemLeft1.featuredImage && (
                      <Link
                        href={`/${itemLeft1.category?.slug || 'news'}/${itemLeft1.id}`}
                        className="block aspect-[24/9] max-h-20 w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-100"
                      >
                        <img
                          src={itemLeft1.featuredImage}
                          alt={itemLeft1.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-semibold pt-1 mt-0.5 border-t border-gray-100/80">
                    <Calendar size={14} className="text-gray-400 shrink-0" />
                    <span>{getTimeAgo(itemLeft1.publishedAt)}</span>
                  </div>
                </div>
              )}

              {/* Bottom Left Card */}
              {itemLeft2 && (
                <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-gray-200/60 shadow-2xs flex flex-col justify-between h-full group hover:shadow-md transition duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block shrink-0" />
                      <span>{itemLeft2.category?.name || 'স্থানীয় সংবাদ'}</span>
                    </div>

                    <Link href={`/${itemLeft2.category?.slug || 'news'}/${itemLeft2.id}`}>
                      <h4
                        style={{
                          fontFamily: 'Bangla, sans-serif',
                          fontSize: '22px',
                          fontWeight: 700,
                          lineHeight: '26.4px',
                          letterSpacing: '-0.2px',
                          textAlign: 'start',
                        }}
                        className="text-gray-900 group-hover:text-[#02474d] transition duration-200"
                      >
                        {itemLeft2.title}
                      </h4>
                    </Link>

                    {itemLeft2.featuredImage && (
                      <Link
                        href={`/${itemLeft2.category?.slug || 'news'}/${itemLeft2.id}`}
                        className="block aspect-[24/9] max-h-20 w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-100"
                      >
                        <img
                          src={itemLeft2.featuredImage}
                          alt={itemLeft2.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-semibold pt-1 mt-0.5 border-t border-gray-100/80">
                    <Calendar size={14} className="text-gray-400 shrink-0" />
                    <span>{getTimeAgo(itemLeft2.publishedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. CENTER COLUMN: Main Featured Card */}
          {itemCenter && (
            <div className={`${centerSpan} bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200/60 shadow-2xs flex flex-col justify-start items-center text-center group hover:shadow-md transition duration-200`}>
              <div className="space-y-1.5 w-full flex flex-col items-center">
                <div>
                  <span className="bg-[#02474d] text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full inline-block">
                    {itemCenter.category?.name || 'প্রধান খবর'}
                  </span>
                </div>

                <Link href={`/${itemCenter.category?.slug || 'news'}/${itemCenter.id}`} className="block w-full text-center">
                  <h3
                    style={{
                      fontFamily: 'Bangla, sans-serif',
                      fontSize: '22px',
                      fontWeight: 700,
                      lineHeight: '26.4px',
                      letterSpacing: '-0.2px',
                      textAlign: 'center',
                    }}
                    className="text-gray-900 group-hover:text-[#02474d] transition duration-200"
                  >
                    {itemCenter.title}
                  </h3>
                </Link>

                <Link
                  href={`/${itemCenter.category?.slug || 'news'}/${itemCenter.id}`}
                  className="block aspect-[16/9] max-h-44 sm:max-h-48 w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-100"
                >
                  {itemCenter.featuredImage ? (
                    <img
                      src={itemCenter.featuredImage}
                      alt={itemCenter.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                      খুলনা গেজেট
                    </div>
                  )}
                </Link>

                {/* Excerpt Paragraph Text under Image */}
                {itemCenter.content && (
                  <Link href={`/${itemCenter.category?.slug || 'news'}/${itemCenter.id}`} className="block pt-0.5 w-full">
                    <p
                      style={{
                        fontFamily: 'Bangla, sans-serif',
                        fontSize: '21px',
                        fontWeight: 400,
                        lineHeight: '24px',
                        letterSpacing: '-0.2px',
                        textAlign: 'center',
                      }}
                      className="text-gray-600 line-clamp-5"
                    >
                      {getExcerpt(itemCenter.content)}
                    </p>
                  </Link>
                )}

                <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-gray-600 font-semibold pt-1 mt-1 border-t border-gray-100/80 w-full shrink-0">
                  <Calendar size={14} className="text-gray-400 shrink-0" />
                  <span>{getTimeAgo(itemCenter.publishedAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. RIGHT COLUMN (3 Cols on LG) */}
          {hasRight && (
            <div className="lg:col-span-3 space-y-1.5 flex flex-col justify-between">
              {/* Top Right Card */}
              {itemRight1 && (
                <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-gray-200/60 shadow-2xs flex flex-col justify-between h-full group hover:shadow-md transition duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block shrink-0" />
                      <span>{itemRight1.category?.name || 'স্থানীয় সংবাদ'}</span>
                    </div>

                    <Link href={`/${itemRight1.category?.slug || 'news'}/${itemRight1.id}`}>
                      <h4
                        style={{
                          fontFamily: 'Bangla, sans-serif',
                          fontSize: '22px',
                          fontWeight: 700,
                          lineHeight: '26.4px',
                          letterSpacing: '-0.2px',
                          textAlign: 'start',
                        }}
                        className="text-gray-900 group-hover:text-[#02474d] transition duration-200"
                      >
                        {itemRight1.title}
                      </h4>
                    </Link>

                    {itemRight1.featuredImage && (
                      <Link
                        href={`/${itemRight1.category?.slug || 'news'}/${itemRight1.id}`}
                        className="block aspect-[24/9] max-h-20 w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-100"
                      >
                        <img
                          src={itemRight1.featuredImage}
                          alt={itemRight1.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-semibold pt-1 mt-0.5 border-t border-gray-100/80">
                    <Calendar size={14} className="text-gray-400 shrink-0" />
                    <span>{getTimeAgo(itemRight1.publishedAt)}</span>
                  </div>
                </div>
              )}

              {/* Bottom Right Card */}
              {itemRight2 && (
                <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-gray-200/60 shadow-2xs flex flex-col justify-between h-full group hover:shadow-md transition duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block shrink-0" />
                      <span>
                        {itemRight2.category?.name || 'বাংলাদেশ'}
                        {itemRight2.subCategory && ` - ${itemRight2.subCategory.name}`}
                      </span>
                    </div>

                    <Link href={`/${itemRight2.category?.slug || 'news'}/${itemRight2.id}`}>
                      <h4
                        style={{
                          fontFamily: 'Bangla, sans-serif',
                          fontSize: '22px',
                          fontWeight: 700,
                          lineHeight: '26.4px',
                          letterSpacing: '-0.2px',
                          textAlign: 'start',
                        }}
                        className="text-gray-900 group-hover:text-[#02474d] transition duration-200"
                      >
                        {itemRight2.title}
                      </h4>
                    </Link>

                    {itemRight2.featuredImage && (
                      <Link
                        href={`/${itemRight2.category?.slug || 'news'}/${itemRight2.id}`}
                        className="block aspect-[24/9] max-h-20 w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-100"
                      >
                        <img
                          src={itemRight2.featuredImage}
                          alt={itemRight2.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-semibold pt-1 mt-0.5 border-t border-gray-100/80">
                    <Calendar size={14} className="text-gray-400 shrink-0" />
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
