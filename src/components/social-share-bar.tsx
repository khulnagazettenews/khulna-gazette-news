'use client';

import React from 'react';
import { Printer } from 'lucide-react';

interface SocialShareBarProps {
  title: string;
  url: string;
}

export default function SocialShareBar({ title, url }: SocialShareBarProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex items-center gap-1.5 select-none shrink-0 print:hidden">
      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-xs bg-[#3b5998] hover:opacity-90 text-white flex items-center justify-center transition text-xs shadow-2xs"
        title="Facebook"
      >
        <i className="fa fa-facebook"></i>
      </a>

      {/* Messenger */}
      <a
        href={`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-xs bg-[#0084ff] hover:opacity-90 text-white flex items-center justify-center transition text-xs shadow-2xs"
        title="Messenger"
      >
        <i className="fa fa-comment font-bold"></i>
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-xs bg-[#1da1f2] hover:opacity-90 text-white flex items-center justify-center transition text-xs shadow-2xs"
        title="Twitter"
      >
        <i className="fa fa-twitter"></i>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-xs bg-[#25d366] hover:opacity-90 text-white flex items-center justify-center transition text-xs shadow-2xs"
        title="WhatsApp"
      >
        <i className="fa fa-whatsapp"></i>
      </a>

      {/* Print */}
      <button
        onClick={handlePrint}
        className="w-7 h-7 rounded-xs bg-[#555555] hover:bg-gray-700 text-white flex items-center justify-center transition text-xs shadow-2xs cursor-pointer"
        title="প্রিন্ট করুন"
      >
        <Printer size={14} />
      </button>
    </div>
  );
}
