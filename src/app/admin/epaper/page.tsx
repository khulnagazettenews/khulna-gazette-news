'use client';

import { useEffect, useState } from 'react';
import { 
  Upload, 
  X, 
  Trash2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  FileImage,
  Sparkles,
  Check,
  Download
} from 'lucide-react';

interface EpaperIssue {
  id: string;
  date: string;
  pdfUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

const toBengaliDigit = (num: number) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map((d) => bnDigits[parseInt(d)] || d).join('');
};

const getAdminPageName = (idx: number, total: number) => {
  if (idx === 0) return '১ম পৃষ্ঠা (প্রথম-পাতা)';
  if (total > 1 && idx === total - 1) return `${toBengaliDigit(idx + 1)}তম পৃষ্ঠা (শেষ-পাতা)`;
  const ordinals = ['১ম', '২য়', '৩য়', '৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম', '১১দশ', '১২দশ'];
  return `${ordinals[idx] || `${toBengaliDigit(idx + 1)}তম`} পৃষ্ঠা`;
};

export default function EpaperManagement() {
  const [issues, setIssues] = useState<EpaperIssue[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State - 8 default page slots for 8 pages epaper support
  const [date, setDate] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['', '', '', '', '', '', '', '']);
  
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

  // Upload image for a specific page slot
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

  // Bulk Upload 8+ images at once
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    let newSlots = [...imageUrls];
    if (files.length > newSlots.length) {
      newSlots = [...newSlots, ...Array(files.length - newSlots.length).fill('')];
    }

    for (let i = 0; i < files.length; i++) {
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

  const addExtraSlot = () => {
    setImageUrls((prev) => [...prev, '']);
  };

  const removeSlotImage = (slotIdx: number) => {
    setImageUrls((prev) => {
      const next = [...prev];
      next[slotIdx] = '';
      return next;
    });
  };

  const removeSlotEntirely = (slotIdx: number) => {
    if (imageUrls.length <= 4) return;
    setImageUrls((prev) => prev.filter((_, idx) => idx !== slotIdx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError('প্রকাশের তারিখ নির্বাচন করুন।');
      return;
    }

    const validUrls = imageUrls.filter((url) => url.trim() !== '');
    if (validUrls.length === 0) {
      setError('অন্ততঃ ১টি পৃষ্ঠা আপলোড করা আবশ্যক।');
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
        setSuccess(`১ দিনের মোট ${validUrls.length}টি পৃষ্ঠার ই-পেপার সফলভাবে প্রকাশিত হয়েছে!`);
        setDate('');
        setImageUrls(['', '', '', '', '', '', '', '']);
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <FileImage size={16} />
            <span>ডিজিটাল ই-পেপার আর্কাইভ (১ থেকে ৮+ পৃষ্ঠা)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>ই-পেপার ব্যবস্থাপনা</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {issues.length} টি প্রকাশনা
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            প্রতিটি প্রকাশের দিনের জন্য ১ থেকে ৮ (বা প্রয়োজন অনুযায়ী যতখুশি) পৃষ্ঠা আপলোড ও স্বয়ংক্রিয়ভাবে নিয়ন্ত্রণ করুন।
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
        {/* Upload Form (Left Column) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Upload size={18} className="text-red-600" />
            <span>১ দিনের ই-পেপার আপলোড (১ থেকে ৮+ পৃষ্ঠা)</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            {/* Date Input */}
            <div>
              <label className="block mb-1.5 font-extrabold text-slate-900">
                পত্রিকা প্রকাশের তারিখ <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-red-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Quick Bulk Upload */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                একসাথে ৮টি (বা সব) পৃষ্ঠার ছবি ফাইল নির্বাচন করুন:
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBulkUpload}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>

            {/* Dedicated Slots Grid */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-900">
                  পৃষ্ঠা অনুযায়ী ছবি প্রিভিউ (মোট {imageUrls.length}টি স্লট):
                </label>
                <button
                  type="button"
                  onClick={addExtraSlot}
                  className="text-[11px] font-extrabold text-red-600 hover:underline"
                >
                  + স্লট বাড়ান
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[460px] overflow-y-auto p-1 border border-slate-100 rounded-2xl scrollbar-thin">
                {imageUrls.map((_, idx) => {
                  const url = imageUrls[idx];
                  const isUploading = uploadingSlot === idx;
                  const pageTitle = getAdminPageName(idx, imageUrls.length);

                  return (
                    <div
                      key={idx}
                      className="border border-slate-200/90 rounded-2xl p-2.5 bg-slate-50 flex flex-col justify-between space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-black text-slate-800 border-b border-slate-200/70 pb-1">
                        <span className="truncate max-w-[110px]">{pageTitle}</span>
                        <div className="flex items-center gap-1">
                          {url && <Check size={14} className="text-emerald-600 shrink-0" />}
                          {imageUrls.length > 4 && (
                            <button
                              type="button"
                              onClick={() => removeSlotEntirely(idx)}
                              className="text-slate-400 hover:text-red-600 transition"
                              title="স্লট রিমুভ করুন"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {url ? (
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 bg-white group">
                          <img src={url} alt={pageTitle} className="w-full h-full object-cover epaper-sharp" />
                          <button
                            type="button"
                            onClick={() => removeSlotImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-md transition"
                            title="মুছে ফেলুন"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="aspect-[3/4] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-600 bg-white transition p-2 text-center">
                          {isUploading ? (
                            <span className="text-[10px] font-extrabold text-red-600 animate-pulse">
                              আপলোড হচ্ছে...
                            </span>
                          ) : (
                            <>
                              <Upload size={18} className="text-slate-400 mb-1" />
                              <span className="text-[10px] font-bold text-slate-600">
                                আপলোড করুন
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
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm py-3 rounded-2xl transition disabled:opacity-50 shadow-md shadow-red-600/20"
            >
              {submitting ? 'প্রকাশিত করা হচ্ছে...' : 'ই-পেপার প্রকাশ করুন'}
            </button>
          </form>
        </div>

        {/* Epaper Issues list (Right Column) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>প্রকাশিত ই-পেপার সংখ্যার তালিকা</span>
            <span className="text-xs text-slate-400 font-bold">মোট: {issues.length} টি</span>
          </h3>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
              ই-পেপার লোড হচ্ছে...
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">কোনো ই-পেপার পাওয়া যায়নি।</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {issues.map((issue) => {
                const list = issue.imageUrls && issue.imageUrls.length > 0
                  ? issue.imageUrls.filter(Boolean)
                  : (issue.imageUrl ? [issue.imageUrl] : []);

                return (
                  <div key={issue.id} className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs bg-slate-50/70 p-3.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="font-black text-xs text-slate-900">
                        {new Date(issue.date).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </span>
                      <button
                        onClick={() => handleDelete(issue.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition"
                        title="ই-পেপার সংকলন মুছে ফেলুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Auto-Adjusting Thumbnails Grid */}
                    <div 
                      className="grid gap-1.5 bg-white p-1.5 border border-slate-200 rounded-xl max-h-48 overflow-y-auto scrollbar-thin"
                      style={{
                        gridTemplateColumns: list.length <= 4 
                          ? 'repeat(4, 1fr)' 
                          : 'repeat(auto-fill, minmax(50px, 1fr))'
                      }}
                    >
                      {list.map((img, slotIdx) => {
                        return (
                          <div key={slotIdx} className="aspect-[3/4] bg-slate-100 rounded-lg border border-slate-200 overflow-hidden relative">
                            {img ? (
                              <img src={img} alt={`Page ${slotIdx + 1}`} className="w-full h-full object-cover epaper-sharp" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-300 font-bold">
                                খালি
                              </div>
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-white text-[8px] font-black text-center py-0.2">
                              P{slotIdx + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold pt-0.5">
                      <span>মোট পৃষ্ঠা: {list.length}টি</span>
                      {issue.pdfUrl && (
                        <a href={issue.pdfUrl} target="_blank" className="text-red-600 hover:underline flex items-center gap-1">
                          <Download size={12} />
                          <span>পিডিএফ (PDF)</span>
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
