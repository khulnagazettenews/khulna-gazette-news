'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TiptapEditor from './tiptap';
import { Upload, X, Save, AlertCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  subCategories?: Category[];
}

interface NewsFormProps {
  initialData?: any;
  newsId?: string;
}

export default function NewsForm({ initialData, newsId }: NewsFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'REPORTER';
  const isReporterOrContributor = ['REPORTER', 'CONTRIBUTOR'].includes(role);
  const isSubEditor = role === 'SUB_EDITOR';
  const canPublish = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [imageCaption, setImageCaption] = useState(initialData?.imageCaption || '');
  const [photoCredit, setPhotoCredit] = useState(initialData?.photoCredit || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [subCategoryId, setSubCategoryId] = useState(initialData?.subCategoryId || '');
  const [reporterName, setReporterName] = useState(initialData?.reporterName || '');
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [isBreaking, setIsBreaking] = useState(initialData?.isBreaking || false);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags ? initialData.tags.map((t: any) => t.name).join(', ') : ''
  );
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduledAt 
      ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) 
      : ''
  );
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all parent categories on load
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (res.ok) {
          setCategories(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Sync subcategories when categoryId changes
  useEffect(() => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    const selectedCat = categories.find((c) => c.id === categoryId);
    if (selectedCat && selectedCat.subCategories) {
      setSubCategories(selectedCat.subCategories);
    } else {
      setSubCategories([]);
    }
  }, [categoryId, categories]);

  // Handle Featured Image Upload
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
        setFeaturedImage(data.url);
      } else {
        setError(data.error || 'ছবি আপলোড ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setError('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFeaturedImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !categoryId) {
      setError('শিরোনাম, কন্টেন্ট এবং ক্যাটাগরি আবশ্যক।');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const tagsArray = tagsInput
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    const payload = {
      title,
      subtitle: subtitle || null,
      content,
      featuredImage: featuredImage || null,
      imageCaption: imageCaption || null,
      photoCredit: photoCredit || null,
      categoryId,
      subCategoryId: subCategoryId || null,
      reporterName: reporterName || null,
      status,
      isBreaking,
      isFeatured,
      tags: tagsArray,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    };

    try {
      const url = newsId ? `/api/news/${newsId}` : '/api/news';
      const method = newsId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(newsId ? 'সংবাদটি আপডেট করা হয়েছে।' : 'নতুন সংবাদ প্রকাশিত হয়েছে।');
        // Redirect to listing
        setTimeout(() => {
          router.push('/admin/news');
        }, 1500);
      } else {
        setError(data.error || 'সংবাদ প্রকাশ করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setError('অনুরোধ পাঠানো সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {success && (
        <div className="bg-green-150 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Primary Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="সংবাদের প্রধান শিরোনাম লিখুন"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">উপ-শিরোনাম (ঐচ্ছিক)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="সংবাদের উপ-শিরোনাম লিখুন"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">খবরের বিস্তারিত বিবরণ</label>
              <TiptapEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">এসইও (SEO) মেটাডাটা</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">এসইও টাইটেল (ঐচ্ছিক)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="সার্চ ইঞ্জিনের জন্য টাইটেল"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মেটা ডেসক্রিপশন (ঐচ্ছিক)</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="সংবাদের সংক্ষিপ্ত মেটা বিবরণ লিখুন"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Meta, Settings and Actions */}
        <div className="space-y-6">
          {/* Featured Image card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">ফিচার্ড ইমেজ</h3>
            
            {featuredImage ? (
              <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-video flex items-center justify-center">
                <img src={featuredImage} alt="Featured image" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              role === 'CONTRIBUTOR' ? (
                <div className="border-2 border-dashed border-gray-250 rounded-lg h-36 flex flex-col items-center justify-center bg-gray-50 text-gray-400 select-none">
                  <Upload className="text-gray-300 mb-2" size={24} />
                  <span className="text-xs">ছবি আপলোডের অনুমতি নেই</span>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer hover:border-red-650 transition bg-gray-50">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-xs text-gray-500">{uploading ? 'আপলোড হচ্ছে...' : 'ছবি নির্বাচন করুন'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ইমেজের ক্যাপশন</label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="ইমেজের ক্যাপশন লিখুন"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ফটো ক্রেডিট</label>
              <input
                type="text"
                value={photoCredit}
                onChange={(e) => setPhotoCredit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="যেমন: খুলনা গেজেট"
              />
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">শ্রেণীবিন্যাস</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">প্রধান ক্যাটাগরি</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId('');
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                required
              >
                <option value="">ক্যাটাগরি সিলেক্ট করুন</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {subCategories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  সাব-ক্যাটাগরি / জেলা
                </label>
                <select
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="">সাব-ক্যাটাগরি সিলেক্ট করুন</option>
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">প্রতিবেদকের নাম (ফ্রি টেক্সট)</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="যেমন: বিশেষ প্রতিনিধি / স্টাফ রিপোর্টার"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="বিশ্বকাপ, রাজনীতি, বাজেট"
              />
            </div>
          </div>

          {/* Publishing Settings & Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">প্রকাশনার সেটিংস</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">অবস্থা (Status)</label>
              {isReporterOrContributor ? (
                <div className="w-full border border-gray-250 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-sm font-medium">
                  খসড়া (DRAFT) — প্রকাশ করতে সম্পাদকের অনুমতি লাগবে
                </div>
              ) : (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650 bg-white"
                >
                  <option value="DRAFT">খসড়া (Draft)</option>
                  {(canPublish || (isSubEditor && initialData?.status === 'PUBLISHED')) && (
                    <option value="PUBLISHED">প্রকাশ করুন (Published)</option>
                  )}
                  {(canPublish || (isSubEditor && initialData?.status === 'SCHEDULED')) && (
                    <option value="SCHEDULED">শিডিউল (Scheduled)</option>
                  )}
                  <option value="TRASHED">মুছে ফেলুন (Trashed)</option>
                </select>
              )}
            </div>

            {status === 'SCHEDULED' && !isReporterOrContributor && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">শিডিউল প্রকাশের সময়</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                  required
                />
              </div>
            )}

            {canPublish && (
              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span>ব্রেকিং নিউজ স্ট্রিপে দেখান</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span>ফিচার্ড স্টোরি হিসেবে হাইলাইট করুন</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'সংরক্ষণ করা হচ্ছে...' : 'সংবাদটি সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
