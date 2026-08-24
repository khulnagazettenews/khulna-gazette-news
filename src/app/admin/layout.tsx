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
  ShieldCheck,
  ArrowUpDown,
  PlusCircle,
  Search,
  Bell,
  Home,
  Briefcase
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [counts, setCounts] = useState<{ pendingComments: number; draftNews: number }>({
    pendingComments: 0,
    draftNews: 0,
  });

  const role = (session?.user as any)?.role || 'REPORTER';

  // Redirect Subscribers out of admin panel
  useEffect(() => {
    if (status === 'authenticated' && role === 'SUBSCRIBER') {
      router.replace('/');
    }
  }, [status, role, router]);

  // Fetch count badges for sidebar
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/admin/counts')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.pendingComments === 'number') {
            setCounts(data);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [status, pathname]);

  // Bypass layout wrapper on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (status === 'authenticated' && role === 'SUBSCRIBER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Build navigation items based on role
  interface NavSubItem {
    name: string;
    href: string;
    icon: any;
  }
  interface NavItem {
    name: string;
    href?: string;
    icon: any;
    badge?: number | null;
    badgeColor?: string;
    subItems?: NavSubItem[];
  }

  const navigation: NavItem[] = [];

  // 1. Dashboard
  if (role !== 'SUBSCRIBER') {
    navigation.push({ name: 'ড্যাশবোর্ড', href: '/admin', icon: LayoutDashboard });
  }

  // 2. Categories Group, Reorder & Special Topics
  if (['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role)) {
    navigation.push(
      { name: 'নিউজ রিঅর্ডার', href: '/admin/reorder', icon: ArrowUpDown },
      {
        name: 'ক্যাটাগরি',
        icon: FolderKanban,
        subItems: [
          { name: 'পোস্ট ক্যাটাগরি', href: '/admin/categories', icon: FolderKanban },
          { name: 'নেভবার মেনু ম্যানেজমেন্ট', href: '/admin/navbar-menu', icon: Globe },
        ],
      },
      { name: 'বিশেষ প্রতিবেদন সেকশন', href: '/admin/special-topics', icon: Sparkles }
    );
  }

  // 3. News Articles
  if (['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes(role)) {
    navigation.push({
      name: 'খবরসমূহ',
      href: '/admin/news',
      icon: Newspaper,
      badge: counts.draftNews > 0 ? counts.draftNews : null,
      badgeColor: 'bg-amber-500 text-white',
    });
  }

  // 4. Media & Prayer Times
  if (['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role)) {
    navigation.push(
      { name: 'ই-পেপার', href: '/admin/epaper', icon: FileImage },
      { name: 'ফটো গ্যালারি', href: '/admin/photos', icon: ImageIcon },
      { name: 'ভিডিও গ্যালারি', href: '/admin/videos', icon: Video },
      { name: 'নামাজের সময়সূচি', href: '/admin/prayer-times', icon: Clock }
    );
  }

  // 5. Advertisements & Sidebar Widgets
  if (['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER', 'EDITOR', 'SUB_EDITOR'].includes(role)) {
    navigation.push({ name: 'বিজ্ঞাপন', href: '/admin/advertisements', icon: Megaphone });
  }

  // 6. Comments & Job Applications
  if (['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role)) {
    navigation.push(
      {
        name: 'মন্তব্যসমূহ',
        href: '/admin/comments',
        icon: MessageSquare,
        badge: counts.pendingComments > 0 ? counts.pendingComments : null,
        badgeColor: 'bg-rose-500 text-white animate-pulse',
      },
      { name: 'চাকরির আবেদনসমূহ', href: '/admin/job-applications', icon: Briefcase }
    );
  }

  // 7. Users & Roles
  if (['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    navigation.push({ name: 'ইউজার ও রোলস', href: '/admin/users', icon: Users });
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  // Get active breadcrumb title
  let activeTitle = 'অ্যাডমিন পোর্টাল';
  for (const item of navigation) {
    if (item.href && (pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href)))) {
      activeTitle = item.name;
      break;
    }
    if (item.subItems) {
      const sub = item.subItems.find(s => pathname === s.href || pathname?.startsWith(s.href));
      if (sub) {
        activeTitle = `${item.name} › ${sub.name}`;
        break;
      }
    }
  }

  return (
    <div className="admin-portal min-h-screen bg-slate-100/60 flex font-sans antialiased text-slate-800">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900">
            <Link href="/admin" className="flex items-center gap-3 group min-w-0">
              <div className="w-9.5 h-9.5 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-600/30 group-hover:bg-blue-500 transition duration-300 shrink-0">
                খ
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors truncate">
                  খুলনা গেজেট
                </span>
                <span className="text-xs text-blue-400 font-mono tracking-wider font-bold uppercase">
                  Admin Portal
                </span>
              </div>
            </Link>
            <button 
              className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition" 
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="px-3.5 pt-5 pb-2">
            <div className="px-3 mb-2.5 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-mono">
                মূল মেনু
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            </div>
            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon;

                if (item.subItems) {
                  const isAnySubActive = item.subItems.some(s => pathname === s.href || pathname?.startsWith(s.href));
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-extrabold select-none ${
                        isAnySubActive ? 'bg-slate-800 text-blue-400' : 'text-slate-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isAnySubActive ? 'text-blue-400' : 'text-slate-400'} />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight size={14} className={`transform transition ${isAnySubActive ? 'rotate-90 text-blue-400' : 'text-slate-500'}`} />
                      </div>

                      <div className="pl-4 space-y-1 border-l border-slate-800 ml-5">
                        {item.subItems.map((sub) => {
                          const subActive = pathname === sub.href || (pathname ? pathname.startsWith(sub.href) : false);
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                subActive
                                  ? 'bg-blue-600 text-white font-black shadow-xs'
                                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <div className="flex items-center gap-2">
                                <SubIcon size={14} className={subActive ? 'text-white' : 'text-slate-400'} />
                                <span>{sub.name}</span>
                              </div>
                              {subActive && <ChevronRight size={13} className="text-white" />}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const active = item.href ? (pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))) : false;
                return (
                  <Link
                    key={item.name}
                    href={item.href || '#'}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative ${
                      active 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold' 
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.badge != null && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-blue-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                      {active && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          <ChevronRight size={15} className="text-white" />
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>


        {/* User Profile Card & Signout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800 border border-slate-700/80 shadow-xs">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <UserIcon size={18} />}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-white truncate">
                {session?.user?.name || 'অ্যাডমিন'}
              </p>
              <div className="flex items-center gap-1 text-xs text-blue-300 font-bold">
                <ShieldCheck size={12} className="shrink-0 text-blue-400" />
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
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold py-2.5 rounded-xl transition duration-200"
          >
            <LogOut size={14} />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition focus:outline-none border border-slate-200" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <Link href="/admin" className="text-slate-400 hover:text-slate-700 transition flex items-center gap-1">
                <Home size={14} />
                <span className="hidden sm:inline">হোম</span>
              </Link>
              <ChevronRight size={13} className="text-slate-300" />
              <span className="text-slate-900 font-extrabold">{activeTitle}</span>
            </div>
          </div>

          {/* Right Action Icons & User Info */}
          <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
            {/* Quick News Creation Shortcut */}
            {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes(role) && (
              <Link
                href="/admin/news/new"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm shadow-blue-600/20 border border-blue-500/30 transition duration-200"
              >
                <PlusCircle size={15} />
                <span className="hidden sm:inline">নতুন খবর</span>
              </Link>
            )}

            {/* Live Status Badge */}
            <div className="hidden xl:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200/80 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>সিস্টেম লাইভ</span>
            </div>

            {/* View Live Site Link */}
            <Link 
              href="/" 
              target="_blank" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-2 rounded-xl shadow-2xs transition duration-200"
            >
              <Globe size={14} className="text-teal-600" />
              <span className="hidden md:inline">ওয়েবসাইট</span>
              <ExternalLink size={12} className="text-slate-400" />
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

