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
  Check, 
  AlertCircle, 
  X,
  Upload
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-650"></div>
      </div>
    );
  }

  // Security Check: Only allowed roles
  if (!session || !['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER'].includes(userRole)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Megaphone size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">অননুমোদিত অ্যাক্সেস!</h2>
        <p className="text-gray-600 text-sm mb-4">
          এই পৃষ্ঠাটি শুধুমাত্র বিজ্ঞাপন ম্যানেজার ও অ্যাডমিনদের জন্য সংরক্ষিত। আপনার এই ফিচারটি দেখার অনুমতি নেই।
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

      setSuccess('বিজ্ঞাপন সফলভাবে তৈরি করা হয়েছে।');
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
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ব্যানার বিজ্ঞাপন ও ক্যাম্পেইন ম্যানেজমেন্ট</h2>
          <p className="text-sm text-gray-500">ওয়েবসাইটের বিভিন্ন স্লটের ব্যানার বিজ্ঞাপন তৈরি, আপডেট ও তাদের পারফরম্যান্স ট্র্যাক করুন।</p>
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
          className="flex items-center justify-center gap-2 bg-red-655 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition"
        >
          <PlusCircle size={18} />
          <span>নতুন বিজ্ঞাপন যোগ করুন</span>
        </button>
      </div>

      {/* Error/Success alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3 text-sm animate-pulse">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 rounded-md flex items-center gap-3 text-sm">
          <Check size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Advertisements Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <span className="text-xs mt-2 block">বিজ্ঞাপন তালিকা লোড হচ্ছে...</span>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400">
          <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
          <span>কোনো বিজ্ঞাপন পাওয়া যায়নি।</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              <div>
                {/* Image Preview Container */}
                <div className="aspect-[3/1] bg-gray-50 border-b border-gray-100 relative overflow-hidden flex items-center justify-center">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ad.status === 'ACTIVE' 
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {ad.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{ad.title}</h3>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-1.5 inline-block">
                      {getPositionLabel(ad.position)}
                    </span>
                  </div>

                  {ad.targetUrl && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-650 hover:underline break-all">
                      <LinkIcon size={12} className="shrink-0" />
                      <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="truncate">
                        {ad.targetUrl}
                      </a>
                    </div>
                  )}

                  {/* Scheduled dates */}
                  {(ad.startDate || ad.endDate) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Calendar size={12} className="shrink-0" />
                      <span>
                        {ad.startDate ? new Date(ad.startDate).toLocaleDateString('bn-BD') : 'শুরু থেকে'} - {' '}
                        {ad.endDate ? new Date(ad.endDate).toLocaleDateString('bn-BD') : 'শেষ নাই'}
                      </span>
                    </div>
                  )}

                  {/* Analytics Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                      <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                        <Eye size={10} /> ভিউস
                      </span>
                      <span className="font-extrabold text-gray-700 text-sm mt-0.5 block">{ad.views}</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                      <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                        <MousePointerClick size={10} /> ক্লিকস
                      </span>
                      <span className="font-extrabold text-gray-700 text-sm mt-0.5 block">{ad.clicks}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3.5 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(ad)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                >
                  <Pencil size={13} />
                  <span>এডিট</span>
                </button>
                <button
                  onClick={() => handleDelete(ad)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>মুছে ফেলুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Megaphone size={18} className="text-red-600" />
                <span>নতুন ব্যানার বিজ্ঞাপন যোগ করুন</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">বিজ্ঞাপনের শিরোনাম / ক্যাম্পেইন নাম</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="যেমন: সিটি ব্যাংক হোম লোন ক্যাম্পেইন"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">বিজ্ঞাপন ইমেজ ব্যানার</label>
                {formData.imageUrl ? (
                  <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-[3/1] flex items-center justify-center">
                    <img src={formData.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-1 right-1 bg-red-650 hover:bg-red-700 text-white p-1 rounded-full shadow transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition bg-gray-50">
                    <Upload className="text-gray-400 mb-1" size={20} />
                    <span className="text-[10px] text-gray-500">{uploading ? 'আপলোড হচ্ছে...' : 'ব্যানার ফাইল নির্বাচন করুন'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">ক্লিক করলে যে লিংকে যাবে (Target URL)</label>
                <input
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="যেমন: https://www.bankwebsite.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">বিজ্ঞাপনের পজিশন</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650 bg-white"
                  >
                    <option value="top_banner">শীর্ষ ব্যানার (Top Banner)</option>
                    <option value="sidebar_banner">সাইডবার ব্যানার (Sidebar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">অবস্থা (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650 bg-white"
                  >
                    <option value="ACTIVE">সক্রিয় (Active)</option>
                    <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">শুরুর তারিখ (ঐচ্ছিক)</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">শেষের তারিখ (ঐচ্ছিক)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 border border-gray-300 text-gray-600 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-red-655 hover:bg-red-750 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm hover:shadow transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Pencil size={18} className="text-blue-650" />
                <span>বিজ্ঞাপনের তথ্য সম্পাদন</span>
              </h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentAd(null);
                }}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">বিজ্ঞাপনের শিরোনাম / ক্যাম্পেইন নাম</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">বিজ্ঞাপন ইমেজ ব্যানার</label>
                {formData.imageUrl ? (
                  <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-[3/1] flex items-center justify-center">
                    <img src={formData.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-1 right-1 bg-red-655 hover:bg-red-700 text-white p-1 rounded-full shadow transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition bg-gray-50">
                    <Upload className="text-gray-400 mb-1" size={20} />
                    <span className="text-[10px] text-gray-500">{uploading ? 'আপলোড হচ্ছে...' : 'ব্যানার ফাইল নির্বাচন করুন'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">ক্লিক করলে যে লিংকে যাবে (Target URL)</label>
                <input
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">বিজ্ঞাপনের পজিশন</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650 bg-white"
                  >
                    <option value="top_banner">শীর্ষ ব্যানার (Top Banner)</option>
                    <option value="sidebar_banner">সাইডবার ব্যানার (Sidebar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">অবস্থা (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650 bg-white"
                  >
                    <option value="ACTIVE">সক্রিয় (Active)</option>
                    <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">শুরুর তারিখ (ঐচ্ছিক)</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">শেষের তারিখ (ঐচ্ছিক)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentAd(null);
                  }}
                  className="w-1/2 border border-gray-300 text-gray-600 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-650 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm hover:shadow transition"
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
