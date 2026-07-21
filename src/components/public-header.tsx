import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import PublicNavbar from './public-navbar';
import { BookOpen } from 'lucide-react';

function getBengaliDate() {
  const date = new Date();
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  const toBengaliNumber = (num: number | string) => {
    const numbers: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return num.toString().split('').map(digit => numbers[digit] || digit).join('');
  };

  const dayName = days[date.getDay()];
  const dateNum = toBengaliNumber(date.getDate());
  const monthName = months[date.getMonth()];
  const yearNum = toBengaliNumber(date.getFullYear());

  return `${dayName}, ${dateNum} ${monthName} ${yearNum}`;
}

export default async function PublicHeader() {
  // Fetch categories with nested subcategories
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { parentId: null },
        { parentId: { isSet: false } }
      ]
    },
    orderBy: { order: 'asc' },
    include: {
      subCategories: {
        orderBy: { order: 'asc' },
      },
    },
  });

  const formattedDate = getBengaliDate();

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Top bar info */}
      <div className="bg-slate-50 text-gray-700 text-xs sm:text-sm py-3.5 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">{formattedDate}</span>
            <span className="text-gray-300">|</span>
            <span className="font-semibold text-gray-600">খুলনা, বাংলাদেশ</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/klngazette" target="_blank" className="hover:text-blue-600 transition" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" className="hover:text-sky-500 transition" title="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" className="hover:text-red-650 transition" title="Youtube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" className="hover:text-pink-600 transition" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* Epaper button link */}
            <Link 
              href="/epaper" 
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded transition text-xs shadow-sm hover:shadow"
            >
              <BookOpen size={12} />
              <span>ই-পেপার</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Brand logo banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col items-center justify-center border-b border-gray-100">
        <Link href="/" className="text-center group block">
          <Image
            src="/logo.png"
            alt="খুলনা গেজেট"
            width={320}
            height={100}
            className="h-16 sm:h-20 w-auto max-w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.02]"
            priority
          />
          <p className="text-[10px] sm:text-xs text-gray-400 mt-2 tracking-widest uppercase font-semibold">
            খবরের অন্তরালে খবর
          </p>
        </Link>
      </div>

      {/* Navigation bar container */}
      <PublicNavbar categories={categories} />
    </header>
  );
}
