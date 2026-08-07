'use client';

import { useEffect, useState } from 'react';
import { 
  Upload, 
  X, 
  Trash2, 
  Video, 
  Play,
  CheckCircle2,
  AlertCircle,
  Film
} from 'lucide-react';

interface GalleryVideo {
  id: string;
  youtubeUrl: string;
  title: string;
  categoryTag?: string;
  description?: string;
  order: number;
}

export default function VideoGalleryManagement() {
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [categoryTag, setCategoryTag] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('0');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (res.ok) {
        setVideos(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl || !title) {
      setError('ইউটিউব লিংক এবং শিরোনাম আবশ্যক।');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl,
          title: title.trim(),
          categoryTag: categoryTag.trim(),
          description: description.trim(),
          order: parseInt(order) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('ভিডিও গ্যালারিতে নতুন ভিডিও সফলভাবে যুক্ত করা হয়েছে!');
        setYoutubeUrl('');
        setTitle('');
        setCategoryTag('');
        setDescription('');
        setOrder('0');
        fetchVideos();
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
    if (!confirm('আপনি কি নিশ্চিত যে এই ভিডিওটি মুছে ফেলতে চান?')) {
      return;
    }

    setError('');
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccess('ভিডিও মুছে ফেলা হয়েছে।');
        fetchVideos();
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
            <Video size={16} />
            <span>ভিডিও কনটেন্ট ও ইউটিউব গ্যালারি</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>ভিডিও গ্যালারি ম্যানেজমেন্ট</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {videos.length} টি ভিডিও
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            হোমপেজের ভিডিও গ্যালারি সেকশনে প্রদর্শনের জন্য ইউটিউব ভিডিও লিংক যুক্ত করুন।
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
        {/* Form (Left Column) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Film size={18} className="text-red-600" />
            <span>নতুন ইউটিউব ভিডিও যোগ করুন</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1.5 font-bold text-slate-900">ভিডিওর শিরোনাম <span className="text-red-600">*</span></label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: শেখ হাসিনা দেশে ফিরলে কারাগারে যেতে হবে: আইনমন্ত্রী"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">রেড ব্যানার টেক্সট/ট্যাগ (অপশনাল)</label>
              <input
                type="text"
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                placeholder="যেমন: হাসিনা ফিরলে আইনের মুখোমুখি হতে হবে"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">সংক্ষিপ্ত বিবরণ (অপশনাল)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="যেমন: সাবেক প্রধানমন্ত্রী শেখ হাসিনার দেশে ফেরার প্রসঙ্গে আইনমন্ত্রী অ্যাডভোকেট মো. আসাদুজ্জামান বলেছেন..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-bold focus:outline-none focus:border-red-500 focus:bg-white transition font-medium"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">ইউটিউব ভিডিও ইউআরএল (YouTube URL) <span className="text-red-600">*</span></label>
              <input
                type="url"
                required
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="যেমন: https://www.youtube.com/watch?v=M7lc1UVf-VE"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>

            {/* YouTube Live Preview */}
            {youtubeUrl && getYoutubeId(youtubeUrl) && (
              <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-xs">
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`}
                  className="w-full h-full"
                  title="YouTube Preview"
                />
              </div>
            )}

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
              {submitting ? 'যুক্ত হচ্ছে...' : 'গ্যালারিতে যুক্ত করুন'}
            </button>
          </form>
        </div>

        {/* Video List (Right Column) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>ভিডিও গ্যালারির তালিকা</span>
            <span className="text-xs text-slate-400 font-bold">মোট: {videos.length} টি</span>
          </h3>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
              ভিডিও লোড হচ্ছে...
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">কোনো ভিডিও পাওয়া যায়নি।</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((vid) => {
                const ytId = getYoutubeId(vid.youtubeUrl);
                const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

                return (
                  <div key={vid.id} className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs bg-white group flex flex-col justify-between">
                    <div>
                      <div className="aspect-video bg-slate-900 overflow-hidden relative flex items-center justify-center">
                        {thumbUrl ? (
                          <img src={thumbUrl} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90" />
                        ) : (
                          <Video size={30} className="text-slate-600" />
                        )}
                        <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center absolute shadow-lg group-hover:scale-110 transition">
                          <Play size={18} className="fill-white ml-0.5" />
                        </div>
                        <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          ক্রম: {vid.order}
                        </span>
                      </div>
                      <div className="p-3">
                        <h4 className="font-extrabold text-slate-900 text-xs line-clamp-2 leading-snug">{vid.title}</h4>
                      </div>
                    </div>
                    <div className="p-3 pt-0 flex justify-end">
                      <button
                        onClick={() => handleDelete(vid.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                      >
                        <Trash2 size={14} />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
