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

  // Date & Greeting in English
  const currentHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10
  );

  let greetingEn = 'Welcome';
  if (currentHour >= 5 && currentHour < 12) greetingEn = 'Good Morning';
  else if (currentHour >= 12 && currentHour < 16) greetingEn = 'Good Afternoon';
  else if (currentHour >= 16 && currentHour < 19) greetingEn = 'Good Evening';
  else greetingEn = 'Good Night';

  const todayEn = new Date().toLocaleDateString('en-US', {
    timeZone: 'Asia/Dhaka',
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
                    if (role === 'SUPER_ADMIN') return 'Super Admin Panel';
                    if (role === 'ADMIN') return 'Admin Panel';
                    if (role === 'EDITOR') return 'Editor Dashboard';
                    if (role === 'SUB_EDITOR') return 'Sub-Editor Dashboard';
                    if (role === 'REPORTER') return 'Reporter Panel';
                    if (role === 'CONTRIBUTOR') return 'Contributor Panel';
                    if (role === 'ADVERTISEMENT_MANAGER') return 'Ad Manager Panel';
                    return 'Control Panel';
                  })()}
                </span>
                <span className="text-xs text-slate-200 font-bold flex items-center gap-1.5 bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700">
                  <Clock size={14} className="text-blue-400" />
                  <span>{todayEn}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                {greetingEn}, <span className="text-blue-400">{session?.user?.name || 'Admin'}</span>!
              </h1>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed font-medium">
                Manage your news content, special reports, advertisements, and overall website performance in real time.
              </p>
            </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR', 'REPORTER', 'CONTRIBUTOR'].includes(role) && (
              <Link
                href="/admin/news/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-blue-600/30 border border-blue-400/40 transition-all duration-200"
              >
                <PlusCircle size={18} />
                <span>Add New Post</span>
              </Link>
            )}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-700 transition-all duration-200"
            >
              <ExternalLink size={16} className="text-blue-400" />
              <span>Visit Site</span>
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
              {restrictsToOwnNews ? 'My Total Posts' : 'Total Posts'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition duration-200">
              <Newspaper size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalNews}</h2>
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
              <CheckCircle2 size={13} />
              <span>{publishedNewsCount} Published</span>
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
              {restrictsToOwnNews ? 'My Draft Posts' : 'Draft Posts'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition duration-200">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{draftNews}</h2>
            <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              In Draft
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-600 font-semibold truncate">
            {draftNews > 0 ? 'Pending Review & Publish' : 'No Drafts Pending'}
          </p>
        </div>

        {/* Dynamic Card: Team Members / Categories */}
        {['SUPER_ADMIN', 'ADMIN'].includes(role) ? (
          <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-600"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Users</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition duration-200">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalUsers}</h2>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Active Users
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 font-semibold truncate">
              System Roles Active
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-600"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Categories</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition duration-200">
                <FolderKanban size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalCategories}</h2>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Active Categories
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 font-semibold truncate">
              Configured on Site
            </p>
          </div>
        )}

        {/* Total Views Card */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {restrictsToOwnNews ? 'My Total Views' : 'Total Post Views'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <Eye size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalViews.toLocaleString('en-US')}</h2>
            <span className="text-xs font-black text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-200">
              <TrendingUp size={13} />
              <span>Live Views</span>
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-600 font-semibold truncate">
            Realtime Reader Engagement
          </p>
        </div>

        {/* Pending Comments Card */}
        {['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role) && (
          <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-rose-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider font-sans">Pending Comments</span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition duration-200">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{pendingComments}</h2>
              <span className="text-xs font-black text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Awaiting Approval
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 font-semibold truncate">
              {pendingComments > 0 ? 'Review Pending Comments' : 'All Comments Approved'}
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
                <h3 className="font-black text-base text-slate-900">Content Performance & Analytics</h3>
                <p className="text-xs text-slate-600 font-semibold">Post Readership and Publication Density</p>
              </div>
            </div>
            <span className="text-xs font-black text-blue-800 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 flex items-center gap-1">
              <Activity size={14} />
              <span>Avg {avgViews} Views / Post</span>
            </span>
          </div>

          {/* Lightweight SVG Visual Bar Graph */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative">
            <div className="flex items-center justify-between text-xs text-slate-700 font-extrabold mb-3">
              <span>Weekly Posts Overview</span>
              <span className="text-emerald-700 font-black">+{publishRatio}% Publication Rate</span>
            </div>
            <div className="h-32 flex items-end justify-between gap-3 pt-4 px-2">
              {[
                { day: 'Sat', val: 65 },
                { day: 'Sun', val: 80 },
                { day: 'Mon', val: 45 },
                { day: 'Tue', val: 95 },
                { day: 'Wed', val: 70 },
                { day: 'Thu', val: 85 },
                { day: 'Fri', val: 90 }
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
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition font-sans">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block">Total Posts</span>
              <span className="text-lg font-black text-slate-900">{totalNews}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase block">Published</span>
              <span className="text-lg font-black text-emerald-900">{publishedNewsCount}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase block">Drafts</span>
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
                <h3 className="font-black text-base text-slate-900">Category Breakdown</h3>
                <p className="text-xs text-slate-600 font-semibold">Share of Published Posts by Category</p>
              </div>
            </div>
            <Link 
              href="/admin/categories" 
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {categoriesWithCount.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 font-semibold">No Categories Configured</p>
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
                        {count} ({pct}%)
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
              Total {totalCategories} Active Categories Configured
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
                Top Read Articles
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-200 bg-blue-950 px-3 py-1 rounded-full border border-blue-700">
              Live Ranking
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
                    {news.category?.name || 'Post'}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs sm:text-sm leading-snug line-clamp-2 text-slate-100 group-hover:text-blue-300 transition">
                  {news.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1.5 border-t border-slate-700/80">
                  <span className="flex items-center gap-1 text-blue-300 font-extrabold">
                    <Eye size={14} />
                    <span>{news.viewCount.toLocaleString('en-US')} Views</span>
                  </span>
                  <span className="text-xs font-bold text-slate-200 group-hover:translate-x-0.5 transition-transform">
                    Edit &rarr;
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
                  {restrictsToOwnNews ? 'My Recent Posts' : 'Recent Posts'}
                </h2>
                <p className="text-xs text-slate-600 font-semibold">Latest uploaded posts list</p>
              </div>
            </div>
            <Link 
              href="/admin/news" 
              className="inline-flex items-center gap-1 text-xs text-blue-700 font-black hover:text-blue-800 transition bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl border border-blue-200"
            >
              <span>View All Posts</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-black text-slate-600 uppercase tracking-wider font-sans">
                  <th className="px-6 py-3.5">Post</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Views</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {recentNews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-semibold">
                      No posts found.
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
                            <span className="text-xs text-slate-500 block mt-0.5 font-semibold font-sans">
                              {new Date(news.createdAt).toLocaleDateString('en-US', {
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
                          {news.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                          news.status === 'PUBLISHED' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${news.status === 'PUBLISHED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                          <span>{news.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-slate-800 font-sans">
                        {news.viewCount.toLocaleString('en-US')}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/admin/news/${news.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs font-black text-slate-800 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 px-3.5 py-1.5 rounded-xl transition duration-200"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
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
                <span>Quick Actions</span>
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
                      <span className="block font-black text-slate-900 group-hover:text-blue-700 transition text-xs sm:text-sm">Add New Post</span>
                      <span className="text-xs text-slate-600 font-semibold">Create new post for site</span>
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
                      <span className="block font-black text-slate-900 group-hover:text-indigo-700 transition text-xs sm:text-sm">Special Reports</span>
                      <span className="text-xs text-slate-600 font-semibold">Configure homepage cover section</span>
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
                      <span className="block font-black text-slate-900 transition text-xs sm:text-sm">Categories</span>
                      <span className="text-xs text-slate-600 font-semibold">Manage categories & navbar order</span>
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
                      <span className="block font-black text-slate-900 group-hover:text-amber-700 transition text-xs sm:text-sm">Advertisements</span>
                      <span className="text-xs text-slate-600 font-semibold">Ad banners & analytics</span>
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
                      <span className="block font-black text-slate-900 group-hover:text-emerald-700 transition text-xs sm:text-sm">Users & Roles</span>
                      <span className="text-xs text-slate-600 font-semibold">User permissions & roles</span>
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
                <span>System Health Diagnostic</span>
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-300 font-semibold">Database Connection</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  <span>MongoDB Atlas (Connected)</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-300 font-semibold">On-Demand Revalidation</span>
                <span className="font-bold text-blue-400">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-300 font-semibold">Publication Rate</span>
                <span className="font-bold text-slate-100">{publishRatio}% Successful</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


