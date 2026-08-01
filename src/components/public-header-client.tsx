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
      {/* ================= TOP HEADER matching user exact specification ================= */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0">
        
        {/* Left Side: Hamburger Menu + Location/Date */}
        <div className="left flex items-start gap-6 w-full lg:w-[33%] justify-start">
          <div className="menu">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-[#222222] hover:text-[#e60023] focus:outline-none p-1 cursor-pointer transition"
              title="মেনু"
            >
              <i className={`fa ${mobileOpen ? 'fa-times' : 'fa-bars'} text-[28px]`}></i>
            </button>
          </div>

          <div className="date select-none">
            <h4 className="text-[22px] font-bold text-[#000000] leading-tight">খুলনা, বাংলাদেশ</h4>
            <p className="mt-1.5 text-[#222222] text-[18px] leading-tight">{currentDate}</p>
          </div>
        </div>

        {/* Logo Center */}
        <div className="logo w-full lg:w-[34%] text-center flex justify-center">
          <Link href="/">
            <img
              src="/logo.png"
              alt="Khulna Gazette"
              className="w-[320px] max-w-full h-auto object-contain"
            />
          </Link>
        </div>

        {/* Right Side: e-Paper + Social + Search */}
        <div className="right w-full lg:w-[33%] flex justify-end items-center gap-[35px]">
          <Link href="/epaper" className="epaper text-[#e60023] text-[22px] font-bold cursor-pointer hover:underline">
            ই-পেপার
          </Link>

          <div className="social flex items-center gap-6 text-[#222222] text-[22px]">
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
      <nav className="navbar border-t border-[#efefef] bg-white sticky top-0 z-40">
        <ul className="max-w-[1400px] mx-auto flex items-center justify-center gap-[28px] lg:gap-[34px] py-4 px-4 list-none overflow-x-auto whitespace-nowrap select-none no-scrollbar">
          
          {/* Home Active Icon */}
          <li className={`cursor-pointer transition hover:text-[#e60023] ${pathname === '/' ? 'active text-[#e60023] text-[28px]' : 'text-[24px] text-[#000000]'}`}>
            <Link href="/" className="flex items-center justify-center">
              <i className={`fa fa-home ${pathname === '/' ? 'border-b-3 border-[#e60023] pb-3.5' : ''}`}></i>
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
                className={`relative group text-[24px] cursor-pointer transition hover:text-[#e60023] ${
                  isActive ? 'active text-[#e60023] text-[28px]' : 'text-[#000000]'
                }`}
              >
                {hasSub ? (
                  <div className="flex items-center gap-1.5">
                    <Link href={`/${cat.slug}`} className={`${isActive ? 'border-b-3 border-[#e60023] pb-3.5' : ''}`}>
                      {cat.name}
                    </Link>
                    <ChevronDown size={18} className="text-gray-700 group-hover:text-[#e60023] inline" />
                  </div>
                ) : (
                  <Link href={`/${cat.slug}`} className={`${isActive ? 'border-b-3 border-[#e60023] pb-3.5' : ''}`}>
                    {cat.name}
                  </Link>
                )}

                {/* Submenu Dropdown */}
                {hasSub && (
                  <div className="absolute left-0 mt-2 w-52 bg-[#111827] text-white shadow-xl py-2 hidden group-hover:block transition duration-150 z-50 rounded-b text-base">
                    {subList?.map((sub: any) => (
                      <Link
                        key={sub.slug}
                        href={`/${cat.slug}/${sub.slug}`}
                        className="block px-4 py-2 hover:bg-[#e60023] text-[18px] font-normal text-white transition"
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
            <li className={`text-[24px] cursor-pointer transition hover:text-[#e60023] ${pathname === `/${exclusiveCat.slug}` ? 'active text-[#e60023] text-[28px]' : 'text-[#000000]'}`}>
              <Link href={`/${exclusiveCat.slug}`} className={`${pathname === `/${exclusiveCat.slug}` ? 'border-b-3 border-[#e60023] pb-3.5' : ''}`}>
                {exclusiveCat.name}
              </Link>
            </li>
          )}

          {/* More Dropdown */}
          <li className="relative group text-[24px] cursor-pointer transition hover:text-[#e60023] text-[#000000]">
            <div className="flex items-center gap-1.5">
              <span>আরও</span>
              <ChevronDown size={18} className="text-gray-700 group-hover:text-[#e60023] inline" />
            </div>
            <div className="absolute right-0 mt-2 w-60 bg-[#111827] text-white shadow-xl py-2 hidden group-hover:block transition z-50 rounded-b text-base">
              <Link href="/sports" className="block px-4 py-2 hover:bg-[#e60023] text-[18px] font-normal text-white transition">
                ফুটবল বিশ্বকাপ-২০২৬
              </Link>
              <Link href="/photo-gallery" className="block px-4 py-2 hover:bg-[#e60023] text-[18px] font-normal text-white transition">
                ফটো গ্যালারি
              </Link>
              <Link href="/video-gallery" className="block px-4 py-2 hover:bg-[#e60023] text-[18px] font-normal text-white transition">
                ভিডিও গ্যালারি
              </Link>
              <Link href="/technology" className="block px-4 py-2 hover:bg-[#e60023] text-[18px] font-normal text-white transition">
                আইটি
              </Link>
              <Link href="/health" className="block px-4 py-2 hover:bg-[#e60023] text-[18px] font-normal text-white transition">
                চিকিৎসা
              </Link>
              <Link href="/literature" className="block px-4 py-2 hover:bg-[#e60023] text-[18px] font-normal text-white transition">
                সাহিত্য
              </Link>
              <Link href="/chitro-bichitro" className="block px-4 py-2 hover:bg-[#e60023] text-[18px] font-normal text-white transition">
                চিত্র বিচিত্র
              </Link>
              <Link href="/social-media" className="block px-4 py-2 hover:bg-[#e60023] text-[18px] font-normal text-white transition">
                সোশ্যাল মিডিয়া
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

      {/* Mobile Drawer Navigation (When hamburger clicked) */}
      {mobileOpen && (
        <div className="bg-white text-[#262626] border-b border-gray-200 xl:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <div className="flex flex-col pb-3 mb-2 border-b border-gray-100 text-xs font-bold text-gray-800 leading-tight">
              <span>খুলনা, বাংলাদেশ</span>
              <span className="text-[11px] text-gray-500 font-normal mt-0.5">{currentDate}</span>
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
              className="block px-3 py-2 rounded-md hover:bg-gray-50 text-base font-semibold"
            >
              ফটো গ্যালারি
            </Link>
            <Link
              href="/video-gallery"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md hover:bg-gray-50 text-base font-semibold"
            >
              ভিডিও গ্যালারি
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
