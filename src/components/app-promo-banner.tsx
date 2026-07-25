'use client';

import React from 'react';
import Image from 'next/image';

export default function AppPromoBanner() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs text-center">
      {/* Top Banner Header */}
      <div className="bg-[#b91c1c] text-white py-2 px-3 font-bold text-sm tracking-wide flex items-center justify-center gap-1.5 select-none">
        <span>খুলনা গেজেট অ্যাপ পেতে ক্লিক করুন</span>
      </div>

      {/* Main Content Area */}
      <a
        href="https://play.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 group hover:bg-slate-50 transition"
      >
        <div className="flex flex-col items-center space-y-3">
          {/* App Preview Mockup Container */}
          <div className="relative w-full max-w-[220px] bg-gradient-to-b from-red-50 to-white rounded-xl p-3 border border-red-100 flex flex-col items-center shadow-xs group-hover:scale-[1.02] transition duration-200">
            {/* Phone Screen Mockup */}
            <div className="w-28 bg-white border-2 border-gray-800 rounded-2xl p-2 shadow-md relative overflow-hidden my-1">
              <div className="w-8 h-1 bg-gray-800 rounded-full mx-auto mb-2"></div>
              <div className="bg-red-700 text-white rounded p-1.5 text-[9px] font-extrabold text-center tracking-tight mb-2">
                খুলনা গেজেট
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                <div className="h-2 bg-red-100 rounded w-3/5"></div>
              </div>
            </div>

            {/* Website URL */}
            <div className="text-[11px] font-bold text-red-700 mt-2 tracking-tight">
              www.khulnagazette.com
            </div>
          </div>

          {/* Google Play Store Badge */}
          <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-800 shadow-xs">
            <svg className="w-5 h-5 fill-current text-emerald-400" viewBox="0 0 24 24">
              <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5.34 0 .65.12.9.32l11.66 8.5-11.66 8.5a1.49 1.49 0 0 1-.9.32c-.83 0-1.5-.67-1.5-1.5zm13.88-8.5L5.42 3.82c.16-.14.37-.22.6-.22.25 0 .48.1.66.27l12.44 9.07c.36.26.44.77.18 1.13-.05.07-.11.13-.18.18L6.68 23.33c-.18.17-.41.27-.66.27-.23 0-.44-.08-.6-.22l11.46-8.18z"/>
            </svg>
            <div className="text-left">
              <div className="text-[8px] leading-none text-gray-400 uppercase tracking-wider">GET IT ON</div>
              <div className="text-xs font-bold leading-none mt-0.5">Google Play</div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
