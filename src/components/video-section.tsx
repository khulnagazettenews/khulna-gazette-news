'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Video } from 'lucide-react';

export interface VideoItem {
  id: string;
  youtubeUrl: string;
  title: string;
  categoryTag?: string;
  description?: string;
  createdAt?: string | Date;
}

interface VideoSectionProps {
  videos?: VideoItem[];
}

const FALLBACK_VIDEOS: VideoItem[] = [
  {
    id: 'kg-1',
    title: 'খুলনার সার্বিক উন্নয়ন ও উপকূলীয় অঞ্চলের বিশেষ সংবাদচিত্র — খুলনা গেজেট',
    categoryTag: 'বিশেষ আলোচনা',
    description: 'খুলনা শহর ও সংলগ্ন উপকূলীয় এলাকার নদী বাঁধ ও সাম্প্রতিক সংবাদ বুলেটিন...',
    youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
  },
  {
    id: 'kg-2',
    title: 'খুলনা গেজেট ভিডিও বুলেটিন: রূপসা নদী ও খুলনা শহরের আজকের খবর',
    categoryTag: 'ভিডিও বুলেটিন',
    description: 'খুলনা জেলা প্রশাসন ও শহর কর্তৃপক্ষের তদারকি অভিযান...',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'kg-3',
    title: 'সুন্দরবন সংরক্ষণ ও পরিবেশগত বিশেষ অনুসন্ধানী প্রতিবেদন',
    categoryTag: 'বিশেষ প্রতিবেদন',
    description: 'সুন্দরবনের জীববৈচিত্র্য ও বন সংরক্ষণে খুলনা গেজেটের অনুসন্ধান...',
    youtubeUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
  },
  {
    id: 'kg-4',
    title: 'দক্ষিণাঞ্চলের কৃষি, মৎস্য ও ব্যবসা বাণিজ্যের তাজা খবর',
    categoryTag: 'অর্থনীতি ও ব্যবসা',
    description: 'খুলনাঞ্চলের কৃষি পণ্য ও রফতানি বাণিজ্য আপডেট...',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
  },
  {
    id: 'kg-5',
    title: 'খুলনা শহরের ইতিহাস ও রূপসা নদীর তীরবর্তী বিশেষ ভিডিওচিত্র',
    categoryTag: 'ইতিহাস ও ঐতিহ্য',
    description: 'রূপসা নদী ও খুলনা শহরের ঐতিহাসিক বিবরণচিত্র...',
    youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
  },
];

