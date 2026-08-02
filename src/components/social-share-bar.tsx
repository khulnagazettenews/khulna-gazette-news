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
    <div className="flex items-center gap-1 select-none shrink-0 print:hidden">
      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-6 h-6 rounded-full bg-[#1877F2] hover:opacity-90 text-white flex items-center justify-center transition text-[11px]"
        title="Facebook-এ শেয়ার করুন"
      >
        <i className="fa fa-facebook"></i>
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-6 h-6 rounded-full bg-[#1DA1F2] hover:opacity-90 text-white flex items-center justify-center transition text-[11px]"
        title="Twitter-এ শেয়ার করুন"
      >
        <i className="fa fa-twitter"></i>
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white flex items-center justify-center transition text-[11px]"
        title="Instagram"
      >
        <i className="fa fa-instagram"></i>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-6 h-6 rounded-full bg-[#25D366] hover:opacity-90 text-white flex items-center justify-center transition text-[11px]"
        title="WhatsApp-এ শেয়ার করুন"
      >
        <i className="fa fa-whatsapp"></i>
      </a>

      {/* Messenger */}
      <a
        href={`fb-messenger://share/?link=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-6 h-6 rounded-full bg-[#0084FF] hover:opacity-90 text-white flex items-center justify-center transition text-[11px]"
        title="Messenger-এ শেয়ার করুন"
      >
        <i className="fa fa-commenting"></i>
      </a>

      {/* Print */}
      <button
        onClick={handlePrint}
        className="w-6 h-6 text-gray-700 hover:text-black flex items-center justify-center transition cursor-pointer text-sm ml-1"
        title="প্রিন্ট করুন"
      >
        <i className="fa fa-print"></i>
      </button>
    </div>
  );
}
