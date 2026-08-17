import Link from 'next/link';

interface HeroNewsItem {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  featuredImage?: string | null;
  content: string;
  publishedAt: Date | string | null;
  category: { name: string; slug: string } | any;
  reporterName?: string | null;
}

interface HomeHeroProps {
  news: HeroNewsItem[];
  latestNews?: any[];
  popularNews?: any[];
}

function getExcerpt(content: string) {
  if (!content) return '';
  let text = content.replace(/<[^>]+>/g, '').trim();

  // Strip requested sentences
  text = text.replace(/হাসিনাকে ফেরাতে দেশের ২২টি পাবলিক বিশ্ববিদ্যালয়ের ৪০৪ জন শিক্ষক একটি গোপন তৎপরতায় যুক্ত হয়েছেন।?\s*(উক্ত ঘটনার প্রেক্ষিতে খুলনা বিশ্ববিদ্যালয়ের কোনো)?/g, '').trim();
  text = text.replace(/কর্তৃপক্ষের অনুমোদনক্রমে এই তদন্ত কমিটি গঠন করা হলো।?\s*”?গঠিত কমিটিতে বিজ্ঞান, প্রকৌশল ও প্রযুক্তিবিদ্যা স্কুলের ডিন প্রফেসর ড\. মো\. আশরাফুল আলমকে সভাপতি এবং ছাত্র বিষয়ক পরিচালক অধ্যাপক ড\. মো\. সালাউদ্দীনকে সদস্য-সচিব করা হয়েছে।?\s*(এছাড়াও কমিটির অন্য)?/g, '').trim();
  text = text.replace(/কর্তৃপক্ষের অনুমোদনক্রমে এই তদন্ত কমিটি গঠন করা হলো।?/g, '').trim();

  // Deduplicate phrases
  text = text.replace(/বিভিন্ন গণমাধ্যম ও নানা সূত্রের খবরে জানা গেছে,?\s*বিভিন্ন গণমাধ্যম ও নানা সূত্রের খবরে জানা গেছে/g, 'বিভিন্ন গণমাধ্যম ও নানা সূত্রের খবরে জানা গেছে');

  if (/[\“\"\'\‘]?সম্প্রতি/.test(text)) {
    text = text.replace(/([\“\"\'\‘]?)সম্প্রতি/g, '$1সম্প্রতি বিভিন্ন গণমাধ্যম ও নানা সূত্রের খবরে জানা গেছে,');
  }
  return text.trim();
}

export default function HomeHero({ news }: HomeHeroProps) {
  if (!news || news.length === 0) return null;

  // Main Lead news takes news[0], remaining items go to 3-column grid below
  const mainLead = news[0];
  const gridNews = news.length > 1 ? news.slice(1, 13) : [];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. TOP HERO MAIN LEAD SECTION: Clean Frameless News Layout */}
      {mainLead && (
        <div className="bg-white py-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">
            {/* Left Side: Large Red Heading + Description + Bottom Link (order-1 on MD/LG, 5 cols - Equal Baseline) */}
            <div className="order-2 md:order-1 md:col-span-5 flex flex-col justify-between h-full space-y-3 py-0">
              <div className="space-y-2.5">
                <Link href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`} className="group block">
                  <h1 className="text-[24px] sm:text-[28px] lg:text-[31px] xl:text-[33px] font-bold text-[#e60023] group-hover:text-[#000000] hover:text-[#000000] transition leading-[1.28]">
                    {mainLead.title}
                  </h1>
                </Link>

                {mainLead.content && (
                  <p 
                    className="text-[#333333] text-[17px] sm:text-[19px]"
                    style={{
                      fontFamily: 'Bangla, sans-serif',
                      fontWeight: 400,
                      lineHeight: '1.6',
                      display: '-webkit-box',
                      WebkitLineClamp: 7,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {getExcerpt(mainLead.content)}
                  </p>
                )}
              </div>

              {/* Bottom read more button aligned on exact same baseline as image bottom */}
              <div className="pt-2 flex items-center justify-end shrink-0">
                <Link
                  href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`}
                  className="bg-gray-100 hover:bg-[#e60023] text-gray-800 hover:text-white border border-gray-200/80 shadow-2xs rounded-lg px-4 py-1.5 font-bold text-sm sm:text-base inline-flex items-center gap-1.5 transition duration-200 group"
                >
                  <span>বিস্তারিত</span>
                  <svg className="w-4 h-4 text-gray-700 group-hover:text-white stroke-[2.5] transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Side: Featured Image Column (order-2 on MD/LG, 7 cols - Aligned Top & Bottom Baseline) */}
            <div className="order-1 md:order-2 md:col-span-7 group flex flex-col justify-between h-full py-0">
              {mainLead.featuredImage ? (
                <Link
                  href={`/${mainLead.category?.slug || 'news'}/${mainLead.id}`}
                  className="block w-full h-full min-h-[250px] sm:min-h-[280px] lg:min-h-[310px] overflow-hidden rounded-none bg-gray-100 shadow-xs relative"
                >
                  <img
                    src={mainLead.featuredImage}
                    alt={mainLead.title}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition duration-500 ease-out rounded-none"
                  />
                  <div className="absolute inset-0 ring-1 ring-black/5 rounded-none pointer-events-none" />
                </Link>
              ) : (
                <div className="w-full h-full min-h-[250px] sm:min-h-[280px] lg:min-h-[310px] bg-gray-100 rounded-none flex items-center justify-center text-gray-400 font-bold text-base">
                  খুলনা গেজেট
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. GRID OF NEWS CARDS BELOW TOP HERO (1-col on mobile list, 3-cols on desktop grid) */}
      {gridNews.length > 0 && (
        <div className="pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-x-4 sm:gap-y-5">
            {gridNews.map((story, index) => {
              const categorySlug = story.category?.slug || 'news';
              const isFirstRow = index < 3;
              return (
                <div 
                  key={story.id} 
                  className={`group flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 border-b border-gray-100 sm:border-b-0 pb-3 sm:pb-0 last:border-b-0 ${!isFirstRow ? 'sm:border-t sm:border-gray-200/80 sm:pt-3.5' : ''}`}
                >
                  {story.featuredImage ? (
                    <Link
                      href={`/${categorySlug}/${story.id}`}
                      className="block w-28 aspect-[354/199] sm:w-full sm:h-auto sm:aspect-[354/199] shrink-0 overflow-hidden rounded bg-gray-100"
                    >
                      <img
                        src={story.featuredImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                      />
                    </Link>
                  ) : (
                    <div className="w-28 aspect-[354/199] sm:w-full sm:h-auto sm:aspect-[354/199] shrink-0 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-xs">
                      খুলনা গেজেট
                    </div>
                  )}
                  <Link href={`/${categorySlug}/${story.id}`} className="block pt-0.5 flex-1 min-w-0">
                    <h3 
                      className="text-[22px] font-bold text-[#000000] hover:text-[rgb(0,0,116)] transition leading-[26.4px] tracking-[-0.2px] line-clamp-2 break-words"
                      style={{
                        fontFamily: 'Bangla, sans-serif',
                        fontSize: '22px',
                        fontWeight: 700,
                        lineHeight: '26.4px',
                        letterSpacing: '-0.2px',
                      }}
                    >
                      {story.title}
                    </h3>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
