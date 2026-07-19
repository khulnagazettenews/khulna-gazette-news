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
  MessageSquare
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-650"></div>
      </div>
    );
  }

  // Build navigation items based on role
  const navigation = [];

  // 1. Dashboard (Allowed for all roles except Subscriber)
  if (role !== 'SUBSCRIBER') {
    navigation.push({ name: 'ড্যাশবোর্ড', href: '/admin', icon: LayoutDashboard });
  }

  // 2. Categories (Super Admin, Admin, Editor, Sub Editor)
  if (['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role)) {
    navigation.push({ name: 'ক্যাটাগরি ম্যানেজমেন্ট', href: '/admin/categories', icon: FolderKanban });
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <Link href="/admin" className="text-xl font-bold text-white tracking-wide">
              খুলনা গেজেট
            </Link>
            <button 
              className="lg:hidden text-slate-400 hover:text-white" 
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="mt-6 px-4 space-y-1">
            {navigation.map((item) => {
              const active = pathname ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition ${
                    active 
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/10' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Signout */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white border border-slate-700">
              {session?.user?.name ? session.user.name.charAt(0) : <UserIcon size={18} />}
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[150px]">
                {session?.user?.name || 'অ্যাডমিন'}
              </p>
              <p className="text-xs text-slate-400">
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
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-950/20 hover:text-red-400 border border-slate-700 text-slate-300 text-sm font-medium py-2 rounded-lg transition"
          >
            <LogOut size={16} />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button 
            className="lg:hidden text-slate-600 focus:outline-none" 
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-500">স্বাগতম, {session?.user?.name || 'অ্যাডমিন'}</span>
            <Link 
              href="/" 
              target="_blank" 
              className="text-xs text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 font-semibold px-3 py-1.5 rounded-lg transition"
            >
              সাইট ভিজিট করুন
            </Link>
          </div>
        </header>

        {/* Dashboard Pages Scroll Container */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
