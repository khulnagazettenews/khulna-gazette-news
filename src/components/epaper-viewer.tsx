'use client';

import { useState, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Calendar as CalendarIcon, 
  Download, 
  Maximize2,
  Plus,
  Minus,
  FileText,
  ImageIcon,
  Sparkles
} from 'lucide-react';

interface EpaperIssue {
  id: string;
  date: Date | string;
  imageUrl: string | null;
  imageUrls?: string[];
  pdfUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface EpaperViewerProps {
  initialIssues: EpaperIssue[];
}

// Dynamic Bengali Page Label Generator
const getPageLabel = (idx: number, totalPages: number) => {
  if (idx === 0) return 'প্রথম-পাতা';
  if (totalPages > 1 && idx === totalPages - 1) return 'শেষ-পাতা';
  const ordinals = ['১ম', '২য়', '৩য়', '৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম', '১১দশ', '১২দশ'];
  const ordinal = ordinals[idx] || `${idx + 1}তম`;
  return `${ordinal}-পাতা`;
};

// Real Khulna Gazette Front Page + pages
const FALLBACK_PAGES = [
  '/uploads/epaper/khulna_gazette_p1.jpg',
  '/uploads/epaper/khulna_gazette_p1.jpg',
  '/uploads/epaper/khulna_gazette_p1.jpg',
  '/uploads/epaper/khulna_gazette_p1.jpg',
];

export default function EpaperViewer({ initialIssues }: EpaperViewerProps) {
  const [issues] = useState<EpaperIssue[]>(initialIssues);
  const [activeIssue, setActiveIssue] = useState<EpaperIssue | null>(
    initialIssues.length > 0 ? initialIssues[0] : null
  );

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1); // Default to 100% Full Page Fit View
  const [viewMode, setViewMode] = useState<'image' | 'pdf'>('image'); // Mode switcher
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1.75);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    activeIssue ? new Date(activeIssue.date).toISOString().split('T')[0] : '2026-07-25'
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Extract all available pages for active issue (auto-supports 4, 6, 8 or any number of pages)
  const pages = useMemo(() => {
    let list: string[] = [];
    if (activeIssue?.imageUrls && activeIssue.imageUrls.length > 0) {
      list = activeIssue.imageUrls.filter((url) => Boolean(url && url.trim()));
    } else if (activeIssue?.imageUrl) {
      list = [activeIssue.imageUrl];
    }

    if (list.length === 0) {
      return FALLBACK_PAGES;
    }

    return list;
  }, [activeIssue]);

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    setSelectedDateStr(dateVal);
    if (!dateVal) return;

    const found = issues.find((item) => {
      const dStr = new Date(item.date).toISOString().split('T')[0];
      return dStr === dateVal;
    });

    if (found) {
      setActiveIssue(found);
      setActivePageIndex(0);
      setZoomScale(1.25);
    }
  };

  // Page navigation handlers
  const goToPrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex((prev) => prev - 1);
      setZoomScale(1.25);
    }
  };

  const goToNextPage = () => {
    if (activePageIndex < pages.length - 1) {
      setActivePageIndex((prev) => prev + 1);
      setZoomScale(1.25);
    }
  };

  // Zoom handlers
  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setZoomScale((z) => Math.max(z - 0.25, 0.75));
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setZoomScale((z) => Math.min(z + 0.25, 4));
  };

  const setPresetZoom = (scale: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setZoomScale(scale);
  };

  // Optional Ctrl + Mouse Wheel Zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoomScale((z) => Math.min(z + 0.25, 4));
      } else {
        setZoomScale((z) => Math.max(z - 0.25, 0.75));
      }
    }
  };

  return (
    <div className="max-w-[1140px] mx-auto py-6 px-3 sm:px-4 font-sans text-[#222222]">
      
      {/* 1. HEADER SECTION ("আজকের পত্রিকা") - Exact Purbanchal Header Style + Sharp Mode Indicator */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
              <path d="M3 13.5C1.5 11.9792 0.75 10.1458 0.75 8C0.75 5.85417 1.5 4.03125 3 2.53125C4.52083 1.01042 6.35417 0.25 8.5 0.25C10.6458 0.25 12.4688 1.01042 13.9688 2.53125C15.4896 4.03125 16.25 5.85417 16.25 8C16.25 10.1458 15.4896 11.9792 13.9688 13.5C12.4688 15 10.6458 15.75 8.5 15.75C6.35417 15.75 4.52083 15 3 13.5ZM8.5 13.75C10.0833 13.75 11.4375 13.1875 12.5625 12.0625C13.6875 10.9375 14.25 9.58333 14.25 8C14.25 6.41667 13.6875 5.0625 12.5625 3.9375C11.4375 2.8125 10.0833 2.25 8.5 2.25V13.75Z" fill="#A00B01"/>
            </svg>
            <h3 className="text-[22px] font-bold text-[#222222] tracking-tight flex items-center gap-2">
              <span>আজকের পত্রিকা</span>
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={12} />
                <span>এইচডি স্পষ্ট ভিউ ({pages.length} পৃষ্ঠা)</span>
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {activeIssue?.pdfUrl && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setViewMode('image')}
                  className={`px-3 py-1 rounded transition flex items-center gap-1 ${
                    viewMode === 'image' ? 'bg-[#A00B01] text-white shadow-2xs' : 'text-slate-700 hover:text-[#A00B01]'
                  }`}
                >
                  <ImageIcon size={13} />
                  <span>ইমেজ মোড</span>
                </button>
                <button
                  onClick={() => setViewMode('pdf')}
                  className={`px-3 py-1 rounded transition flex items-center gap-1 ${
                    viewMode === 'pdf' ? 'bg-[#A00B01] text-white shadow-2xs' : 'text-slate-700 hover:text-[#A00B01]'
                  }`}
                >
                  <FileText size={13} />
                  <span>অরিজিনাল ভেক্টর পিডিএফ (১০০% ক্লিয়ার)</span>
                </button>
              </div>
            )}

            {activeIssue?.pdfUrl && (
              <a
                href={activeIssue.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#A00B01] hover:bg-red-800 text-white text-xs font-bold px-3.5 py-1.5 rounded transition flex items-center gap-1.5 shadow-2xs"
              >
                <Download size={14} />
                <span>PDF ডাউনলোড</span>
              </a>
            )}
          </div>
        </div>
        
        {/* Divider line */}
        <div className="w-full h-[1px] bg-[#ececec] mt-3 mb-5"></div>

        {/* 2. TOP PAGE THUMBNAILS CONTAINER (.epaper-thumbnails-container - Auto Adjust Grid) */}
        <div className="bg-[#f7f7f7] p-2.5 sm:p-3 rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-[#eeeeee]">
          <div 
            className="grid gap-2.5"
            style={{
              gridTemplateColumns: pages.length <= 4 
                ? 'repeat(auto-fit, minmax(130px, 1fr))' 
                : 'repeat(auto-fit, minmax(110px, 1fr))'
            }}
          >
            {pages.map((imgUrl, idx) => {
              const label = getPageLabel(idx, pages.length);
              const isActive = activePageIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActivePageIndex(idx);
                    setZoomScale(1.25);
                    setViewMode('image');
                  }}
                  className={`p-1.5 rounded-[3px] cursor-pointer transition flex flex-col items-center select-none ${
                    isActive
                      ? 'border-2 border-[#A00B01] bg-white shadow-xs'
                      : 'border-2 border-transparent hover:border-[#A00B01] bg-transparent'
                  }`}
                >
                  <div className="w-full aspect-[3/4] overflow-hidden bg-white rounded-xs shadow-2xs">
                    <img
                      src={imgUrl}
                      alt={label}
                      className="w-full h-full object-cover epaper-sharp"
                    />
                  </div>
                  <div
                    className={`text-center font-bold text-[13px] sm:text-[14px] mt-1.5 transition truncate max-w-full ${
                      isActive ? 'text-[#A00B01]' : 'text-[#333333]'
                    }`}
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. CENTER MAIN PAGE DISPLAY (Vector PDF View vs Sharp Image View) */}
      {viewMode === 'pdf' && activeIssue?.pdfUrl ? (
        <div className="max-w-[1050px] mx-auto my-6 bg-white border border-[#e2e2e2] rounded shadow-sm overflow-hidden p-2">
          <div className="bg-[#f5f5f5] p-2 mb-2 rounded border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="text-[#A00B01]">📄 অরিজিনাল ভেক্টর পিডিএফ ফরম্যাট — সর্বোচ্চ স্পষ্টতা ও ক্লিয়ার রিডিং</span>
            <a href={activeIssue.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">নতুন ট্যাবে বড় করে দেখুন</a>
          </div>
          <iframe 
            src={activeIssue.pdfUrl} 
            className="w-full h-[850px] rounded border border-slate-200"
            title="Khulna Gazette E-Paper Vector PDF Viewer"
          />
        </div>
      ) : (
        <div className="max-w-[1050px] mx-auto my-6 bg-white border border-[#e2e2e2] rounded shadow-2xs overflow-hidden">
          {/* Working Zoom & Page Navigation Toolbar Header */}
          <div className="bg-[#f5f5f5] border-b border-[#e2e2e2] p-2.5 px-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs font-bold text-gray-800">
            {/* Page indicator & quick selector dropdown */}
            <div className="flex items-center gap-2">
              <span className="bg-[#A00B01] text-white px-2.5 py-1 rounded text-xs font-black shadow-2xs">
                {getPageLabel(activePageIndex, pages.length)}
              </span>

              {/* Page Select Dropdown */}
              <select
                value={activePageIndex}
                onChange={(e) => {
                  setActivePageIndex(Number(e.target.value));
                  setZoomScale(1.25);
                }}
                className="bg-white border border-gray-300 text-slate-800 text-xs font-extrabold py-1 px-2.5 rounded-lg focus:outline-none focus:border-[#A00B01] cursor-pointer shadow-2xs"
              >
                {pages.map((_, idx) => (
                  <option key={idx} value={idx}>
                    {getPageLabel(idx, pages.length)} (পৃষ্ঠা {idx + 1}/{pages.length})
                  </option>
                ))}
              </select>

              {/* Top Next / Prev Page Navigation Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goToPrevPage}
                  disabled={activePageIndex === 0}
                  className="bg-white hover:bg-slate-100 disabled:opacity-30 border border-gray-300 text-slate-800 px-2 py-1 rounded-lg text-xs font-extrabold flex items-center gap-0.5 transition cursor-pointer shadow-2xs"
                  title="আগের পাতা"
                >
                  <ChevronLeft size={15} className="text-[#A00B01]" />
                  <span className="hidden sm:inline">আগের পাতা</span>
                </button>
                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={activePageIndex === pages.length - 1}
                  className="bg-white hover:bg-slate-100 disabled:opacity-40 border border-gray-300 text-slate-800 px-2 py-1 rounded-lg text-xs font-extrabold flex items-center gap-0.5 transition cursor-pointer shadow-2xs"
                  title="পরের পাতা"
                >
                  <span className="hidden sm:inline">পরের পাতা</span>
                  <ChevronRight size={15} className="text-[#A00B01]" />
                </button>
              </div>
            </div>

            {/* Sharp Zoom Presets & Controls */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-gray-500 font-semibold mr-1 hidden lg:inline">দ্রুত জুম:</span>

              {/* Preset Buttons */}
              <button
                type="button"
                onClick={(e) => setPresetZoom(1, e)}
                className={`px-2 py-0.5 rounded text-[11px] font-extrabold border transition ${zoomScale === 1 ? 'bg-[#A00B01] text-white border-[#A00B01]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={(e) => setPresetZoom(1.5, e)}
                className={`px-2 py-0.5 rounded text-[11px] font-extrabold border transition ${zoomScale === 1.5 ? 'bg-[#A00B01] text-white border-[#A00B01]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                150% (HD)
              </button>
              <button
                type="button"
                onClick={(e) => setPresetZoom(2, e)}
                className={`px-2 py-0.5 rounded text-[11px] font-extrabold border transition ${zoomScale === 2 ? 'bg-[#A00B01] text-white border-[#A00B01]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                200% (আল্ট্রা)
              </button>

              <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

              {/* Zoom Out Button (-) */}
              <button
                type="button"
                onClick={handleZoomOut}
                className="bg-white hover:bg-gray-200 border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs font-extrabold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                title="জুম আউট (-)"
              >
                <Minus size={13} className="text-[#A00B01]" />
                <span className="hidden sm:inline">জুম কমান</span>
              </button>

              {/* Zoom In Button (+) */}
              <button
                type="button"
                onClick={handleZoomIn}
                className="bg-white hover:bg-gray-200 border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs font-extrabold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                title="জুম ইন (+)"
              >
                <Plus size={13} className="text-[#A00B01]" />
                <span className="hidden sm:inline">জুম বাড়ান</span>
              </button>

              {/* Lightbox Fullscreen Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                }}
                className="bg-[#A00B01] hover:bg-red-800 text-white px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ml-1 shadow-2xs"
                title="ফুলস্ক্রিন লাইটবক্স"
              >
                <Maximize2 size={13} />
                <span className="hidden sm:inline">ফুলস্ক্রিন</span>
              </button>
            </div>
          </div>

          {/* Reading Tip Bar */}
          <div className="bg-amber-50/80 px-3.5 py-1.5 border-b border-amber-100 text-[11px] text-amber-900 font-semibold flex flex-wrap items-center justify-between gap-2">
            <span>💡 পরিষ্কার লেখা পড়ার জন্য চিত্রে ডাবল-ক্লিক করুন অথবা ১৫০%/২০০% জুম অপশন চাপুন।</span>
            <span className="text-gray-600 font-bold bg-amber-100/60 px-2 py-0.5 rounded">স্কেল: {Math.round(zoomScale * 100)}%</span>
          </div>

          {/* Scrollable Container with Crisp HD Sharp Rendering */}
          <div 
            ref={containerRef}
            onWheel={handleWheel}
            className="relative overflow-auto flex justify-center bg-[#f0f0f0] p-3 sm:p-4 min-h-[550px] max-h-[900px] scrollbar-thin scrollbar-thumb-gray-400 select-none group/container"
          >
            {/* Floating Left Overlay Button (Previous Page) */}
            {activePageIndex > 0 && (
              <button
                type="button"
                onClick={goToPrevPage}
                className="fixed sm:absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-slate-900/85 hover:bg-[#A00B01] text-white p-3 rounded-full shadow-2xl transition backdrop-blur-xs flex items-center justify-center cursor-pointer border border-white/20 hover:scale-110"
                title="আগের পাতায় যান"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Floating Right Overlay Button (Next Page) */}
            {activePageIndex < pages.length - 1 && (
              <button
                type="button"
                onClick={goToNextPage}
                className="fixed sm:absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-slate-900/85 hover:bg-[#A00B01] text-white p-3 rounded-full shadow-2xl transition backdrop-blur-xs flex items-center justify-center cursor-pointer border border-white/20 hover:scale-110"
                title="পরের পাতায় যান"
              >
                <ChevronRight size={24} />
              </button>
            )}

            <div 
              className="transition-all duration-150 flex justify-center"
              style={{ width: `${zoomScale * 100}%` }}
            >
              <img
                src={pages[activePageIndex]}
                alt={getPageLabel(activePageIndex, pages.length)}
                onDoubleClick={() => setZoomScale((z) => (z > 1.25 ? 1 : 1.75))}
                onClick={() => {
                  if (zoomScale <= 1) {
                    setLightboxOpen(true);
                  }
                }}
                className="w-full h-auto object-contain block cursor-pointer border border-gray-300 shadow-md bg-white epaper-sharp rounded-xs"
                style={{
                  imageRendering: 'crisp-edges',
                  WebkitFontSmoothing: 'antialiased',
                }}
                title="স্পষ্ট খবরের জন্য ডাবল ক্লিক করুন বা জুম বাড়ান"
              />
            </div>
          </div>

          {/* 3.1 DEDICATED BOTTOM PAGE SWITCHER BAR WITH MINI THUMBNAILS */}
          <div className="bg-[#f8f9fa] border-t border-[#e2e2e2] p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-800">
            <button
              type="button"
              onClick={goToPrevPage}
              disabled={activePageIndex === 0}
              className="bg-white hover:bg-slate-100 disabled:opacity-30 border border-slate-300 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <ChevronLeft size={16} className="text-[#A00B01]" />
              <span>আগের পাতা {activePageIndex > 0 && `(পৃষ্ঠা ${activePageIndex})`}</span>
            </button>

            {/* Interactive Small Paper Thumbnail Cards */}
            <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1 max-w-full scrollbar-thin">
              {pages.map((imgUrl, idx) => {
                const isCurrent = activePageIndex === idx;
                const label = getPageLabel(idx, pages.length);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActivePageIndex(idx);
                      setZoomScale(1.25);
                    }}
                    className={`group flex flex-col items-center gap-1 p-1 rounded-xl transition cursor-pointer select-none ${
                      isCurrent
                        ? 'bg-white border-2 border-[#A00B01] shadow-sm'
                        : 'bg-transparent border border-transparent hover:border-slate-300'
                    }`}
                  >
                    <div className="w-12 sm:w-14 aspect-[3/4] overflow-hidden rounded-md bg-slate-200 border border-slate-200 shadow-2xs group-hover:scale-105 transition">
                      <img
                        src={imgUrl}
                        alt={label}
                        className="w-full h-full object-cover epaper-sharp"
                      />
                    </div>
                    <span
                      className={`text-[11px] font-extrabold truncate max-w-[70px] ${
                        isCurrent ? 'text-[#A00B01]' : 'text-slate-700'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={activePageIndex === pages.length - 1}
              className="bg-white hover:bg-slate-100 disabled:opacity-30 border border-slate-300 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <span>পরের পাতা {activePageIndex < pages.length - 1 && `(পৃষ্ঠা ${activePageIndex + 2})`}</span>
              <ChevronRight size={16} className="text-[#A00B01]" />
            </button>
          </div>
        </div>
      )}

      {/* 4. CALENDAR SECTION ("Calender") - Exact Purbanchal Style */}
      <div className="mt-8 pt-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
            <path d="M3 13.5C1.5 11.9792 0.75 10.1458 0.75 8C0.75 5.85417 1.5 4.03125 3 2.53125C4.52083 1.01042 6.35417 0.25 8.5 0.25C10.6458 0.25 12.4688 1.01042 13.9688 2.53125C15.4896 4.03125 16.25 5.85417 16.25 8C16.25 10.1458 15.4896 11.9792 13.9688 13.5C12.4688 15 10.6458 15.75 8.5 15.75C6.35417 15.75 4.52083 15 3 13.5ZM8.5 13.75C10.0833 13.75 11.4375 13.1875 12.5625 12.0625C13.6875 6.41667 13.6875 5.0625 12.5625 3.9375C11.4375 2.8125 10.0833 2.25 8.5 2.25V13.75Z" fill="#A00B01"/>
          </svg>
          <h3 className="text-[20px] font-bold text-[#222222] tracking-tight">
            Calender
          </h3>
        </div>

        {/* Divider line */}
        <div className="w-full h-[1px] bg-[#ececec] mt-3 mb-4"></div>

        {/* Datepicker container */}
        <div className="bg-[#f7f7f7] p-3.5 rounded-[5px] border border-[#eeeeee] flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#cccccc] rounded px-3 py-2 text-xs font-bold">
            <CalendarIcon size={16} className="text-[#A00B01]" />
            <span>তারিখ নির্বাচন করুন:</span>
            <input
              type="date"
              value={selectedDateStr}
              onChange={handleDateChange}
              className="bg-transparent text-[#222222] font-bold focus:outline-none cursor-pointer"
            />
          </div>
          <span className="text-xs text-gray-500 font-semibold">
            (যেকোনো দিনের সংকলন দেখতে তারিখ সিলেক্ট করুন)
          </span>
        </div>
      </div>

      {/* 5. LIGHTBOX SLIDER POPUP WITH WORKING HD CRISP ZOOM CONTROLS */}
      {lightboxOpen && pages[activePageIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-3 sm:p-5 select-none">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between text-white max-w-6xl border-b border-white/20 pb-2">
            <div className="flex items-center gap-3">
              <span className="font-bold text-base sm:text-lg">
                {getPageLabel(activePageIndex, pages.length)} - ই-পেপার (এইচডি ভিউ)
              </span>
              <span className="text-xs text-emerald-400 font-extrabold bg-white/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                জুম: {Math.round(lightboxZoom * 100)}%
              </span>
            </div>

            {/* Lightbox Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom(1.5)}
                className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded text-xs font-bold transition"
              >
                150% HD
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom(2.25)}
                className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded text-xs font-bold transition"
              >
                225% আল্ট্রা
              </button>

              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.max(z - 0.25, 0.75))}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                title="জুম আউট (-)"
              >
                <Minus size={14} />
              </button>

              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.min(z + 0.25, 4))}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                title="জুম ইন (+)"
              >
                <Plus size={14} />
              </button>

              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="bg-white/20 hover:bg-[#A00B01] text-white p-1.5 rounded-full transition cursor-pointer ml-2"
                title="বন্ধ করুন"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Main Newspaper Image Display */}
          <div 
            onWheel={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                  setLightboxZoom((z) => Math.min(z + 0.25, 4));
                } else {
                  setLightboxZoom((z) => Math.max(z - 0.25, 0.75));
                }
              }
            }}
            className="flex-1 w-full flex items-start justify-center overflow-auto p-2 my-2 scrollbar-thin scrollbar-thumb-white/40"
          >
            <div 
              className="transition-all duration-150 flex justify-center"
              style={{ width: `${lightboxZoom * 100}%` }}
            >
              <img
                src={pages[activePageIndex]}
                alt={getPageLabel(activePageIndex, pages.length)}
                className="w-full h-auto object-contain rounded bg-white shadow-2xl epaper-sharp"
                style={{
                  imageRendering: 'crisp-edges',
                  WebkitFontSmoothing: 'antialiased',
                }}
              />
            </div>
          </div>

          {/* Bottom Bar Page Navigation */}
          <div className="w-full max-w-md flex items-center justify-between text-white bg-white/10 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/20">
            <button
              onClick={() => {
                if (activePageIndex > 0) setActivePageIndex(activePageIndex - 1);
              }}
              disabled={activePageIndex === 0}
              className="hover:text-red-400 disabled:opacity-30 font-bold flex items-center gap-1 cursor-pointer text-xs"
            >
              <ChevronLeft size={18} />
              <span>আগের পাতা</span>
            </button>

            <span className="font-bold text-xs sm:text-sm text-red-400">
              {getPageLabel(activePageIndex, pages.length)} ({activePageIndex + 1} / {pages.length})
            </span>

            <button
              onClick={() => {
                if (activePageIndex < pages.length - 1) setActivePageIndex(activePageIndex + 1);
              }}
              disabled={activePageIndex === pages.length - 1}
              className="hover:text-red-400 disabled:opacity-30 font-bold flex items-center gap-1 cursor-pointer text-xs"
            >
              <span>পরের পাতা</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
