'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, ChevronDown, Home } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order: number;
  subCategories?: Category[];
}

interface PublicHeaderClientProps {
  categories: Category[];
  formattedDate: string;
}

function getBengaliFullDateClient() {
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

  // Gregorian part: বুধবার, ২২শে জুলাই, ২০২৬
  const gregorianPart = `${dayName} । ${dateNum}শে ${monthName}, ${yearNum}`;

  // Bengali calendar part: ৭ই শ্রাবণ, ১৪৩৩
  let bYear = date.getFullYear() - 593;
  if (date.getMonth() < 3 || (date.getMonth() === 3 && date.getDate() < 14)) {
    bYear = date.getFullYear() - 594;
  }

  const monthStarts = [
    { name: 'মাঘ', m: 0, d: 15 },
    { name: 'ফাল্গুন', m: 1, d: 14 },
    { name: 'চৈত্র', m: 2, d: 15 },
    { name: 'বৈশাখ', m: 3, d: 14 },
    { name: 'জ্যৈষ্ঠ', m: 4, d: 15 },
    { name: 'আষাঢ়', m: 5, d: 16 },
    { name: 'শ্রাবণ', m: 6, d: 16 },
    { name: 'ভাদ্র', m: 7, d: 16 },
    { name: 'আশ্বিন', m: 8, d: 16 },
    { name: 'কার্তিক', m: 9, d: 16 },
    { name: 'অগ্রহায়ণ', m: 10, d: 15 },
    { name: 'পৌষ', m: 11, d: 15 },
  ];

  let bMonthName = '';
  let bDay = 1;

  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  for (let i = 11; i >= 0; i--) {
    const start = monthStarts[i];
    const startDate = new Date(date.getFullYear(), start.m, start.d);
    if (d1 >= startDate) {
      bMonthName = start.name;
      const diffTime = d1.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      bDay = diffDays + 1;
      break;
    }
  }

  if (!bMonthName) {
    bMonthName = 'পৌষ';
    const startDate = new Date(date.getFullYear() - 1, 11, 15);
    const diffTime = d1.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    bDay = diffDays + 1;
  }

  const suffix = bDay === 1 ? 'লা' : (bDay === 2 || bDay === 3 || bDay === 4) ? 'রা' : 'ই';
  const bengaliPart = `${toBengaliNumber(bDay)}${suffix} ${bMonthName}, ${toBengaliNumber(bYear)}`;

  return `${gregorianPart} । ${bengaliPart}`;
}

