'use client';

import { useState } from 'react';
import Link from 'next/link';
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

interface NavbarProps {
  categories: Category[];
}

export default function PublicNavbar({ categories }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 text-[18px] font-normal">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-start gap-4 sm:gap-6 h-10 overflow-x-auto no-scrollbar">
          {/* Mobile menu toggle */}
          <div className="flex xl:hidden shrink-0">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-[#000000] hover:text-[#ED1C24] focus:outline-none"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Desktop Nav menu */}
          <div className="hidden xl:flex items-center space-x-6 text-[#000000] font-normal text-[22px] whitespace-nowrap">
            {/* Homepage Link with Red Home Icon & Bottom Line matching screenshot */}
            <Link
              href="/"
              className={`py-1.5 transition flex items-center justify-center relative group shrink-0 ${
                pathname === '/' ? 'text-[#ED1C24]' : 'text-[#ED1C24]'
              }`}
            >
              <span className="relative pb-1">
                <Home size={22} className="text-[#ED1C24] fill-current" />
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
                      className={`flex items-center gap-1 hover:text-[#ED1C24] py-1.5 transition focus:outline-none relative font-light text-[22px] ${
                        isActive ? 'text-[#ED1C24]' : 'text-[#000000]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronDown size={14} className="text-gray-700 group-hover:text-[#ED1C24]" />
                    </button>
                  ) : (
                    <Link
                      href={`/${cat.slug}`}
                      className={`hover:text-[#ED1C24] py-1.5 transition relative group font-light text-[22px] ${
                        isActive ? 'text-[#ED1C24]' : 'text-[#000000]'
                      }`}
                    >
                      <span>{cat.name}</span>
                    </Link>
                  )}

                  {/* Dropdown Menu for subcategories matching original khulnagazette.com theme */}
                  {hasSub && (
                    <div className="absolute left-0 mt-0 w-52 bg-black text-white shadow-xl py-1 hidden group-hover:block transition duration-150 z-50">
                      {cat.subCategories?.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/${cat.slug}/${sub.slug}`}
                          className="block px-4 py-2 hover:bg-transparent hover:text-red-500 text-[16px] font-normal text-white transition"
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
                className={`hover:text-[#ED1C24] py-2 transition font-normal relative group`}
              >
                <span className="relative py-0.5">
                  {exclusiveCat.name}
                </span>
              </Link>
            )}

            {/* More dropdown */}
            {moreCats.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-[#ED1C24] py-2 transition focus:outline-none relative font-normal">
                  <span className="relative py-0.5">
                    <span>আরও</span>
                  </span>
                  <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 mt-0 w-56 bg-black text-white shadow-xl py-1 hidden group-hover:block transition z-50">
                  {moreCats.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${cat.slug}`}
                      className="block px-4 py-2 hover:bg-transparent hover:text-red-500 text-[16px] font-normal text-white transition"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {/* Static link options */}
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

          {/* Search Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#262626] hover:text-[#ED1C24] p-2 focus:outline-none"
              title="অনুসন্ধান"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Search Bar Overlay */}
      {searchOpen && (
        <div className="bg-gray-50 py-3 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="bg-[#ED1C24] hover:bg-red-700 text-white px-5 rounded-lg text-sm font-semibold transition"
              >
                খুঁজুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Nav menu Drawer */}
      {mobileOpen && (
        <div className="xl:hidden bg-white text-[#262626] border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
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

            {/* Static Media Links in Mobile Menu */}
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
    </nav>
  );
}
