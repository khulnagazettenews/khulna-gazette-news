'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
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

  const gregorianPart = `${dayName} । ${dateNum}শে ${monthName}, ${yearNum}`;

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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Defined Navigation Bar Items strictly matching khulnagazette.com order:
  // 1. বাংলাদেশ 2. খুলনাঞ্চল 3. খেলা 4. বিনোদন 5. রাজনীতি 6. আন্তর্জাতিক 7. অর্থনীতি 8. শিক্ষা 9. মুক্ত ভাবনা 10. ইসলাম ও জীবন 11. গেজেট এক্সক্লুসিভ
  const navOrderMap: Record<string, number> = {
    'bangladesh': 1,
    'khulna': 2,
    'khulnanchal': 2,
    'sports': 3,
    'khela': 3,
    'entertainment': 4,
    'binodon': 4,
    'politics': 5,
    'rajniti': 5,
    'international': 6,
    'antarjatik': 6,
    'economy': 7,
    'economic': 7,
    'orthoniti': 7,
    'education': 8,
    'shikkha': 8,
    'mukto-bhabna': 9,
    'free-thinking': 9,
    'islam': 10,
    'islam-and-life': 10,
    'gazette-exclusive': 11,
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = navOrderMap[a.slug] || a.order || 99;
    const orderB = navOrderMap[b.slug] || b.order || 99;
    return orderA - orderB;
  });

  const mainNavCats = sortedCategories.filter((c) => {
    const orderVal = navOrderMap[c.slug] || c.order || 99;
    return orderVal <= 10 && c.slug !== 'gazette-exclusive';
  });

  const moreCats = sortedCategories.filter((c) => {
    const orderVal = navOrderMap[c.slug] || c.order || 99;
    return orderVal > 11;
  });

  const exclusiveCat = categories.find((c) => c.slug === 'gazette-exclusive') || {
    id: 'exclusive',
    name: 'গেজেট এক্সক্লুসিভ',
    slug: 'gazette-exclusive',
    parentId: null,
    order: 11
  };

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
    <header className="w-full bg-white font-sans border-b border-[#e5e5e5]">
      {/* ================= TOP HEADER matching user exact mobile & desktop specification ================= */}
      {/* Mobile Top Header (100% Match with khulnagazette.com mobile screen) */}
      <div className="lg:hidden px-3 py-2.5 flex items-center justify-between border-b border-gray-100">
        {/* Left: Hamburger Icon */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#222222] hover:text-[#e60023] focus:outline-none p-1 cursor-pointer"
          title="মেনু"
        >
          <i className={`fa ${mobileOpen ? 'fa-times' : 'fa-bars'} text-[22px]`}></i>
        </button>

        {/* Center: Mobile Logo */}
        <Link href="/" className="flex justify-center">
          <img
            src="/logo.png"
            alt="Khulna Gazette"
            className="w-[175px] sm:w-[210px] h-auto object-contain"
          />
        </Link>

        {/* Right: e-Paper Link & Search Icon */}
        <div className="flex items-center gap-2.5">
          <Link href="/epaper" className="text-[#e60023] text-[16px] sm:text-[18px] font-bold hover:underline">
            ই-পেপার
          </Link>
          <button onClick={() => setSearchOpen(!searchOpen)} className="text-[#222222] hover:text-[#e60023] p-1" title="Search">
            <i className="fa fa-search text-[17px]"></i>
          </button>
        </div>
      </div>

      {/* Desktop Top Header (Ultra-wide desktop responsive 1520px) */}
      <div className="hidden lg:flex max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-4 justify-between items-center">
        {/* Left Side: Hamburger Menu + Location/Date */}
        <div className="left flex items-center gap-6 w-[33%] justify-start">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-[#222222] hover:text-[#e60023] focus:outline-none p-1 cursor-pointer transition"
            title="মেনু"
          >
            <i className={`fa ${mobileOpen ? 'fa-times' : 'fa-bars'} text-[28px]`}></i>
          </button>

          <div className="date select-none text-left">
            <h4
              className="text-[21px] font-normal text-[#000000] text-left"
              style={{
                fontFamily: 'Bangla, sans-serif',
                fontSize: '21px',
                fontWeight: 400,
                lineHeight: '23.1px',
                letterSpacing: '-0.2px',
                textAlign: 'left',
              }}
            >
              খুলনা, বাংলাদেশ
            </h4>
            <p suppressHydrationWarning className="mt-1.5 text-[#222222] text-[18px] leading-tight">{currentDate}</p>
          </div>
        </div>

        {/* Logo Center */}
        <div className="logo w-[34%] text-center flex justify-center">
          <Link href="/">
            <img
              src="/logo.png"
              alt="Khulna Gazette"
              className="w-[320px] max-w-full h-auto object-contain"
            />
          </Link>
        </div>

        {/* Right Side: e-Paper + Social + Search */}
        <div className="right w-[33%] flex flex-col items-end justify-center gap-2.5">
          <Link href="/epaper" className="epaper text-[#e60023] text-[22px] font-bold cursor-pointer hover:underline leading-none">
            ই-পেপার
          </Link>

          <div className="social flex items-center gap-6 text-[#222222] text-[22px] leading-none">
            <a href="https://www.facebook.com/klngazette" target="_blank" rel="noopener noreferrer" className="hover:text-[#e60023] transition" title="Facebook">
              <i className="fa fa-facebook-f"></i>
            </a>
            <a href="https://x.com/khulnagazette" target="_blank" rel="noopener noreferrer" className="hover:text-[#e60023] transition" title="Twitter">
              <i className="fa fa-twitter"></i>
            </a>
            <a href="https://www.youtube.com/@khulnagazette" target="_blank" rel="noopener noreferrer" className="hover:text-[#e60023] transition" title="Youtube">
              <i className="fa fa-youtube"></i>
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#e60023] transition" title="Instagram">
              <i className="fa fa-instagram"></i>
            </a>
            <button onClick={() => setSearchOpen(!searchOpen)} className="hover:text-[#e60023] cursor-pointer focus:outline-none" title="Search">
              <i className="fa fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ================= NAVBAR matching user exact specification ================= */}
      <nav className="navbar border-t border-[#efefef] bg-white sticky top-0 z-40 hidden md:block">
        <ul className="max-w-[1520px] mx-auto flex items-center justify-center gap-[24px] lg:gap-[32px] py-3 px-4 sm:px-6 lg:px-8 list-none whitespace-nowrap select-none overflow-visible">
          
          {/* Home Active Icon */}
          <li className={`cursor-pointer transition hover:text-[#e60023] ${pathname === '/' ? 'active text-[#e60023] text-[26px]' : 'text-[22px] text-[#000000]'}`}>
            <Link href="/" className="flex items-center justify-center">
              <i className={`fa fa-home ${pathname === '/' ? 'border-b-3 border-[#e60023] pb-3' : ''}`}></i>
            </Link>
          </li>

          {/* Category List */}
          {mainNavCats.map((cat) => {
            const isKhulnanchal = cat.slug === 'khulna' || cat.slug === 'khulnanchal';
            const khulnaSubs = [
              { name: 'খুলনা', slug: 'khulna' },
              { name: 'কুষ্টিয়া', slug: 'kustia' },
              { name: 'চুয়াডাঙ্গা', slug: 'chuadanga' },
              { name: 'ঝিনাইদহ', slug: 'jhineidha' },
              { name: 'নড়াইল', slug: 'narail' },
              { name: 'বাগেরহাট', slug: 'bagerhat' },
              { name: 'মাগুরা', slug: 'magura' },
              { name: 'মেহেরপুর', slug: 'meherpur' },
              { name: 'যশোর', slug: 'jashore' },
              { name: 'সাতক্ষীরা', slug: 'satkhira' },
            ];

            const subList = isKhulnanchal 
              ? (cat.subCategories && cat.subCategories.length > 0 ? cat.subCategories : khulnaSubs)
              : cat.subCategories;
            const hasSub = subList && subList.length > 0;
            const isActive = pathname ? (pathname === `/${cat.slug}` || pathname.startsWith(`/${cat.slug}/`)) : false;

            return (
              <li
                key={cat.id}
                className={`relative group text-[21px] lg:text-[23px] cursor-pointer transition hover:text-[#e60023] py-1 ${
                  isActive ? 'active text-[#e60023] font-bold' : 'text-[#000000]'
                }`}
              >
                {hasSub ? (
                  <div className="flex items-center gap-1">
                    <Link href={`/${cat.slug}`} className={`${isActive ? 'border-b-3 border-[#e60023] pb-3' : ''}`}>
                      {cat.name}
                    </Link>
                    <i className="fa fa-caret-down text-xs text-gray-700 group-hover:text-[#e60023] inline-block ml-0.5"></i>
                  </div>
                ) : (
                  <Link href={`/${cat.slug}`} className={`${isActive ? 'border-b-3 border-[#e60023] pb-3' : ''}`}>
                    {cat.name}
                  </Link>
                )}

                {/* Submenu Dropdown */}
                {hasSub && (
                  <div className="absolute left-0 top-full mt-1 w-52 bg-white text-[#222222] shadow-2xl py-2 hidden group-hover:block transition duration-150 z-50 rounded border border-gray-200 text-base">
                    {subList?.map((sub: any) => (
                      <Link
                        key={sub.slug}
                        href={`/${cat.slug}/${sub.slug}`}
                        className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}

          {/* Exclusive Section */}
          {exclusiveCat && (
            <li className={`text-[21px] lg:text-[23px] cursor-pointer transition hover:text-[#e60023] py-1 ${pathname === `/${exclusiveCat.slug}` ? 'active text-[#e60023] font-bold' : 'text-[#000000]'}`}>
              <Link href={`/${exclusiveCat.slug}`} className={`${pathname === `/${exclusiveCat.slug}` ? 'border-b-3 border-[#e60023] pb-3' : ''}`}>
                {exclusiveCat.name}
              </Link>
            </li>
          )}

          {/* More Dropdown */}
          <li className="relative group text-[21px] lg:text-[23px] cursor-pointer transition hover:text-[#e60023] text-[#000000] py-1">
            <div className="flex items-center gap-1">
              <span>আরও</span>
              <i className="fa fa-caret-down text-xs text-gray-700 group-hover:text-[#e60023] inline-block ml-0.5"></i>
            </div>
            <div className="absolute right-0 top-full mt-1 w-64 bg-white text-[#222222] shadow-2xl py-2 hidden group-hover:block transition z-50 rounded border border-gray-200 text-base">
              <Link href="/lifestyle" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                লাইফস্টাইল
              </Link>
              <Link href="/technology" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                তথ্যপ্রযুক্তি
              </Link>
              <Link href="/health" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                স্বাস্থ্য ও চিকিৎসা
              </Link>
              <Link href="/photo-gallery" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                ফটো গ্যালারি
              </Link>
              <Link href="/video-gallery" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                ভিডিও গ্যালারি
              </Link>
              <Link href="/literature" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                সাহিত্য
              </Link>
              <Link href="/chitro-bichitro" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                চিত্র বিচিত্র
              </Link>
              <Link href="/social-media" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                সোশ্যাল মিডিয়া
              </Link>
              <Link href="/converter" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                কনভার্টার
              </Link>
              <Link href="/greeting-cards" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                শুভেচ্ছা কার্ড
              </Link>
              <Link href="/jobs" className="block px-4 py-2 hover:bg-[#e60023] hover:text-white text-[17px] font-medium text-[#333333] transition">
                চাকরি
              </Link>
            </div>
          </li>
        </ul>
      </nav>

      {/* Floating Search Input Form */}
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

      {/* Mobile Drawer Navigation Overlay (Exact Match with khulnagazette.com Screenshot) */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex justify-start animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        >
          {/* Main Slide-out Drawer Panel */}
          <div className="w-[82%] max-w-[340px] bg-white h-full overflow-y-auto shadow-2xl flex flex-col justify-start relative">
            
            {/* Top Light Grey Header with Red Home Icon */}
            <div className="bg-[#e5e5e5] px-5 py-4 flex items-center justify-start border-b border-gray-300">
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-[#e60023] text-[24px]">
                <i className="fa fa-home"></i>
              </Link>
            </div>

            {/* Nav Menu Links List */}
            <div className="px-5 py-3 divide-y divide-gray-100 font-sans">
              <Link
                href="/bangladesh"
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023]"
              >
                বাংলাদেশ
              </Link>

              {/* খুলনাঞ্চল with Caret Down */}
              <div>
                <button
                  onClick={() => toggleDropdown('khulna')}
                  className="w-full flex items-center justify-between py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023] text-left focus:outline-none"
                >
                  <span>খুলনাঞ্চল</span>
                  <i className={`fa fa-caret-down text-sm transition transform ${activeDropdown === 'khulna' ? 'rotate-180' : ''}`}></i>
                </button>
                {activeDropdown === 'khulna' && (
                  <div className="pl-4 pb-2 space-y-2 text-[17px] font-medium text-gray-700">
                    <Link href="/khulna/khulna" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">খুলনা</Link>
                    <Link href="/khulna/kustia" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">কুষ্টিয়া</Link>
                    <Link href="/khulna/chuadanga" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">চুয়াডাঙ্গা</Link>
                    <Link href="/khulna/jhineidha" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">ঝিনাইদহ</Link>
                    <Link href="/khulna/narail" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">নড়াইল</Link>
                    <Link href="/khulna/bagerhat" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">বাগেরহাট</Link>
                    <Link href="/khulna/magura" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">মাগুরা</Link>
                    <Link href="/khulna/meherpur" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">মেহেরপুর</Link>
                    <Link href="/khulna/jashore" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">যশোর</Link>
                    <Link href="/khulna/satkhira" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">সাতক্ষীরা</Link>
                  </div>
                )}
              </div>

              <Link href="/sports" onClick={() => setMobileOpen(false)} className="block py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023]">
                খেলা
              </Link>
              <Link href="/entertainment" onClick={() => setMobileOpen(false)} className="block py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023]">
                বিনোদন
              </Link>
              <Link href="/politics" onClick={() => setMobileOpen(false)} className="block py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023]">
                রাজনীতি
              </Link>
              <Link href="/international" onClick={() => setMobileOpen(false)} className="block py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023]">
                আন্তর্জাতিক
              </Link>
              <Link href="/economy" onClick={() => setMobileOpen(false)} className="block py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023]">
                অর্থনীতি
              </Link>
              <Link href="/education" onClick={() => setMobileOpen(false)} className="block py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023]">
                শিক্ষা
              </Link>
              <Link href="/free-thinking" onClick={() => setMobileOpen(false)} className="block py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023]">
                মুক্ত ভাবনা
              </Link>
              <Link href="/islam-life" onClick={() => setMobileOpen(false)} className="block py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023]">
                ইসলাম ও জীবন
              </Link>
              <Link href="/exclusive" onClick={() => setMobileOpen(false)} className="block py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023]">
                গেজেট এক্সক্লুসিভ
              </Link>

              {/* আরও with Caret Down */}
              <div>
                <button
                  onClick={() => toggleDropdown('more')}
                  className="w-full flex items-center justify-between py-3 text-[19px] font-bold text-[#222222] hover:text-[#e60023] text-left focus:outline-none"
                >
                  <span>আরও</span>
                  <i className={`fa fa-caret-down text-sm transition transform ${activeDropdown === 'more' ? 'rotate-180' : ''}`}></i>
                </button>
                {activeDropdown === 'more' && (
                  <div className="pl-4 pb-2 space-y-2 text-[17px] font-medium text-gray-700">
                    <Link href="/lifestyle" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">লাইফস্টাইল</Link>
                    <Link href="/technology" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">তথ্যপ্রযুক্তি</Link>
                    <Link href="/health" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">স্বাস্থ্য ও চিকিৎসা</Link>
                    <Link href="/photo-gallery" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">ফটো গ্যালারি</Link>
                    <Link href="/video-gallery" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">ভিডিও গ্যালারি</Link>
                    <Link href="/literature" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">সাহিত্য</Link>
                    <Link href="/chitro-bichitro" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">চিত্র বিচিত্র</Link>
                    <Link href="/social-media" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">সোশ্যাল মিডিয়া</Link>
                    <Link href="/converter" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">কনভার্টার</Link>
                    <Link href="/greeting-cards" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">শুভেচ্ছা কার্ড</Link>
                    <Link href="/jobs" onClick={() => setMobileOpen(false)} className="block py-1 hover:text-[#e60023]">চাকরি</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Right Circle Close Button (X) Outside Drawer */}
          <div className="pt-6 pl-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="w-10 h-10 rounded-full border border-gray-400 bg-white/90 text-gray-700 hover:text-black flex items-center justify-center shadow-lg cursor-pointer"
              title="বন্ধ করুন"
            >
              <i className="fa fa-times text-xl"></i>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
