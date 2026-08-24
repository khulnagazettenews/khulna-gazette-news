import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import { Video, Play } from 'lucide-react';

export const revalidate = 60; // 60s (ISR)

const FALLBACK_VIDEOS = [
  {
    id: 'kg-v1',
    title: 'খুলনার সার্বিক উন্নয়ন ও উপকূলীয় অঞ্চলের বিশেষ সংবাদচিত্র — খুলনা গেজেট',
    youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
  },
  {
    id: 'kg-v2',
    title: 'খুলনা গেজেট ভিডিও বুলেটিন: রূপসা নদী ও খুলনা শহরের আজকের খবর',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'kg-v3',
    title: 'সুন্দরবন সংরক্ষণ ও পরিবেশগত বিশেষ অনুসন্ধানী প্রতিবেদন',
    youtubeUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
  },
  {
    id: 'kg-v4',
    title: 'দক্ষিণাঞ্চলের কৃষি, মৎস্য ও ব্যবসা বাণিজ্যের তাজা খবর',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
  },
  {
    id: 'kg-v5',
    title: 'খুলনা শহরের ইতিহাস ও রূপসা নদীর তীরবর্তী বিশেষ ভিডিওচিত্র',
    youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
  },
  {
    id: 'kg-v6',
    title: 'উপকূলীয় অঞ্চলে ঝড়-বৃষ্টি প্রতিরোধ ব্যবস্থা ও স্থানান্তরের খবর',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
  },
];

export default async function PublicVideoGallery() {
  let dbVideos: any[] = [];
  try {
    dbVideos = await prisma.galleryVideo.findMany({
      orderBy: { order: 'asc' },
    });
  } catch (err) {
    console.error('Error fetching gallery videos:', err);
  }

  const videos = dbVideos && dbVideos.length > 0 ? dbVideos : FALLBACK_VIDEOS;

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return 'https://www.youtube.com/embed/M7lc1UVf-VE';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : 'M7lc1UVf-VE';
    return `https://www.youtube.com/embed/${id}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-[#000000]">
      <PublicHeader />

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b-2 border-[#FF0000] pb-2 mb-6 gap-3">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[#000000] flex items-center gap-2">
              <Video size={26} className="text-[#e60023]" />
              <span>ভিডিও গ্যালারি</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              খুলনা গেজেট ভিডিও গ্যালারি — ভিডিও রিপোর্ট ও অন্যান্য বিশেষ সংবাদচিত্র
            </p>
          </div>

          <a
            href="https://www.youtube.com/@khulnagazette"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#e60023] hover:bg-red-700 text-white font-black text-sm sm:text-base px-4 py-2 rounded transition shadow-xs antialiased"
          >
            <svg className="w-4.5 h-4.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="font-black text-sm sm:text-base tracking-normal">ইউটিউব চ্যানেল সাবস্ক্রাইব করুন</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => {
            const embedUrl = getYoutubeEmbedUrl(vid.youtubeUrl);
            return (
              <div key={vid.id} className="bg-white rounded overflow-hidden flex flex-col justify-between group space-y-2 border border-gray-200/80 p-2.5 shadow-xs hover:shadow-md transition duration-300">
                <div className="aspect-video w-full bg-black relative rounded overflow-hidden border border-gray-100">
                  <iframe
                    src={embedUrl}
                    title={vid.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
                <div className="pt-1">
                  <h3 className="text-[17px] sm:text-[19px] font-bold text-[#000000] leading-snug line-clamp-2 hover:text-[#e60023] transition-colors">
                    {vid.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
