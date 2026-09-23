'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TiptapEditor from './tiptap';
import { Upload, X, Save, AlertCircle, Eye, ChevronUp, ChevronDown, Check } from 'lucide-react';
import MediaModal from '@/components/media-modal';

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
  const canPublish = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'].includes(role);

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
  const [format, setFormat] = useState('Standard');
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags ? initialData.tags.map((t: any) => t.name).join(', ') : ''
  );
  const [tagAddInput, setTagAddInput] = useState('');
  const [scheduledAt, setScheduledAt] = useState(
    toDatetimeLocal(initialData?.scheduledAt)
  );
  const [publishedAt, setPublishedAt] = useState(
    toDatetimeLocal(initialData?.publishedAt)
  );
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFeaturedMediaModal, setShowFeaturedMediaModal] = useState(false);

  // Auto-Save Draft State
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

  const handleRemoveImage = () => {
    setFeaturedImage('');
  };

  const handleAddSingleTag = () => {
    if (!tagAddInput.trim()) return;
    const currentTags = tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean);
    if (!currentTags.includes(tagAddInput.trim())) {
      setTagsInput([...currentTags, tagAddInput.trim()].join(', '));
    }
    setTagAddInput('');
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
        setTimeout(() => {
          router.push('/admin/news');
        }, 1200);
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl font-sans text-gray-800">
      {/* Notifications */}
      {hasDraft && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 rounded text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>An unsaved local draft was found! Would you like to restore it?</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded text-xs transition"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-3 py-1 rounded text-xs transition"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2.5 rounded text-xs font-semibold">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2.5 rounded text-xs flex items-center gap-2 font-semibold">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* WordPress 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column (3 Cols / ~75% width) - Main Title, Subtitle, Editor */}
        <div className="lg:col-span-3 space-y-4">
          {/* Secondary Title Box */}
          <div>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder:text-gray-400"
              placeholder="Enter secondary title here"
            />
          </div>

          {/* Main Title Box (WordPress Style Extra Large Input) */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-3.5 py-2.5 text-lg font-normal focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder:text-gray-400"
              placeholder="Add title"
              required
            />
          </div>

          {/* Editor Area */}
          <div className="bg-white rounded border border-gray-300 shadow-2xs">
            <TiptapEditor value={content} onChange={setContent} />
          </div>

          {/* SEO Metadata Box */}
          <div className="bg-white border border-gray-300 rounded shadow-2xs overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">SEO Metadata</h3>
              <div className="flex gap-1 text-gray-400">
                <ChevronUp size={14} className="cursor-pointer hover:text-gray-600" />
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                  placeholder="Meta title for search engines..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                  placeholder="Meta summary for search engines..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col / ~25% width) - Authentic WordPress Sidebar Widgets */}
        <div className="space-y-4 text-xs">
          {/* 1. News Author Title Widget */}
          <div className="bg-white border border-gray-300 rounded shadow-2xs overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3.5 py-2 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs">News Author Title</h3>
              <div className="flex gap-1 text-gray-400">
                <ChevronUp size={14} className="cursor-pointer" />
              </div>
            </div>
            <div className="p-3">
              <label className="block text-[11px] text-gray-600 mb-1 font-medium">News Author Title</label>
              <input
                type="text"
                value={authorTitle}
                onChange={(e) => setAuthorTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                placeholder="e.g. Special Correspondent"
              />
            </div>
          </div>

          {/* 2. Featured Image Widget */}
          <div className="bg-white border border-gray-300 rounded shadow-2xs overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3.5 py-2 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs">Featured image</h3>
              <div className="flex gap-1 text-gray-400">
                <ChevronUp size={14} className="cursor-pointer" />
              </div>
            </div>
            <div className="p-3.5 space-y-2">
              {featuredImage ? (
                <div className="space-y-2">
                  <div className="relative border border-gray-200 rounded overflow-hidden aspect-video bg-gray-50 group">
                    <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setShowFeaturedMediaModal(true)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold"
                    >
                      Click to Change Image
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-blue-600 hover:underline text-[11px] block"
                  >
                    Remove featured image
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFeaturedMediaModal(true)}
                  className="text-blue-600 hover:underline text-xs font-semibold block text-left"
                >
                  Set featured image
                </button>
              )}
            </div>
          </div>

          {/* 3. Publish Widget (WordPress Authentic Publish Box) */}
          <div className="bg-white border border-gray-300 rounded shadow-2xs overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3.5 py-2 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs">Publish</h3>
              <div className="flex gap-1 text-gray-400">
                <ChevronUp size={14} className="cursor-pointer" />
              </div>
            </div>

            <div className="p-3.5 space-y-3">
              {/* Top Action Buttons: Save Draft & Preview */}
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('DRAFT');
                    setTimeout(() => {
                      (document.querySelector('form') as HTMLFormElement)?.requestSubmit();
                    }, 50);
                  }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold rounded text-[11px] transition"
                >
                  Save Draft
                </button>

                {newsId && (
                  <a
                    href={`/news/${newsId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold rounded text-[11px] transition inline-flex items-center gap-1"
                  >
                    <Eye size={12} />
                    <span>Preview</span>
                  </a>
                )}
              </div>

              {/* Status Row */}
              <div className="space-y-2 text-[11px] text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Status: <strong className="text-gray-900">{status}</strong></span>
                  {!isReporterOrContributor && (
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="border border-gray-300 rounded px-1.5 py-0.5 text-[11px] bg-white text-blue-600 font-semibold cursor-pointer outline-none"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="TRASHED">Trash</option>
                    </select>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span>Visibility: <strong className="text-gray-900">Public</strong></span>
                  <span className="text-blue-600 hover:underline cursor-pointer">Edit</span>
                </div>

                <div className="space-y-1 pt-1 border-t border-gray-100">
                  <label className="block text-[11px] text-gray-600">Publish Date & Time:</label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-[11px] bg-white outline-none"
                  />
                </div>
              </div>

              {/* Placement Checkboxes (Featured & Breaking Ticker) */}
              {canPublish && (
                <div className="space-y-1.5 pt-2 border-t border-gray-200 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                    />
                    <span>ফিচার (Featured / Special Topic)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={(e) => setIsBreaking(e.target.checked)}
                      className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Breaking News Ticker</span>
                  </label>
                </div>
              )}

              {/* Bottom Primary Publish / Update Button */}
              <div className="bg-gray-50 -mx-3.5 -mb-3.5 p-3.5 border-t border-gray-200 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-1.5 rounded text-xs shadow-2xs transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : newsId ? 'Update' : 'Publish'}
                </button>
              </div>
            </div>
          </div>

          {/* 4. Categories Widget */}
          <div className="bg-white border border-gray-300 rounded shadow-2xs overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3.5 py-2 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs">Categories</h3>
              <div className="flex gap-1 text-gray-400">
                <ChevronUp size={14} className="cursor-pointer" />
              </div>
            </div>

            <div className="p-3.5 space-y-2.5">
              <div className="flex border-b border-gray-200 text-[11px] font-semibold">
                <button
                  type="button"
                  className="px-2.5 py-1 border-b-2 border-blue-600 text-blue-600 bg-white"
                >
                  All Categories
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 text-gray-500 hover:text-gray-700"
                >
                  Most Used
                </button>
              </div>

              <div className="max-h-52 overflow-y-auto border border-gray-200 rounded p-2.5 bg-white space-y-1.5 text-[11px]">
                {categories.map((c) => {
                  const isPrimaryChecked = categoryId === c.id;
                  const isTagChecked = tagsInput.split(',').map((t: string) => t.trim().toLowerCase()).includes(c.name.toLowerCase());
                  const isChecked = isPrimaryChecked || isTagChecked;

                  return (
                    <div key={c.id} className="space-y-1">
                      <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (!categoryId) setCategoryId(c.id);
                              const currentTags = tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean);
                              if (!currentTags.includes(c.name)) {
                                setTagsInput([...currentTags, c.name].join(', '));
                              }
                            } else {
                              if (categoryId === c.id) setCategoryId('');
                              const currentTags = tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean);
                              setTagsInput(currentTags.filter((t: string) => t.toLowerCase() !== c.name.toLowerCase()).join(', '));
                            }
                          }}
                          className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className={isPrimaryChecked ? 'font-bold text-blue-700' : 'font-normal'}>{c.name}</span>
                      </label>

                      {c.subCategories && c.subCategories.length > 0 && (
                        <div className="pl-4 space-y-1 border-l border-gray-200 ml-1">
                          {c.subCategories.map((sub) => {
                            const isSubPrimary = subCategoryId === sub.id;
                            const isSubTagChecked = tagsInput.split(',').map((t: string) => t.trim().toLowerCase()).includes(sub.name.toLowerCase());
                            const isSubChecked = isSubPrimary || isSubTagChecked;

                            return (
                              <label key={sub.id} className="flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-black">
                                <input
                                  type="checkbox"
                                  checked={isSubChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSubCategoryId(sub.id);
                                      if (!categoryId) setCategoryId(c.id);
                                      const currentTags = tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean);
                                      if (!currentTags.includes(sub.name)) {
                                        setTagsInput([...currentTags, sub.name].join(', '));
                                      }
                                    } else {
                                      if (subCategoryId === sub.id) setSubCategoryId('');
                                      const currentTags = tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean);
                                      setTagsInput(currentTags.filter((t: string) => t.toLowerCase() !== sub.name.toLowerCase()).join(', '));
                                    }
                                  }}
                                  className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 w-3 h-3"
                                />
                                <span className={isSubPrimary ? 'font-bold text-blue-700' : ''}>{sub.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <a href="/admin/categories" className="text-[11px] text-blue-600 hover:underline font-medium">
                  + Add Category
                </a>
              </div>
            </div>
          </div>



          {/* 6. Tags Widget */}
          <div className="bg-white border border-gray-300 rounded shadow-2xs overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3.5 py-2 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs">Tags</h3>
              <div className="flex gap-1 text-gray-400">
                <ChevronUp size={14} className="cursor-pointer" />
              </div>
            </div>
            <div className="p-3.5 space-y-2">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={tagAddInput}
                  onChange={(e) => setTagAddInput(e.target.value)}
                  placeholder="Add new tag"
                  className="w-full border border-gray-300 rounded px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddSingleTag}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold rounded text-xs transition shrink-0"
                >
                  Add
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-[11px] outline-none"
                  placeholder="Tags separated by commas"
                />
                <p className="text-[10px] text-gray-400 mt-1">Separate tags with commas</p>
              </div>
            </div>
          </div>

          {/* 7. Featured Image Caption & Photo Credit Widget */}
          <div className="bg-white border border-gray-300 rounded shadow-2xs overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3.5 py-2 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs">Featured Image Caption</h3>
              <div className="flex gap-1 text-gray-400">
                <ChevronUp size={14} className="cursor-pointer" />
              </div>
            </div>
            <div className="p-3.5 space-y-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1 font-medium">Caption text</label>
                <textarea
                  rows={2}
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="Enter image caption..."
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-600 mb-1 font-medium">Source Attribution / Credit</label>
                <input
                  type="text"
                  value={photoCredit}
                  onChange={(e) => setPhotoCredit(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="e.g. Khulna Gazette / Staff Reporter"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Modal Component for Featured Image */}
      <MediaModal
        isOpen={showFeaturedMediaModal}
        onClose={() => setShowFeaturedMediaModal(false)}
        mode="featured"
        title="Featured image"
        actionButtonText="Set featured image"
        onSelectMedia={(data) => {
          setFeaturedImage(data.url);
          if (data.caption) {
            setImageCaption(data.caption);
          }
        }}
      />
    </form>
  );
}
