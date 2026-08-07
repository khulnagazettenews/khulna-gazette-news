'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, ChevronLeft, ChevronRight, Pause, Play, X, ExternalLink } from 'lucide-react';

export interface PhotoNewsItem {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string | null;
  credit?: string | null;
  newsUrl?: string;
  timeAgo?: string;
}

interface PhotoSectionProps {
  photos?: any[];
  newsWithPhotos?: any[];
}

const FALLBACK_ITEMS: PhotoNewsItem[] = [
  {
    id: 'pa-1',
    title: 'একঝলক (৭ আগস্ট ২০২৬)',
    imageUrl: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=1200&auto=format&fit=crop',
    caption: 'খুলনার গাংনী রোড সংলগ্ন এলাকায় ট্রেন দুর্ঘটনা ও রূপসা নদীর উপকূলে উদ্ধার কাজ শুরু।',
    credit: 'খুলনা গেজেট',
    timeAgo: '৪ ঘণ্টা আগে',
    newsUrl: '#',
  },
  {
    id: 'pa-2',
    title: 'পানির নিচে সড়ক, ভোগান্তিতে মানুষ',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop',
    caption: 'ভারী বর্ষণে শহরের প্রধান প্রধান সড়কে পানি জমে জনদুর্ভোগ সৃষ্টি হয়েছে।',
    credit: 'এম এ রহমান',
    timeAgo: '৫ ঘণ্টা আগে',
    newsUrl: '#',
  },
  {
    id: 'pa-3',
    title: 'মাছের হাটে ব্যস্ত দিন',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    caption: 'সকালে কেসিসি পাইকারি মৎস্য বাজারে ইলিশ ও রূপচাঁদা মাছের উপচে পড়া ভিড়।',
    credit: 'গেজেট বিশেষ প্রতিনিধি',
    timeAgo: '৬ ঘণ্টা আগে',
    newsUrl: '#',
  },
  {
    id: 'pa-4',
    title: 'ঢাকায় অ্যারাবিয়ান খাবারের উৎসব',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    caption: 'উৎসব মুখর পরিবেশে সুস্বাদু অ্যারাবিয়ান ফ্লেভারের আইটেম তৈরি ও বিক্রি।',
    credit: 'আরিফ হোসেন',
    timeAgo: '৭ ঘণ্টা আগে',
    newsUrl: '#',
  },
  {
    id: 'pa-5',
    title: '৭ আগস্ট ২০২৪: ছবিতে ফিরে দেখা',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    caption: 'ঐতিহাসিক দিবসে গ্রাফিতি আঁকা ও তরুণ চিত্রশিল্পীদের দেয়াল লিখন।',
    credit: 'ফটো গ্যালারি খুলনা',
    timeAgo: '৮ ঘণ্টা আগে',
    newsUrl: '#',
  },
];

