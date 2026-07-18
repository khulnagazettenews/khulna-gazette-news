import Link from 'next/link';

interface HeroNewsItem {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  featuredImage?: string | null;
  content: string;
  publishedAt: Date | null;
  category: { name: string; slug: string };
  reporterName?: string | null;
}

interface HomeHeroProps {
  news: HeroNewsItem[];
}

export default function HomeHero({ news }: HomeHeroProps) {
  if (news.length === 0) return null;

  const lead = news[0];
  const secondary = news.slice(1, 4);

  // Extract a clean paragraph snippet for description preview
  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 150 ? text.slice(0, 150) + '...' : text;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lead Story - Spans 2 cols */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between group">
        <Link href={`/${lead.category?.slug || 'news'}/${lead.slug}-${lead.id}`} className="block overflow-hidden relative aspect-video">
          {lead.featuredImage ? (
            <img 
              src={lead.featuredImage} 
              alt={lead.title} 
              className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-gray-400">খুলনা গেজেট</div>
          )}
          <span className="absolute bottom-4 left-4 bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded shadow">
            {lead.category?.name}
          </span>
        </Link>

        <div className="p-6 space-y-3">
          <Link href={`/${lead.category?.slug || 'news'}/${lead.slug}-${lead.id}`} className="block">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 hover:text-red-650 transition leading-snug">
              {lead.title}
            </h2>
          </Link>
          {lead.subtitle && (
            <p className="text-sm font-semibold text-slate-500">{lead.subtitle}</p>
          )}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {getExcerpt(lead.content)}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium pt-2">
            <span>{lead.reporterName || 'স্টাফ রিপোর্টার'}</span>
            <span>•</span>
            <span>
              {lead.publishedAt && new Date(lead.publishedAt).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Stories Stack */}
      <div className="space-y-6">
        {secondary.map((story) => (
          <div 
            key={story.id} 
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 hover:shadow-md transition group"
          >
            <div className="flex-1 space-y-2">
              <span className="text-[9px] font-extrabold text-red-600 uppercase tracking-wider block">
                {story.category?.name}
              </span>
              <Link href={`/${story.category?.slug || 'news'}/${story.slug}-${story.id}`} className="block">
                <h3 className="text-xs sm:text-sm font-black text-gray-900 hover:text-red-650 transition leading-snug line-clamp-3">
                  {story.title}
                </h3>
              </Link>
              <span className="text-[9px] text-gray-400 block font-medium">
                {story.publishedAt && new Date(story.publishedAt).toLocaleDateString('bn-BD', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            {story.featuredImage && (
              <Link 
                href={`/${story.category?.slug || 'news'}/${story.slug}-${story.id}`}
                className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-lg bg-gray-50 aspect-square"
              >
                <img 
                  src={story.featuredImage} 
                  alt={story.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
