'use client';

import { useEffect } from 'react';

interface AdBannerProps {
  ad?: {
    id: string;
    title: string;
    imageUrl: string;
    targetUrl?: string | null;
    position: string;
  } | null;
  fallbackText: string;
  className?: string;
}

export default function AdBanner({ ad, fallbackText, className = '' }: AdBannerProps) {
  useEffect(() => {
    if (ad) {
      // Fire and forget view tracking API
      fetch(`/api/advertisements/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' }),
      }).catch((err) => console.error('Error tracking ad view:', err));
    }
  }, [ad]);

  const handleClick = () => {
    if (ad) {
      // Fire and forget click tracking API
      fetch(`/api/advertisements/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'click' }),
      }).catch((err) => console.error('Error tracking ad click:', err));
    }
  };

  if (!ad) {
    return (
      <div className={`w-full bg-slate-100 border border-slate-200 h-24 rounded-xl flex items-center justify-center text-xs text-slate-400 select-none ${className}`}>
        {fallbackText}
      </div>
    );
  }

  const BannerContent = (
    <img 
      src={ad.imageUrl} 
      alt={ad.title} 
      className="w-full h-full object-cover rounded-xl transition duration-300 hover:brightness-95" 
    />
  );

  return (
    <div className={`w-full relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center ${className}`}>
      {ad.targetUrl ? (
        <a 
          href={ad.targetUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={handleClick}
          className="w-full h-full block"
        >
          {BannerContent}
        </a>
      ) : (
        <div className="w-full h-full">
          {BannerContent}
        </div>
      )}
    </div>
  );
}
