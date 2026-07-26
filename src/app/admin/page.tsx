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
  CheckCircle2,
  Edit3,
  Server,
  Image as ImageIcon
} from 'lucide-react';

export const revalidate = 0; // Disable server cache for admin index to ensure live stats

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || 'REPORTER';
  const restrictsToOwnNews = ['REPORTER', 'CONTRIBUTOR'].includes(role);
  const userId = (session?.user as any)?.id;

  // Filter stats and news list based on role
  const newsFilter = restrictsToOwnNews ? { authorId: userId } : {};

  // 1. Fetch Stats from DB in parallel
  const [
    totalNews,
    draftNews,
    publishedNewsCount,
    totalCategories,
    totalUsers,
    pendingComments,
    newsWithViews,
    recentNews
  ] = await Promise.all([
    prisma.news.count({ where: newsFilter }),
    prisma.news.count({ where: { status: 'DRAFT', ...newsFilter } }),
    prisma.news.count({ where: { status: 'PUBLISHED', ...newsFilter } }),
    prisma.category.count(),
    ['SUPER_ADMIN', 'ADMIN'].includes(role) ? prisma.user.count() : Promise.resolve(0),
    ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role) ? prisma.comment.count({ where: { approved: false } }) : Promise.resolve(0),
    prisma.news.findMany({ where: newsFilter, select: { viewCount: true } }),
    prisma.news.findMany({
      where: newsFilter,
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        author: true
      }
    })
  ]);

  const totalViews = newsWithViews.reduce((sum, item) => sum + item.viewCount, 0);

  // Calculate publication ratio
  const publishRatio = totalNews > 0 ? Math.round((publishedNewsCount / totalNews) * 100) : 0;

  // Date & Greeting in Bengali
  const currentHour = new Date().getHours();
  let greetingBn = 'স্বাগতম';
  if (currentHour >= 5 && currentHour < 12) greetingBn = 'শুভ সকাল';
  else if (currentHour >= 12 && currentHour < 17) greetingBn = 'শুভ দুপুর';
  else if (currentHour >= 17 && currentHour < 20) greetingBn = 'শুভ বিকাল';
  else greetingBn = 'শুভ রাত';

  const todayBn = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-8">
      {/* 1. Welcome Hero Banner with Glassmorphic Aesthetics */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-800/80">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/3 -mb-16 w-72 h-72 rounded-full bg-rose-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-md">
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
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Clock size={13} className="text-teal-400" />
                <span>{todayBn}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {greetingBn}, <span className="bg-gradient-to-r from-teal-300 via-rose-300 to-white bg-clip-text text-transparent">{session?.user?.name || 'অ্যাডমিন'}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              খুলনা গেজেট নিউজ পোর্টালে আপনার সংবাদ কন্টেন্ট, বিশেষ প্রতিবেদন, বিজ্ঞাপন এবং সার্বিক পারফরম্যান্স নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes(role) && (
              <Link
                href="/admin/news/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-xl shadow-red-600/30 border border-red-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <PlusCircle size={18} />
                <span>নতুন খবর লিখুন</span>
              </Link>
            )}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-700/80 backdrop-blur-md transition-all duration-300"
            >
              <ExternalLink size={16} className="text-teal-400" />
              <span>লাইভ সাইট</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Grid Metric Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role) ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-5`}>
        {/* Total News Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {restrictsToOwnNews ? 'আমার মোট সংবাদ' : 'মোট প্রকাশিত সংবাদ'}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition duration-300 shadow-xs">
              <Newspaper size={21} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalNews}</h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
              <CheckCircle2 size={13} />
              <span>{publishedNewsCount} প্রকাশিত</span>
            </span>
          </div>
          {/* Ratio bar */}
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${publishRatio}%` }}
            />
          </div>
        </div>

        {/* Draft News Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {restrictsToOwnNews ? 'আমার খসড়া সংবাদ' : 'খসড়া সংবাদ'}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition duration-300 shadow-xs">
              <FileText size={21} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{draftNews}</h2>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              ড্রাফটে রয়েছে
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 font-medium truncate">
            {draftNews > 0 ? 'সম্পাদনা ও প্রকাশের অপেক্ষায়' : 'কোনো খসড়া বাকি নেই'}
          </p>
        </div>

        {/* Dynamic Card: Team Members / Categories */}
        {['SUPER_ADMIN', 'ADMIN'].includes(role) ? (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">টিম মেম্বার</span>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-300 shadow-xs">
                <Users size={21} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalUsers}</h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                অ্যাক্টিভ ইউজার
              </span>
            </div>
            <p className="mt-3 text-[11px] text-slate-400 font-medium truncate">
              সিস্টেম রোল ব্যবস্থাপনা সক্রিয়
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">ক্যাটাগরি</span>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-300 shadow-xs">
                <FolderKanban size={21} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalCategories}</h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                সচল ক্যাটাগরি
              </span>
            </div>
            <p className="mt-3 text-[11px] text-slate-400 font-medium truncate">
              হোমপেজ সেকশন কনফিগার করা
            </p>
          </div>
        )}

        {/* Total Views Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {restrictsToOwnNews ? 'আমার মোট পঠিত' : 'মোট পাঠ সংখ্যা (ভিউ)'}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition duration-300 shadow-xs">
              <Eye size={21} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalViews.toLocaleString('bn-BD')}</h2>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-100">
              <TrendingUp size={13} />
              <span>লাইভ ভিউ</span>
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 font-medium truncate">
            পাঠকদের রিয়েলটাইম আগ্রহের হিসাব
          </p>
        </div>

        {/* Pending Comments Card */}
        {['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role) && (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">নতুন মন্তব্য</span>
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition duration-300 shadow-xs">
                <MessageSquare size={21} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{pendingComments}</h2>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                অনুমোদনের অপেক্ষায়
              </span>
            </div>
            <p className="mt-3 text-[11px] text-slate-400 font-medium truncate">
              {pendingComments > 0 ? 'পেন্ডিং মন্তব্য রিভিউ করুন' : 'সকল মন্তব্য অনুমোদিত'}
            </p>
          </div>
        )}
      </div>

      {/* 3. Main Content: Recent News & Quick Actions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Recent Articles Table with Image Thumbnails */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden space-y-0">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs shadow-xs">
                <Clock size={16} />
              </div>
              <div>
                <h2 className="font-black text-base text-slate-900 leading-snug">
                  {restrictsToOwnNews ? 'আমার সাম্প্রতিক খবরসমূহ' : 'সাম্প্রতিক খবরসমূহ'}
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">সর্বশেষ আপলোড হওয়া সংবাদের তালিকা</p>
              </div>
            </div>
            <Link 
              href="/admin/news" 
              className="inline-flex items-center gap-1 text-xs text-red-600 font-extrabold hover:text-red-700 transition bg-red-50 hover:bg-red-100/70 px-3.5 py-1.5 rounded-xl border border-red-100"
            >
              <span>সব খবর দেখুন</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-150 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">সংবাদ</th>
                  <th className="px-4 py-3.5">ক্যাটাগরি</th>
                  <th className="px-4 py-3.5">অবস্থা</th>
                  <th className="px-4 py-3.5 text-center">ভিউ</th>
                  <th className="px-6 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentNews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                      কোনো খবর পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  recentNews.map((news) => (
                    <tr key={news.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Image Thumbnail */}
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/70 shadow-2xs">
                            {news.featuredImage ? (
                              <img 
                                src={news.featuredImage} 
                                alt={news.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                <ImageIcon size={16} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link 
                              href={`/admin/news/${news.id}/edit`} 
                              className="font-extrabold text-slate-900 group-hover:text-red-600 transition leading-snug line-clamp-1 block"
                            >
                              {news.title}
                            </Link>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                              {new Date(news.createdAt).toLocaleDateString('bn-BD', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 inline-block">
                          {news.category?.name || 'সাধারণ'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                          news.status === 'PUBLISHED' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${news.status === 'PUBLISHED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                          <span>{news.status === 'PUBLISHED' ? 'প্রকাশিত' : 'খসড়া'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-extrabold text-slate-700">
                        {news.viewCount.toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/admin/news/${news.id}/edit`}
                          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition duration-200"
                        >
                          <Edit3 size={13} />
                          <span>সম্পাদনা</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Shortcuts Panel & System Health */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                <span>সহজ অ্যাকশন (Quick Actions)</span>
              </h2>
            </div>
            
            <div className="space-y-2.5">
              {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes(role) && (
                <Link 
                  href="/admin/news/new"
                  className="flex items-center justify-between p-3.5 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100 rounded-2xl transition duration-200 font-bold text-xs border border-red-100 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                      <PlusCircle size={17} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 group-hover:text-red-600 transition">নতুন খবর লিখুন</span>
                      <span className="text-[10px] text-slate-500 font-normal">পোর্টালের জন্য নতুন পোস্ট তৈরি করুন</span>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role) && (
                <Link 
                  href="/admin/special-topics"
                  className="flex items-center justify-between p-3.5 bg-teal-50/60 text-teal-800 hover:bg-teal-100/60 rounded-2xl transition duration-200 font-bold text-xs border border-teal-100 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                      <Sparkles size={17} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 group-hover:text-teal-700 transition">বিশেষ প্রতিবেদন সাজান</span>
                      <span className="text-[10px] text-slate-500 font-normal">হোমপেজের মূল কভার প্রতিবেদন নির্বাচন</span>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-teal-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}
              
              {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role) && (
                <Link 
                  href="/admin/categories"
                  className="flex items-center justify-between p-3.5 bg-slate-50/80 text-slate-700 hover:bg-slate-100 rounded-2xl transition duration-200 font-bold text-xs border border-slate-200/70 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                      <FolderKanban size={17} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 transition">ক্যাটাগরি ম্যানেজমেন্ট</span>
                      <span className="text-[10px] text-slate-500 font-normal">বিষয়শ্রেণী ও অর্ডারিং কনফিগার</span>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              {['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER'].includes(role) && (
                <Link 
                  href="/admin/advertisements"
                  className="flex items-center justify-between p-3.5 bg-amber-50/60 text-amber-800 hover:bg-amber-100/60 rounded-2xl transition duration-200 font-bold text-xs border border-amber-100 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                      <Megaphone size={17} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 group-hover:text-amber-700 transition">বিজ্ঞাপন স্পেস</span>
                      <span className="text-[10px] text-slate-500 font-normal">ব্যানার বিজ্ঞাপন ও এনালিটিক্স</span>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              {['SUPER_ADMIN', 'ADMIN'].includes(role) && (
                <Link 
                  href="/admin/users"
                  className="flex items-center justify-between p-3.5 bg-blue-50/60 text-blue-800 hover:bg-blue-100/60 rounded-2xl transition duration-200 font-bold text-xs border border-blue-100 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                      <Users size={17} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 group-hover:text-blue-700 transition">ইউজার ও রোলস</span>
                      <span className="text-[10px] text-slate-500 font-normal">এডমিন ও রিপোর্টার পারমিশন</span>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* System Health Diagnostic Card */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-xs text-white flex items-center gap-2 uppercase tracking-wider font-mono">
                <Server size={15} className="text-teal-400" />
                <span>সিস্টেম হেলথ ডায়াগনস্টিক</span>
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <span className="text-slate-400 font-medium">ডাটাবেস কানেকশন</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>MongoDB Atlas (সচল)</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <span className="text-slate-400 font-medium">অন-ডিমান্ড রিভ্যালিডেশন</span>
                <span className="font-bold text-teal-300">সক্রিয়</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <span className="text-slate-400 font-medium">পাবলিকেশন রেট</span>
                <span className="font-bold text-slate-200">{publishRatio}% সফল</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
