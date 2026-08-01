'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Search, 
  Eye, 
  ExternalLink,
  Newspaper,
  CheckCircle2,
  Clock,
  Filter,
  Image as ImageIcon,
  User as UserIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  category: { name: string; slug: string };
  subCategory?: { name: string; slug: string } | null;
  author: { name: string };
  status: string;
  viewCount: number;
  createdAt: string;
}

export default function NewsManagementList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;

  const fetchNewsList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        query,
        status: statusFilter,
      });

      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      if (res.ok) {
        setNews(data.items);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsList();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNewsList();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই সংবাদটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      return;
    }

    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchNewsList();
      } else {
        const err = await res.json();
        alert(err.error || 'মুছে ফেলা সম্ভব হয়নি।');
      }
    } catch (err) {
      alert('একটি সমস্যা হয়েছে।');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* 1. Header & Title Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <Newspaper size={16} />
            <span>সংবাদ কন্টেন্ট ব্যবস্থাপনা</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>সংবাদসমূহ</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              মোট {total} টি
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            খুলনা গেজেট পোর্টালের সকল সংবাদ এখান থেকে সম্পাদনা, ফিল্টার এবং রিভিউ করুন।
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/admin/reorder"
            className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-xs transition"
            title="হোমপেজ নিউজ পজিশন ও সিকোয়েন্স সেট করুন"
          >
            <span>⭐ পজিশন সেটিং (Reorder)</span>
          </Link>

          <Link
            href="/admin/news/new"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md shadow-red-600/20 transition transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <PlusCircle size={18} />
            <span>নতুন সংবাদ লিখুন</span>
          </Link>
        </div>
      </div>

      {/* 2. Filter Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="সংবাদের শিরোনাম বা বিষয়বস্তু খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition"
          />
        </form>

        {/* Status Pills Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              statusFilter === '' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সকল সংবাদ
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('PUBLISHED'); setPage(1); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              statusFilter === 'PUBLISHED' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>প্রকাশিত</span>
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('DRAFT'); setPage(1); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              statusFilter === 'DRAFT' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100'
            }`}
          >
            <Clock size={13} />
            <span>খসড়া</span>
          </button>
        </div>
      </div>

      {/* 3. News Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">সংবাদের শিরোনাম</th>
                <th className="px-4 py-4">ক্যাটাগরি</th>
                <th className="px-4 py-4">লেখক</th>
                <th className="px-4 py-4">অবস্থা</th>
                <th className="px-4 py-4 text-center">ভিউ</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
                    সংবাদ তালিকা লোড হচ্ছে...
                  </td>
                </tr>
              ) : news.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    কোনো সংবাদ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                    {/* Title with Image Thumbnail */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                          {item.featuredImage ? (
                            <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 max-w-sm">
                          <Link 
                            href={`/admin/news/${item.id}/edit`}
                            className="font-extrabold text-slate-900 group-hover:text-red-600 transition leading-snug line-clamp-1 block"
                          >
                            {item.title}
                          </Link>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                            {new Date(item.createdAt).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category Pill */}
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 inline-block">
                        {item.category?.name || 'সাধারণ'}
                      </span>
                      {item.subCategory && (
                        <span className="text-slate-400 text-[10px] font-semibold block mt-0.5">
                          ↳ {item.subCategory.name}
                        </span>
                      )}
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3.5 text-slate-700 font-bold">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-extrabold">
                          {item.author?.name ? item.author.name.charAt(0) : <UserIcon size={10} />}
                        </div>
                        <span className="truncate">{item.author?.name || 'রিপোর্টার'}</span>
                      </div>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                        item.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'DRAFT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'PUBLISHED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}></span>
                        <span>
                          {item.status === 'PUBLISHED' ? 'প্রকাশিত' : item.status === 'DRAFT' ? 'খসড়া' : 'শিডিউলড'}
                        </span>
                      </span>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3.5 text-center font-extrabold text-slate-700">
                      {item.viewCount.toLocaleString('bn-BD')}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'PUBLISHED' && (
                          <Link
                            href={`/${item.category?.slug || 'news'}/${item.id}`}
                            target="_blank"
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                            title="ওয়েবসাইটে দেখুন"
                          >
                            <ExternalLink size={15} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/news/${item.id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="সম্পাদনা করুন"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              পৃষ্ঠা <span className="font-bold text-slate-900">{page}</span> / {totalPages} (মোট {total}টি সংবাদ)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-40 shadow-2xs"
              >
                <ChevronLeft size={14} />
                <span>পূর্ববর্তী</span>
              </button>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-40 shadow-2xs"
              >
                <span>পরবর্তী</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
