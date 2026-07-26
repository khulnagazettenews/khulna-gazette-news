'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  GripVertical, 
  Save, 
  Sparkles, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Layout, 
  Star,
  Newspaper,
  Info,
  Grid,
  List
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  category?: { name: string; slug: string };
  publishedAt?: string | null;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export default function AdminReorderPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('top_news');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [poolNews, setPoolNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Add modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch news data on category change
  useEffect(() => {
    fetchReorderData(selectedCategory);
  }, [selectedCategory]);

  const fetchReorderData = async (catSlug: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/reorder?category=${catSlug}`);
      const data = await res.json();

      if (res.ok) {
        setCategories(data.categories || []);
        setNewsList(data.news || []);
        setPoolNews(data.poolNews || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'ডাটা লোড করা সম্ভব হয়নি' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'সার্ভারে কানেক্ট করতে সমস্যা হয়েছে' });
    } finally {
      setLoading(false);
    }
  };

  // Reorder Functions
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= newsList.length) return;
    const updated = [...newsList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setNewsList(updated);
  };

  const makeCenterLead = (index: number) => {
    // Center Lead is position 3 (index 2)
    if (index === 2) return;
    moveItem(index, 2);
  };

  const removeItem = (index: number) => {
    const updated = [...newsList];
    updated.splice(index, 1);
    setNewsList(updated);
  };

  const addNewsToTop = (item: NewsItem) => {
    if (newsList.some((n) => n.id === item.id)) {
      alert('এই খবরটি ইতিমধ্যে গ্রিডে রয়েছে');
      return;
    }
    setNewsList([...newsList, item]);
    setModalOpen(false);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updated = [...newsList];
    const item = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, item);
    setDraggedIndex(index);
    setNewsList(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Save Order to Backend
  const handleSaveOrder = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const newsIds = newsList.map((n) => n.id);
      const res = await fetch('/api/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          newsIds,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'সংবাদের গ্রিড ক্রম সফলভাবে সংরক্ষিত হয়েছে!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'সংরক্ষণ করতে সমস্যা হয়েছে' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'সেভ করার সময় ত্রুটি ঘটেছে' });
    } finally {
      setSaving(false);
    }
  };

  const filteredPool = poolNews.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render a Single Grid Card Component
  const renderGridCard = (item: NewsItem | undefined, index: number, isCenterLead: boolean = false) => {
    if (!item) {
      return (
        <div 
          onClick={() => setModalOpen(true)}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-red-400 hover:text-red-600 transition cursor-pointer bg-slate-50/50 min-h-[160px]"
        >
          <Plus size={24} />
          <span className="text-xs font-bold mt-1">পজিশন #{index + 1} ফাকা রয়েছে</span>
          <span className="text-[10px] text-slate-400 mt-0.5">খবর যুক্ত করতে ক্লিক করুন</span>
        </div>
      );
    }

    return (
      <div
        key={item.id}
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragEnd={handleDragEnd}
        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
          isCenterLead
            ? 'border-2 border-red-500 shadow-xl ring-4 ring-red-500/15 bg-gradient-to-b from-red-50/40 via-white to-white'
            : 'border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300'
        }`}
      >
        {/* Card Header Tag */}
        <div className={`px-3 py-1.5 flex items-center justify-between border-b text-[11px] font-black ${
          isCenterLead 
            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-600' 
            : 'bg-slate-50 text-slate-700 border-slate-100'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="cursor-grab active:cursor-grabbing hover:opacity-80 p-0.5" title="মাউস দিয়ে ড্রাগ করুন">
              <GripVertical size={14} />
            </span>
            <span>{isCenterLead ? '⭐ পজিশন #৩ (সেন্টার মেইন লিড)' : `পজিশন #${index + 1}`}</span>
          </div>

          {item.category && (
            <span className={`text-[10px] px-2 py-0.5 rounded ${isCenterLead ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
              {item.category.name}
            </span>
          )}
        </div>

        {/* Thumbnail Image */}
        <div className={`relative overflow-hidden bg-slate-100 ${isCenterLead ? 'aspect-[16/9]' : 'aspect-video'}`}>
          {item.featuredImage ? (
            <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
              <Newspaper size={24} />
            </div>
          )}
          {isCenterLead && (
            <span className="absolute top-2 left-2 bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow-md">
              MAIN LEAD
            </span>
          )}
        </div>

        {/* Title Content */}
        <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
          <h4 className={`font-extrabold text-slate-900 leading-snug line-clamp-2 ${isCenterLead ? 'text-sm sm:text-base text-red-950 font-black' : 'text-xs'}`}>
            {item.title}
          </h4>

          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2 gap-1">
            {selectedCategory === 'top_news' && index !== 2 && (
              <button
                type="button"
                onClick={() => makeCenterLead(index)}
                className="text-[10px] font-black text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg transition flex items-center gap-1"
                title="সেন্টার মেইন লিড বানান"
              >
                <Star size={12} className="fill-amber-500 text-amber-500" />
                <span>লিড করুন</span>
              </button>
            )}

            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                onClick={() => moveItem(index, index - 1)}
                disabled={index === 0}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition"
                title="পিছনে নিন"
              >
                <ArrowLeft size={13} />
              </button>

              <button
                type="button"
                onClick={() => moveItem(index, index + 1)}
                disabled={index === newsList.length - 1}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition"
                title="সামনে নিন"
              >
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                title="সরিয়ে ফেলুন"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <Grid size={16} />
            <span>হোমপেজ ভিজ্যুয়াল গ্রিড ম্যানেজার</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            নিউজ গ্রিড রিঅর্ডার (Visual Grid Reorder)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            মাউস দিয়ে যেকোনো কার্ড ড্রাগ করে বা অ্যারো টিপে গ্রিডের পজিশন পরিবর্তন করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-xs transition"
          >
            <Plus size={16} />
            <span>খবর যুক্ত করুন</span>
          </button>
          
          <button
            onClick={handleSaveOrder}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-2xl shadow-md shadow-red-600/20 transition duration-200 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'নতুন গ্রিড ক্রম সেভ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 2. Category Selector Tabs */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
        <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
          ক্যাটাগরি বা হোম সেকশন নির্বাচন করুন:
        </label>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('top_news')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              selectedCategory === 'top_news'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles size={14} />
            <span>⭐ টপ নিউজ (হোমপেজ গ্রিড)</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat.slug
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Visual Grid Section */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-xs text-slate-500 font-bold mt-3">সংবাদ গ্রিড ডাটা লোড হচ্ছে...</p>
        </div>
      ) : selectedCategory === 'top_news' ? (
        /* Top News Homepage Visual Layout Grid */
        <div className="space-y-6">
          {/* Main Hero Visual Section (3 Columns) */}
          <div className="bg-slate-900/90 text-white p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-extrabold text-xs text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={16} />
                <span>হোমপেজ হিরো ভিজ্যুয়াল গ্রিড (Home Hero Grid Preview)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-bold">পজিশন ৩ = সেন্টার মেইন লিড</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: 2 Stacked Cards (Position #1 & #2) */}
              <div className="lg:col-span-3 space-y-4">
                <div className="text-[11px] font-bold text-blue-400 border-b border-slate-800 pb-1">
                  বাম পাশের কার্ড ১ & ২ (Positions 1-2)
                </div>
                {renderGridCard(newsList[0], 0)}
                {renderGridCard(newsList[1], 1)}
              </div>

              {/* Center Column: Big Main Lead Card (Position #3) */}
              <div className="lg:col-span-6 space-y-3">
                <div className="text-[11px] font-black text-red-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>⭐ সেন্টার মেইন লিড সংবাদ (Position 3)</span>
                  <span className="text-white text-[10px] bg-red-600 px-2 py-0.5 rounded">MAIN LEAD</span>
                </div>
                {renderGridCard(newsList[2], 2, true)}

                {/* Sub-grid of 4 cards right under lead (Positions #4, #5, #6, #7) */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 block">লিডের নিচের ৪টি সাব-কার্ড (Positions 4-7):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[3, 4, 5, 6].map((idx) => (
                      <div key={idx} className="scale-95 origin-top">
                        {renderGridCard(newsList[idx], idx)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Guide */}
              <div className="lg:col-span-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-teal-400 border-b border-slate-800 pb-2">
                  গ্রিড গাইডলাইন
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  মাউস দিয়ে যে কোনো কার্ড ড্রাগ করে অন্য কার্ডের উপর ছেড়ে দিন, স্বয়ংক্রিয়ভাবে স্থান পরিবর্তন হবে।
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-red-400 block text-[11px]">পজিশন ৩:</span>
                  <span className="text-[10px] text-slate-400">এই খবরটি মূল সাইটের কেন্দ্রে সবচেয়ে বড় ছবি ও হেডলাইনে দেখাবে।</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Grid (Positions #8 to #15) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                অন্যান্য টপ নিউজ গ্রিড (Positions 8 - 15)
              </h3>
              <span className="text-xs text-slate-400 font-bold">মোট: {Math.max(newsList.length, 15)} টি</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: Math.max(newsList.length, 15) - 7 }).map((_, i) => {
                const idx = i + 7;
                return renderGridCard(newsList[idx], idx);
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Regular Category Grid Layout */
        <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              ক্যাটাগরি গ্রিড পজিশন ({selectedCategory.toUpperCase()})
            </h3>
            <span className="text-xs text-slate-400 font-bold">মোট: {newsList.length} টি</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newsList.map((item, idx) => renderGridCard(item, idx, idx === 0))}
          </div>
        </div>
      )}

      {/* Add News Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                প্রকাশিত সংবাদ তালিকা থেকে যুক্ত করুন
              </h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="সংবাদের শিরোনাম দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPool.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium text-center py-8">
                  কোনো সংবাদ পাওয়া যায়নি।
                </p>
              ) : (
                filteredPool.map((item) => {
                  const isAdded = newsList.some((n) => n.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                          {item.category?.name}
                        </span>
                        <h4 className="font-extrabold text-slate-900 truncate mt-1">
                          {item.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => addNewsToTop(item)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-xl font-extrabold transition shrink-0 ${
                          isAdded
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-2xs'
                        }`}
                      >
                        {isAdded ? 'যুক্ত আছে' : '+ যুক্ত করুন'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
