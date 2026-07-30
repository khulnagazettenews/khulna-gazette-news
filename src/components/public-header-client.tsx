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

  // Order categories exactly as khulnagazette.com live menu:
  // 1. বাংলাদেশ 2. খুলনাঞ্চল 3. খেলা 4. বিনোদন 5. রাজনীতি 6. আন্তর্জাতিক 7. অর্থনীতি 8. শিক্ষা 9. মুক্ত ভাবনা 10. ইসলাম ও জীবন 11. গেজেট এক্সক্লুসিভ
  const categoryOrderMap: Record<string, number> = {
    'bangladesh': 1,
    'khulna': 2,
    'khulnanchal': 2,
    'khela': 3,
    'sports': 3,
    'entertainment': 4,
    'politics': 5,
    'international': 6,
    'economic': 7,
    'economy': 7,
    'education': 8,
    'free-thinking': 9,
    'mukto-bhabna': 9,
    'islam-and-life': 10,
    'gazette-exclusive': 11,
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = categoryOrderMap[a.slug] || a.order || 99;
    const orderB = categoryOrderMap[b.slug] || b.order || 99;
    return orderA - orderB;
  });

  const mainNavCats = sortedCategories.filter((c) => {
    const orderVal = categoryOrderMap[c.slug] || c.order || 99;
    return orderVal <= 10 && c.slug !== 'gazette-exclusive';
  });

  const moreCats = sortedCategories.filter((c) => {
    const orderVal = categoryOrderMap[c.slug] || c.order || 99;
    return orderVal > 11;
  });

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
      <div className="w-full max-w-full px-4 sm:px-8 lg:px-12 py-3 flex sm:py-3.5 items-center justify-between">
        {/* Left: Menu Toggle & Date Display */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 sm:min-w-[325px] shrink-0">
          {/* Hamburger menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-gray-700 hover:text-red-600 focus:outline-none p-1 shrink-0 cursor-pointer"
            title="Menu"
          >
            {mobileOpen ? <i className="fa fa-times text-2xl"></i> : <i className="fa fa-bars text-2xl"></i>}
          </button>

          {/* Date and Location Text */}
          <div className="hidden sm:flex flex-col select-none whitespace-nowrap leading-snug">
            <span className="text-base sm:text-lg font-extrabold text-[#000000] tracking-tight">খুলনা, বাংলাদেশ</span>
            <span className="text-xs sm:text-sm md:text-[15px] font-bold text-[#333333] mt-0.5">{currentDate}</span>
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
            className="text-red-600 hover:text-red-700 font-black text-[12px] sm:text-[13px] md:text-base hover:underline select-none tracking-tight flex items-center gap-1.5"
          >
            <i className="fa fa-newspaper-o"></i>
            <span>ই-পেপার</span>
          </Link>

          {/* Social Icons & Search Toggle */}
          <div className="flex items-center gap-2 sm:gap-3.5 mt-1 sm:mt-1.5 text-gray-800 select-none">
            {/* Social Icons (hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-3.5 text-base">
              <a href="https://www.facebook.com/klngazette" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition" title="Facebook">
                <i className="fa fa-facebook"></i>
              </a>
              <a href="https://twitter.com/khulnagazette" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition" title="Twitter">
                <i className="fa fa-twitter"></i>
              </a>
              <a href="https://www.youtube.com/channel/UCU_4M-GqxW5k1SONo5OoP4Q" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition" title="Youtube">
                <i className="fa fa-youtube-play"></i>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition" title="Instagram">
                <i className="fa fa-instagram"></i>
              </a>
            </div>

            {/* Separator (hidden on mobile) */}
            <span className="hidden sm:inline text-gray-300">|</span>

            {/* Search Icon button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:text-red-600 focus:outline-none p-1 cursor-pointer"
              title="Search"
            >
              <i className="fa fa-search text-base"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM NAVIGATION BAR ROW (DESKTOP) */}
      <div className="border-t border-b border-gray-200 sticky top-0 z-40 bg-white shadow-2xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden xl:flex items-center justify-between text-[18px] text-[#000000] font-light h-10">
            {/* Homepage Link with red Home Icon & bottom indicator */}
            <Link
              href="/"
              className={`hover:text-[#ED1C24] py-1.5 transition flex items-center justify-center relative group shrink-0 ${
                pathname === '/' ? 'text-[#ED1C24]' : 'text-[#ED1C24]'
              }`}
            >
              <span className="relative pb-0.5 flex items-center justify-center">
                <i className="fa fa-home text-[#ED1C24] text-lg"></i>
                <span className="absolute left-0 bottom-0 w-full h-[2.5px] bg-[#ED1C24]"></span>
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
                      className={`flex items-center gap-1 hover:text-[#ED1C24] py-1.5 transition focus:outline-none relative font-light text-[18px] ${
                        isActive ? 'text-[#ED1C24]' : 'text-[#000000]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronDown size={13} className="text-gray-700 group-hover:text-[#ED1C24]" />
                    </button>
                  ) : (
                    <Link
                      href={`/${cat.slug}`}
                      className={`hover:text-[#ED1C24] py-1.5 transition relative group font-light text-[18px] ${
                        isActive ? 'text-[#ED1C24]' : 'text-[#000000]'
                      }`}
                    >
                      <span>{cat.name}</span>
                    </Link>
                  )}

                  {/* Dropdown Menu for subcategories matching original theme */}
                  {hasSub && (
                    <div className="absolute left-0 mt-0 w-52 bg-black text-white shadow-xl py-1 hidden group-hover:block transition duration-150 z-50">
                      {cat.subCategories?.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/${cat.slug}/${sub.slug}`}
                          className="block px-4 py-2 hover:bg-transparent hover:text-red-500 text-[16px] font-light text-white transition"
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
                className={`hover:text-[#ED1C24] py-1.5 transition font-light text-[18px] relative group ${
                  pathname === `/${exclusiveCat.slug}` ? 'text-[#ED1C24]' : 'text-[#000000]'
                }`}
              >
                <span>{exclusiveCat.name}</span>
              </Link>
            )}

            {/* More dropdown */}
            {moreCats.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-[#ED1C24] py-1.5 transition focus:outline-none relative font-light text-[18px] text-[#000000]">
                  <span>আরও</span>
                  <ChevronDown size={13} className="text-gray-700" />
                </button>
                <div className="absolute right-0 mt-0 w-52 bg-black text-white shadow-xl py-1 hidden group-hover:block transition z-50">
                  {moreCats.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${cat.slug}`}
                      className="block px-4 py-2 hover:bg-transparent hover:text-red-500 text-[16px] font-light text-white transition"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link
                    href="/photo-gallery"
                    className="block px-4 py-2 hover:bg-red-50 hover:text-[#ED1C24] text-sm sm:text-base font-bold border-t border-gray-100"
                  >
                    ফটো গ্যালারি
                  </Link>
                  <Link
                    href="/video-gallery"
                    className="block px-4 py-2 hover:bg-red-50 hover:text-[#ED1C24] text-sm sm:text-base font-bold"
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
          <div className="w-full max-w-full px-4 sm:px-8 lg:px-12">
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
