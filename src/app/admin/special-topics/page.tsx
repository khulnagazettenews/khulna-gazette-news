'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Pencil, Trash2, Eye, EyeOff, Sparkles, Check, Search, Layers, X, Layers3 } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  category: { name: string };
  publishedAt?: string;
  featuredImage?: string | null;
}

interface SpecialTopic {
  id: string;
  title: string;
  bannerSubtitle?: string | null;
  isActive: boolean;
  newsIds: string[];
  order: number;
  createdAt: string;
}

export default function SpecialTopicManagement() {
  const [topics, setTopics] = useState<SpecialTopic[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('বিশেষ প্রতিবেদন ও আন্তর্জাতিক সংবাদ');
  const [bannerSubtitle, setBannerSubtitle] = useState('বিস্তারিত দেখতে কভার খবরের যেকোনো একটিতে ক্লিক করুন');
  const [isActive, setIsActive] = useState(true);
  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>([]);
  const [order, setOrder] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch topics
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/special-topics');
      const data = await res.json();
      if (res.ok) {
        setTopics(data);
      } else {
        setError(data.error || 'সেকশন তথ্য লোড করা সম্ভব হয়নি।');
      }
    } catch (err) {
      setError('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Fetch published news for selector
  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch('/api/news?status=PUBLISHED&limit=100');
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.items)) {
          setNewsList(data.items);
        } else if (Array.isArray(data)) {
          setNewsList(data);
        } else {
          setNewsList([]);
        }
      } else {
        setNewsList([]);
      }
    } catch (err) {
      console.error('Failed to load news:', err);
      setNewsList([]);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchNews();
  }, []);

  const handleEdit = (topic: SpecialTopic) => {
    setEditingId(topic.id);
    setTitle(topic.title);
    setBannerSubtitle(topic.bannerSubtitle || '');
    setIsActive(topic.isActive);
    setSelectedNewsIds(topic.newsIds || []);
    setOrder(topic.order.toString());
    setError('');
    setSuccess('');
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle('বিশেষ প্রতিবেদন ও আন্তর্জাতিক সংবাদ');
    setBannerSubtitle('বিস্তারিত দেখতে কভার খবরের যেকোনো একটিতে ক্লিক করুন');
    setIsActive(true);
    setSelectedNewsIds([]);
    setOrder('0');
    setError('');
  };

  const handleToggleActive = async (topic: SpecialTopic) => {
    try {
      const newStatus = !topic.isActive;
      const res = await fetch(`/api/special-topics/${topic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (res.ok) {
        setTopics((prev) =>
          prev.map((t) => (t.id === topic.id ? { ...t, isActive: newStatus } : { ...t, isActive: newStatus ? false : t.isActive }))
        );
        setSuccess(newStatus ? 'সেকশনটি দৃশ্যমান (Show) করা হয়েছে।' : 'সেকশনটি হাইড (Hide) করা হয়েছে।');
      } else {
        const data = await res.json();
        setError(data.error || 'আপডেট করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setError('নেটওয়ার্ক ত্রুটি।');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('শিরোনাম আবশ্যক।');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      title,
      bannerSubtitle,
      isActive,
      newsIds: selectedNewsIds,
      order: parseInt(order) || 0,
    };

    try {
      const url = editingId ? `/api/special-topics/${editingId}` : '/api/special-topics';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingId ? 'সেকশন আপডেট করা হয়েছে।' : 'নতুন স্পেশাল টপিক সেকশন তৈরি করা হয়েছে।');
        handleResetForm();
        fetchTopics();
      } else {
        setError(data.error || 'একটি ত্রুটি ঘটেছে।');
      }
    } catch (err) {
      setError('অনুরোধ পাঠানো সম্ভব হয়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই বিশেষ সেকশনটি মুছে ফেলতে চান?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/special-topics/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccess('সেকশন মুছে ফেলা হয়েছে।');
        if (editingId === id) handleResetForm();
        fetchTopics();
      } else {
        const data = await res.json();
        setError(data.error || 'মুছে ফেলা সম্ভব হয়নি।');
      }
    } catch (err) {
      setError('নেটওয়ার্ক ত্রুটি।');
    }
  };

  const toggleSelectNews = (id: string) => {
    if (selectedNewsIds.includes(id)) {
      setSelectedNewsIds(selectedNewsIds.filter((item) => item !== id));
    } else {
      if (selectedNewsIds.length >= 6) {
        alert('সর্বোচ্চ ৬ টি খবর নির্বাচন করা সম্ভব।');
        return;
      }
      setSelectedNewsIds([...selectedNewsIds, id]);
    }
  };

  const safeNewsList = Array.isArray(newsList) ? newsList : [];
  const filteredNews = safeNewsList.filter((n) =>
    n.title ? n.title.toLowerCase().includes(searchQuery.toLowerCase()) : false
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/60">
              <Sparkles size={18} />
            </div>
            <span>বিশেষ প্রতিবেদন সেকশন ম্যানেজমেন্ট</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            হোমপেজের বিশেষ প্রতিবেদন ও কভার নিউজ সেকশনটি চালু/বন্ধ (Hide/Show) করুন এবং নির্দিষ্ট খবরসমূহ নির্বাচন করুন।
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs font-bold shadow-xs animate-in fade-in duration-200">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-bold shadow-xs animate-in fade-in duration-200">
          ✕ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Top Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <PlusCircle size={18} className="text-teal-600" />
              {editingId ? 'সেকশন সম্পাদনা করুন' : 'নতুন বিশেষ সেকশন যোগ করুন'}
            </span>
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-teal-700 hover:underline font-bold"
              >
                নতুন যোগ করুন
              </button>
            )}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সেকশনের মূল শিরোনাম (Title)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                placeholder="যেমন: বিশেষ প্রতিবেদন ও আন্তর্জাতিক সংবাদ"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ব্যানার সাব-টাইটেল (Subtitle)
              </label>
              <input
                type="text"
                value={bannerSubtitle}
                onChange={(e) => setBannerSubtitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                placeholder="যেমন: বিস্তারিত দেখতে কভার খবরের যেকোনো একটিতে ক্লিক করুন"
              />
            </div>

            <div className="flex items-center justify-between bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
              <div>
                <span className="text-xs font-black text-teal-950 block">হোমপেজে দৃশ্যমান থাকবে?</span>
                <span className="text-[11px] font-bold text-teal-700">
                  {isActive ? 'অন রয়েছে (Show)' : 'অফ রয়েছে (Hide)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ক্রম (Order)</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
              />
            </div>

            {/* News Selection Box */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">
                  সেকশনে খবর নির্বাচন করুন ({selectedNewsIds.length}/৬)
                </label>
                {selectedNewsIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedNewsIds([])}
                    className="text-[11px] text-rose-600 hover:underline font-extrabold"
                  >
                    সব ক্লিয়ার করুন
                  </button>
                )}
              </div>

              {/* Selected news list items chips */}
              {selectedNewsIds.length > 0 && (
                <div className="space-y-1.5 p-2.5 bg-teal-50/70 border border-teal-200/80 rounded-xl">
                  <span className="text-[10px] font-bold text-teal-900 block">নির্বাচিত খবরসমূহ (সরিয়ে ফেলতে ✕ এ চাপুন):</span>
                  <div className="space-y-1">
                    {selectedNewsIds.map((id, index) => {
                      const item = safeNewsList.find((n) => n.id === id);
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-teal-100 shadow-2xs text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <span className="font-bold text-slate-800 truncate">
                              {item ? item.title : `খবর (ID: ${id.slice(0, 8)}...)`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSelectNews(id)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition shrink-0"
                            title="মুছে ফেলুন"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search filter input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="খবরের শিরোনাম লিখে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                />
              </div>

              {/* News list picker */}
              <div className="max-h-60 overflow-y-auto border border-slate-200/80 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                {newsLoading ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium">খবর লোড হচ্ছে...</div>
                ) : filteredNews.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium">কোনো খবর পাওয়া যায়নি।</div>
                ) : (
                  filteredNews.slice(0, 35).map((n) => {
                    const isSelected = selectedNewsIds.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => toggleSelectNews(n.id)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition text-xs ${
                          isSelected ? 'bg-teal-100/70 font-bold text-teal-950' : 'hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-4 h-4 rounded border flex items-center justify-center shrink-0 border-slate-400 bg-white">
                            {isSelected && <Check size={12} className="text-teal-700 stroke-[3]" />}
                          </span>
                          <span className="truncate">{n.title}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                          {n.category?.name || 'সাধারণ'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md shadow-teal-700/20 transition disabled:opacity-50"
              >
                {submitting ? 'সংরক্ষণ হচ্ছে...' : editingId ? 'আপডেট করুন' : 'সেভ করুন'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right / List (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers size={18} className="text-teal-600" />
            <span>স্পেশাল সেকশন তালিকা</span>
          </h3>

          {loading ? (
            <div className="text-center py-10 text-slate-400 font-medium">লোডিং হচ্ছে...</div>
          ) : topics.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-2xl p-6 text-xs font-medium">
              এখনো কোনো কাস্টম স্পেশাল সেকশন তৈরি করা হয়নি। পাশে থাকা ফর্ম থেকে তৈরি করুন।
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-2xl p-4 transition duration-200 ${
                    item.isActive
                      ? 'border-teal-300 bg-teal-50/30 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-900 truncate">{item.title}</h4>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${
                            item.isActive
                              ? 'bg-teal-100 text-teal-800 border border-teal-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.isActive ? 'সচল (Active)' : 'হাইড (Hidden)'}
                        </span>
                      </div>
                      {item.bannerSubtitle && (
                        <p className="text-xs text-slate-500 font-medium">{item.bannerSubtitle}</p>
                      )}
                      <div className="text-[11px] text-slate-400 pt-1 font-semibold">
                        সংযুক্ত খবর: {item.newsIds?.length || 0} টি | ক্রম: {item.order}
                      </div>

                      {/* Display Selected News Titles */}
                      {item.newsIds && item.newsIds.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-teal-100/80 space-y-1.5">
                          <span className="text-[11px] font-black text-teal-900 block">সংযুক্ত খবরসমূহ:</span>
                          <div className="space-y-1">
                            {item.newsIds.map((newsId, idx) => {
                              const matchedNews = safeNewsList.find((n) => n.id === newsId);
                              return (
                                <div key={newsId} className="text-xs text-slate-800 flex items-center gap-2 font-bold truncate bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                                  <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="truncate">{matchedNews ? matchedNews.title : `খবর (ID: ${newsId.slice(0, 8)}...)`}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`p-2 rounded-xl border transition ${
                          item.isActive
                            ? 'bg-white hover:bg-amber-50 text-amber-600 border-amber-200 shadow-2xs'
                            : 'bg-white hover:bg-teal-50 text-teal-600 border-teal-200 shadow-2xs'
                        }`}
                        title={item.isActive ? 'হাইড করুন' : 'শো করুন'}
                      >
                        {item.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>

                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 shadow-2xs transition"
                        title="সম্পাদনা করুন"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 shadow-2xs transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
