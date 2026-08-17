'use client';

import { useEffect, useRef } from 'react';

export interface AdItem {
  id: string;
  title?: string;
  imageUrl?: string | null;
  targetUrl?: string | null;
  position: string;
  adType?: string | null; // "IMAGE", "HTML_SCRIPT", "TEXT_IMAGE"
  codeSnippet?: string | null;
  description?: string | null;
}

interface AdBannerProps {
  ad?: AdItem | null;
  fallbackText?: string;
  className?: string;
  hideIfEmpty?: boolean;
}

export default function AdBanner({ ad, fallbackText = 'বিজ্ঞাপন স্পেস', className = '', hideIfEmpty = true }: AdBannerProps) {
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ad) {
      // View tracking
      fetch(`/api/advertisements/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' }),
      }).catch((err) => console.error('Error tracking ad view:', err));
    }
  }, [ad]);

  // Execute HTML_SCRIPT / JS scripts inside container if adType is HTML_SCRIPT
  useEffect(() => {
    if (ad?.adType === 'HTML_SCRIPT' && ad?.codeSnippet && scriptContainerRef.current) {
      const container = scriptContainerRef.current;
      container.innerHTML = ''; // clear previous content

      const range = document.createRange();
      range.selectNode(container);
      const fragment = range.createContextualFragment(ad.codeSnippet);
      container.appendChild(fragment);
    }
  }, [ad]);

  const handleClick = () => {
    if (ad) {
      fetch(`/api/advertisements/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'click' }),
      }).catch((err) => console.error('Error tracking ad click:', err));
    }
  };

  if (!ad) {
    if (hideIfEmpty) return null;
    return (
      <div className={`w-full bg-slate-100 border border-slate-200 h-20 sm:h-24 rounded-2xl flex items-center justify-center text-xs text-slate-400 select-none font-bold ${className}`}>
        {fallbackText}
      </div>
    );
  }

  // HTML / AdSense Script Ad
  if (ad.adType === 'HTML_SCRIPT') {
    return (
      <div className={`w-full relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-center min-h-[90px] ${className}`}>
        <div ref={scriptContainerRef} className="w-full flex items-center justify-center overflow-hidden" />
      </div>
    );
  }

  // Text + Image Ad
  if (ad.adType === 'TEXT_IMAGE') {
    return (
      <div className={`w-full relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-4 flex-1">
          {ad.imageUrl && (
            <img src={ad.imageUrl} alt={ad.title || 'Ad'} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0 border border-slate-700" />
          )}
          <div>
            {ad.title && <h4 className="font-extrabold text-sm sm:text-base text-amber-300">{ad.title}</h4>}
            {ad.description && <p className="text-xs text-slate-300 mt-1 line-clamp-2">{ad.description}</p>}
          </div>
        </div>
        {ad.targetUrl && (
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="shrink-0 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition"
          >
            বিস্তারিত দেখুন
          </a>
        )}
      </div>
    );
  }

  // Default Image Banner Ad
  return (
    <div className={`w-full relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-center ${className}`}>
      {ad.targetUrl ? (
        <a 
          href={ad.targetUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={handleClick}
          className="w-full h-full block"
        >
          {ad.imageUrl ? (
            <img 
              src={ad.imageUrl} 
              alt={ad.title || 'বিজ্ঞাপন'} 
              className="w-full h-full object-cover transition duration-300 hover:brightness-95" 
            />
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 font-bold">{ad.title || 'বিজ্ঞাপন'}</div>
          )}
        </a>
      ) : (
        <div className="w-full h-full">
          {ad.imageUrl ? (
            <img 
              src={ad.imageUrl} 
              alt={ad.title || 'বিজ্ঞাপন'} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 font-bold">{ad.title || 'বিজ্ঞাপন'}</div>
          )}
        </div>
      )}
    </div>
  );
}

