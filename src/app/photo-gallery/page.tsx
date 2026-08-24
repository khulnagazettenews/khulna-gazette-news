import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import PhotoGrid from '@/components/photo-grid';
import { Camera } from 'lucide-react';

export const revalidate = 60; // 60 seconds (ISR)

const FALLBACK_PHOTOS = [
  {
    id: 'ph-1',
    imageUrl: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=1200&auto=format&fit=crop',
    caption: 'রূপসা সেতুতে সূর্যাস্তের রক্তিম আভা ও খুলনা শহরের গোধূলিলগ্নের নান্দনিক রূপ',
    credit: 'খুলনা গেজেট ফটো ডেস্ক',
  },
  {
    id: 'ph-2',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop',
    caption: 'সুন্দরবনের জীববৈচিত্র্য ও নদীতীরে হরিণের অবাধ বিচরণ চিত্র',
    credit: 'এম এ রহমান',
  },
  {
    id: 'ph-3',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    caption: 'উপকূলীয় জনপদে নতুন সোনালী ধানের ক্ষেত ও স্থানীয় কৃষকের হাসি',
    credit: 'গেজেট বিশেষ প্রতিনিধি',
  },
  {
    id: 'ph-4',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    caption: 'কুয়াশাচ্ছন্ন কুঁড়ি ভোরে ভৈরব নদীর তীরে মাঝিদের ব্যস্ত কর্মসংস্থান',
    credit: 'আরিফ হোসেন',
  },
  {
    id: 'ph-5',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    caption: 'দক্ষিণাঞ্চলের নদী উপকূলে গোধূলি বেলার শান্ত নিবিড় পরিবেশ',
    credit: 'ফটো গ্যালারি খুলনা',
  },
];

export default async function PublicPhotoGallery() {
  let dbPhotos: any[] = [];
  let newsWithPhotos: any[] = [];
  try {
    const res = await Promise.all([
      prisma.galleryPhoto.findMany({
        orderBy: { order: 'asc' },
      }),
      prisma.news.findMany({
        where: {
          status: 'PUBLISHED',
          featuredImage: { not: null },
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
        include: { category: true },
      }),
    ]);
    dbPhotos = res[0];
    newsWithPhotos = res[1];
  } catch (err) {
    console.error('Error fetching gallery photos:', err);
  }

  const combinedPhotos: any[] = [];

  // Map published news images to gallery items
  if (newsWithPhotos && newsWithPhotos.length > 0) {
    newsWithPhotos.forEach((item) => {
      if (item.featuredImage) {
        combinedPhotos.push({
          id: `news-${item.id}`,
          imageUrl: item.featuredImage,
          caption: item.title,
          credit: item.photoCredit || item.reporterName || 'খুলনা গেজেট',
          newsUrl: `/${item.category?.slug || 'bangladesh'}/${item.slug}-${item.id}`,
        });
      }
    });
  }

  // Include DB gallery photos
  if (dbPhotos && dbPhotos.length > 0) {
    dbPhotos.forEach((ph) => {
      if (ph.imageUrl) {
        combinedPhotos.push({
          id: ph.id,
          imageUrl: ph.imageUrl,
          caption: ph.caption || 'ছবিতে খবর',
          credit: ph.credit || 'খুলনা গেজেট',
        });
      }
    });
  }

  const photos = combinedPhotos.length > 0 ? combinedPhotos : FALLBACK_PHOTOS;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-[#000000]">
      <PublicHeader />

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="border-b-2 border-[#FF0000] pb-1.5 mb-6">
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#000000] flex items-center gap-2">
            <Camera size={26} className="text-[#e60023]" />
            <span>ফটো গ্যালারি</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            খুলনা গেজেট ফটো গ্যালারি — বিভিন্ন ইভেন্ট ও খবরের ছবিসমূহ
          </p>
        </div>

        <PhotoGrid photos={photos} />
      </main>

      <PublicFooter />
    </div>
  );
}
