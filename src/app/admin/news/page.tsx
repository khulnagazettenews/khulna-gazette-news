'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Pencil, Trash2, Search, Eye } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  category: { name: string };
  subCategory?: { name: string } | null;
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
    if (!confirm('আপনি কি নিশ্চিত যে এই সংবাদটি মুছে ফেলতে চান?')) {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">সংবাদসমূহ</h2>
          <p className="text-sm text-gray-500">আপনার সাইটের সকল সংবাদ এখান থেকে পরিচালনা করুন।</p>
        </div>
        <Link
          href="/admin/news/new"
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition h-fit"
        >
          <PlusCircle size={18} />
          <span>নতুন সংবাদ লিখুন</span>
        </Link>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="খবরের শিরোনাম খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
          />
          <button type="submit" className="absolute left-3 top-2.5 text-gray-400">
            <Search size={18} />
          </button>
        </form>

        <div className="w-full md:w-auto flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
          >
            <option value="">সকল খবরের অবস্থা</option>
            <option value="PUBLISHED">প্রকাশিত (Published)</option>
            <option value="DRAFT">খসড়া (Draft)</option>
            <option value="SCHEDULED">শিডিউলড (Scheduled)</option>
          </select>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500">শিরোনাম</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500">ক্যাটাগরি</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500">লেখক</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500">অবস্থা</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500">ভিউ</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    লোডিং হচ্ছে...
                  </td>
                </tr>
              ) : news.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    কোনো সংবাদ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 max-w-sm">
                      <span className="font-semibold text-gray-800 line-clamp-1">{item.title}</span>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        তৈরি হয়েছে:{' '}
                        {new Date(item.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2.5 py-1 rounded">
                        {item.category?.name || 'অনির্ধারিত'}
                      </span>
                      {item.subCategory && (
                        <span className="text-gray-400 text-xs ml-1.5">
                          &gt; {item.subCategory.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.author.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                          item.status === 'PUBLISHED'
                            ? 'bg-green-50 text-green-700 border border-green-150'
                            : item.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border border-amber-150'
                            : 'bg-indigo-50 text-indigo-750 border border-indigo-150'
                        }`}
                      >
                        {item.status === 'PUBLISHED'
                          ? 'প্রকাশিত'
                          : item.status === 'DRAFT'
                          ? 'খসড়া'
                          : 'শিডিউলড'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">{item.viewCount}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/news/${item.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="সম্পাদনা"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
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

        {/* Pagination panel */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              পৃষ্ঠা {page} / {totalPages} (মোট {total}টি খবরের মধ্যে)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="bg-white border border-gray-300 text-gray-600 text-xs px-3 py-1.5 rounded hover:bg-gray-100 transition disabled:opacity-50"
              >
                পূর্ববর্তী
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="bg-white border border-gray-300 text-gray-600 text-xs px-3 py-1.5 rounded hover:bg-gray-100 transition disabled:opacity-50"
              >
                পরবর্তী
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
