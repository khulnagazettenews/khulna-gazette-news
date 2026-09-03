import Link from 'next/link';

interface BlockNewsItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  content: string;
  publishedAt: Date | string | null;
  reporterName?: string | null;
}

interface CategoryBlockProps {
  title: string;
  slug: string;
  news: BlockNewsItem[];
  variant?: 'standard' | 'sports' | 'entertainment' | 'compact';
}

export default function CategoryBlock({
  title,
  slug,
  news,
  variant = 'standard',
}: CategoryBlockProps) {
  if (!news || news.length === 0) return null;

  const lead = news[0];
  const secondary = news.slice(1, 5);

  const getExcerpt = (html: string) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 120 ? text.slice(0, 120) + '...' : text;
  };

  return (
    <div className="space-y-2.5">
      {/* Category Header: Top full red border line matching image */}
      <div className="border-t-2 border-[#e60023] pt-1.5 pb-1 w-full">
        <Link href={`/${slug}`} className="group inline-block">
          <h2
            style={{
              fontFamily: "'Bangla', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
              fontSize: '32px',
              fontWeight: 500,
              lineHeight: '38.4px',
              letterSpacing: '-0.2px',
              textAlign: 'left',
            }}
            className="text-[#000000] group-hover:text-[#e60023] transition duration-200 cursor-pointer"
          >
            {title}
          </h2>
        </Link>
      </div>

      {/* Block Content Container */}
      <div className="bg-white">
        {variant === 'sports' || variant === 'entertainment' ? (
          /* Sports & Entertainment Layout (Match lower half of reference image) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Side: 1 Big Lead Story (Image + Title + Excerpt) */}
            <div className="lg:col-span-7 space-y-2 group">
              {lead.featuredImage && (
                <Link
                  href={`/${slug}/${lead.id}`}
                  className="block aspect-[16/9] w-full overflow-hidden rounded bg-gray-100"
                >
                  <img
                    src={lead.featuredImage}
                    alt={lead.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                  />
                </Link>
              )}
              <Link href={`/${slug}/${lead.id}`} className="block pt-0.5">
                <h3
                  style={{
                    fontFamily: "'Bangla', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
                    fontSize: '21px',
                    fontWeight: 400,
                    lineHeight: '23.1px',
                    letterSpacing: '-0.2px',
                    textAlign: 'left',
                  }}
                  className="text-[#000000] group-hover:text-[#e60023] transition line-clamp-2 break-words"
                >
                  {lead.title}
                </h3>
              </Link>
              <p
                style={{
                  fontFamily: "'Bangla', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
                  fontSize: '21px',
                  fontWeight: 400,
                  lineHeight: '23.1px',
                  letterSpacing: '-0.2px',
                  textAlign: 'left',
                }}
                className="text-gray-600 line-clamp-3"
              >
                {getExcerpt(lead.content)}
              </p>
            </div>

            {/* Right Side: 2x2 Grid of 4 Cards (Image on Top + Title below) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              {secondary.map((item) => (
                <div key={item.id} className="group space-y-1.5">
                  {item.featuredImage && (
                    <Link
                      href={`/${slug}/${item.id}`}
                      className="block aspect-[16/9] w-full overflow-hidden rounded bg-gray-100"
                    >
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                      />
                    </Link>
                  )}
                  <Link href={`/${slug}/${item.id}`} className="block pt-0.5 min-w-0">
                    <h4
                      style={{
                        fontFamily: "'Bangla', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
                        fontSize: '21px',
                        fontWeight: 400,
                        lineHeight: '23.1px',
                        letterSpacing: '-0.2px',
                        textAlign: 'left',
                      }}
                      className="text-[#000000] group-hover:text-[#e60023] transition line-clamp-2 break-words"
                    >
                      {item.title}
                    </h4>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard Layout: Bangladesh / Khulnanchal (Match top half of reference image) */
          <div className="space-y-3">
            {/* Top Main Lead Story (Image on Top + Bold Headline below) */}
            <div className="group space-y-2">
              {lead.featuredImage && (
                <Link
                  href={`/${slug}/${lead.id}`}
                  className="block aspect-[546/307] w-full overflow-hidden rounded bg-gray-100"
                >
                  <img
                    src={lead.featuredImage}
                    alt={lead.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                  />
                </Link>
              )}
              <Link href={`/${slug}/${lead.id}`} className="block pt-0.5">
                <h3
                  style={{
                    fontFamily: "'Bangla', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
                    fontSize: '21px',
                    fontWeight: 400,
                    lineHeight: '23.1px',
                    letterSpacing: '-0.2px',
                    textAlign: 'left',
                  }}
                  className="text-[#000000] group-hover:text-[#e60023] transition line-clamp-2 break-words"
                >
                  {lead.title}
                </h3>
              </Link>
            </div>

            {/* 4 List Items below (Left Thumbnail 120x62 + Right Title) */}
            <div className="space-y-2 pt-1">
              {secondary.map((item) => (
                <Link
                  key={item.id}
                  href={`/${slug}/${item.id}`}
                  className="flex gap-3 group items-center py-1 border-b border-gray-100 last:border-b-0"
                >
                  {item.featuredImage && (
                    <div className="w-[120px] h-[62px] rounded overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
                      />
                    </div>
                  )}
                  <h4
                    style={{
                      fontFamily: "'Bangla', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
                      fontSize: '21px',
                      fontWeight: 400,
                      lineHeight: '23.1px',
                      letterSpacing: '-0.2px',
                      textAlign: 'left',
                    }}
                    className="text-[#000000] group-hover:text-[#e60023] transition line-clamp-2 flex-1 break-words"
                  >
                    {item.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
