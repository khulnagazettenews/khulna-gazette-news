'use client';

import { useEffect, useState } from 'react';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  ChevronRight, 
  Folder, 
  FolderKanban, 
  FolderPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Hash,
  Layers
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order: number;
  subCategories?: Category[];
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentOptions, setParentOptions] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [order, setOrder] = useState('0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Load all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
        setParentOptions(data.filter((c: Category) => c.parentId === null));
      } else {
        setError(data.error || 'ক্যাটাগরি লোড করা সম্ভব হয়নি।');
      }
    } catch (err) {
      setError('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setParentId(category.parentId || '');
    setOrder(category.order.toString());
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setParentId('');
    setOrder('0');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError('নাম এবং স্লাগ আবশ্যক।');
      return;
    }

    setFormLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      name,
      slug,
      parentId: parentId || null,
      order: parseInt(order) || 0,
    };

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingId ? 'ক্যাটাগরি আপডেট করা হয়েছে।' : 'নতুন ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে।');
        handleCancel();
        fetchCategories();
      } else {
        setError(data.error || 'একটি ত্রুটি ঘটেছে।');
      }
    } catch (err) {
      setError('অনুরোধ পাঠানো সম্ভব হয়নি।');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ক্যাটাগরি এবং এর অধীনে থাকা সকল সাব-ক্যাটাগরি মুছে ফেলতে চান?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('ক্যাটাগরি মুছে ফেলা হয়েছে।');
        fetchCategories();
      } else {
        setError(data.error || 'মুছে ফেলার অনুমতি নেই বা সমস্যা হয়েছে।');
      }
    } catch (err) {
      setError('মুছে ফেলা সম্ভব হয়নি।');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* 1. Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <FolderKanban size={16} />
            <span>ওয়েবসাইট স্ট্রাকচার ম্যানেজমেন্ট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>ক্যাটাগরি ম্যানেজমেন্ট</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {categories.length} টি ক্যাটাগরি
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            খুলনা গেজেট পোর্টালে প্রকাশনার ক্যাটাগরি ও সাব-ক্যাটাগরি পরিচালনা করুন।
          </p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Category Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FolderPlus size={18} className="text-red-600" />
              <span>{editingId ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি যোগ করুন'}</span>
            </h3>
            {editingId && (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                সম্পাদনা মোড
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1.5 font-bold text-slate-900">ক্যাটাগরির নাম (বাংলা)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 font-bold transition"
                placeholder="যেমন: বাংলাদেশ"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">স্লাগ (Slug - ইংরেজিতে)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 font-bold transition"
                placeholder="যেমন: bangladesh"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">প্যারেন্ট ক্যাটাগরি (ঐচ্ছিক)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 font-bold transition cursor-pointer"
              >
                <option value="">কোনো প্যারেন্ট নেই (মূল ক্যাটাগরি)</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">ক্রম নম্বর (Order)</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 font-bold transition"
                placeholder="0"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black py-3 rounded-2xl shadow-xs transition disabled:opacity-50"
              >
                {editingId ? 'আপডেট করুন' : 'তৈরি করুন'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-4 rounded-2xl transition"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories Tree list */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-teal-600" />
              <span>ক্যাটাগরি ও সাব-ক্যাটাগরি তালিকা</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">প্যারেন্ট ও সাব-ক্যাটাগরি ভিউ</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
              ক্যাটাগরি লোড হচ্ছে...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">কোনো ক্যাটাগরি পাওয়া যায়নি।</div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  {/* Parent Row */}
                  <div className="bg-slate-50/80 px-4 py-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-bold">
                        <Folder size={16} />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">{cat.name}</span>
                        <span className="text-[11px] font-mono text-slate-400 ml-2">/{cat.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-lg font-bold">
                        ক্রম: {cat.order}
                      </span>
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="সম্পাদনা"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories list */}
                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <div className="divide-y divide-slate-100 bg-white">
                      {cat.subCategories.map((sub) => (
                        <div key={sub.id} className="pl-10 pr-4 py-2.5 flex items-center justify-between hover:bg-slate-50/60 transition">
                          <div className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-slate-400" />
                            <span className="text-xs font-extrabold text-slate-700">{sub.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">/{sub.slug}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">ক্রম: {sub.order}</span>
                            <button
                              onClick={() => handleEdit(sub)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="সম্পাদনা"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
