'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Users
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bypass layout wrapper on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const role = (session?.user as any)?.role || 'REPORTER';

  // Build navigation items based on role
  const navigation = [
    { name: 'ড্যাশবোর্ড', href: '/admin', icon: LayoutDashboard },
  ];

  if (role === 'SUPER_ADMIN' || role === 'EDITOR') {
    navigation.push({ name: 'ক্যাটাগরি ম্যানেজমেন্ট', href: '/admin/categories', icon: FolderKanban });
  }

  navigation.push({ name: 'খবরসমূহ', href: '/admin/news', icon: Newspaper });

  if (role === 'SUPER_ADMIN' || role === 'EDITOR') {
    navigation.push(
      { name: 'ই-পেপার', href: '/admin/epaper', icon: FileImage },
      { name: 'ফটো গ্যালারি', href: '/admin/photos', icon: ImageIcon },
      { name: 'ভিডিও গ্যালারি', href: '/admin/videos', icon: Video },
      { name: 'নামাজের সময়সূচি', href: '/admin/prayer-times', icon: Clock }
    );
  }

  if (role === 'SUPER_ADMIN') {
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
                {(session?.user as any)?.role === 'SUPER_ADMIN' 
                  ? 'সুপার অ্যাডমিন' 
                  : (session?.user as any)?.role === 'EDITOR' 
                  ? 'সম্পাদক' 
                  : 'প্রতিবেদক'}
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
