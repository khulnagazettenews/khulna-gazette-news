'use client';

import { useState, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Calendar as CalendarIcon, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2,
  Plus,
  Minus
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

const PAGE_LABELS = ['প্রথম-পাতা', '২য়-পাতা', '৩য়-পাতা', 'শেষ-পাতা'];

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
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1.5);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    activeIssue ? new Date(activeIssue.date).toISOString().split('T')[0] : '2026-07-25'
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Extract 4 pages for active issue
  const pages = useMemo(() => {
    let list: string[] = [];
    if (activeIssue?.imageUrls && activeIssue.imageUrls.length > 0) {
      list = [...activeIssue.imageUrls];
    } else if (activeIssue?.imageUrl) {
      list = [activeIssue.imageUrl];
    }

    if (list.length === 0) {
      return FALLBACK_PAGES;
    }

    while (list.length < 4) {
      list.push(FALLBACK_PAGES[list.length] || FALLBACK_PAGES[0]);
    }
    return list.slice(0, 4);
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
      setZoomScale(1);
    }
  };

  const getPageLabel = (idx: number) => {
    return PAGE_LABELS[idx] || `পৃষ্ঠা ${idx + 1}`;
  };

  // Zoom handlers
  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setZoomScale((z) => Math.max(z - 0.25, 0.5));
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setZoomScale((z) => Math.min(z + 0.25, 4));
  };

  const handleZoomReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setZoomScale(1);
  };

  // Optional Ctrl + Mouse Wheel Zooming
  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom when Ctrl key is pressed, preventing accidental zoom out during normal scrolling
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoomScale((z) => Math.min(z + 0.2, 4));
      } else {
        setZoomScale((z) => Math.max(z - 0.2, 1));
      }
    }
  };

  return (
    <div className="max-w-[1140px] mx-auto py-6 px-3 sm:px-4 font-sans text-[#222222]">
      
      {/* 1. HEADER SECTION ("আজকের পত্রিকা") - Exact Purbanchal Header Style */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Purbanchal Red Circle Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
              <path d="M3 13.5C1.5 11.9792 0.75 10.1458 0.75 8C0.75 5.85417 1.5 4.03125 3 2.53125C4.52083 1.01042 6.35417 0.25 8.5 0.25C10.6458 0.25 12.4688 1.01042 13.9688 2.53125C15.4896 4.03125 16.25 5.85417 16.25 8C16.25 10.1458 15.4896 11.9792 13.9688 13.5C12.4688 15 10.6458 15.75 8.5 15.75C6.35417 15.75 4.52083 15 3 13.5ZM8.5 13.75C10.0833 13.75 11.4375 13.1875 12.5625 12.0625C13.6875 10.9375 14.25 9.58333 14.25 8C14.25 6.41667 13.6875 5.0625 12.5625 3.9375C11.4375 2.8125 10.0833 2.25 8.5 2.25V13.75Z" fill="#A00B01"/>
            </svg>
            <h3 className="text-[22px] font-bold text-[#222222] tracking-tight">
              আজকের পত্রিকা
            </h3>
          </div>

          {activeIssue?.pdfUrl && (
            <a
              href={activeIssue.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#A00B01] hover:bg-red-800 text-white text-xs font-bold px-3.5 py-1.5 rounded transition flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>PDF ডাউনলোড</span>
            </a>
          )}
        </div>
        
        {/* Divider line */}
        <div className="w-full h-[1px] bg-[#ececec] mt-3 mb-5"></div>

        {/* 2. TOP PAGE THUMBNAILS CONTAINER (.epaper-thumbnails-container) */}
        <div className="bg-[#f7f7f7] p-2.5 sm:p-3 rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-[#eeeeee]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {pages.map((imgUrl, idx) => {
              const label = getPageLabel(idx);
              const isActive = activePageIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActivePageIndex(idx);
                    setZoomScale(1);
                  }}
                  className={`p-1.5 rounded-[3px] cursor-pointer transition flex flex-col items-center select-none ${
                    isActive
                      ? 'border-2 border-[#A00B01] bg-white shadow-xs'
                      : 'border-2 border-transparent hover:border-[#A00B01] bg-transparent'
                  }`}
                >
                  <div className="w-full aspect-[3/4] overflow-hidden bg-white">
                    <img
                      src={imgUrl}
                      alt={label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className={`text-center font-bold text-[14px] mt-1.5 transition ${
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

      {/* 3. CENTER MAIN PAGE DISPLAY (.uael-img-gallery) WITH WORKING ZOOM CONTROLS */}
      <div className="max-w-[850px] mx-auto my-6 bg-white border border-[#e2e2e2] rounded shadow-2xs overflow-hidden">
        {/* Working Zoom Toolbar Header */}
        <div className="bg-[#f5f5f5] border-b border-[#e2e2e2] p-2 px-3 flex items-center justify-between gap-2 text-xs font-bold text-gray-800">
          <div className="flex items-center gap-2">
            <span className="bg-[#A00B01] text-white px-2.5 py-0.5 rounded text-[11px] font-bold">
              {getPageLabel(activePageIndex)}
            </span>
            <span className="text-gray-600 text-[11px]">
              ({activePageIndex + 1} / {pages.length})
            </span>
          </div>

          {/* Fully Clickable - and + Zoom Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Zoom Out Button (-) */}
            <button
              type="button"
              onClick={handleZoomOut}
              className="bg-white hover:bg-gray-200 border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs font-extrabold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              title="জুম আউট (-)"
            >
              <Minus size={13} className="text-[#A00B01]" />
              <span>জুম কমান (-)</span>
            </button>

            {/* Current Zoom % Indicator / Click to Reset */}
            <button
              type="button"
              onClick={handleZoomReset}
              className="bg-white border border-gray-300 text-[#A00B01] font-black text-xs px-2.5 py-1 rounded hover:bg-gray-100 transition shadow-2xs"
              title="১০০% সাইজে ফেরান (রিসেট)"
            >
              {Math.round(zoomScale * 100)}%
            </button>

            {/* Zoom In Button (+) */}
            <button
              type="button"
              onClick={handleZoomIn}
              className="bg-white hover:bg-gray-200 border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs font-extrabold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              title="জুম ইন (+)"
            >
              <Plus size={13} className="text-[#A00B01]" />
              <span>জুম বাড়ান (+)</span>
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
              <span className="hidden sm:inline">বড় করুন</span>
            </button>
          </div>
        </div>

        {/* Scrollable Container with Mouse Wheel & Scaled Image */}
        <div 
          ref={containerRef}
          onWheel={handleWheel}
          className="relative overflow-auto flex justify-center bg-[#fafafa] p-2 min-h-[500px] max-h-[850px] scrollbar-thin scrollbar-thumb-gray-400 select-none"
        >
          <div 
            className="transition-all duration-150 flex justify-center"
            style={{ width: `${zoomScale * 100}%` }}
          >
            <img
              src={pages[activePageIndex]}
              alt={getPageLabel(activePageIndex)}
              onDoubleClick={() => setZoomScale((z) => (z > 1 ? 1 : 2))}
              onClick={() => {
                if (zoomScale === 1) {
                  setLightboxOpen(true);
                }
              }}
              className="w-full h-auto object-contain block cursor-pointer border border-gray-200 shadow-2xs bg-white"
              title="মাউসের চাকা ঘোরান জুম করতে, অথবা জুম বাড়ান (+) বাটনে টিপুন"
            />
          </div>
        </div>
      </div>

      {/* 4. CALENDAR SECTION ("Calender") - Exact Purbanchal Style */}
      <div className="mt-8 pt-4">
        <div className="flex items-center gap-2">
          {/* Red Circle Icon SVG */}
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

      {/* 5. LIGHTBOX SLIDER POPUP WITH WORKING ZOOM CONTROLS */}
      {lightboxOpen && pages[activePageIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-3 sm:p-5 select-none">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between text-white max-w-5xl border-b border-white/20 pb-2">
            <div className="flex items-center gap-3">
              <span className="font-bold text-base sm:text-lg">
                {getPageLabel(activePageIndex)} - ই-পেপার
              </span>
              <span className="text-xs text-red-400 font-extrabold bg-white/10 px-2.5 py-0.5 rounded">
                জুম: {Math.round(lightboxZoom * 100)}%
              </span>
            </div>

            {/* Lightbox Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.max(z - 0.25, 0.5))}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                title="জুম আউট (-)"
              >
                <Minus size={14} />
                <span>জুম কমান (-)</span>
              </button>

              <button
                type="button"
                onClick={() => setLightboxZoom(1)}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-bold transition"
                title="রিসেট"
              >
                100%
              </button>

              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.min(z + 0.25, 4))}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                title="জুম ইন (+)"
              >
                <Plus size={14} />
                <span>জুম বাড়ান (+)</span>
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
                  setLightboxZoom((z) => Math.max(z - 0.25, 1));
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
                alt={getPageLabel(activePageIndex)}
                className="w-full h-auto object-contain rounded bg-white shadow-2xl"
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
              {getPageLabel(activePageIndex)} ({activePageIndex + 1} / {pages.length})
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
