'use client';

import { useEffect, useState } from 'react';
import { Upload, X, Trash2, Calendar, FileText, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface EpaperIssue {
  id: string;
  date: string;
  pdfUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

const PAGE_NAMES = [
  '১ম পৃষ্ঠা (প্রথম-পাতা)',
  '২য় পৃষ্ঠা',
  '৩য় পৃষ্ঠা',
  '৪র্থ পৃষ্ঠা (শেষ-পাতা)'
];

export default function EpaperManagement() {
  const [issues, setIssues] = useState<EpaperIssue[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [date, setDate] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['', '', '', '']); // 4 slots for 4 pages
  
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
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

  // Upload image for a specific page slot (0: Page 1, 1: Page 2, 2: Page 3, 3: Page 4)
  const handleSingleSlotUpload = async (slotIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlot(slotIdx);
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
        setImageUrls((prev) => {
          const next = [...prev];
          next[slotIdx] = data.url;
          return next;
        });
      } else {
        setError(data.error || `${file.name} আপলোড করতে সমস্যা হয়েছে।`);
      }
    } catch (err) {
      setError('আপলোড ত্রুটি ঘটেছে।');
    } finally {
      setUploadingSlot(null);
    }
  };

  // Bulk Upload up to 4 images at once
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    const newSlots = [...imageUrls];

    for (let i = 0; i < Math.min(files.length, 4); i++) {
      setUploadingSlot(i);
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          newSlots[i] = data.url;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setImageUrls(newSlots);
    setUploadingSlot(null);
  };

  const removeSlotImage = (slotIdx: number) => {
    setImageUrls((prev) => {
      const next = [...prev];
      next[slotIdx] = '';
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError('প্রকাশের তারিখ নির্বাচন করুন।');
      return;
    }

    const validUrls = imageUrls.filter((url) => url.trim() !== '');
    if (validUrls.length === 0) {
      setError('অন্ততঃ ১টি পৃষ্ঠা আপলোড করা আবশ্যক (সর্বোচ্চ ৪টি পৃষ্ঠা)।');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/epaper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, pdfUrl: null, imageUrls: validUrls }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('১ দিনের ৪টি পৃষ্ঠার ই-পেপার সফলভাবে সংরক্ষিত হয়েছে!');
        setDate('');
        setImageUrls(['', '', '', '']);
        fetchIssues();
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
    if (!confirm('আপনি কি নিশ্চিত যে এই দিনের ই-পেপারটি মুছে ফেলতে চান?')) {
      return;
    }

    setError('');
    try {
      const res = await fetch(`/api/epaper/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccess('ই-পেপার সংকলন মুছে ফেলা হয়েছে।');
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
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-xl font-bold text-gray-800">ই-পেপার ম্যানেজমেন্ট (১ দিনের ৪টি পৃষ্ঠা)</h2>
        <p className="text-sm text-gray-500">
          প্রতিটি প্রকাশের দিনের জন্য ১ নম্বর থেকে ৪ নম্বর পৃষ্ঠা (প্রথম-পাতা, ২য়-পাতা, ৩য়-পাতা, শেষ-পাতা) আপলোড করুন।
        </p>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-bold">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form (Left Column) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit space-y-5">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b border-gray-150 pb-3">
            <Upload size={20} className="text-red-600" />
            <span>১ দিনের ৪টি পেজ আপলোড করুন</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-1">
                পত্রিকা প্রকাশের তারিখ <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            {/* Quick Bulk Upload */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                একসাথে ৪টি ছবি নির্বাচন করতে চাইলে:
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBulkUpload}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-extrabold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
              />
            </div>

            {/* 4 Dedicated Slots Grid */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-extrabold text-gray-700">
                পৃষ্ঠা অনুযায়ী ছবি আপলোড (১ থেকে ৪):
              </label>

              <div className="grid grid-cols-2 gap-3">
                {PAGE_NAMES.map((pageTitle, idx) => {
                  const url = imageUrls[idx];
                  const isUploading = uploadingSlot === idx;

                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-2.5 bg-gray-50 flex flex-col justify-between space-y-2 relative"
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold text-gray-800 border-b border-gray-200 pb-1">
                        <span>{pageTitle}</span>
                        {url && <Check size={14} className="text-green-600" />}
                      </div>

                      {url ? (
                        <div className="relative aspect-[3/4] rounded overflow-hidden border border-gray-300 bg-white group">
                          <img src={url} alt={pageTitle} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeSlotImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow transition"
                            title="মুছে ফেলুন"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-red-600 bg-white transition p-2 text-center">
                          {isUploading ? (
                            <span className="text-[11px] font-bold text-red-600 animate-pulse">
                              আপলোড হচ্ছে...
                            </span>
                          ) : (
                            <>
                              <Upload size={18} className="text-gray-400 mb-1" />
                              <span className="text-[11px] font-bold text-gray-600">
                                ছবি আপলোড
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSingleSlotUpload(idx, e)}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm py-3 rounded-lg transition disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'সংরক্ষণ করা হচ্ছে...' : '৪টি পাতার ই-পেপার প্রকাশ করুন'}
            </button>
          </form>
        </div>

        {/* Epaper Issues list (Right Column) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-150 pb-2">
            প্রকাশিত ই-পেপার সংখ্যার তালিকা
          </h3>

          {loading ? (
            <div className="text-center py-12 text-gray-400 font-bold">লোডিং হচ্ছে...</div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-bold">কোনো ই-পেপার পাওয়া যায়নি।</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {issues.map((issue) => {
                const list = issue.imageUrls && issue.imageUrls.length > 0
                  ? issue.imageUrls
                  : (issue.imageUrl ? [issue.imageUrl] : []);

                return (
                  <div key={issue.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-slate-50 relative group p-3 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="font-extrabold text-xs text-gray-800">
                        {new Date(issue.date).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </span>
                      <button
                        onClick={() => handleDelete(issue.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded transition"
                        title="ই-পেপার সংকলন মুছে ফেলুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* 4 Thumbnails Mini Grid */}
                    <div className="grid grid-cols-4 gap-1.5 bg-white p-1.5 border border-gray-200 rounded">
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const img = list[slotIdx];
                        return (
                          <div key={slotIdx} className="aspect-[3/4] bg-slate-100 rounded border border-gray-200 overflow-hidden relative">
                            {img ? (
                              <img src={img} alt={`Page ${slotIdx + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-300 font-bold">
                                খালি
                              </div>
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[8px] font-bold text-center py-0.2">
                              P{slotIdx + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold pt-1">
                      <span>মোট পৃষ্ঠা: {list.length}টি</span>
                      {issue.pdfUrl && (
                        <a href={issue.pdfUrl} target="_blank" className="text-red-600 hover:underline">
                          PDF ফাইল
                        </a>
                      )}
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
