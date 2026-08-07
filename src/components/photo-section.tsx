'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Camera, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';

export interface PhotoNewsItem {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string | null;
  credit?: string | null;
  newsUrl?: string;
  categoryName?: string;
}

interface PhotoSectionProps {
  photos?: any[];
  newsWithPhotos?: any[];
}

const FALLBACK_ITEMS: PhotoNewsItem[] = [
  {
    id: 'ph-1',
    title: 'রূপসা সেতুতে সূর্যাস্তের রক্তিম আভা ও খুলনা শহরের গোধূলিলগ্নের নান্দনিক রূপ',
    imageUrl: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=1200&auto=format&fit=crop',
    caption: 'রূপসা নদী ও উপকূলীয় রূপালী সন্ধ্যাচিত্র',
    credit: 'খুলনা গেজেট ফটো ডেস্ক',
    newsUrl: '#',
  },
  {
    id: 'ph-2',
    title: 'সুন্দরবনের জীববৈচিত্র্য ও নদীতীরে হরিণের অবাধ বিচরণ চিত্র',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop',
    caption: 'সুন্দরবনের প্রাকৃতিক সৌন্দর্য',
    credit: 'এম এ রহমান',
    newsUrl: '#',
  },
  {
    id: 'ph-3',
    title: 'উপকূলীয় জনপদে নতুন সোনালী ধানের ক্ষেত ও স্থানীয় কৃষকের হাসি',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    caption: 'দক্ষিণাঞ্চলের কৃষি চিত্র',
    credit: 'গেজেট বিশেষ প্রতিনিধি',
    newsUrl: '#',
  },
  {
    id: 'ph-4',
    title: 'কুয়াশাচ্ছন্ন কুঁড়ি ভোরে ভৈরব নদীর তীরে মাঝিদের ব্যস্ত কর্মসংস্থান',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    caption: 'ভৈরব নদীর শান্ত পরিবেশ',
    credit: 'আরিফ হোসেন',
    newsUrl: '#',
  },
  {
    id: 'ph-5',
    title: 'দক্ষিণাঞ্চলের নদী উপকূলে গোধূলি বেলার শান্ত নিবিড় পরিবেশ',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    caption: 'উপকূলীয় সান্ধ্য দৃশ্য',
    credit: 'ফটো গ্যালারি খুলনা',
    newsUrl: '#',
  },
];

