'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Newspaper, 
  FileImage, 
  Image as ImageIcon, 
  Video, 
  Clock, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  Menu,
  X,
  Users,
  Megaphone,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = (session?.user as any)?.role || 'REPORTER';

  // Redirect Subscribers out of admin panel
  useEffect(() => {
    if (status === 'authenticated' && role === 'SUBSCRIBER') {
      router.replace('/');
    }
  }, [status, role, router]);

  // Bypass layout wrapper on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (status === 'authenticated' && role === 'SUBSCRIBER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Build navigation items based on role
  const navigation = [];

  // 1. Dashboard (Allowed for all roles except Subscriber)
  if (role !== 'SUBSCRIBER') {
    navigation.push({ name: 'ড্যাশবোর্ড', href: '/admin', icon: LayoutDashboard });
  }

  // 2. Categories & Special Topics (Super Admin, Admin, Editor, Sub Editor)
  if (['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role)) {
    navigation.push(
      { name: 'ক্যাটাগরি ম্যানেজমেন্ট', href: '/admin/categories', icon: FolderKanban },
      { name: 'বিশেষ প্রতিবেদন সেকশন', href: '/admin/special-topics', icon: Sparkles }
    );
  }

  // 3. News Articles (Super Admin, Admin, Editor, Sub Editor, Reporter, Contributor)
  if (['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes(role)) {
    navigation.push({ name: 'খবরসমূহ', href: '/admin/news', icon: Newspaper });
  }

  // 4. Media & Prayer Times (Super Admin, Admin, Editor, Sub Editor)
  if (['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role)) {
    navigation.push(
      { name: 'ই-পেপার', href: '/admin/epaper', icon: FileImage },
      { name: 'ফটো গ্যালারি', href: '/admin/photos', icon: ImageIcon },
      { name: 'ভিডিও গ্যালারি', href: '/admin/videos', icon: Video },
      { name: 'নামাজের সময়সূচি', href: '/admin/prayer-times', icon: Clock }
    );
  }

  // 5. Advertisements (Super Admin, Admin, Advertisement Manager)
  if (['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER'].includes(role)) {
    navigation.push({ name: 'বিজ্ঞাপন ম্যানেজমেন্ট', href: '/admin/advertisements', icon: Megaphone });
  }

  // 6. Comments (Super Admin, Admin, Editor)
  if (['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role)) {
    navigation.push({ name: 'মন্তব্যসমূহ', href: '/admin/comments', icon: MessageSquare });
  }

  // 7. Users & Roles (Super Admin, Admin)
  if (['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    navigation.push({ name: 'ইউজার ও রোলস', href: '/admin/users', icon: Users });
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex font-sans antialiased text-slate-800">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between border-r border-slate-800/80 shadow-2xl transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-600/30 group-hover:scale-105 transition duration-300">
                KG
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-white tracking-tight leading-tight">
                  খুলনা গেজেট
                </span>
                <span className="text-[10px] text-teal-400 font-mono tracking-wider font-semibold uppercase">
                  Admin Portal
                </span>
              </div>
            </Link>
            <button 
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/60 transition" 
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="px-4 pt-5 pb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 font-mono">
              মূল মেনু
            </p>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = pathname ? (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) : false;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 group ${
                      active 
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20 font-bold' 
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className={active ? 'text-white' : 'text-slate-400 group-hover:text-red-400 transition-colors'} />
                      <span>{item.name}</span>
                    </div>
                    {active && <ChevronRight size={14} className="text-white/80" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile Card & Signout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3.5">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800/70">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white font-extrabold text-xs shadow-xs border border-white/10">
                {session?.user?.name ? session.user.name.charAt(0) : <UserIcon size={16} />}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {session?.user?.name || 'অ্যাডমিন'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-teal-400 font-medium">
                <ShieldCheck size={11} className="shrink-0" />
                <span className="truncate">
                  {(() => {
                    const r = (session?.user as any)?.role;
                    if (r === 'SUPER_ADMIN') return 'সুপার অ্যাডমিন';
                    if (r === 'ADMIN') return 'অ্যাডমিন';
                    if (r === 'EDITOR') return 'সম্পাদক';
                    if (r === 'SUB_EDITOR') return 'সহকারী সম্পাদক';
                    if (r === 'REPORTER') return 'প্রতিবেদক';
                    if (r === 'CONTRIBUTOR') return 'কন্ট্রিবিউটর';
                    if (r === 'ADVERTISEMENT_MANAGER') return 'বিজ্ঞাপন ম্যানেজার';
                    if (r === 'SUBSCRIBER') return 'সাবস্ক্রাইবার';
                    return 'প্রতিবেদক';
                  })()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-900/50 text-xs font-semibold py-2 rounded-xl transition duration-200"
          >
            <LogOut size={14} />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-6 shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition focus:outline-none" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-slate-800 hidden sm:block">
              খুলনা গেজেট অ্যাডমিন প্যানেল
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/70 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>সিস্টেম সচল রয়েছে</span>
            </div>

            <Link 
              href="/" 
              target="_blank" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition duration-200"
            >
              <Globe size={14} className="text-teal-600" />
              <span>ওয়েবসাইট দেখুন</span>
              <ExternalLink size={12} className="text-slate-400 ml-0.5" />
            </Link>
          </div>
        </header>

        {/* Dashboard Pages Scroll Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
