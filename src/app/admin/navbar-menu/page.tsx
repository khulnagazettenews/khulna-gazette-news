'use client';

import { useEffect, useState } from 'react';
import { 
  FolderKanban, 
  FolderPlus, 
  Pencil, 
  Trash2, 
  ChevronRight, 
  Folder, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  Layers
} from 'lucide-react';

interface NavbarItem {
  id: string;
  name: string;
  url: string;
  parentId: string | null;
  order: number;
  subItems?: NavbarItem[];
}

export default function NavbarMenuManagement() {
  const [menuItems, setMenuItems] = useState<NavbarItem[]>([]);
  const [parentOptions, setParentOptions] = useState<NavbarItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [parentId, setParentId] = useState('');
  const [order, setOrder] = useState('0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Load all navbar items
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/navbar-menu');
      const data = await res.json();
      if (res.ok) {
        setMenuItems(data);
        setParentOptions(data.filter((c: NavbarItem) => c.parentId === null));
      } else {
        setError(data.error || 'নেভবার মেনু লোড করা সম্ভব হয়নি।');
      }
    } catch (err) {
      setError('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleEdit = (item: NavbarItem) => {
    setEditingId(item.id);
    setName(item.name);
    setUrl(item.url);
    setParentId(item.parentId || '');
    setOrder(item.order.toString());
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setUrl('');
    setParentId('');
    setOrder('0');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) {
      setError('নাম এবং ইউআরএল আবশ্যক।');
      return;
    }

    setFormLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      name,
      url,
      parentId: parentId || null,
      order: parseInt(order) || 0,
    };

    try {
      const endpoint = editingId ? `/api/navbar-menu/${editingId}` : '/api/navbar-menu';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingId ? 'নেভবার মেনু আইটেম আপডেট করা হয়েছে।' : 'নতুন মেনু আইটেম যোগ করা হয়েছে।');
        handleCancel();
        fetchMenuItems();
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
    if (!confirm('আপনি কি নিশ্চিত যে এই মেনু আইটেমটি মুছে ফেলতে চান?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/navbar-menu/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('মেনু আইটেম মুছে ফেলা হয়েছে।');
        fetchMenuItems();
      } else {
        setError(data.error || 'মুছে ফেলার অনুমতি নেই বা সমস্যা হয়েছে।');
      }
    } catch (err) {
      setError('মুছে ফেলা সম্ভব হয়নি।');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <FolderKanban size={16} />
            <span>নেভবার ম্যানুয়াল বিল্ডার</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>নেভবার মেনু ম্যানেজমেন্ট</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {menuItems.length} টি মেনু আইটেম
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            পোটালের নেভবার (Navbar) ড্রপডাউন ও মেনু আইটেমগুলো স্বাধীনভাবে নিয়ন্ত্রণ ও সাজান।
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
        {/* Navbar Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FolderPlus size={18} className="text-red-600" />
              <span>{editingId ? 'মেনু আইটেম সম্পাদনা' : 'নতুন নেভবার মেনু যোগ করুন'}</span>
            </h3>
            {editingId && (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                সম্পাদনা মোড
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1.5 font-bold text-slate-900">মেনুর নাম (যেমন: বাংলাদেশ)</label>
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
              <label className="block mb-1.5 font-bold text-slate-900">ইউআরএল (Link / Page Path)</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 font-bold transition"
                placeholder="যেমন: /bangladesh অথবা /photo-gallery"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">প্যারেন্ট মেনু (ড্রপডাউন সাব-আইটেমের জন্য)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 font-bold transition cursor-pointer"
              >
                <option value="">কোনো প্যারেন্ট নেই (প্রধান নেভবার আইটেম)</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">ক্রম নম্বর (Order - সিরিয়াল)</label>
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

        {/* Navbar List View */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-teal-600" />
              <span>নেভবার মেনু তালিকা</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">নেভবার ড্রপডাউন হাইরারকি</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
              মেনু লোড হচ্ছে...
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">কোনো মেনু আইটেম পাওয়া যায়নি।</div>
          ) : (
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div key={item.id} className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  {/* Parent Row */}
                  <div className="bg-slate-50/80 px-4 py-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 font-bold">
                        <LinkIcon size={16} />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">{item.name}</span>
                        <span className="text-[11px] font-mono text-slate-400 ml-2">{item.url}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-lg font-bold">
                        ক্রম: {item.order}
                      </span>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="সম্পাদনা"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* SubItems list */}
                  {item.subItems && item.subItems.length > 0 && (
                    <div className="divide-y divide-slate-100 bg-white">
                      {item.subItems.map((sub) => (
                        <div key={sub.id} className="pl-10 pr-4 py-2.5 flex items-center justify-between hover:bg-slate-50/60 transition">
                          <div className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-slate-400" />
                            <span className="text-xs font-extrabold text-slate-700">{sub.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{sub.url}</span>
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