export default function PublicHeaderClient({ categories, formattedDate }: PublicHeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(formattedDate);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setCurrentDate(getBengaliFullDateClient());
  }, []);

  // Split categories: main vs "more" (order > 11)
  const mainNavCats = categories.filter((c) => c.order <= 11 && c.slug !== 'gazette-exclusive');
  const moreCats = categories.filter((c) => c.order > 11);
  const exclusiveCat = categories.find((c) => c.slug === 'gazette-exclusive');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleDropdown = (id: string) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  return (
    <div className="bg-white font-sans w-full">
      {/* 1. TOP HEADER ROW */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex sm:py-3.5 items-center justify-between">
        {/* Left: Menu Toggle & Date Display */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 sm:min-w-[325px] shrink-0">
          {/* Hamburger menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-gray-700 hover:text-red-600 focus:outline-none p-1 shrink-0 cursor-pointer"
            title="Menu"
          >
            {mobileOpen ? <X size={26} className="stroke-[2.5]" /> : <Menu size={26} className="stroke-[2.5]" />}
          </button>

          {/* Date and Location Text */}
          <div className="hidden sm:flex flex-col text-xs sm:text-sm font-bold text-gray-800 leading-tight select-none whitespace-nowrap">
            <span>খুলনা, বাংলাদেশ</span>
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">{currentDate}</span>
          </div>
        </div>

        {/* Center: Brand Logo */}
        <div className="flex justify-center shrink-0 px-2 sm:px-4">
          <Link href="/" className="block">
            <Image
              src="/logo.png"
              alt="খুলনা গেজেট"
              width={290}
              height={90}
              className="h-9 sm:h-11 md:h-13 lg:h-16 w-auto max-w-full object-contain select-none"
              priority
            />
          </Link>
        </div>

        {/* Right: e-Paper & Social Media / Search */}
        <div className="flex flex-col items-end flex-1 sm:min-w-[220px] shrink-0 gap-1">
          {/* e-Paper Link */}
          <Link
            href="/epaper"
            className="text-red-600 hover:text-red-700 font-black text-[12px] sm:text-[13px] md:text-base hover:underline select-none tracking-tight"
          >
            ই-পেপার
          </Link>

          {/* Social Icons & Search Toggle */}
          <div className="flex items-center gap-2 sm:gap-3.5 mt-1 sm:mt-1.5 text-gray-800 select-none">
            {/* Social Icons (hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-3.5">
              {/* Facebook */}
              <a href="https://www.facebook.com/klngazette" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              {/* Twitter */}
              <a href="https://twitter.com/khulnagazette" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition" title="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/channel/UCU_4M-GqxW5k1SONo5OoP4Q" target="_blank" rel="noopener noreferrer" className="hover:text-red-650 transition" title="Youtube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>

            {/* Separator (hidden on mobile) */}
            <span className="hidden sm:inline text-gray-300">|</span>

            {/* Search Icon button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:text-red-650 focus:outline-none p-1 cursor-pointer"
              title="Search"
            >
              <Search size={19} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM NAVIGATION BAR ROW (DESKTOP) */}
      <div className="border-t border-b border-gray-200 sticky top-0 z-40 bg-white shadow-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden xl:flex items-center justify-center space-x-6 text-[0.95rem] text-[#262626] font-normal h-11">
            {/* Homepage Link with red Home Icon */}
            <Link
              href="/"
              className={`hover:text-[#ED1C24] py-2 transition flex items-center justify-center relative group ${
                pathname === '/' ? 'text-[#ED1C24]' : 'text-[#262626]'
              }`}
            >
              <span className="relative py-1 flex items-center justify-center">
                <Home size={17} className="text-[#ED1C24] fill-current" />
                <span
                  className={`absolute left-0 bottom-0 h-[2px] bg-[#ED1C24] transition-all duration-300 ${
                    pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </span>
            </Link>

            {mainNavCats.map((cat) => {
              const hasSub = cat.subCategories && cat.subCategories.length > 0;
              const isActive = pathname ? (pathname === `/${cat.slug}` || pathname.startsWith(`/${cat.slug}/`)) : false;

              return (
                <div key={cat.id} className="relative group">
                  {hasSub ? (
                    <button
                      onClick={() => toggleDropdown(cat.id)}
                      className={`flex items-center gap-1 hover:text-[#ED1C24] py-2 transition focus:outline-none relative ${
                        isActive ? 'text-[#ED1C24]' : 'text-[#262626]'
                      }`}
                    >
                      <span className="relative py-1">
                        {cat.name}
                        <span
                          className={`absolute left-0 bottom-0 h-[2px] bg-[#ED1C24] transition-all duration-300 ${
                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                          }`}
                        ></span>
                      </span>
                      <ChevronDown size={12} className="text-gray-400 group-hover:text-[#ED1C24]" />
                    </button>
                  ) : (
                    <Link
                      href={`/${cat.slug}`}
                      className={`hover:text-[#ED1C24] py-2 transition relative group ${
                        isActive ? 'text-[#ED1C24]' : 'text-[#262626]'
                      }`}
                    >
                      <span className="relative py-1">
                        {cat.name}
                        <span
                          className={`absolute left-0 bottom-0 h-[2px] bg-[#ED1C24] transition-all duration-300 ${
                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                          }`}
                        ></span>
                      </span>
                    </Link>
                  )}

                  {/* Dropdown Menu for subcategories */}
                  {hasSub && (
                    <div className="absolute left-0 mt-0 w-48 bg-white text-[#262626] rounded-b-lg shadow-xl py-2 hidden group-hover:block border-t-2 border-[#ED1C24] transition duration-150 z-50">
                      {cat.subCategories?.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/${cat.slug}/${sub.slug}`}
                          className="block px-4 py-2 hover:bg-red-50 hover:text-[#ED1C24] text-xs font-semibold"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Exclusive Section Link */}
            {exclusiveCat && (
              <Link
                href={`/${exclusiveCat.slug}`}
                className={`hover:text-[#ED1C24] py-2 transition font-normal relative group ${
                  pathname === `/${exclusiveCat.slug}` ? 'text-[#ED1C24]' : ''
                }`}
              >
                <span className="relative py-1">
                  {exclusiveCat.name}
                  <span
                    className={`absolute left-0 bottom-0 h-[2px] bg-[#ED1C24] transition-all duration-300 ${
                      pathname === `/${exclusiveCat.slug}` ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </span>
              </Link>
            )}

            {/* More dropdown */}
            {moreCats.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-[#ED1C24] py-2 transition focus:outline-none relative">
                  <span className="relative py-1">
                    <span>আরও</span>
                    <span className="absolute left-0 bottom-0 h-[2px] bg-[#ED1C24] transition-all duration-300 w-0 group-hover:w-full"></span>
                  </span>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>
                <div className="absolute right-0 mt-0 w-48 bg-white text-[#262626] rounded-b-lg shadow-xl py-2 hidden group-hover:block border-t-2 border-[#ED1C24] z-50 transition">
                  {moreCats.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${cat.slug}`}
                      className="block px-4 py-2 hover:bg-red-50 hover:text-[#ED1C24] text-xs font-semibold"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link
                    href="/photo-gallery"
                    className="block px-4 py-2 hover:bg-red-50 hover:text-[#ED1C24] text-xs font-semibold border-t border-gray-100"
                  >
                    ফটো গ্যালারি
                  </Link>
                  <Link
                    href="/video-gallery"
                    className="block px-4 py-2 hover:bg-red-50 hover:text-[#ED1C24] text-xs font-semibold"
                  >
                    ভিডিও গ্যালারি
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Search Bar Overlay */}
      {searchOpen && (
        <div className="bg-gray-50 py-3 border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="কি খুঁজছেন লিখুন এবং এন্টার চাপুন..."
                className="w-full bg-white border border-gray-300 text-[#262626] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#ED1C24]"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#ED1C24] hover:bg-red-700 text-white px-5 rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                খুঁজুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Nav menu Drawer (Visible when hamburger clicked) */}
      {mobileOpen && (
        <div className="bg-white text-[#262626] border-b border-gray-200 xl:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {/* Location & Date for Mobile (under hamburger when open) */}
            <div className="md:hidden flex flex-col pb-3 mb-2 border-b border-gray-100 text-[11px] font-bold text-gray-800 leading-tight">
              <span>খুলনা, বাংলাদেশ</span>
              <span className="text-[10px] text-gray-500 font-medium mt-0.5">{currentDate}</span>
            </div>

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md hover:bg-gray-50 text-base font-semibold ${
                pathname === '/' ? 'text-[#ED1C24]' : ''
              }`}
            >
              হোম
            </Link>

            {categories.map((cat) => {
              const hasSub = cat.subCategories && cat.subCategories.length > 0;
              const isDropdownActive = activeDropdown === cat.id;
              const isActive = pathname ? (pathname === `/${cat.slug}` || pathname.startsWith(`/${cat.slug}/`)) : false;

              return (
                <div key={cat.id} className="space-y-1">
                  {hasSub ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 text-base font-semibold text-left focus:outline-none ${
                          isActive ? 'text-[#ED1C24]' : ''
                        }`}
                      >
                        <span>{cat.name}</span>
                        <ChevronDown size={16} className={`transform transition ${isDropdownActive ? 'rotate-180' : ''}`} />
                      </button>

                      {isDropdownActive && (
                        <div className="pl-6 bg-gray-50/50 rounded-md py-1">
                          {cat.subCategories?.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/${cat.slug}/${sub.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="block px-3 py-2 text-sm text-slate-600 hover:text-[#ED1C24]"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={`/${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 rounded-md hover:bg-gray-50 text-base font-semibold ${
                        isActive ? 'text-[#ED1C24]' : ''
                      }`}
                    >
                      {cat.name}
                    </Link>
                  )}
                </div>
              );
            })}

            <Link
              href="/photo-gallery"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md hover:bg-gray-50 text-base font-semibold ${
                pathname === '/photo-gallery' ? 'text-[#ED1C24]' : ''
              }`}
            >
              ফটো গ্যালারি
            </Link>
            <Link
              href="/video-gallery"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md hover:bg-gray-50 text-base font-semibold ${
                pathname === '/video-gallery' ? 'text-[#ED1C24]' : ''
              }`}
            >
              ভিডিও গ্যালারি
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