export default function PhotoSection({ photos = [], newsWithPhotos = [] }: PhotoSectionProps) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
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
          caption: item.imageCaption || item.subtitle || item.title,
          credit: item.photoCredit || item.reporterName || item.author?.name || 'খুলনা গেজেট',
          timeAgo: item.publishedAt ? 'সাম্প্রতিক' : '',
          newsUrl: `/${item.category?.slug || 'bangladesh'}/${item.slug}-${item.id}`,
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
          timeAgo: 'গ্যালারি',
          newsUrl: '/photo-gallery',
        });
      }
    });
  }

  const displayItems = items.length > 0 ? items : FALLBACK_ITEMS;
  const totalSlides = displayItems.length;

  // Auto slide effect
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying, totalSlides]);

  const handlePrevSlide = () => {
    setActiveSlideIdx((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIdx((prev) => (prev + 1) % totalSlides);
  };

  const activeMainItem = displayItems[activeSlideIdx] || displayItems[0];
  // Right side 4 cards (excluding active main or top 4 secondary)
  const sideCards = displayItems.filter((_, idx) => idx !== activeSlideIdx).slice(0, 4);
  const rightGridCards = sideCards.length === 4 ? sideCards : displayItems.slice(1, 5);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  return (
    <section className="w-full my-8 font-sans text-[#000000] select-none">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Prothom Alo Style Header: "ছবি >" */}
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-gray-200">
          <Link
            href="/photo-gallery"
            className="text-[24px] sm:text-[28px] font-bold text-[#000000] hover:text-[#e60023] transition-colors flex items-center gap-1.5"
          >
            <span>ছবি</span>
            <span className="text-[#e60023] font-black text-2xl sm:text-3xl leading-none">&rsaquo;</span>
          </Link>
        </div>

        {/* Main 12-Column Grid matching exact Prothom Alo layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Featured Main Slider (7 cols / ~60%) */}
          <div className="lg:col-span-7 flex flex-col justify-between group">
            <div>
              {/* Main Image Slider Frame */}
              <div className="relative aspect-[16/10] w-full rounded-md overflow-hidden bg-black shadow-sm border border-gray-200">
                <img
                  src={activeMainItem.imageUrl}
                  alt={activeMainItem.title}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-102"
                  onClick={() => openLightbox(activeSlideIdx)}
                />

                {/* Top-Left Counter Pill: "৬ / ১০" */}
                <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                  {activeSlideIdx + 1} / {totalSlides}
                </div>

                {/* Top-Right Controls: "<", "||" / ">", ">" */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    onClick={handlePrevSlide}
                    className="w-7 h-7 rounded-full bg-black/65 hover:bg-[#e60023] text-white flex items-center justify-center transition border border-white/20 shadow"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-7 h-7 rounded-full bg-black/65 hover:bg-[#e60023] text-white flex items-center justify-center transition border border-white/20 shadow"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNextSlide}
                    className="w-7 h-7 rounded-full bg-black/65 hover:bg-[#e60023] text-white flex items-center justify-center transition border border-white/20 shadow"
                    aria-label="Next Image"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Bottom Caption Overlay on Image */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 sm:p-4 text-white">
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-gray-200 line-clamp-2">
                    {activeMainItem.caption || activeMainItem.title}
                    {activeMainItem.credit && (
                      <span className="text-gray-300 font-normal ml-1">
                        | ছবি: {activeMainItem.credit}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Title & Time below Main Slider Image */}
              <div className="mt-3">
                <Link
                  href={activeMainItem.newsUrl || '/photo-gallery'}
                  className="text-[20px] sm:text-[24px] font-bold text-[#000000] hover:text-[#e60023] leading-snug line-clamp-2 transition-colors block"
                >
                  {activeMainItem.title}
                </Link>

                {activeMainItem.timeAgo && (
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {activeMainItem.timeAgo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: 4 News Photo Cards in 2x2 Grid (5 cols / ~40%) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {rightGridCards.map((cardItem) => {
              const cardIdx = displayItems.findIndex((i) => i.id === cardItem.id);

              return (
                <div
                  key={cardItem.id}
                  className="flex flex-col justify-between group cursor-pointer"
                  onClick={() => {
                    if (cardIdx !== -1) setActiveSlideIdx(cardIdx);
                  }}
                >
                  <div>
                    {/* Thumbnail Frame */}
                    <div className="relative aspect-[16/10] w-full rounded overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={cardItem.imageUrl}
                        alt={cardItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top-Left Red Camera Badge */}
                      <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#e60023] text-white flex items-center justify-center shadow-md">
                        <Camera size={14} />
                      </div>
                    </div>

                    {/* Headline below Thumbnail */}
                    <h3 className="text-[16px] sm:text-[18px] font-bold text-[#000000] group-hover:text-[#e60023] leading-snug mt-2 line-clamp-2 transition-colors">
                      {cardItem.title}
                    </h3>
                  </div>

                  {/* Time Stamp */}
                  {cardItem.timeAgo && (
                    <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1">
                      {cardItem.timeAgo}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
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
