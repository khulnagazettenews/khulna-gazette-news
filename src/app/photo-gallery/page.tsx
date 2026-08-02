import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import PhotoGrid from '@/components/photo-grid';

export const revalidate = 60; // 60 seconds (ISR)

export default async function PublicPhotoGallery() {
  const photos = await prisma.galleryPhoto.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <PublicHeader />

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="border-b-2 border-[#FF0000] pb-1.5 mb-6">
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#000000]">
            ফটো গ্যালারি
          </h1>
          <p className="text-xs text-gray-500 mt-1">খুলনা গেজেট ফটো গ্যালারি — বিভিন্ন ইভেন্ট ও সংবাদের ছবিসমূহ</p>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-base font-medium">
            গ্যালারিতে কোনো ছবি পাওয়া যায়নি।
          </div>
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