export default function VideoSection({ videos = [] }: VideoSectionProps) {
  const displayVideos = videos && videos.length > 0 ? videos : FALLBACK_VIDEOS;
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const getYoutubeId = (url: string) => {
    if (!url) return 'M7lc1UVf-VE';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : 'M7lc1UVf-VE';
  };

  const activeVideo = displayVideos[activeIdx] || displayVideos[0];
  const activeYtId = getYoutubeId(activeVideo?.youtubeUrl || '');
  const activeThumb = activeYtId
    ? `https://img.youtube.com/vi/${activeYtId}/hqdefault.jpg`
    : '';

  const sideVideos = displayVideos.filter((_, idx) => idx !== activeIdx).slice(0, 4);
  const playlistVideos = sideVideos.length > 0 ? sideVideos : displayVideos.slice(1, 5);

  const handleSelectVideo = (video: VideoItem) => {
    const foundIndex = displayVideos.findIndex((v) => v.id === video.id);
    if (foundIndex !== -1) {
      setActiveIdx(foundIndex);
    } else {
      setActiveIdx(0);
    }
    setIsPlaying(true);
  };

  return (
    <section className="w-full my-8 font-sans bg-white text-[#000000] select-none">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Category Header matching khulnagazette.com exact style */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-[#FF0000] pb-1.5 mb-5 gap-2">
          <Link href="/video-gallery" className="text-[20px] sm:text-[24px] font-bold text-[#000000] leading-none flex items-center gap-2 hover:text-[#e60023] transition-colors">
            <Video size={22} className="text-[#e60023]" />
            <span>ভিডিও</span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <a
              href="https://www.youtube.com/@khulnagazette"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#e60023] via-[#ff002b] to-[#c7001e] hover:from-[#cc001f] hover:to-[#a30018] text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 border border-white/20 overflow-hidden"
            >
              {/* Subtle shining light flare effect on hover */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

              {/* White Animated YouTube Play Icon with Eye-Catching Waves */}
              <span className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full text-[#e60023] shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" style={{ animationDuration: '1.5s' }}></span>
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-300/40"></span>
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5 relative z-10 animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>

              {/* Button Text */}
              <span className="relative tracking-normal font-black text-white text-sm sm:text-base lg:text-lg drop-shadow-sm antialiased">
                ইউটিউব চ্যানেল
              </span>

              {/* Live Signal Pulse Dot */}
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
            </a>
          </div>
        </div>

        {/* Clean Grid Layout (No Heavy Container Background) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Featured Video Player (Left 7-8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-between group">
            <div>
              {/* Aspect Video Frame */}
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-sm border border-gray-200">
                {isPlaying ? (
                  <iframe
                    src={
                      activeYtId
                        ? `https://www.youtube.com/embed/${activeYtId}?autoplay=1&rel=0`
                        : `https://www.youtube.com/embed?listType=user_uploads&list=khulnagazette&autoplay=1`
                    }
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div
                    className="relative w-full h-full cursor-pointer overflow-hidden"
                    onClick={() => setIsPlaying(true)}
                  >
                    {activeThumb ? (
                      <img
                        src={activeThumb}
                        alt={activeVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 text-xs">
                        ভিডিও প্রাকদর্শন
                      </div>
                    )}

                    {/* Red Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#e60023] hover:bg-red-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play size={28} className="ml-1 fill-white" />
                      </div>
                    </div>

                    {/* Category tag overlay top-left */}
                    {activeVideo.categoryTag && (
                      <div className="absolute top-3 left-3 bg-[#e60023] text-white text-xs sm:text-sm font-bold px-3 py-1 rounded">
                        {activeVideo.categoryTag}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title clicking navigates to /video-gallery */}
              <Link href="/video-gallery" className="block">
                <h3 className="text-[20px] sm:text-[24px] font-bold text-[#000000] hover:text-[#e60023] leading-snug mt-3.5 transition-colors">
                  {activeVideo.title}
                </h3>
              </Link>

              {activeVideo.description && (
                <p className="text-sm sm:text-base text-gray-700 mt-2 leading-relaxed line-clamp-2 font-medium">
                  {activeVideo.description}
                </p>
              )}
            </div>
          </div>

          {/* Playlist Cards (Right 4-5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-3.5">
            <div className="text-base sm:text-lg font-bold text-[#000000] border-b border-gray-200 pb-2 flex items-center justify-between">
              <Link href="/video-gallery" className="hover:text-[#e60023] transition-colors">
                অন্যান্য ভিডিও
              </Link>
            </div>

            <div className="space-y-3.5">
              {playlistVideos.map((vid) => {
                const ytId = getYoutubeId(vid.youtubeUrl);
                const thumb = ytId
                  ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                  : '';

                return (
                  <Link
                    key={vid.id}
                    href="/video-gallery"
                    className="flex gap-3 items-start cursor-pointer group p-1.5 rounded hover:bg-gray-50 transition duration-200 block"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-32 sm:w-36 shrink-0 rounded overflow-hidden bg-slate-900 border border-gray-200">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                          ভিডিও
                        </div>
                      )}

                      {/* Small Red Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-7 h-7 rounded-full bg-[#e60023] text-white flex items-center justify-center shadow">
                          <Play size={14} className="ml-0.5 fill-white" />
                        </div>
                      </div>
                    </div>

                    {/* Title with exact website font */}
                    <div className="flex-1">
                      <h4 className="text-[17px] sm:text-[19px] font-bold text-[#000000] group-hover:text-[#e60023] leading-snug line-clamp-2 transition-colors">
                        {vid.title}
                      </h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
