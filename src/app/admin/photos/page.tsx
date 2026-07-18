'use client';

import { useEffect, useState } from 'react';
import { Upload, X, Trash2, Camera } from 'lucide-react';

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
        setError(data.error || 'ছবি আপলোড ব্যর্থ হয়েছে।');
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
        body: JSON.stringify({ imageUrl, caption, credit, order }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('ছবি সফলভাবে গ্যালারিতে যোগ করা হয়েছে।');
        setImageUrl('');
        setCaption('');
        setCredit('');
        setOrder('0');
        fetchPhotos();
      } else {
        setError(data.error || 'একটি সমস্যা হয়েছে।');
      }
    } catch (err) {
      setError('অনুরোধ পাঠানো সম্ভব হয়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?')) {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">ফটো গ্যালারি ম্যানেজমেন্ট</h2>
        <p className="text-sm text-gray-500">ফটো গ্যালারির ছবি আপলোড ও ক্যাপশন যোগ করুন।</p>
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
        {/* Upload Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit space-y-4">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-150 pb-2">
            <Camera size={18} className="text-red-600" />
            <span>ছবি যোগ করুন</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image version upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ছবি নির্বাচন করুন</label>
              {imageUrl ? (
                <div className="relative aspect-video w-full border border-gray-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                  <img src={imageUrl} alt="Uploaded gallery" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="border border-dashed border-gray-300 rounded-lg py-5 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition bg-slate-50">
                  <Upload className="text-gray-400 mb-1" size={20} />
                  <span className="text-xs text-gray-500">{uploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাপশন (বাংলা)</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="ছবির ক্যাপশন লিখুন"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্রেডিট (ফটোগ্রাফার)</label>
              <input
                type="text"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="যেমন: খুলনা গেজেট / আলোকচিত্রী"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্রম নম্বর (Order)</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </form>
        </div>

        {/* Epaper Issues list */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">গ্যালারির ছবিসমূহ</h3>

          {loading ? (
            <div className="text-center py-10 text-gray-400">লোডিং হচ্ছে...</div>
          ) : photos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">কোনো ছবি পাওয়া যায়নি।</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {photos.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between bg-gray-50 relative group">
                  <div className="aspect-video w-full bg-white border-b border-gray-200 overflow-hidden">
                    <img src={item.imageUrl} alt={item.caption || 'Gallery Photo'} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>

                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-700 line-clamp-2">
                      {item.caption || 'কোনো ক্যাপশন নেই'}
                    </p>
                    {item.credit && (
                      <p className="text-[10px] text-gray-450 mt-1 font-bold">
                        ছবি: {item.credit}
                      </p>
                    )}
                    <span className="text-[9px] text-gray-400 block mt-1 font-mono">ক্রম: {item.order}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full shadow border border-gray-200 transition opacity-0 group-hover:opacity-100"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
