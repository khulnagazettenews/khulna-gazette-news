'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Camera, ExternalLink } from 'lucide-react';

interface Photo {
  id: string;
  imageUrl: string;
  caption?: string | null;
  credit?: string | null;
  newsUrl?: string;
}

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const openLightbox = (idx: number) => setIndex(idx);
  const closeLightbox = () => setIndex(null);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === null) return;
    setIndex(index === 0 ? photos.length - 1 : index - 1);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === null) return;
    setIndex(index === photos.length - 1 ? 0 : index + 1);
  };

  return (
    <div className="space-y-6 font-sans text-[#000000]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((item, idx) => (
          <div 
            key={item.id} 
            className="group cursor-pointer border border-gray-200 rounded overflow-hidden shadow-xs hover:shadow-md transition duration-300 bg-white flex flex-col justify-between p-2.5 space-y-2"
          >
            <div 
              onClick={() => openLightbox(idx)}
              className="aspect-[16/10] w-full bg-gray-100 rounded overflow-hidden relative"
            >
              <img 
                src={item.imageUrl} 
                alt={item.caption || 'গ্যালারি ছবি'} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white p-1 rounded">
                <Camera size={14} />
              </div>
            </div>

            <div className="space-y-2 pt-1 flex-grow flex flex-col justify-between">
              {item.newsUrl && item.newsUrl !== '#' ? (
                <Link
                  href={item.newsUrl}
                  className="text-[17px] sm:text-[19px] font-bold text-[#000000] hover:text-[#e60023] leading-snug line-clamp-2 transition-colors block"
                >
                  {item.caption || 'শিরোনাম নেই'}
                </Link>
              ) : (
                <p 
                  onClick={() => openLightbox(idx)}
                  className="text-[17px] sm:text-[19px] font-bold text-[#000000] hover:text-[#e60023] leading-snug line-clamp-2 transition-colors"
                >
                  {item.caption || 'শিরোনাম নেই'}
                </p>
              )}

              <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-xs text-gray-500 font-semibold">
                {item.credit && <span>ছবি: {item.credit}</span>}
                {item.newsUrl && item.newsUrl !== '#' && (
                  <Link
                    href={item.newsUrl}
                    className="text-[#e60023] hover:underline font-bold text-xs inline-flex items-center gap-0.5"
                  >
                    <span>পড়ুন</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {index !== null && (
        <div 
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-between p-4"
        >
          <div className="w-full max-w-5xl flex items-center justify-between z-10 text-white font-bold text-sm">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-red-500" />
              <span>ছবি {index + 1} / {photos.length}</span>
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
              onClick={prev} 
              className="absolute left-2 sm:left-4 text-white hover:text-red-500 bg-black/60 p-3 rounded-full transition shadow-lg border border-white/10 z-20"
            >
              <ChevronLeft size={28} />
            </button>
            
            <div 
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[70vh] flex flex-col items-center justify-center p-2"
            >
              <img 
                src={photos[index].imageUrl} 
                alt="Lightbox view" 
                className="max-w-full max-h-[65vh] object-contain rounded shadow-2xl border border-white/10" 
              />
            </div>

            <button 
              onClick={next} 
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
              {photos[index].caption}
            </h3>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-300 font-semibold">
              {photos[index].credit && <span>ছবি: {photos[index].credit}</span>}
              {photos[index].newsUrl && photos[index].newsUrl !== '#' && (
                <Link
                  href={photos[index].newsUrl!}
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
    </div>
  );
}
