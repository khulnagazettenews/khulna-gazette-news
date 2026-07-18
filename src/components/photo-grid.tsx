'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface Photo {
  id: string;
  imageUrl: string;
  caption?: string | null;
  credit?: string | null;
}

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const openLightbox = (idx: number) => setIndex(idx);
  const closeLightbox = () => setIndex(null);

  const prev = () => {
    if (index === null) return;
    setIndex(index === 0 ? photos.length - 1 : index - 1);
  };

  const next = () => {
    if (index === null) return;
    setIndex(index === photos.length - 1 ? 0 : index + 1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        {photos.map((item, idx) => (
          <div 
            key={item.id} 
            onClick={() => openLightbox(idx)}
            className="group cursor-pointer border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between bg-slate-50 relative"
          >
            <div className="aspect-video w-full bg-white border-b border-gray-200 overflow-hidden">
              <img src={item.imageUrl} alt={item.caption || 'Gallery photo'} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs font-bold text-gray-700 line-clamp-2 leading-relaxed">
                {item.caption || 'ক্যাপশন নেই'}
              </p>
              {item.credit && (
                <p className="text-[10px] text-gray-450 font-semibold flex items-center gap-1">
                  <Camera size={12} className="text-red-650" />
                  <span>ছবি: {item.credit}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {index !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white hover:text-red-500 transition">
            <X size={28} />
          </button>
          
          <button onClick={prev} className="absolute left-4 text-white hover:text-red-500 transition">
            <ChevronLeft size={40} />
          </button>
          
          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center space-y-4">
            <img src={photos[index].imageUrl} alt="Lightbox view" className="max-w-full max-h-[70vh] object-contain rounded shadow-2xl" />
            <div className="text-center text-white space-y-1 px-4">
              <p className="text-sm font-semibold">{photos[index].caption}</p>
              {photos[index].credit && <p className="text-xs text-gray-400">ছবি: {photos[index].credit}</p>}
            </div>
          </div>

          <button onClick={next} className="absolute right-4 text-white hover:text-red-500 transition">
            <ChevronRight size={40} />
          </button>
        </div>
      )}
    </div>
  );
}
