'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Megaphone, 
  Link as LinkIcon, 
  Calendar, 
  Eye, 
  MousePointerClick, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Upload,
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string | null;
  position: string;
  status: string;
  clicks: number;
  views: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

export default function AdvertisementManagementPage() {
  const { data: session, status } = useSession();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    position: 'top_banner',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
  });

  const fetchAds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/advertisements');
      if (!res.ok) {
        throw new Error('বিজ্ঞাপন তালিকা লোড করা যায়নি।');
      }
      const data = await res.json();
      setAds(data);
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    } finally {
      setLoading(false);
    }
  };

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (session && ['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER'].includes(userRole)) {
      fetchAds();
    }
  }, [session, userRole]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Security Check: Only allowed roles
  if (!session || !['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER'].includes(userRole)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-2xl mx-auto my-12 shadow-xs font-sans">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Megaphone size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">অননুমোদিত অ্যাক্সেস!</h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-4">
          এই পৃষ্ঠাটি শুধুমাত্র বিজ্ঞাপন ম্যানেজার ও অ্যাডমিনদের জন্য সংরক্ষিত।
        </p>
      </div>
    );
  }

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        setError(data.error || 'ছবি আপলোড ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setError('ছবি আপলোডের সময় নেটওয়ার্ক সমস্যা হয়েছে।');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/advertisements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'বিজ্ঞাপন তৈরি করা সম্ভব হয়নি।');
      }

      setSuccess('নতুন বিজ্ঞাপন সফলভাবে যোগ করা হয়েছে।');
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        imageUrl: '',
        targetUrl: '',
        position: 'top_banner',
        status: 'ACTIVE',
        startDate: '',
        endDate: '',
      });
      fetchAds();
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentAd) return;

    try {
      const res = await fetch(`/api/advertisements/${currentAd.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'বিজ্ঞাপন আপডেট করা সম্ভব হয়নি।');
      }

      setSuccess('বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে।');
      setIsEditModalOpen(false);
      setFormData({
        title: '',
        imageUrl: '',
        targetUrl: '',
        position: 'top_banner',
        status: 'ACTIVE',
        startDate: '',
        endDate: '',
      });
      setCurrentAd(null);
      fetchAds();
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    }
  };

  const handleDelete = async (ad: Advertisement) => {
    if (!confirm(`"${ad.title}" বিজ্ঞাপনটি কি আপনি নিশ্চিতভাবে মুছে ফেলতে চান?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/advertisements/${ad.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'বিজ্ঞাপন মুছে ফেলা সম্ভব হয়নি।');
      }

      setSuccess('বিজ্ঞাপন সফলভাবে মুছে ফেলা হয়েছে।');
      fetchAds();
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    }
  };

  const openEditModal = (ad: Advertisement) => {
    setCurrentAd(ad);
    setFormData({
      title: ad.title,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl || '',
      position: ad.position,
      status: ad.status,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 10) : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 10) : '',
    });
    setIsEditModalOpen(true);
  };

  const getPositionLabel = (pos: string) => {
    switch (pos) {
      case 'top_banner':
        return 'শীর্ষ ব্যানার (Top Banner)';
      case 'sidebar_banner':
        return 'সাইডবার ব্যানার (Sidebar)';
      default:
        return pos;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <Megaphone size={16} />
            <span>স্পন্সর ও ব্যানার ক্যাম্পেইন</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>বিজ্ঞাপন ব্যবস্থাপনা</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {ads.length} টি ব্যানার
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ওয়েবসাইটের বিভিন্ন স্লটে ব্যানার বিজ্ঞাপন প্রকাশ ও তাদের রিয়েলটাইম ভিউ/ক্লিক ট্রাক করুন।
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: '',
              imageUrl: '',
              targetUrl: '',
              position: 'top_banner',
              status: 'ACTIVE',
              startDate: '',
              endDate: '',
            });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md shadow-red-600/20 transition transform hover:-translate-y-0.5 shrink-0"
        >
          <PlusCircle size={18} />
          <span>নতুন বিজ্ঞাপন যোগ করুন</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Advertisements Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center text-slate-400 font-bold">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
          বিজ্ঞাপন তালিকা লোড হচ্ছে...
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center text-slate-400 font-medium">
          <Megaphone size={40} className="mx-auto text-slate-300 mb-3" />
          <span>কোনো সক্রিয় বিজ্ঞাপন পাওয়া যায়নি।</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-200 group">
              <div>
                {/* Image Preview Container */}
                <div className="aspect-[3/1] bg-slate-100 border-b border-slate-100 relative overflow-hidden flex items-center justify-center">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <span className={`absolute top-2.5 right-2.5 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs ${
                    ad.status === 'ACTIVE' 
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-900/80 text-white backdrop-blur-xs'
                  }`}>
                    {ad.status === 'ACTIVE' ? '● সক্রিয় (Active)' : 'নিষ্ক্রিয়'}
                  </span>
                </div>

                <div className="p-5 space-y-3 text-xs">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">{ad.title}</h3>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-100 mt-1.5 inline-block">
                      {getPositionLabel(ad.position)}
                    </span>
                  </div>

                  {ad.targetUrl && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline break-all font-semibold">
                      <ExternalLink size={13} className="shrink-0" />
                      <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="truncate">
                        {ad.targetUrl}
                      </a>
                    </div>
                  )}

                  {/* Scheduled dates */}
                  {(ad.startDate || ad.endDate) && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <Calendar size={13} className="shrink-0 text-slate-400" />
                      <span>
                        {ad.startDate ? new Date(ad.startDate).toLocaleDateString('bn-BD') : 'শুরু থেকে'} - {' '}
                        {ad.endDate ? new Date(ad.endDate).toLocaleDateString('bn-BD') : 'শেষ নাই'}
                      </span>
                    </div>
                  )}

                  {/* Analytics Stats Grid */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                        <Eye size={12} /> ভিউস
                      </span>
                      <span className="font-black text-slate-900 text-sm mt-0.5 block">{ad.views.toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                        <MousePointerClick size={12} /> ক্লিকস
                      </span>
                      <span className="font-black text-slate-900 text-sm mt-0.5 block">{ad.clicks.toLocaleString('bn-BD')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
                <button
                  onClick={() => openEditModal(ad)}
                  className="p-1.5 px-3 text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center gap-1 shadow-2xs"
                >
                  <Pencil size={13} />
                  <span>সম্পাদনা</span>
                </button>
                <button
                  onClick={() => handleDelete(ad)}
                  className="p-1.5 px-3 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center gap-1 shadow-2xs"
                >
                  <Trash2 size={13} />
                  <span>মুছুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Megaphone size={18} className="text-red-600" />
                <span>নতুন ব্যানার বিজ্ঞাপন যোগ করুন</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1.5 font-bold text-slate-900">বিজ্ঞাপনের শিরোনাম / ক্যাম্পেইন নাম</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="যেমন: সিটি ব্যাংক হোম লোন ক্যাম্পেইন"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 font-bold transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">বিজ্ঞাপন ইমেজ ব্যানার</label>
                {formData.imageUrl ? (
                  <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 aspect-[3/1] flex items-center justify-center">
                    <img src={formData.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full shadow transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 rounded-2xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition bg-slate-50">
                    <Upload className="text-slate-400 mb-1" size={20} />
                    <span className="text-[10px] text-slate-500 font-bold">{uploading ? 'আপলোড হচ্ছে...' : 'ব্যানার ফাইল আপলোড করুন'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">ক্লিক করলে যে লিংকে যাবে (Target URL)</label>
                <input
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="যেমন: https://www.bankwebsite.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 font-semibold transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">বিজ্ঞাপনের পজিশন</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 bg-slate-50 font-bold transition cursor-pointer"
                  >
                    <option value="top_banner">শীর্ষ ব্যানার (Top Banner)</option>
                    <option value="sidebar_banner">সাইডবার ব্যানার (Sidebar)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">অবস্থা (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 bg-slate-50 font-bold transition cursor-pointer"
                  >
                    <option value="ACTIVE">সক্রিয় (Active)</option>
                    <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-3 rounded-2xl shadow-xs transition"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && currentAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Pencil size={18} className="text-blue-600" />
                <span>বিজ্ঞাপনের তথ্য সম্পাদন</span>
              </h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentAd(null);
                }}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1.5 font-bold text-slate-900">বিজ্ঞাপনের শিরোনাম / ক্যাম্পেইন নাম</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 font-bold transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">বিজ্ঞাপন ইমেজ ব্যানার</label>
                {formData.imageUrl ? (
                  <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 aspect-[3/1] flex items-center justify-center">
                    <img src={formData.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full shadow transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 rounded-2xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition bg-slate-50">
                    <Upload className="text-slate-400 mb-1" size={20} />
                    <span className="text-[10px] text-slate-500 font-bold">{uploading ? 'আপলোড হচ্ছে...' : 'ব্যানার ফাইল আপলোড করুন'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">ক্লিক করলে যে লিংকে যাবে (Target URL)</label>
                <input
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 font-semibold transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">বিজ্ঞাপনের পজিশন</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 bg-slate-50 font-bold transition cursor-pointer"
                  >
                    <option value="top_banner">শীর্ষ ব্যানার (Top Banner)</option>
                    <option value="sidebar_banner">সাইডবার ব্যানার (Sidebar)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">অবস্থা (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 bg-slate-50 font-bold transition cursor-pointer"
                  >
                    <option value="ACTIVE">সক্রিয় (Active)</option>
                    <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentAd(null);
                  }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl shadow-xs transition"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
