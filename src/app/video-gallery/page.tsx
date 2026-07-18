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
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 border-l-4 border-red-600 pl-2.5">
            ভিডিও গ্যালারি
          </h2>
          <p className="text-xs text-gray-500 mt-1">খুলনা গেজেট ভিডিও গ্যালারি — ভিডিও রিপোর্ট ও অন্যান্য বিশেষ সংবাদচিত্র</p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200 shadow-sm">
            গ্যালারিতে কোনো ভিডিও পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => {
              const embedUrl = getYoutubeEmbedUrl(vid.youtubeUrl);
              return (
                <div key={vid.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between group">
                  <div className="aspect-video w-full bg-black relative">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={vid.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">ত্রুটিপূর্ণ ভিডিও লিংক</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-800 leading-snug">
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
