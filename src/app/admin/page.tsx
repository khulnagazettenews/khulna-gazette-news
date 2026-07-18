import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { 
  Newspaper, 
  FileText, 
  FolderKanban, 
  Eye, 
  PlusCircle, 
  ExternalLink,
  Users
} from 'lucide-react';

export const revalidate = 0; // Disable server cache for admin index to ensure live stats

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || 'REPORTER';
  const isReporter = role === 'REPORTER';
  const userId = (session?.user as any)?.id;

  // Filter stats and news list based on role
  const newsFilter = isReporter ? { authorId: userId } : {};

  // 1. Fetch Stats from DB
  const totalNews = await prisma.news.count({ where: newsFilter });
  const draftNews = await prisma.news.count({ 
    where: { 
      status: 'DRAFT',
      ...newsFilter 
    } 
  });
  
  // Conditionally query category count or user count
  const totalCategories = await prisma.category.count();
  const totalUsers = role === 'SUPER_ADMIN' ? await prisma.user.count() : 0;

  // Sum views
  const newsWithViews = await prisma.news.findMany({
    where: newsFilter,
    select: { viewCount: true }
  });
  const totalViews = newsWithViews.reduce((sum, item) => sum + item.viewCount, 0);

  // 2. Fetch Recent News
  const recentNews = await prisma.news.findMany({
    where: newsFilter,
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      author: true
    }
  });

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 shadow-sm border border-slate-700 text-white relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
          <Newspaper size={200} />
        </div>
        <div className="relative z-10">
          <span className="bg-red-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {role === 'SUPER_ADMIN' ? 'সুপার অ্যাডমিন কন্ট্রোল' : role === 'EDITOR' ? 'সম্পাদক কন্ট্রোল' : 'প্রতিবেদক প্যানেল'}
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-3">
            আসসালামু আলাইকুম, {session?.user?.name || 'অ্যাডমিন'}!
          </h2>
          <p className="text-slate-350 mt-1.5 text-sm max-w-xl">
            খুলনা গেজেট কন্ট্রোল প্যানেল থেকে আপনার সাইটের কন্টেন্ট পরিচালনা করুন।
          </p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total News Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-blue-500 hover:scale-[1.02] transition-transform duration-300 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {isReporter ? 'আমার মোট সংবাদ' : 'মোট সংবাদ'}
            </p>
            <h3 className="text-3xl font-extrabold text-gray-800 mt-1.5">{totalNews}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Newspaper size={24} />
          </div>
        </div>

        {/* Draft News Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-amber-500 hover:scale-[1.02] transition-transform duration-300 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {isReporter ? 'আমার খসড়া সংবাদ' : 'খসড়া সংবাদ'}
            </p>
            <h3 className="text-3xl font-extrabold text-gray-800 mt-1.5">{draftNews}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        {/* Third Card: Dynamic based on role */}
        {role === 'SUPER_ADMIN' ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-emerald-500 hover:scale-[1.02] transition-transform duration-300 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">মোট টিম মেম্বার</p>
              <h3 className="text-3xl font-extrabold text-gray-800 mt-1.5">{totalUsers}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-emerald-500 hover:scale-[1.02] transition-transform duration-300 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">মোট ক্যাটাগরি</p>
              <h3 className="text-3xl font-extrabold text-gray-800 mt-1.5">{totalCategories}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <FolderKanban size={24} />
            </div>
          </div>
        )}

        {/* Total Views Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-purple-500 hover:scale-[1.02] transition-transform duration-300 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {isReporter ? 'আমার খবরের ভিউ' : 'মোট ভিউ'}
            </p>
            <h3 className="text-3xl font-extrabold text-gray-800 mt-1.5">{totalViews}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Eye size={24} />
          </div>
        </div>
      </div>

      {/* Main grids: recent news & quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent News list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-800">
              {isReporter ? 'আমার সাম্প্রতিক খবরসমূহ' : 'সাম্প্রতিক খবরসমূহ'}
            </h3>
            <Link href="/admin/news" className="text-xs text-red-650 font-bold hover:underline">
              সব খবর দেখুন
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500">শিরোনাম</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500">ক্যাটাগরি</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500">অবস্থা</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500">ভিউ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentNews.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      কোনো খবর পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  recentNews.map((news) => (
                    <tr key={news.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link href={`/admin/news/${news.id}/edit`} className="text-sm font-semibold text-gray-750 hover:text-red-600 line-clamp-1">
                          {news.title}
                        </Link>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          {new Date(news.createdAt).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-600 bg-gray-105 px-2.5 py-1 rounded">
                          {news.category?.name || 'অনির্ধারিত'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          news.status === 'PUBLISHED' 
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {news.status === 'PUBLISHED' ? 'প্রকাশিত' : 'খসড়া'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                        {news.viewCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick shortcuts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h3 className="font-bold text-gray-800">সহজ অ্যাকশন</h3>
          
          <div className="space-y-3">
            <Link 
              href="/admin/news/new"
              className="flex items-center gap-3 p-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl transition-colors font-semibold text-sm"
            >
              <PlusCircle size={20} className="shrink-0" />
              <span>নতুন খবর লিখুন</span>
            </Link>
            
            {role !== 'REPORTER' && (
              <Link 
                href="/admin/categories"
                className="flex items-center gap-3 p-3 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors font-semibold text-sm"
              >
                <FolderKanban size={20} className="shrink-0" />
                <span>ক্যাটাগরি তৈরি করুন</span>
              </Link>
            )}

            {role === 'SUPER_ADMIN' && (
              <Link 
                href="/admin/users"
                className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors font-semibold text-sm"
              >
                <Users size={20} className="shrink-0" />
                <span>ইউজার ও রোলস ম্যানেজ করুন</span>
              </Link>
            )}

            <Link 
              href="/"
              target="_blank"
              className="flex items-center gap-3 p-3 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors font-semibold text-sm"
            >
              <ExternalLink size={20} className="shrink-0" />
              <span>প্রধান ওয়েবসাইট দেখুন</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
