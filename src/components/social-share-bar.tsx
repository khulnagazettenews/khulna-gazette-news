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
        className="w-[25px] h-[25px] bg-[#1877f2] hover:opacity-90 text-white flex items-center justify-center text-[15px] no-underline rounded-none"
        title="Facebook"
      >
        <i className="fa-brands fa-facebook-f"></i>
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-[25px] h-[25px] bg-[#45a3d9] hover:opacity-90 text-white flex items-center justify-center text-[15px] no-underline rounded-none"
        title="Twitter"
      >
        <i className="fa-brands fa-twitter"></i>
      </a>

      {/* Instagram */}
      <a
        href={`https://www.instagram.com/`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-[25px] h-[25px] text-white flex items-center justify-center text-[15px] no-underline rounded-none"
        style={{
          background: 'linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)',
        }}
        title="Instagram"
      >
        <i className="fa-brands fa-instagram"></i>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-[25px] h-[25px] bg-[#25d366] hover:opacity-90 text-white flex items-center justify-center text-[15px] no-underline rounded-none"
        title="WhatsApp"
      >
        <i className="fa-brands fa-whatsapp"></i>
      </a>

      {/* Messenger */}
      <a
        href={`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-[25px] h-[25px] bg-[#168aff] hover:opacity-90 text-white flex items-center justify-center text-[15px] no-underline rounded-none"
        title="Messenger"
      >
        <i className="fa-brands fa-facebook-messenger"></i>
      </a>

      {/* Print Icon Button */}
      <button
        onClick={handlePrint}
        className="ml-[7px] cursor-pointer bg-transparent border-0 p-0 flex items-center justify-center hover:opacity-80 transition"
        title="প্রিন্ট করুন"
      >
        <span className="text-[#555] text-[26px] leading-none">
          <i className="fa-solid fa-print"></i>
        </span>
      </button>
    </div>
  );
}
