'use client';

import { useEffect, useState } from 'react';
import { Upload, X, Trash2, Video, Play } from 'lucide-react';

interface GalleryVideo {
  id: string;
  youtubeUrl: string;
  title: string;
  order: number;
}

export default function VideoGalleryManagement() {
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
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
        body: JSON.stringify({ youtubeUrl, title, order }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('ভিডিও সফলভাবে গ্যালারিতে যোগ করা হয়েছে।');
        setYoutubeUrl('');
        setTitle('');
        setOrder('0');
        fetchVideos();
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
    if (!confirm('আপনি কি নিশ্চিত যে এই ভিডিওটি গ্যালারি থেকে মুছে ফেলতে চান?')) {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">ভিডিও গ্যালারি ম্যানেজমেন্ট</h2>
        <p className="text-sm text-gray-500">ইউটিউব ভিডিওর লিংক ও শিরোনাম যোগ করে ভিডিও গ্যালারি তৈরি করুন।</p>
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
            <Video size={18} className="text-red-600" />
            <span>ভিডিও যোগ করুন</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিওর শিরোনাম (বাংলা)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="যেমন: খুলনা রূপসা সেতুর ওপারে পর্যটন"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ইউটিউব ভিডিও লিংক (YouTube URL)</label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="যেমন: https://www.youtube.com/watch?v=..."
                required
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

        {/* Video list */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">গ্যালারির ভিডিওসমূহ</h3>

          {loading ? (
            <div className="text-center py-10 text-gray-400">লোডিং হচ্ছে...</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">কোনো ভিডিও পাওয়া যায়নি।</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map((item) => {
                const ytId = getYoutubeId(item.youtubeUrl);
                const thumbUrl = ytId 
                  ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` 
                  : '/uploads/video-placeholder.jpg';
                return (
                  <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between bg-gray-50 relative group">
                    <div className="relative aspect-video w-full bg-slate-900 border-b border-gray-200 overflow-hidden flex items-center justify-center">
                      <img src={thumbUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80" />
                      <div className="absolute w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-700 transition">
                        <Play size={20} className="ml-0.5 fill-current" />
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-700 line-clamp-2">
                        {item.title}
                      </p>
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
