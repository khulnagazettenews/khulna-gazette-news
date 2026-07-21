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
  Users,
  Megaphone,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const revalidate = 0; // Disable server cache for admin index to ensure live stats

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || 'REPORTER';
  const restrictsToOwnNews = ['REPORTER', 'CONTRIBUTOR'].includes(role);
  const userId = (session?.user as any)?.id;

  // Filter stats and news list based on role
  const newsFilter = restrictsToOwnNews ? { authorId: userId } : {};

  // 1. Fetch Stats from DB
  const totalNews = await prisma.news.count({ where: newsFilter });
  const draftNews = await prisma.news.count({ 
    where: { 
      status: 'DRAFT',
      ...newsFilter 
    } 
  });
  
  const publishedNewsCount = await prisma.news.count({
    where: {
      status: 'PUBLISHED',
      ...newsFilter
    }
  });

  // Conditionally query category count or user count
  const totalCategories = await prisma.category.count();
  const totalUsers = ['SUPER_ADMIN', 'ADMIN'].includes(role) ? await prisma.user.count() : 0;
  
  // Pending comments count
  const pendingComments = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role) 
    ? await prisma.comment.count({ where: { approved: false } }) 
    : 0;

  // Sum views
  const newsWithViews = await prisma.news.findMany({
    where: newsFilter,
    select: { viewCount: true }
  });
  const totalViews = newsWithViews.reduce((sum, item) => sum + item.viewCount, 0);

  // 2. Fetch Recent News
  const recentNews = await prisma.news.findMany({
    where: newsFilter,
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      author: true
    }
  });

  // Date String in Bengali
  const todayBn = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800/80">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600/30 text-red-300 border border-red-500/40 backdrop-blur-xs">
                <ShieldCheck size={14} className="text-red-400" />
                {(() => {
                  if (role === 'SUPER_ADMIN') return 'সুপার অ্যাডমিন প্যানেল';
                  if (role === 'ADMIN') return 'অ্যাডমিন প্যানেল';
                  if (role === 'EDITOR') return 'সম্পাদক ড্যাশবোর্ড';
                  if (role === 'SUB_EDITOR') return 'সহকারী সম্পাদক ড্যাশবোর্ড';
                  if (role === 'REPORTER') return 'প্রতিবেদক প্যানেল';
                  if (role === 'CONTRIBUTOR') return 'সহযোগী লেখক প্যানেল';
                  if (role === 'ADVERTISEMENT_MANAGER') return 'বিজ্ঞাপন ম্যানেজার';
                  return 'কন্ট্রোল প্যানেল';
                })()}
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                • {todayBn}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              স্বাগতম, {session?.user?.name || 'অ্যাডমিন'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              খুলনা গেজেট নিউজ পোর্টালে আপনার কন্টেন্ট, ক্যাটাগরি এবং সার্বিক পরিসংখ্যান নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes(role) && (
              <Link
                href="/admin/news/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-red-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <PlusCircle size={18} />
                <span>নতুন খবর লিখুন</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role) ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-5`}>
        {/* Total News Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {restrictsToOwnNews ? 'আমার মোট সংবাদ' : 'মোট প্রকাশিত সংবাদ'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Newspaper size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{totalNews}</h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <CheckCircle2 size={12} />
              <span>{publishedNewsCount} প্রকাশিত</span>
            </span>
          </div>
        </div>

        {/* Draft News Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {restrictsToOwnNews ? 'আমার খসড়া সংবাদ' : 'খসড়া সংবাদ'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{draftNews}</h3>
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              ড্রাফট সংরক্ষিত
            </span>
          </div>
        </div>

        {/* Dynamic Card: Team Members / Categories */}
        {['SUPER_ADMIN', 'ADMIN'].includes(role) ? (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">টিম মেম্বার</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{totalUsers}</h3>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                অ্যাক্টিভ ইউজার
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ক্যাটাগরি</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <FolderKanban size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{totalCategories}</h3>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                সচল বিষয়শ্রেণী
              </span>
            </div>
          </div>
        )}

        {/* Total Views Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {restrictsToOwnNews ? 'আমার মোট পঠিত' : 'মোট ভিউ'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Eye size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{totalViews.toLocaleString('bn-BD')}</h3>
            <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp size={12} />
              <span>লাইভ ভিউ</span>
            </span>
          </div>
        </div>

        {/* Pending Comments Card */}
        {['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role) && (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-red-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">নতুন মন্তব্য</span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{pendingComments}</h3>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                অনুমোদনের অপেক্ষায়
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grids: Recent News & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Recent News Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden space-y-0">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-slate-500" />
              <h3 className="font-extrabold text-sm text-slate-800">
                {restrictsToOwnNews ? 'আমার সাম্প্রতিক খবরসমূহ' : 'সাম্প্রতিক খবরসমূহ'}
              </h3>
            </div>
            <Link 
              href="/admin/news" 
              className="inline-flex items-center gap-1 text-xs text-red-600 font-extrabold hover:text-red-700 transition"
            >
              <span>সব খবর দেখুন</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">সংবাদের শিরোনাম</th>
                  <th className="px-4 py-3">ক্যাটাগরি</th>
                  <th className="px-4 py-3">অবস্থা</th>
                  <th className="px-4 py-3 text-right">ভিউ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentNews.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                      কোনো খবর পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  recentNews.map((news) => (
                    <tr key={news.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-3.5">
                        <Link 
                          href={`/admin/news/${news.id}/edit`} 
                          className="font-bold text-slate-800 group-hover:text-red-600 transition leading-snug line-clamp-1 block"
                        >
                          {news.title}
                        </Link>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(news.createdAt).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100 inline-block">
                          {news.category?.name || 'সাধারণ'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block ${
                          news.status === 'PUBLISHED' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {news.status === 'PUBLISHED' ? 'প্রকাশিত' : 'খসড়া'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-700">
                        {news.viewCount.toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Shortcuts Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Zap size={18} className="text-amber-500" />
              <span>সহজ অ্যাকশন (Quick Actions)</span>
            </h3>
            
            <div className="space-y-2.5">
              {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes(role) && (
                <Link 
                  href="/admin/news/new"
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100 rounded-xl transition font-bold text-xs border border-red-100 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                      <PlusCircle size={15} />
                    </div>
                    <span>নতুন খবর লিখুন</span>
                  </div>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role) && (
                <Link 
                  href="/admin/special-topics"
                  className="flex items-center justify-between p-3 bg-teal-50/70 text-teal-800 hover:bg-teal-100/70 rounded-xl transition font-bold text-xs border border-teal-100 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
                      <Sparkles size={15} />
                    </div>
                    <span>বিশেষ প্রতিবেদন সাজান</span>
                  </div>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}
              
              {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role) && (
                <Link 
                  href="/admin/categories"
                  className="flex items-center justify-between p-3 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl transition font-bold text-xs border border-slate-200/70 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                      <FolderKanban size={15} />
                    </div>
                    <span>ক্যাটাগরি তৈরি করুন</span>
                  </div>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              {['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER'].includes(role) && (
                <Link 
                  href="/admin/advertisements"
                  className="flex items-center justify-between p-3 bg-amber-50/70 text-amber-800 hover:bg-amber-100/70 rounded-xl transition font-bold text-xs border border-amber-100 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                      <Megaphone size={15} />
                    </div>
                    <span>বিজ্ঞাপন ম্যানেজ করুন</span>
                  </div>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              {['SUPER_ADMIN', 'ADMIN'].includes(role) && (
                <Link 
                  href="/admin/users"
                  className="flex items-center justify-between p-3 bg-blue-50/70 text-blue-800 hover:bg-blue-100/70 rounded-xl transition font-bold text-xs border border-blue-100 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Users size={15} />
                    </div>
                    <span>ইউজার ও রোলস ম্যানেজ করুন</span>
                  </div>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              <Link 
                href="/"
                target="_blank"
                className="flex items-center justify-between p-3 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl transition font-bold text-xs border border-slate-200/70 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <ExternalLink size={15} />
                  </div>
                  <span>প্রধান ওয়েবসাইট দেখুন</span>
                </div>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
