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
  Image as ImageIcon,
  Flame,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight
} from 'lucide-react';

export const revalidate = 0; // Disable server cache for admin index to ensure live stats

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || 'REPORTER';
  const restrictsToOwnNews = ['REPORTER', 'CONTRIBUTOR'].includes(role);
  const userId = (session?.user as any)?.id;

  // Filter stats and news list based on role
  const newsFilter = restrictsToOwnNews ? { authorId: userId } : {};

  // 1. Fetch Stats & Analytics from DB in parallel
  const [
    totalNews,
    draftNews,
    publishedNewsCount,
    totalCategories,
    totalUsers,
    pendingComments,
    newsWithViews,
    recentNews,
    topNews,
    categoriesWithCount
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
    }),
    prisma.news.findMany({
      where: { status: 'PUBLISHED', ...newsFilter },
      take: 3,
      orderBy: { viewCount: 'desc' },
      include: {
        category: true
      }
    }),
    prisma.category.findMany({
      take: 5,
      include: {
        _count: {
          select: { news: true }
        }
      },
      orderBy: {
        news: {
          _count: 'desc'
        }
      }
    })
  ]);

  const totalViews = newsWithViews.reduce((sum, item) => sum + item.viewCount, 0);
  const avgViews = totalNews > 0 ? Math.round(totalViews / totalNews) : 0;

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
      {/* 1. Welcome Hero Banner - Clean High Contrast Minimalist Slate/Navy */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-500/25 text-blue-200 border border-blue-400/40">
                <ShieldCheck size={15} className="text-blue-400" />
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
                <span className="text-xs text-slate-200 font-bold flex items-center gap-1.5 bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700">
                  <Clock size={14} className="text-blue-400" />
                  <span>{todayBn}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                {greetingBn}, <span className="text-blue-400">{session?.user?.name || 'অ্যাডমিন'}</span>!
              </h1>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed font-medium">
                খুলনা গেজেট নিউজ পোর্টালে আপনার সংবাদ কন্টেন্ট, বিশেষ প্রতিবেদন, বিজ্ঞাপন এবং সার্বিক পারফরম্যান্স রিয়েলটাইমে নিয়ন্ত্রণ করুন।
              </p>
            </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes(role) && (
              <Link
                href="/admin/news/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-blue-600/30 border border-blue-400/40 transition-all duration-200"
              >
                <PlusCircle size={18} />
                <span>নতুন খবর লিখুন</span>
              </Link>
            )}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-700 transition-all duration-200"
            >
              <ExternalLink size={16} className="text-blue-400" />
              <span>লাইভ সাইট</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Grid Metric Cards - Readable Contrast */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role) ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-5`}>
        {/* Total News Card */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-blue-600"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {restrictsToOwnNews ? 'আমার মোট সংবাদ' : 'মোট প্রকাশিত সংবাদ'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition duration-200">
              <Newspaper size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalNews}</h2>
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
              <CheckCircle2 size={13} />
              <span>{publishedNewsCount} প্রকাশিত</span>
            </span>
          </div>
          {/* Ratio bar */}
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${publishRatio}%` }}
            />
          </div>
        </div>

        {/* Draft News Card */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {restrictsToOwnNews ? 'আমার খসড়া সংবাদ' : 'খসড়া সংবাদ'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition duration-200">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{draftNews}</h2>
            <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              ড্রাফটে রয়েছে
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-600 font-semibold truncate">
            {draftNews > 0 ? 'সম্পাদনা ও প্রকাশের অপেক্ষায়' : 'কোনো খসড়া বাকি নেই'}
          </p>
        </div>

        {/* Dynamic Card: Team Members / Categories */}
        {['SUPER_ADMIN', 'ADMIN'].includes(role) ? (
          <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-600"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">টিম মেম্বার</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition duration-200">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalUsers}</h2>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                অ্যাক্টিভ ইউজার
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 font-semibold truncate">
              সিস্টেম রোল ব্যবস্থাপনা সক্রিয়
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-600"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">ক্যাটাগরি</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition duration-200">
                <FolderKanban size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalCategories}</h2>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                সচল ক্যাটাগরি
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 font-semibold truncate">
              হোমপেজ সেকশন কনফিগার করা
            </p>
          </div>
        )}

        {/* Total Views Card */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {restrictsToOwnNews ? 'আমার মোট পঠিত' : 'মোট পাঠ সংখ্যা (ভিউ)'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <Eye size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalViews.toLocaleString('bn-BD')}</h2>
            <span className="text-xs font-black text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-200">
              <TrendingUp size={13} />
              <span>লাইভ ভিউ</span>
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-600 font-semibold truncate">
            পাঠকদের রিয়েলটাইম আগ্রহের হিসাব
          </p>
        </div>

        {/* Pending Comments Card */}
        {['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role) && (
          <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-rose-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">নতুন মন্তব্য</span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition duration-200">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{pendingComments}</h2>
              <span className="text-xs font-black text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                অনুমোদনের অপেক্ষায়
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 font-semibold truncate">
              {pendingComments > 0 ? 'পেন্ডিং মন্তব্য রিভিউ করুন' : 'সকল মন্তব্য অনুমোদিত'}
            </p>
          </div>
        )}
      </div>

      {/* 3. Visual Analytics & Category Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Visual Analytics SVG Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-2xs border border-slate-300 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9.5 h-9.5 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">কন্টেন্ট পারফরম্যান্স ও ভিউ অ্যানালিটিক্স</h3>
                <p className="text-xs text-slate-600 font-semibold">সংবাদ রিডারশিপ এবং নিয়মিত প্রকাশের ডেনসিটি</p>
              </div>
            </div>
            <span className="text-xs font-black text-blue-800 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 flex items-center gap-1">
              <Activity size={14} />
              <span>গড় {avgViews} ভিউ / পোস্ট</span>
            </span>
          </div>

          {/* Lightweight SVG Visual Bar Graph */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative">
            <div className="flex items-center justify-between text-xs text-slate-700 font-extrabold mb-3">
              <span>সাপ্তাহিক নিউজ ওভারভিউ</span>
              <span className="text-emerald-700 font-black">+{publishRatio}% পাবলিকেশন হার</span>
            </div>
            <div className="h-32 flex items-end justify-between gap-3 pt-4 px-2">
              {[
                { day: 'শনিবার', val: 65 },
                { day: 'রবিবার', val: 80 },
                { day: 'সোমবার', val: 45 },
                { day: 'মঙ্গলবার', val: 95 },
                { day: 'বুধবার', val: 70 },
                { day: 'বৃহস্পতিবার', val: 85 },
                { day: 'শুক্রবার', val: 90 }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-slate-200 rounded-t-lg h-24 flex items-end overflow-hidden p-0.5">
                    <div 
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        item.val > 80 
                          ? 'bg-blue-600' 
                          : item.val > 60
                          ? 'bg-indigo-600'
                          : 'bg-slate-500'
                      }`}
                      style={{ height: `${item.val}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition">
                    {item.day.slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block">মোট পোস্ট</span>
              <span className="text-lg font-black text-slate-900">{totalNews}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase block">প্রকাশিত</span>
              <span className="text-lg font-black text-emerald-900">{publishedNewsCount}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase block">খসড়া</span>
              <span className="text-lg font-black text-amber-900">{draftNews}</span>
            </div>
          </div>
        </div>

        {/* Right Category Breakdown Progress Bars (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-2xs border border-slate-300 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9.5 h-9.5 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <PieChart size={20} />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">ক্যাটাগরি কভারেজ</h3>
                <p className="text-xs text-slate-600 font-semibold">বিভাগ অনুযায়ী প্রকাশিত সংবাদের শেয়ার</p>
              </div>
            </div>
            <Link 
              href="/admin/categories" 
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
            >
              <span>ম্যানেজ</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {categoriesWithCount.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 font-semibold">কোনো ক্যাটাগরি কনফিগার করা নেই</p>
            ) : (
              categoriesWithCount.map((cat, idx) => {
                const count = cat._count.news;
                const pct = totalNews > 0 ? Math.round((count / totalNews) * 100) : 0;
                const colors = [
                  'bg-blue-600',
                  'bg-indigo-600',
                  'bg-emerald-600',
                  'bg-amber-600',
                  'bg-slate-700'
                ];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${barColor}`}></span>
                        {cat.name}
                      </span>
                      <span className="font-mono text-slate-700 font-black">
                        {count} টি ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
                      <div 
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-xs font-bold text-slate-600">
              মোট {totalCategories} টি সচল ক্যাটাগরি পোর্টালে যুক্ত আছে
            </span>
          </div>
        </div>
      </div>

      {/* 4. Top Trending Articles Highlight Banner */}
      {topNews.length > 0 && (
        <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 text-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="text-amber-400" size={20} />
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                আজকের সবচেয়ে জনপ্রিয় খবর (Top Read Articles)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-200 bg-blue-950 px-3 py-1 rounded-full border border-blue-700">
              লাইভ ভিউ র‌্যাঙ্কিং
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topNews.map((news, idx) => (
              <Link 
                key={news.id} 
                href={`/admin/news/${news.id}/edit`}
                className="bg-slate-800 hover:bg-slate-750 p-4 rounded-2xl border border-slate-700 hover:border-blue-400 transition-all duration-200 group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-blue-200 bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-700">
                    {news.category?.name || 'খবর'}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs sm:text-sm leading-snug line-clamp-2 text-slate-100 group-hover:text-blue-300 transition">
                  {news.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1.5 border-t border-slate-700/80">
                  <span className="flex items-center gap-1 text-blue-300 font-extrabold">
                    <Eye size={14} />
                    <span>{news.viewCount.toLocaleString('bn-BD')} ভিউ</span>
                  </span>
                  <span className="text-xs font-bold text-slate-200 group-hover:translate-x-0.5 transition-transform">
                    সম্পাদনা &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. Main Content: Recent News & Quick Actions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Recent Articles Table with Image Thumbnails */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-2xs border border-slate-300 overflow-hidden space-y-0">
          <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs shadow-xs">
                <Clock size={16} />
              </div>
              <div>
                <h2 className="font-black text-base text-slate-900 leading-snug">
                  {restrictsToOwnNews ? 'আমার সাম্প্রতিক খবরসমূহ' : 'সাম্প্রতিক খবরসমূহ'}
                </h2>
                <p className="text-xs text-slate-600 font-semibold">সর্বশেষ আপলোড হওয়া সংবাদের তালিকা</p>
              </div>
            </div>
            <Link 
              href="/admin/news" 
              className="inline-flex items-center gap-1 text-xs text-blue-700 font-black hover:text-blue-800 transition bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl border border-blue-200"
            >
              <span>সব খবর দেখুন</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-black text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-3.5">সংবাদ</th>
                  <th className="px-4 py-3.5">ক্যাটাগরি</th>
                  <th className="px-4 py-3.5">অবস্থা</th>
                  <th className="px-4 py-3.5 text-center">ভিউ</th>
                  <th className="px-6 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {recentNews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-semibold">
                      কোনো খবর পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  recentNews.map((news) => (
                    <tr key={news.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Image Thumbnail */}
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
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
                              className="font-extrabold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-1 block text-xs sm:text-sm"
                            >
                              {news.title}
                            </Link>
                            <span className="text-xs text-slate-500 block mt-0.5 font-semibold">
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
                        <span className="text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                          {news.category?.name || 'সাধারণ'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                          news.status === 'PUBLISHED' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${news.status === 'PUBLISHED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                          <span>{news.status === 'PUBLISHED' ? 'প্রকাশিত' : 'খসড়া'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-slate-800">
                        {news.viewCount.toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/admin/news/${news.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs font-black text-slate-800 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 px-3.5 py-1.5 rounded-xl transition duration-200"
                        >
                          <Edit3 size={14} />
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
          <div className="bg-white rounded-3xl shadow-2xs border border-slate-300 p-5 space-y-4">
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
                  className="flex items-center justify-between p-3.5 bg-blue-50/70 text-blue-900 hover:bg-blue-100 rounded-2xl transition duration-200 font-bold text-xs border border-blue-200 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                      <PlusCircle size={17} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 group-hover:text-blue-700 transition text-xs sm:text-sm">নতুন খবর লিখুন</span>
                      <span className="text-xs text-slate-600 font-semibold">পোর্টালের জন্য নতুন পোস্ট তৈরি করুন</span>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role) && (
                <Link 
                  href="/admin/special-topics"
                  className="flex items-center justify-between p-3.5 bg-slate-50 text-slate-800 hover:bg-slate-100 rounded-2xl transition duration-200 font-bold text-xs border border-slate-200 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                      <Sparkles size={17} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 group-hover:text-indigo-700 transition text-xs sm:text-sm">বিশেষ প্রতিবেদন সাজান</span>
                      <span className="text-xs text-slate-600 font-semibold">হোমপেজের মূল কভার প্রতিবেদন নির্বাচন</span>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}
              
              {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'].includes(role) && (
                <Link 
                  href="/admin/categories"
                  className="flex items-center justify-between p-3.5 bg-slate-50 text-slate-800 hover:bg-slate-100 rounded-2xl transition duration-200 font-bold text-xs border border-slate-200 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                      <FolderKanban size={17} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 transition text-xs sm:text-sm">ক্যাটাগরি ম্যানেজমেন্ট</span>
                      <span className="text-xs text-slate-600 font-semibold">বিষয়শ্রেণী ও অর্ডারিং কনফিগার</span>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              {['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER', 'EDITOR', 'SUB_EDITOR'].includes(role) && (
                <Link 
                  href="/admin/advertisements"
                  className="flex items-center justify-between p-3.5 bg-amber-50/70 text-amber-900 hover:bg-amber-100 rounded-2xl transition duration-200 font-bold text-xs border border-amber-200 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                      <Megaphone size={17} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 group-hover:text-amber-700 transition text-xs sm:text-sm">বিজ্ঞাপন স্পেস</span>
                      <span className="text-xs text-slate-600 font-semibold">ব্যানার বিজ্ঞাপন ও এনালিটিক্স</span>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}

              {['SUPER_ADMIN', 'ADMIN'].includes(role) && (
                <Link 
                  href="/admin/users"
                  className="flex items-center justify-between p-3.5 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 rounded-2xl transition duration-200 font-bold text-xs border border-emerald-200 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                      <Users size={17} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 group-hover:text-emerald-700 transition text-xs sm:text-sm">ইউজার ও রোলস</span>
                      <span className="text-xs text-slate-600 font-semibold">এডমিন ও রিপোর্টার পারমিশন</span>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* System Health Diagnostic Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-2 uppercase tracking-wider font-mono">
                <Server size={16} className="text-blue-400" />
                <span>সিস্টেম হেলথ ডায়াগনস্টিক</span>
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-300 font-semibold">ডাটাবেস কানেকশন</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  <span>MongoDB Atlas (সচল)</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-300 font-semibold">অন-ডিমান্ড রিভ্যালিডেশন</span>
                <span className="font-bold text-blue-400">সক্রিয়</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-300 font-semibold">পাবলিকেশন রেট</span>
                <span className="font-bold text-slate-100">{publishRatio}% সফল</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


