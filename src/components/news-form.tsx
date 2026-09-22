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

const toDatetimeLocal = (dateStr?: string | Date | null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

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
  const [authorTitle, setAuthorTitle] = useState(initialData?.authorTitle || '');
  const [status, setStatus] = useState(initialData?.status || (canPublish ? 'PUBLISHED' : 'DRAFT'));
  const [isBreaking, setIsBreaking] = useState(initialData?.isBreaking || false);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags ? initialData.tags.map((t: any) => t.name).join(', ') : ''
  );
  const [scheduledAt, setScheduledAt] = useState(
    toDatetimeLocal(initialData?.scheduledAt)
  );
  const [publishedAt, setPublishedAt] = useState(
    toDatetimeLocal(initialData?.publishedAt)
  );
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-Save Draft State (for new news creation)
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);

  // Check for existing local draft on mount
  useEffect(() => {
    if (!newsId && typeof window !== 'undefined') {
      const saved = localStorage.getItem('kg_news_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title || parsed.content) {
            setHasDraft(true);
            setDraftData(parsed);
          }
        } catch (e) {}
      }
    }
  }, [newsId]);

  // Auto-save draft on title/content change
  useEffect(() => {
    if (!newsId && (title || content)) {
      const timeout = setTimeout(() => {
        localStorage.setItem('kg_news_draft', JSON.stringify({ title, subtitle, content, categoryId }));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [newsId, title, subtitle, content, categoryId]);

  const handleRestoreDraft = () => {
    if (draftData) {
      if (draftData.title) setTitle(draftData.title);
      if (draftData.subtitle) setSubtitle(draftData.subtitle);
      if (draftData.content) setContent(draftData.content);
      if (draftData.categoryId) setCategoryId(draftData.categoryId);
      setHasDraft(false);
    }
  };

  const handleDiscardDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kg_news_draft');
    }
    setHasDraft(false);
  };

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
      authorTitle: authorTitle || null,
      status,
      isBreaking,
      isFeatured,
      tags: tagsArray,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
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
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kg_news_draft');
        }
        setSuccess(newsId ? 'Post updated successfully.' : 'New post created successfully.');
        // Redirect to listing
        setTimeout(() => {
          router.push('/admin/news');
        }, 1500);
      } else {
        setError(data.error || 'Failed to save post.');
      }
    } catch (err) {
      setError('Network request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl font-sans">
      {hasDraft && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <span>An unsaved local draft was found! Would you like to restore it?</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs transition"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-semibold">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 font-semibold">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Primary Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Enter post title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Optional)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Enter post subtitle..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Post Content</label>
              <TiptapEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">SEO Metadata</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (Optional)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Meta title for search engines..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (Optional)</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Short meta summary for search engines..."
              />
            </div>
          </div>
        </div>

        {/* Right Side - Meta, Settings and Actions */}
        <div className="space-y-6">
          {/* Featured Image card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Featured Image</h3>
            
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
                  <span className="text-xs">Image upload restricted for contributors</span>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer hover:border-red-650 transition bg-gray-50">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'Select Featured Image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Image Caption</label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Enter image caption..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Photo Credit</label>
              <input
                type="text"
                value={photoCredit}
                onChange={(e) => setPhotoCredit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="e.g. Khulna Gazette / Staff Reporter"
              />
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Taxonomy</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Primary Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId('');
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                required
              >
                <option value="">Select Category</option>
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
                  Sub-category / District
                </label>
                <select
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="">Select Sub-category</option>
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reporter Name</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="e.g. Staff Reporter / Khulna Bureau"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Author Title / Designation</label>
              <input
                type="text"
                value={authorTitle}
                onChange={(e) => setAuthorTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="e.g. Special Correspondent / District Reporter"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Sports, Politics, Economy"
              />
            </div>
          </div>

          {/* Publishing Settings & Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Publish Settings</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              {isReporterOrContributor ? (
                <div className="w-full border border-gray-250 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-sm font-medium">
                  Draft — requires editor review before publication
                </div>
              ) : (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650 bg-white"
                >
                  <option value="DRAFT">Draft</option>
                  {(canPublish || (isSubEditor && initialData?.status === 'PUBLISHED')) && (
                    <option value="PUBLISHED">Published</option>
                  )}
                  {(canPublish || (isSubEditor && initialData?.status === 'SCHEDULED')) && (
                    <option value="SCHEDULED">Scheduled</option>
                  )}
                  <option value="TRASHED">Trash</option>
                </select>
              )}
            </div>

            {status === 'SCHEDULED' && !isReporterOrContributor && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Schedule Publishing Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                  required
                />
              </div>
            )}

            {!isReporterOrContributor && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Publish Date & Time (Optional / Backdate)
                </label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Leave blank for current time. Select date to publish as backdated article.
                </p>
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
                  <span>Show in Breaking News ticker</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span>Highlight as Featured Story</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Post'}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
