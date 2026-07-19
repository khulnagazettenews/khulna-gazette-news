'use client';

import { useEffect, useState } from 'react';
import { Upload, X, Trash2, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface EpaperIssue {
  id: string;
  date: string;
  pdfUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export default function EpaperManagement() {
  const [issues, setIssues] = useState<EpaperIssue[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [date, setDate] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/epaper');
      const data = await res.json();
      if (res.ok) {
        setIssues(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImg(true);
    setError('');
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`আপলোড হচ্ছে (${i + 1}/${files.length})...`);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          newUrls.push(data.url);
        } else {
          setError(data.error || `${file.name} আপলোড ব্যর্থ হয়েছে।`);
        }
      } catch (err) {
        setError('আপলোড ত্রুটি ঘটেছে।');
      }
    }

    setImageUrls((prev) => [...prev, ...newUrls]);
    setUploadingImg(false);
    setUploadProgress('');
  };

  const movePage = (index: number, direction: 'prev' | 'next') => {
    if (direction === 'prev' && index === 0) return;
    if (direction === 'next' && index === imageUrls.length - 1) return;

    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    const updated = [...imageUrls];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImageUrls(updated);
  };

  const deletePage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || imageUrls.length === 0) {
      setError('তারিখ এবং অন্ততঃ একটি ইমেজ পৃষ্ঠা আপলোড করা আবশ্যক।');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/epaper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, pdfUrl: null, imageUrls }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('ই-পেপার সফলভাবে আপলোড করা হয়েছে।');
        setDate('');
        setImageUrls([]);
        fetchIssues();
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
    if (!confirm('আপনি কি নিশ্চিত যে এই দিনের ই-পেপারটি মুছে ফেলতে চান?')) {
      return;
    }

    setError('');
    try {
      const res = await fetch(`/api/epaper/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccess('ই-পেপার মুছে ফেলা হয়েছে।');
        fetchIssues();
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
        <h2 className="text-xl font-bold text-gray-800">ই-পেপার ম্যানেজমেন্ট</h2>
        <p className="text-sm text-gray-500">প্রতিদিনের ছাপা পত্রিকার পেজ ইমেজ সংস্করণ আপলোড করুন।</p>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
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
            <Upload size={18} className="text-red-600" />
            <span>ই-পেপার আপলোড</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">পত্রিকার প্রকাশের তারিখ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                required
              />
            </div>

            {/* Image version upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                পত্রিকার পেজ ইমেজ সমূহ (১ বা একাধিক)
              </label>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 border border-gray-200 p-3 rounded-lg mb-3 bg-slate-50 max-h-[300px] overflow-y-auto font-sans">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-[3/4] border border-gray-300 rounded-lg overflow-hidden group/thumb bg-white flex flex-col justify-between">
                      <img src={url} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {/* Page tag */}
                      <span className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        পৃষ্ঠা {idx + 1}
                      </span>

                      {/* Control overlays */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center gap-1.5 transition duration-150">
                        <button
                          type="button"
                          onClick={() => movePage(idx, 'prev')}
                          disabled={idx === 0}
                          className="bg-white/95 text-slate-800 p-1 rounded hover:bg-slate-100 disabled:opacity-40 transition"
                          title="পূর্বে সরান"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => deletePage(idx)}
                          className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition"
                          title="মুছে ফেলুন"
                        >
                          <X size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => movePage(idx, 'next')}
                          disabled={idx === imageUrls.length - 1}
                          className="bg-white/95 text-slate-800 p-1 rounded hover:bg-slate-100 disabled:opacity-40 transition"
                          title="পরে সরান"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label className="border border-dashed border-gray-300 rounded-lg py-3 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition bg-slate-50">
                <Calendar size={18} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 font-semibold">
                  {uploadingImg ? (uploadProgress || 'আপলোড হচ্ছে...') : 'ইমেজ ফাইল নির্বাচন করুন'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultiImageUpload}
                  className="hidden"
                  disabled={uploadingImg}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'আপলোড হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </form>
        </div>

        {/* Epaper Issues list */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">প্রকাশিত সংখ্যার তালিকা</h3>

          {loading ? (
            <div className="text-center py-10 text-gray-400">লোডিং হচ্ছে...</div>
          ) : issues.length === 0 ? (
            <div className="text-center py-10 text-gray-400">কোনো ই-পেপার পাওয়া যায়নি।</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <div key={issue.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between bg-gray-50 relative group">
                  {issue.imageUrl ? (
                    <div className="aspect-[3/4] w-full bg-white border-b border-gray-200 overflow-hidden relative font-sans">
                      <img src={issue.imageUrl} alt="Epaper issue" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      {issue.imageUrls && issue.imageUrls.length > 0 && (
                        <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded font-bold">
                          {issue.imageUrls.length} পৃষ্ঠা
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[3/4] w-full bg-slate-200 flex flex-col items-center justify-center text-gray-400 border-b border-gray-200 font-sans">
                      <FileText size={40} />
                      <span className="text-[10px] mt-2">ইমেজ সংস্করণ নেই</span>
                    </div>
                  )}

                  <div className="p-3 text-center">
                    <p className="font-semibold text-xs text-gray-700">
                      {new Date(issue.date).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {issue.pdfUrl && (
                      <a
                        href={issue.pdfUrl}
                        target="_blank"
                        className="text-[10px] text-red-600 font-bold block mt-1 hover:underline"
                      >
                        PDF ডাউনলোড
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(issue.id)}
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
