'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Megaphone, 
  Link as LinkIcon, 
  Calendar, 
  Eye, 
  MousePointerClick, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Upload,
  BarChart3,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Code,
  Image as ImageIcon,
  FileText,
  GripVertical
} from 'lucide-react';

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string | null;
  position: string;
  adType: string;
  codeSnippet?: string | null;
  description?: string | null;
  order: number;
  status: string;
  clicks: number;
  views: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

export default function AdvertisementManagementPage() {
  const { data: session, status } = useSession();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState<'ALL' | 'HOME' | 'SIDEBAR'>('ALL');
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    position: 'sidebar_widget_top',
    adType: 'IMAGE',
    codeSnippet: '',
    description: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
  });

  const fetchAds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/advertisements');
      if (!res.ok) {
        throw new Error('Failed to load ad list.');
      }
      const data = await res.json();
      setAds(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAds();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Security Check: Only allowed roles
  const normalizedRole = userRole ? String(userRole).toUpperCase() : '';
  const isAllowed = session && ['SUPER_ADMIN', 'ADMIN', 'ADVERTISEMENT_MANAGER', 'EDITOR', 'SUB_EDITOR', 'REPORTER'].includes(normalizedRole);

  if (!isAllowed) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-2xl mx-auto my-12 shadow-xs font-sans">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Megaphone size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unauthorized Access!</h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-4">
          This page is restricted to Ad Managers and Admins only.
        </p>
      </div>
    );
  }

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        setError(data.error || 'Image upload failed.');
      }
    } catch (err) {
      setError('Network error during image upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/advertisements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          order: ads.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create ad/widget.');
      }

      setSuccess('New ad / custom widget added successfully.');
      setIsAddModalOpen(false);
      resetFormData();
      fetchAds();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentAd) return;

    try {
      const res = await fetch(`/api/advertisements/${currentAd.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update ad.');
      }

      setSuccess('Ad updated successfully.');
      setIsEditModalOpen(false);
      resetFormData();
      setCurrentAd(null);
      fetchAds();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    }
  };

  const handleDelete = async (ad: Advertisement) => {
    if (!confirm(`Are you sure you want to delete "${ad.title || 'this ad'}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/advertisements/${ad.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete ad.');
      }

      setSuccess('Ad deleted successfully.');
      fetchAds();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ads.length) return;

    const newAds = [...ads];
    const temp = newAds[index];
    newAds[index] = newAds[targetIndex];
    newAds[targetIndex] = temp;

    // Update order property
    const reorderedItems = newAds.map((ad, idx) => ({
      ...ad,
      order: idx,
    }));

    setAds(reorderedItems);
    setReordering(true);

    try {
      const res = await fetch('/api/advertisements/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: reorderedItems.map(item => ({ id: item.id, order: item.order })),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save order.');
      }
      setSuccess('Ad position sequence updated.');
    } catch (err: any) {
      setError(err.message || 'Error updating sequence.');
      fetchAds(); // Revert
    } finally {
      setReordering(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      imageUrl: '',
      targetUrl: '',
      position: 'sidebar_widget_top',
      adType: 'IMAGE',
      codeSnippet: '',
      description: '',
      status: 'ACTIVE',
      startDate: '',
      endDate: '',
    });
  };

  const openEditModal = (ad: Advertisement) => {
    setCurrentAd(ad);
    setFormData({
      title: ad.title,
      imageUrl: ad.imageUrl || '',
      targetUrl: ad.targetUrl || '',
      position: ad.position,
      adType: ad.adType || 'IMAGE',
      codeSnippet: ad.codeSnippet || '',
      description: ad.description || '',
      status: ad.status,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 10) : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 10) : '',
    });
    setIsEditModalOpen(true);
  };

const HOME_POSITIONS = [
  { value: 'top_banner', label: 'Top Banner (Below Header)' },
  { value: 'home_after_hero', label: 'After Main Hero' },
  { value: 'home_before_bangladesh_khulna', label: 'Before Bangladesh & Khulna Section' },
  { value: 'home_before_sports', label: 'Before Sports Section' },
  { value: 'home_before_entertainment', label: 'Before Entertainment Section' },
  { value: 'middle_banner', label: 'Middle Banner (Before Politics & Economy)' },
  { value: 'home_before_international', label: 'Before International Section' },
  { value: 'home_before_education_islam', label: 'Before Education & Islam Section' },
  { value: 'home_before_technology', label: 'Before IT / Technology Section' },
  { value: 'home_before_lifestyle_health', label: 'Before Lifestyle & Health Section' },
  { value: 'home_before_literature', label: 'Before Literature Section' },
  { value: 'home_before_chitro_social', label: 'Before Social Media & Features Section' },
  { value: 'home_before_mukto_bhabna', label: 'Before Opinion Section' },
  { value: 'home_before_exclusive', label: 'Before Gazette Exclusive Section' },
  { value: 'home_before_photo_gallery', label: 'Before Photo Gallery Section' },
  { value: 'home_before_video_section', label: 'Before Video Section (Homepage Bottom)' },
];

