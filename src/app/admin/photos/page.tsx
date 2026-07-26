'use client';

import { useEffect, useState } from 'react';
import { 
  Upload, 
  X, 
  Trash2, 
  Camera, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption?: string;
  credit?: string;
  order: number;
}

export default function PhotoGalleryManagement() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [credit, setCredit] = useState('');
  const [order, setOrder] = useState('0');
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      if (res.ok) {
        setPhotos(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
      } else {
        setError(data.error || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setError('আপলোড ত্রুটি ঘটেছে।');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setError('ছবি আপলোড করা আবশ্যক।');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          caption: caption.trim() || null,
          credit: credit.trim() || null,
          order: parseInt(order) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('গ্যালারিতে নতুন ছবি সফলভাবে যোগ করা হয়েছে!');
        setImageUrl('');
        setCaption('');
        setCredit('');
        setOrder('0');
        fetchPhotos();
      } else {
        setError(data.error || 'সংরক্ষণ করা সম্ভব হয়নি।');
      }
    } catch (err) {
      setError('অনুরোধ পাঠানো সম্ভব হয়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ছবিটি মুছে ফেলতে চান?')) {
      return;
    }

    setError('');
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccess('ছবি মুছে ফেলা হয়েছে।');
        fetchPhotos();
      } else {
        const err = await res.json();
        setError(err.error || 'মুছে ফেলা সম্ভব হয়নি।');
      }
    } catch (err) {
      setError('নেটওয়ার্ক ত্রুটি।');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <Camera size={16} />
            <span>ছবি ফিচার ব্যবস্থাপনা</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>ফটো গ্যালারি ম্যানেজমেন্ট</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {photos.length} টি ছবি
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            হোমপেজের ফটো গ্যালারি সেকশনে প্রকাশের জন্য বিশেষ ছবি ও ক্যাপশন আপলোড করুন।
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Upload size={18} className="text-red-600" />
            <span>নতুন ছবি আপলোড করুন</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1.5 font-extrabold text-slate-900">গ্যালারি ছবি ফাইল <span className="text-red-600">*</span></label>
              {imageUrl ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center group">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-md transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="aspect-video border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition bg-slate-50">
                  {uploading ? (
                    <span className="text-xs font-bold text-red-600 animate-pulse">আপলোড হচ্ছে...</span>
                  ) : (
                    <>
                      <Upload size={22} className="text-slate-400 mb-1.5" />
                      <span className="text-xs font-bold text-slate-600">ছবি সিলেক্ট করুন</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">ছবি বিবরণ / ক্যাপশন (ঐচ্ছিক)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="যেমন: রূপসা নদীতে সূর্যাস্তের মনোরম দৃশ্য"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">ছবি ক্রেডিট / আলোকচিত্রী (ঐচ্ছিক)</label>
              <input
                type="text"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                placeholder="যেমন: খুলনা গেজেট / নিজস্ব প্রতিনিধি"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">ক্রম নম্বর (Order)</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm py-3 rounded-2xl transition disabled:opacity-50 shadow-md shadow-red-600/20"
            >
              {submitting ? 'প্রকাশ হচ্ছে...' : 'গ্যালারিতে যুক্ত করুন'}
            </button>
          </form>
        </div>

        {/* Gallery Cards (Right Column) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>ফটো গ্যালারি ফটোসমূহ</span>
            <span className="text-xs text-slate-400 font-bold">মোট: {photos.length} টি</span>
          </h3>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
              গ্যালারি লোড হচ্ছে...
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">কোনো ছবি পাওয়া যায়নি।</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs bg-white group flex flex-col justify-between">
                  <div>
                    <div className="aspect-video bg-slate-100 overflow-hidden relative">
                      <img src={photo.imageUrl} alt={photo.caption || 'Photo'} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        ক্রম: {photo.order}
                      </span>
                    </div>
                    {photo.caption && (
                      <div className="p-3">
                        <p className="text-xs font-extrabold text-slate-900 line-clamp-2">{photo.caption}</p>
                        {photo.credit && <span className="text-[10px] text-slate-400 font-semibold block mt-1">ছবি: {photo.credit}</span>}
                      </div>
                    )}
                  </div>
                  <div className="p-3 pt-0 flex justify-end">
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                    >
                      <Trash2 size={14} />
                      <span>মুছুন</span>
                    </button>
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