export default function PhotoSection({ photos = [], newsWithPhotos = [] }: PhotoSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Format items from news or gallery photos
  const items: PhotoNewsItem[] = [];

  if (newsWithPhotos && newsWithPhotos.length > 0) {
    newsWithPhotos.forEach((item) => {
      if (item.featuredImage) {
        items.push({
          id: item.id,
          title: item.title,
          imageUrl: item.featuredImage,
          caption: item.imageCaption || item.title,
          credit: item.photoCredit || item.reporterName || item.author?.name || 'খুলনা গেজেট',
          newsUrl: `/${item.category?.slug || 'bangladesh'}/${item.slug}-${item.id}`,
          categoryName: item.category?.name || 'খবর',
        });
      }
    });
  }

  if (photos && photos.length > 0) {
    photos.forEach((ph) => {
      if (ph.imageUrl) {
        items.push({
          id: ph.id,
          title: ph.caption || 'ছবিতে খবর',
          imageUrl: ph.imageUrl,
          caption: ph.caption,
          credit: ph.credit || 'খুলনা গেজেট',
          newsUrl: '/photo-gallery',
          categoryName: 'ছবিঘর',
        });
      }
    });
  }

  const displayItems = items.length > 0 ? items : FALLBACK_ITEMS;

  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 370, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slideLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const slideRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  return (
    <section className="w-full my-6 font-sans text-[#000000] select-none">
      {/* Category Section Header matching khulnagazette.com exact font & style */}
      <div className="flex items-center justify-between border-b-2 border-[#FF0000] pb-1 mb-4">
        <h2 className="text-[24px] sm:text-[28px] font-bold text-[#000000] leading-none flex items-center gap-2">
          <Camera size={24} className="text-[#e60023]" />
          <span>ছবিতে খবর</span>
        </h2>

        <div className="flex items-center gap-3">
          {/* Slider Arrow Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={slideLeft}
              className="w-8 h-8 rounded bg-gray-100 hover:bg-[#e60023] text-gray-700 hover:text-white flex items-center justify-center transition border border-gray-200"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={slideRight}
              className="w-8 h-8 rounded bg-gray-100 hover:bg-[#e60023] text-gray-700 hover:text-white flex items-center justify-center transition border border-gray-200"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <Link href="/photo-gallery" className="text-sm sm:text-base text-[#e60023] font-bold hover:underline">
            সব খবর
          </Link>
        </div>
      </div>

      {/* Horizontal Sliding Photo Cards Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-none py-1 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayItems.map((item, idx) => (
          <div
            key={item.id || idx}
            className="snap-start shrink-0 w-[290px] sm:w-[350px] md:w-[370px] bg-white rounded overflow-hidden flex flex-col justify-between group space-y-2 border border-gray-200/80 p-2.5 shadow-xs hover:shadow-md transition duration-300"
          >
            {/* Featured Image */}
            <div
              onClick={() => openLightbox(idx)}
              className="relative aspect-[16/10] w-full bg-gray-100 rounded overflow-hidden cursor-pointer"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white p-1 rounded">
                <Camera size={14} />
              </div>
              {item.categoryName && (
                <span className="absolute top-2 right-2 bg-[#e60023] text-white text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded">
                  {item.categoryName}
                </span>
              )}
            </div>

            {/* Title matching exact font size and style of news headlines */}
            <div className="space-y-2 flex-grow flex flex-col justify-between pt-1">
              <Link
                href={item.newsUrl || '#'}
                className="text-[19px] sm:text-[22px] font-bold text-[#000000] hover:text-[#e60023] leading-snug line-clamp-2 transition duration-200"
              >
                {item.title}
              </Link>

              <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-xs sm:text-sm text-gray-600 font-semibold">
                {item.credit && <span>ছবি: {item.credit}</span>}
                <Link
                  href={item.newsUrl || '#'}
                  className="text-[#e60023] hover:underline font-bold text-xs sm:text-sm inline-flex items-center gap-0.5"
                >
                  <span>পড়ুন</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal View */}
      {lightboxIndex !== null && displayItems[lightboxIndex] && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-between p-4"
        >
          <div className="w-full max-w-5xl flex items-center justify-between z-10 text-white font-bold text-sm">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-red-500" />
              <span>ছবি {lightboxIndex + 1} / {displayItems.length}</span>
            </div>
            <button
              onClick={closeLightbox}
              className="text-white hover:text-red-500 bg-white/10 p-2 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>

          <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex === 0 ? displayItems.length - 1 : lightboxIndex - 1);
              }}
              className="absolute left-2 sm:left-4 text-white hover:text-red-500 bg-black/60 p-3 rounded-full transition shadow-lg border border-white/10 z-20"
            >
              <ChevronLeft size={28} />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[70vh] flex flex-col items-center justify-center p-2"
            >
              <img
                src={displayItems[lightboxIndex].imageUrl}
                alt={displayItems[lightboxIndex].title}
                className="max-w-full max-h-[65vh] object-contain rounded shadow-2xl border border-white/10"
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex === displayItems.length - 1 ? 0 : lightboxIndex + 1);
              }}
              className="absolute right-2 sm:left-auto sm:right-4 text-white hover:text-red-500 bg-black/60 p-3 rounded-full transition shadow-lg border border-white/10 z-20"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center text-white space-y-2 z-10"
          >
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {displayItems[lightboxIndex].title}
            </h3>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-300 font-semibold">
              {displayItems[lightboxIndex].credit && (
                <span>ছবি: {displayItems[lightboxIndex].credit}</span>
              )}
              {displayItems[lightboxIndex].newsUrl && displayItems[lightboxIndex].newsUrl !== '#' && (
                <Link
                  href={displayItems[lightboxIndex].newsUrl!}
                  className="bg-[#e60023] hover:bg-red-700 text-white font-bold px-3 py-1 rounded transition text-xs inline-flex items-center gap-1"
                >
                  <span>সংবাদটি পড়ুন</span>
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
