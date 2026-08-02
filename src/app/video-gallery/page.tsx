import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';

export const revalidate = 60; // 60s (ISR)

export default async function PublicVideoGallery() {
  const videos = await prisma.galleryVideo.findMany({
    orderBy: { order: 'asc' },
  });

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}` : '';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <PublicHeader />

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="border-b-2 border-[#FF0000] pb-1.5 mb-6">
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#000000]">
            ভিডিও গ্যালারি
          </h1>
          <p className="text-xs text-gray-500 mt-1">খুলনা গেজেট ভিডিও গ্যালারি — ভিডিও রিপোর্ট ও অন্যান্য বিশেষ সংবাদচিত্র</p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-base font-medium">
            গ্যালারিতে কোনো ভিডিও পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => {
              const embedUrl = getYoutubeEmbedUrl(vid.youtubeUrl);
              return (
                <div key={vid.id} className="bg-white rounded overflow-hidden flex flex-col justify-between group space-y-2">
                  <div className="aspect-video w-full bg-black relative rounded overflow-hidden">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={vid.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">ত্রুটিপূর্ণ ভিডিও লিংক</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#000000] leading-snug">
                      {vid.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
