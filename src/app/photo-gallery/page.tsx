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
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 border-l-4 border-red-600 pl-2.5">
            ফটো গ্যালারি
          </h2>
          <p className="text-xs text-gray-500 mt-1">খুলনা গেজেট ফটো গ্যালারি — বিভিন্ন ইভেন্ট ও সংবাদের ছবিসমূহ</p>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200 shadow-sm">
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
