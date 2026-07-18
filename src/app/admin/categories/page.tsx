'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Pencil, Trash2, ChevronDown, ChevronRight, Folder } from 'lucide-react';

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
        
        // Flatten list for parent selection (only main categories are allowed as parent)
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
        setSuccess(editingId ? 'ক্যাটাগরি আপডেট করা হয়েছে।' : 'নতুন ক্যাটাগরি তৈরি করা হয়েছে।');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">ক্যাটাগরি ম্যানেজমেন্ট</h2>
          <p className="text-sm text-gray-500">খুলনা গেজেট সাইটের ক্যাটাগরি ও সাব-ক্যাটাগরি নিয়ন্ত্রণ করুন।</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-150 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PlusCircle size={18} className="text-red-600" />
            <span>{editingId ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি যোগ করুন'}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরির নাম (বাংলা)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Generate generic slug draft from English translation if possible, or manual
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="যেমন: বাংলাদেশ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">স্লাগ (Slug - ইংরেজিতে)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="যেমন: bangladesh"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">প্যারেন্ট ক্যাটাগরি (ঐচ্ছিক)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্রম নম্বর (Order)</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="0"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {editingId ? 'আপডেট করুন' : 'তৈরি করুন'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 px-4 rounded-lg transition"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories Tree list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">ক্যাটাগরি তালিকা</h3>

          {loading ? (
            <div className="text-center py-10 text-gray-400">লোডিং হচ্ছে...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 text-gray-400">কোনো ক্যাটাগরি পাওয়া যায়নি।</div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  {/* Parent Row */}
                  <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Folder className="text-blue-500" size={18} />
                      <div>
                        <span className="font-bold text-gray-700">{cat.name}</span>
                        <span className="text-[10px] text-gray-400 ml-2">/{cat.slug}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded font-mono">
                        ক্রম: {cat.order}
                      </span>
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="সম্পাদনা"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories list */}
                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <div className="divide-y divide-gray-50 bg-white">
                      {cat.subCategories.map((sub) => (
                        <div key={sub.id} className="pl-10 pr-4 py-2.5 flex items-center justify-between hover:bg-gray-50/55 transition">
                          <div className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">{sub.name}</span>
                            <span className="text-[9px] text-gray-400">/{sub.slug}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-mono">ক্রম: {sub.order}</span>
                            <button
                              onClick={() => handleEdit(sub)}
                              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                              title="সম্পাদনা"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={13} />
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
