'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Search,
  Check,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ExternalLink,
  Copy,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  Save,
  Crop,
} from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  date?: string;
  size?: string;
  dimensions?: string;
  type?: string;
}

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (data: { url: string; alt?: string; caption?: string; title?: string }) => void;
  mode?: 'featured' | 'insert';
  title?: string;
  actionButtonText?: string;
}

export default function MediaModal({
  isOpen,
  onClose,
  onSelectMedia,
  mode = 'featured',
  title,
  actionButtonText,
}: MediaModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('library');
  const [activeSidebar, setActiveSidebar] = useState<'add_media' | 'featured' | 'url'>(
    mode === 'featured' ? 'featured' : 'add_media'
  );
  
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMediaList, setLoadingMediaList] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>('');
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [imgDimensions, setImgDimensions] = useState('');

  // Attachment Form Fields
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaDescription, setMediaDescription] = useState('');
  
  // Insert from URL state
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Image Editor State
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const editCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveSidebar(mode === 'featured' ? 'featured' : 'add_media');
      fetchMediaLibrary();
    }
  }, [isOpen, mode]);

  const fetchMediaLibrary = async () => {
    setLoadingMediaList(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMediaList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMediaList(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        const newItem: MediaItem = {
          id: `upload-${Date.now()}`,
          url: data.url,
          name: file.name,
          date: 'আজকে',
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: '1280 by 720 pixels',
          type: file.type || 'image/jpeg',
        };
        setMediaList((prev) => [newItem, ...prev]);
        setSelectedMediaUrl(data.url);
        setMediaTitle(file.name.replace(/\.[^/.]+$/, ''));
        setActiveTab('library');
      } else {
        setUploadError(data.error || 'ফাইল আপলোড করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setUploadError('নেটওয়ার্ক ড্রপ করেছে। আবার চেষ্টা করুন।');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectMediaItem = (item: MediaItem) => {
    setSelectedMediaUrl(item.url);
    setMediaTitle(item.name.replace(/\.[^/.]+$/, ''));
    setMediaAlt('');
    setMediaCaption('');
    setMediaDescription('');
    setImgDimensions(item.dimensions || '');
  };

  const handleDeletePermanently = async (url: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ছবিটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/media?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.url !== url));
        if (selectedMediaUrl === url) {
          setSelectedMediaUrl('');
        }
      }
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Open Image Editor
  const handleOpenImageEditor = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setIsEditingImage(true);
  };

  // Save Transformation from Canvas
  const handleSaveEditedImage = async () => {
    if (!selectedMediaUrl) return;

    setSavingEdit(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedMediaUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isRotated90or270 = rotation === 90 || rotation === 270;
      canvas.width = isRotated90or270 ? img.height : img.width;
      canvas.height = isRotated90or270 ? img.width : img.height;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.92)
      );

      if (!blob) return;

      const file = new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        const newItem: MediaItem = {
          id: `edited-${Date.now()}`,
          url: data.url,
          name: file.name,
          date: 'আজকে',
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: `${canvas.width} by ${canvas.height} pixels`,
          type: 'image/jpeg',
        };

        setMediaList((prev) => [newItem, ...prev]);
        setSelectedMediaUrl(data.url);
        setIsEditingImage(false);
      } else {
        alert(data.error || 'ছবি সেভ করতে সমস্যা হয়েছে।');
      }
    } catch (e) {
      console.error('Save edited image error:', e);
      alert('ছবি প্রসেস বা সেভ করতে ত্রুটি ঘটেছে।');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmSelect = () => {
    const finalUrl = activeSidebar === 'url' ? customUrlInput.trim() : selectedMediaUrl;
    if (!finalUrl) return;

    onSelectMedia({
      url: finalUrl,
      alt: mediaAlt,
      caption: mediaCaption,
      title: mediaTitle,
    });
    onClose();
  };

  if (!isOpen) return null;

  const filteredList = mediaList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItem = mediaList.find((m) => m.url === selectedMediaUrl);

  const displayTitle =
    title || (mode === 'featured' ? 'Featured image' : 'Add media');
  const displayActionButton =
    actionButtonText || (mode === 'featured' ? 'Set featured image' : 'Insert into post');

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-sans text-gray-800">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Modal Header */}
        <div className="bg-white px-5 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{displayTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* WordPress Left Sidebar Menu */}
          <div className="w-52 bg-gray-50 border-r border-gray-200 py-3 shrink-0 hidden md:block select-none">
            <div className="text-[11px] font-bold text-gray-400 px-4 mb-2 uppercase tracking-wider">
              Actions
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSidebar('add_media');
                setActiveTab('library');
              }}
              className={`w-full text-left px-4 py-2 text-xs font-semibold transition flex items-center justify-between ${
                activeSidebar === 'add_media'
                  ? 'text-blue-700 bg-white border-l-4 border-blue-600 shadow-2xs font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Add media
            </button>
            <button
              type="button"
              disabled
              className="w-full text-left px-4 py-2 text-xs font-medium text-gray-400 cursor-not-allowed opacity-60"
            >
              Create gallery
            </button>
            <button
              type="button"
              disabled
              className="w-full text-left px-4 py-2 text-xs font-medium text-gray-400 cursor-not-allowed opacity-60"
            >
              Create audio playlist
            </button>
            <button
              type="button"
              disabled
              className="w-full text-left px-4 py-2 text-xs font-medium text-gray-400 cursor-not-allowed opacity-60"
            >
              Create video playlist
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSidebar('featured');
                setActiveTab('library');
              }}
              className={`w-full text-left px-4 py-2 text-xs font-semibold transition ${
                activeSidebar === 'featured'
                  ? 'text-blue-700 bg-white border-l-4 border-blue-600 shadow-2xs font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Featured image
            </button>
            <button
              type="button"
              onClick={() => setActiveSidebar('url')}
              className={`w-full text-left px-4 py-2 text-xs font-semibold transition ${
                activeSidebar === 'url'
                  ? 'text-blue-700 bg-white border-l-4 border-blue-600 shadow-2xs font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Insert from URL
            </button>
          </div>

          {/* Center + Right Section */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {activeSidebar === 'url' ? (
              <div className="flex-1 p-8 max-w-xl space-y-4">
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2">
                  Insert Image from Direct URL
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                {customUrlInput && (
                  <div className="aspect-video w-full max-w-sm rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={customUrlInput}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Top Tabs Header */}
                <div className="border-b border-gray-200 px-4 flex items-center justify-between bg-white shrink-0">
                  <div className="flex space-x-1 font-medium text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className={`px-4 py-3 border-b-2 font-semibold transition ${
                        activeTab === 'upload'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Upload files
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('library')}
                      className={`px-4 py-3 border-b-2 font-semibold transition ${
                        activeTab === 'library'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Media Library
                    </button>
                  </div>

                  {activeTab === 'library' && (
                    <div className="relative py-2">
                      <Search size={14} className="absolute left-2.5 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search media..."
                        className="pl-8 pr-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-44 sm:w-60"
                      />
                    </div>
                  )}
                </div>

                {/* Tab 1: Upload */}
                {activeTab === 'upload' && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 max-w-lg w-full flex flex-col items-center justify-center space-y-4 bg-gray-50/50">
                      <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                        <Upload size={36} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-800">Drop files to upload</h3>
                        <p className="text-xs text-gray-500">
                          or click button below to select files from your computer
                        </p>
                      </div>

                      <label className="bg-white hover:bg-gray-100 text-blue-700 font-semibold border border-blue-600 px-5 py-2 rounded text-xs sm:text-sm cursor-pointer shadow-2xs transition inline-block">
                        {uploading ? 'Uploading Image...' : 'Select Files'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>

                      {uploadError && (
                        <p className="text-xs text-red-600 font-semibold">{uploadError}</p>
                      )}

                      <p className="text-[11px] text-gray-400 pt-4 border-t border-gray-200 w-full">
                        Maximum upload file size: 64 MB.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Media Library */}
                {activeTab === 'library' && (
                  <div className="flex-1 flex overflow-hidden">
                    {/* Media Grid */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                      {loadingMediaList ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                          <Loader2 size={24} className="animate-spin text-blue-600" />
                          <span className="text-xs font-semibold">Loading Media Library...</span>
                        </div>
                      ) : filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <ImageIcon size={40} className="mb-2 opacity-50" />
                          <p className="text-xs font-semibold">No media items found in library.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {filteredList.map((item) => {
                            const isSelected = selectedMediaUrl === item.url;
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleSelectMediaItem(item)}
                                className={`relative aspect-square rounded border-2 overflow-hidden cursor-pointer group transition bg-gray-200 ${
                                  isSelected
                                    ? 'border-blue-600 ring-2 ring-blue-600/30'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition transform group-hover:scale-105"
                                  loading="lazy"
                                />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-1 shadow-md">
                                    <Check size={12} strokeWidth={3} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* WordPress Authentic Right Sidebar: ATTACHMENT DETAILS */}
                    {selectedMediaUrl && (
                      <div className="w-80 sm:w-96 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto shrink-0 space-y-4 text-xs">
                        {/* Header Link */}
                        <div className="flex items-center justify-end text-[11px] text-gray-500 hover:text-gray-800 cursor-pointer">
                          <ChevronLeft size={14} />
                          <span>Expand Details</span>
                        </div>

                        <h4 className="font-bold text-gray-600 uppercase tracking-wider text-[11px]">
                          ATTACHMENT DETAILS
                        </h4>

                        {/* Thumbnail + File Info Side-by-Side (WordPress Exact Match) */}
                        <div className="flex gap-3 items-start border-b border-gray-200 pb-4">
                          <div className="w-24 h-16 rounded border border-gray-300 overflow-hidden bg-white shrink-0 shadow-2xs">
                            <img
                              src={selectedMediaUrl}
                              alt="Selected Thumbnail"
                              className="w-full h-full object-cover"
                              onLoad={(e) => {
                                const img = e.currentTarget;
                                if (img.naturalWidth && img.naturalHeight) {
                                  setImgDimensions(`${img.naturalWidth} by ${img.naturalHeight} pixels`);
                                }
                              }}
                            />
                          </div>

                          <div className="space-y-0.5 text-[11px] text-gray-600 min-w-0 flex-1">
                            <p className="font-bold text-gray-900 truncate" title={selectedItem?.name || selectedMediaUrl.split('/').pop()}>
                              {selectedItem?.name || selectedMediaUrl.split('/').pop()?.split('?')[0] || 'Image'}
                            </p>
                            <p className="text-gray-500">{selectedItem?.date || 'সেপ্টেম্বর ২৩, ২০২৬'}</p>
                            <p className="text-gray-500">{selectedItem?.size || '৬২৯ KB'}</p>
                            <p className="text-gray-500">{imgDimensions || selectedItem?.dimensions || '1280 by 720 pixels'}</p>

                            <div className="flex items-center gap-2 pt-1 font-medium text-[11px]">
                              <button
                                type="button"
                                onClick={handleOpenImageEditor}
                                className="text-blue-600 hover:underline flex items-center gap-0.5"
                              >
                                Edit Image
                              </button>
                              <button
                                type="button"
                                disabled={deleting}
                                onClick={() => handleDeletePermanently(selectedMediaUrl)}
                                className="text-red-600 hover:underline disabled:opacity-50"
                              >
                                {deleting ? 'Deleting...' : 'Delete permanently'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Form Fields matching WordPress screenshot */}
                        <div className="space-y-4 pt-1">
                          {/* Alt Text */}
                          <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                              Alt Text
                            </label>
                            <textarea
                              rows={2}
                              value={mediaAlt}
                              onChange={(e) => setMediaAlt(e.target.value)}
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                            />
                            <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                              <a
                                href="https://www.w3.org/WAI/tutorials/images/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                              >
                                Learn how to describe the purpose of the image <ExternalLink size={10} />
                              </a>
                              .<br />
                              Leave empty if the image is purely decorative.
                            </p>
                          </div>

                          {/* Title */}
                          <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={mediaTitle}
                              onChange={(e) => setMediaTitle(e.target.value)}
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                            />
                          </div>

                          {/* Image Caption */}
                          <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                              Image Caption
                            </label>
                            <textarea
                              rows={2}
                              value={mediaCaption}
                              onChange={(e) => setMediaCaption(e.target.value)}
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                            />
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={mediaDescription}
                              onChange={(e) => setMediaDescription(e.target.value)}
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                            />
                          </div>

                          {/* File URL */}
                          <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                              File URL
                            </label>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                readOnly
                                value={selectedMediaUrl}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-[11px] bg-gray-100 text-gray-600 select-all"
                              />
                              <button
                                type="button"
                                onClick={() => handleCopyUrl(selectedMediaUrl)}
                                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-[10px] font-semibold transition shrink-0 flex items-center gap-1"
                              >
                                <Copy size={12} />
                                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-100 border-t border-gray-200 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500 font-medium">
            {activeSidebar === 'url'
              ? customUrlInput
                ? 'URL Entered'
                : 'Enter a valid image URL'
              : selectedMediaUrl
              ? '1 item selected'
              : 'Select an image from the library or upload'}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded text-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                activeSidebar === 'url' ? !customUrlInput.trim() : !selectedMediaUrl
              }
              onClick={handleConfirmSelect}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              {displayActionButton}
            </button>
          </div>
        </div>

        {/* WordPress Style Interactive Image Editor Overlay */}
        {isEditingImage && (
          <div className="absolute inset-0 z-[100000] bg-black/80 backdrop-blur-xs flex flex-col p-4 sm:p-6 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full h-full flex flex-col overflow-hidden">
              {/* Image Editor Header */}
              <div className="bg-gray-900 text-white px-5 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Crop size={18} />
                  <span>WordPress Image Editor</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingImage(false)}
                  className="text-gray-400 hover:text-white p-1 rounded transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Toolbar */}
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded flex items-center gap-1.5 shadow-2xs"
                >
                  <RotateCcw size={14} />
                  <span>Rotate Left 90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded flex items-center gap-1.5 shadow-2xs"
                >
                  <RotateCw size={14} />
                  <span>Rotate Right 90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH((f) => !f)}
                  className={`px-3 py-1.5 border border-gray-300 rounded flex items-center gap-1.5 shadow-2xs ${
                    flipH ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <FlipHorizontal size={14} />
                  <span>Flip Horizontal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV((f) => !f)}
                  className={`px-3 py-1.5 border border-gray-300 rounded flex items-center gap-1.5 shadow-2xs ${
                    flipV ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <FlipVertical size={14} />
                  <span>Flip Vertical</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRotation(0);
                    setFlipH(false);
                    setFlipV(false);
                  }}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded flex items-center gap-1.5 shadow-2xs ml-auto"
                >
                  <RefreshCw size={14} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Canvas Interactive Workspace */}
              <div className="flex-1 bg-gray-900 p-6 flex items-center justify-center overflow-auto">
                <div
                  className="transition-transform duration-200 max-w-full max-h-full flex items-center justify-center"
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${
                      flipV ? -1 : 1
                    })`,
                  }}
                >
                  <img
                    src={selectedMediaUrl}
                    alt="Editing"
                    className="max-h-[60vh] max-w-[70vw] object-contain rounded shadow-2xl border border-gray-700"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between shrink-0">
                <div className="text-xs text-gray-500 font-medium">
                  {rotation > 0 || flipH || flipV
                    ? `Transformations: Rotation ${rotation}°, FlipH: ${flipH ? 'Yes' : 'No'}, FlipV: ${flipV ? 'Yes' : 'No'}`
                    : 'Use toolbar controls above to rotate or flip image.'}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingImage(false)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={handleSaveEditedImage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded text-xs transition disabled:opacity-50 shadow-2xs flex items-center gap-1.5"
                  >
                    {savingEdit ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving Image...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Edited Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
