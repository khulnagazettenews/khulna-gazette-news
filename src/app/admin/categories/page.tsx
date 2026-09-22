'use client';

import { useEffect, useState } from 'react';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  ChevronRight, 
  Folder, 
  FolderKanban, 
  FolderPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Hash,
  Layers
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order: number;
  subCategories?: Category[];
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentOptions, setParentOptions] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [order, setOrder] = useState('0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Load all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
        setParentOptions(data.filter((c: Category) => c.parentId === null));
      } else {
        setError(data.error || 'Failed to load categories.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setParentId(category.parentId || '');
    setOrder(category.order.toString());
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setParentId('');
    setOrder('0');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError('Name and slug are required.');
      return;
    }

    setFormLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      name,
      slug,
      parentId: parentId || null,
      order: parseInt(order) || 0,
    };

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingId ? 'Category updated successfully.' : 'New category created successfully.');
        handleCancel();
        fetchCategories();
      } else {
        setError(data.error || 'An error occurred.');
      }
    } catch (err) {
      setError('Failed to send request.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category and all its subcategories?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Category deleted successfully.');
        fetchCategories();
      } else {
        setError(data.error || 'Failed to delete category.');
      }
    } catch (err) {
      setError('An error occurred during deletion.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* 1. Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <FolderKanban size={16} />
            <span>Structure Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Categories</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {categories.length} Categories
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage primary categories and sub-categories across the Khulna Gazette portal.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Category Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FolderPlus size={18} className="text-red-600" />
              <span>{editingId ? 'Edit Category' : 'Add New Category'}</span>
            </h3>
            {editingId && (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                Edit Mode
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1.5 font-bold text-slate-900">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 font-bold transition"
                placeholder="e.g. Bangladesh"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">Slug (URL string)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 font-bold transition"
                placeholder="e.g. bangladesh"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">Parent Category (Optional)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 font-bold transition cursor-pointer"
              >
                <option value="">None (Primary Category)</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-900">Sort Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 font-bold transition"
                placeholder="0"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black py-3 rounded-2xl shadow-xs transition disabled:opacity-50"
              >
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-4 rounded-2xl transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories Tree list */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-teal-600" />
              <span>Categories & Sub-categories List</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">Hierarchy View</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">No categories found.</div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  {/* Parent Row */}
                  <div className="bg-slate-50/80 px-4 py-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-bold">
                        <Folder size={16} />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">{cat.name}</span>
                        <span className="text-[11px] font-mono text-slate-400 ml-2">/{cat.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-lg font-bold">
                        Order: {cat.order}
                      </span>
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories list */}
                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <div className="divide-y divide-slate-100 bg-white">
                      {cat.subCategories.map((sub) => (
                        <div key={sub.id} className="pl-10 pr-4 py-2.5 flex items-center justify-between hover:bg-slate-50/60 transition">
                          <div className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-slate-400" />
                            <span className="text-xs font-extrabold text-slate-700">{sub.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">/{sub.slug}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">Order: {sub.order}</span>
                            <button
                              onClick={() => handleEdit(sub)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
