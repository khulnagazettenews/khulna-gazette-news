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
  ChevronRight,
  Star
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
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const limit = 10;

  // Fetch Categories for Filter Dropdown
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchNewsList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        query,
        status: statusFilter,
        categoryId: categoryFilter,
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
  }, [page, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNewsList();
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setNews((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to change status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleSetMainLead = async (newsItem: NewsItem) => {
    if (!confirm(`Set "${newsItem.title}" as homepage MAIN LEAD?`)) {
      return;
    }
    try {
      const resFetch = await fetch('/api/reorder?category=top_news');
      const dataFetch = await resFetch.json();
      const currentList: NewsItem[] = dataFetch.news || [];

      const filtered = currentList.filter((n) => n.id !== newsItem.id);
      const updatedNewsIds = [newsItem.id, ...filtered.map((n) => n.id)];

      const resSave = await fetch('/api/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'top_news',
          newsIds: updatedNewsIds,
        }),
      });

      if (resSave.ok) {
        alert(`"${newsItem.title}" set as homepage MAIN LEAD successfully!`);
      } else {
        alert('Failed to set Main Lead');
      }
    } catch (err) {
      alert('Server error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) {
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
        alert(err.error || 'Failed to delete post.');
      }
    } catch (err) {
      alert('An error occurred.');
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
            <span>Posts Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>All Posts</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              Total {total}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage, edit, filter, and review all articles published on Khulna Gazette.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/admin/reorder"
            className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-xs transition"
            title="Reorder homepage post positions"
          >
            <span>⭐ Position Reorder</span>
          </Link>

          <Link
            href="/admin/news/new"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md shadow-red-600/20 transition transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <PlusCircle size={18} />
            <span>Add New Post</span>
          </Link>
        </div>
      </div>

      {/* 2. Filter Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts by title or keyword..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition"
            />
          </form>

          {/* Category Dropdown Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-2xl px-3 py-2.5 focus:outline-none focus:border-red-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

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
            All Statuses
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
            <span>Published</span>
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
            <span>Draft</span>
          </button>
        </div>
      </div>

      {/* 3. News Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Title</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Author</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-center">Views</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
                    Loading posts list...
                  </td>
                </tr>
              ) : news.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No posts found.
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
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
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
                        {item.category?.name || 'General'}
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
                        <span className="truncate">{item.author?.name || 'Reporter'}</span>
                      </div>
                    </td>

                    {/* Status Pill Badge with Inline Quick Status Change */}
                    <td className="px-4 py-3.5">
                      <select
                        value={item.status}
                        onChange={(e) => handleQuickStatusChange(item.id, e.target.value)}
                        className={`text-[11px] font-black px-2.5 py-1 rounded-full outline-none cursor-pointer transition border ${
                          item.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : item.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        }`}
                      >
                        <option value="PUBLISHED">✓ Published</option>
                        <option value="DRAFT">⏳ Draft</option>
                        <option value="SCHEDULED">📅 Scheduled</option>
                        <option value="TRASHED">🗑️ Trash</option>
                      </select>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3.5 text-center font-extrabold text-slate-700">
                      {item.viewCount.toLocaleString('en-US')}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'PUBLISHED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSetMainLead(item)}
                              className="px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="Set as homepage Main Lead"
                            >
                              <Star size={12} className="fill-amber-500 text-amber-500" />
                              <span>Main Lead</span>
                            </button>
                            <Link
                              href={`/${item.category?.slug || 'news'}/${item.id}`}
                              target="_blank"
                              className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                              title="View on Website"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          </>
                        )}
                        <Link
                          href={`/admin/news/${item.id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
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
              Page <span className="font-bold text-slate-900">{page}</span> of {totalPages} ({total} total posts)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-40 shadow-2xs"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-40 shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
