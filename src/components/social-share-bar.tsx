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
        className="w-7 h-7 rounded-full bg-[#1877F2] hover:opacity-90 text-white flex items-center justify-center transition shadow-xs text-xs"
        title="Facebook-এ শেয়ার করুন"
      >
        <i className="fa fa-facebook"></i>
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-full bg-[#1DA1F2] hover:opacity-90 text-white flex items-center justify-center transition shadow-xs text-xs"
        title="Twitter-এ শেয়ার করুন"
      >
        <i className="fa fa-twitter"></i>
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white flex items-center justify-center transition shadow-xs text-xs"
        title="Instagram"
      >
        <i className="fa fa-instagram"></i>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-full bg-[#25D366] hover:opacity-90 text-white flex items-center justify-center transition shadow-xs text-xs"
        title="WhatsApp-এ শেয়ার করুন"
      >
        <i className="fa fa-whatsapp"></i>
      </a>

      {/* Messenger */}
      <a
        href={`fb-messenger://share/?link=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] hover:opacity-90 text-white flex items-center justify-center transition shadow-xs text-xs"
        title="Messenger-এ শেয়ার করুন"
      >
        <i className="fa fa-commenting"></i>
      </a>

      {/* Print */}
      <button
        onClick={handlePrint}
        className="w-7 h-7 rounded-full bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center transition shadow-xs cursor-pointer text-xs"
        title="প্রিন্ট করুন"
      >
        <i className="fa fa-print"></i>
      </button>
    </div>
  );
}