const SIDEBAR_POSITIONS = [
  { value: 'sidebar_widget_top', label: 'Sidebar Top Widget' },
  { value: 'sidebar_widget_middle', label: 'Sidebar Middle Widget' },
  { value: 'sidebar_widget_bottom', label: 'Sidebar Bottom Widget' },
  { value: 'sidebar_banner', label: 'Sidebar Banner' },
];

const ALL_POSITIONS = [...HOME_POSITIONS, ...SIDEBAR_POSITIONS];

  const getPositionLabel = (pos: string) => {
    const found = ALL_POSITIONS.find(p => p.value === pos);
    return found ? found.label : pos;
  };

  const getAdTypeLabel = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return '📷 Image Banner';
      case 'HTML_SCRIPT':
        return '📜 HTML/AdSense Code';
      case 'TEXT_IMAGE':
        return '📝 Text + Image';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <Megaphone size={16} />
            <span>Sponsor & Banner Campaign Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Advertisements & Widgets Management</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {ads.length} Widgets/Banners
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage banner ads, AdSense scripts, and sidebar custom widgets. Reorder slots easily with Up/Down buttons.
          </p>
        </div>

        <button
          onClick={() => {
            resetFormData();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md shadow-red-600/20 transition transform hover:-translate-y-0.5 shrink-0"
        >
          <PlusCircle size={18} />
          <span>Add New Ad / Widget</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Sub-section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          All Ads ({ads.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HOME')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition ${
            activeTab === 'HOME'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-red-600 hover:bg-white/60'
          }`}
        >
          📌 Home Section Ads ({ads.filter(a => !a.position.startsWith('sidebar')).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SIDEBAR')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition ${
            activeTab === 'SIDEBAR'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
          }`}
        >
          📌 Sidebar Ads ({ads.filter(a => a.position.startsWith('sidebar')).length})
        </button>
      </div>

      {/* Advertisements Grid / List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center text-slate-400 font-bold">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
          Loading advertisements and widgets...
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center text-slate-400 font-medium">
          <Megaphone size={40} className="mx-auto text-slate-300 mb-3" />
          <span>No ad banners or widgets found.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads
            .filter((ad) => {
              if (activeTab === 'HOME') return !ad.position.startsWith('sidebar');
              if (activeTab === 'SIDEBAR') return ad.position.startsWith('sidebar');
              return true;
            })
            .map((ad, index) => (
            <div key={ad.id} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-200 group">
              <div>
                {/* Header & Reorder Control Bar */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <GripVertical size={16} className="text-slate-400" />
                    <span>Order Position: #{index + 1}</span>
                  </div>
                  
                  {/* Up / Down Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0 || reordering}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 transition"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === ads.length - 1 || reordering}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 transition"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>

                {/* Preview Container based on adType */}
                <div className="aspect-[3/1] bg-slate-900 border-b border-slate-100 relative overflow-hidden flex items-center justify-center text-white">
                  {ad.adType === 'HTML_SCRIPT' ? (
                    <div className="p-3 text-center text-xs font-mono text-amber-300 w-full overflow-hidden truncate">
                      <Code size={20} className="mx-auto mb-1 text-amber-400" />
                      <span>HTML / AdSense Code Snippet</span>
                    </div>
                  ) : ad.imageUrl ? (
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400 font-bold">
                      <ImageIcon size={24} className="mx-auto mb-1 opacity-50" />
                      No Image Set
                    </div>
                  )}

                  <span className={`absolute top-2.5 right-2.5 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs ${
                    ad.status === 'ACTIVE' 
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-900/80 text-white backdrop-blur-xs'
                  }`}>
                    {ad.status === 'ACTIVE' ? '● Active' : 'Inactive'}
                  </span>
                </div>

                <div className="p-5 space-y-3 text-xs">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">{ad.title || 'Untitled Ad'}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        {getPositionLabel(ad.position)}
                      </span>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        {getAdTypeLabel(ad.adType)}
                      </span>
                    </div>
                  </div>

                  {ad.description && (
                    <p className="text-slate-600 text-xs line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {ad.description}
                    </p>
                  )}

                  {ad.targetUrl && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline break-all font-semibold">
                      <ExternalLink size={13} className="shrink-0" />
                      <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="truncate">{ad.targetUrl}</a>
                    </div>
                  )}

                  {/* Analytics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-slate-500 font-bold text-[11px]">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
                      <Eye size={14} className="text-slate-400" />
                      <span>{ad.views || 0} Views</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
                      <MousePointerClick size={14} className="text-slate-400" />
                      <span>{ad.clicks || 0} Clicks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(ad)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs shadow-2xs transition"
                >
                  <Pencil size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(ad)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-bold text-xs shadow-2xs transition"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                <PlusCircle size={18} className="text-red-600 shrink-0" />
                <span className="text-slate-900 font-black text-base">
                  Create New Ad / Widget
                </span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700 overflow-y-auto">
              <div>
                <label className="block mb-1.5 font-bold text-slate-900">Ad Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'IMAGE', label: '📷 Image Banner' },
                    { id: 'HTML_SCRIPT', label: '📜 HTML/AdSense' },
                    { id: 'TEXT_IMAGE', label: '📝 Text + Image' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, adType: type.id })}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition text-center ${
                        formData.adType === type.id
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">
                  Ad Title / Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Campaign Banner"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 font-bold transition"
                />
              </div>

              {/* Form Fields according to adType */}
              {formData.adType === 'HTML_SCRIPT' ? (
                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">Custom HTML / AdSense Script Code</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="<script async src='https://pagead2.googlesyndication.com/...'></script>"
                    value={formData.codeSnippet}
                    onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 text-amber-300 font-mono border border-slate-800 rounded-2xl focus:outline-none focus:border-red-500 text-xs transition"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block mb-1.5 font-bold text-slate-900">Banner Image</label>
                    {formData.imageUrl ? (
                      <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 aspect-[3/1] flex items-center justify-center">
                        <img src={formData.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full shadow transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-300 rounded-2xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition bg-slate-50">
                        <Upload className="text-slate-400 mb-1" size={20} />
                        <span className="text-[10px] text-slate-500 font-bold">{uploading ? 'Uploading...' : 'Upload Banner File'}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-slate-900">Target URL (On Click)</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 font-semibold transition"
                    />
                  </div>
                </>
              )}

              {formData.adType === 'TEXT_IMAGE' && (
                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">Description / Content</label>
                  <textarea
                    rows={3}
                    placeholder="Enter ad description text..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 font-medium transition"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">Ad Position Slot</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 bg-slate-50 font-bold transition cursor-pointer"
                  >
                    <optgroup label="📌 Home Section Ads">
                      {HOME_POSITIONS.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="📌 Sidebar Ads">
                      {SIDEBAR_POSITIONS.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 bg-slate-50 font-bold transition cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-3 rounded-2xl shadow-xs transition"
                >
                  Add Widget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && currentAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Pencil size={18} className="text-blue-600" />
                <span>Edit Advertisement</span>
              </h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentAd(null);
                }}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700 overflow-y-auto">
              <div>
                <label className="block mb-1.5 font-bold text-slate-900">Ad Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'IMAGE', label: '📷 Image Banner' },
                    { id: 'HTML_SCRIPT', label: '📜 HTML/AdSense' },
                    { id: 'TEXT_IMAGE', label: '📝 Text + Image' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, adType: type.id })}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition text-center ${
                        formData.adType === type.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">
                  Ad Title / Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Offer Banner"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 font-bold transition"
                />
              </div>

              {formData.adType === 'HTML_SCRIPT' ? (
                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">Custom HTML / AdSense Script Code</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.codeSnippet}
                    onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 text-amber-300 font-mono border border-slate-800 rounded-2xl focus:outline-none focus:border-blue-500 text-xs transition"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block mb-1.5 font-bold text-slate-900">Banner Image</label>
                    {formData.imageUrl ? (
                      <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 aspect-[3/1] flex items-center justify-center">
                        <img src={formData.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full shadow transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-300 rounded-2xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 transition bg-slate-50">
                        <Upload className="text-slate-400 mb-1" size={20} />
                        <span className="text-[10px] text-slate-500 font-bold">{uploading ? 'Uploading...' : 'Upload Banner File'}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-slate-900">Target URL (On Click)</label>
                    <input
                      type="url"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 font-semibold transition"
                    />
                  </div>
                </>
              )}

              {formData.adType === 'TEXT_IMAGE' && (
                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">Description / Content</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium transition"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">Ad Position Slot</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 bg-slate-50 font-bold transition cursor-pointer"
                  >
                    <optgroup label="📌 Home Section Ads">
                      {HOME_POSITIONS.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="📌 Sidebar Ads">
                      {SIDEBAR_POSITIONS.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 font-bold text-slate-900">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 bg-slate-50 font-bold transition cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentAd(null);
                  }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl shadow-xs transition"
                >
                  Update Ad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

