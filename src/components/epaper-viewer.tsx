'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Sparkles,
  AlertCircle
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
  initialSelectedDate?: string;
}

const formatDateToYYYYMMDD = (dateInput: Date | string): string => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;
    if (dateInput.includes('T')) return dateInput.split('T')[0];
  }
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const toBanglaNum = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((char) => (/\d/.test(char) ? bnDigits[parseInt(char)] : char))
    .join('');
};

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

export default function EpaperViewer({ initialIssues, initialSelectedDate }: EpaperViewerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryDate = searchParams?.get('date');

  const [issues] = useState<EpaperIssue[]>(initialIssues);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const matchedInitialIssue = useMemo(() => {
    const targetDate = queryDate || initialSelectedDate;
    if (targetDate && initialIssues.length > 0) {
      const normalizedTarget = formatDateToYYYYMMDD(targetDate);
      const found = initialIssues.find((item) => formatDateToYYYYMMDD(item.date) === normalizedTarget);
      if (found) return found;
    }
    return initialIssues.length > 0 ? initialIssues[0] : null;
  }, [initialIssues, initialSelectedDate, queryDate]);

  const [activeIssue, setActiveIssue] = useState<EpaperIssue | null>(matchedInitialIssue);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1.0); // Default 1.0 (100% full page view)
  const [viewMode, setViewMode] = useState<'image' | 'pdf'>('image'); // Mode switcher
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1.0); // Default 1.0 for complete fit to screen
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    queryDate || initialSelectedDate || (activeIssue ? formatDateToYYYYMMDD(activeIssue.date) : '2026-09-15')
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const lightboxContainerRef = useRef<HTMLDivElement>(null);
  const mainViewerWrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mainViewerWrapperRef.current?.requestFullscreen) {
        mainViewerWrapperRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const targetDate = queryDate || initialSelectedDate;
    if (!targetDate || issues.length === 0) return;

    const normalizedTarget = formatDateToYYYYMMDD(targetDate);

    // 1. Try exact match
    const exactMatch = issues.find((item) => formatDateToYYYYMMDD(item.date) === normalizedTarget);

    if (exactMatch) {
      setActiveIssue(exactMatch);
      setActivePageIndex(0);
      setSelectedDateStr(normalizedTarget);
      setNoticeMessage(null);
    } else {
      // 2. Find closest issue if exact match not found
      let closest: EpaperIssue | null = null;
      let minDiff = Infinity;
      const targetMs = new Date(normalizedTarget).getTime();

      for (const item of issues) {
        const itemDateStr = formatDateToYYYYMMDD(item.date);
        const diff = Math.abs(new Date(itemDateStr).getTime() - targetMs);
        if (diff < minDiff) {
          minDiff = diff;
          closest = item;
        }
      }

      if (closest) {
        setActiveIssue(closest);
        setActivePageIndex(0);
        const closestDateStr = formatDateToYYYYMMDD(closest.date);
        setSelectedDateStr(closestDateStr);
        setNoticeMessage(`অনুরোধকৃত তারিখ (${toBanglaNum(normalizedTarget)}) এর ই-পেপার পাওয়া যায়নি। নিকটবর্তী (${toBanglaNum(closestDateStr)}) তারিখের সংকলন দেখানো হচ্ছে।`);
      }
    }
  }, [queryDate, initialSelectedDate, issues]);

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

  // Handle date change from input
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    setSelectedDateStr(dateVal);
    if (!dateVal) return;
    router.push(`/epaper?date=${dateVal}`);
  };

  // Page navigation handlers
  const goToPrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex((prev) => prev - 1);
      setZoomScale(1.0);
      setPanPos({ x: 0, y: 0 });
      setLightboxZoom(1.0);
      setLbPanPos({ x: 0, y: 0 });
    }
  };

  const goToNextPage = () => {
    if (activePageIndex < pages.length - 1) {
      setActivePageIndex((prev) => prev + 1);
      setZoomScale(1.0);
      setPanPos({ x: 0, y: 0 });
      setLightboxZoom(1.0);
      setLbPanPos({ x: 0, y: 0 });
    }
  };

  // Zoom handlers
  const handleZoomOut = () => {
    setZoomScale((z) => {
      const nz = Math.max(Number((z - 0.25).toFixed(2)), 0.6);
      if (nz <= 1.0) setPanPos({ x: 0, y: 0 });
      return nz;
    });
  };

  const handleZoomIn = () => {
    setZoomScale((z) => Math.min(Number((z + 0.25).toFixed(2)), 4.0));
  };

  // Wheel zoom via useEffect for passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoomScale((z) => {
        const nz = Math.min(Math.max(Number((z + delta).toFixed(2)), 0.6), 4.0);
        if (nz <= 1.0) setPanPos({ x: 0, y: 0 });
        return nz;
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const lbContainer = lightboxContainerRef.current;
    if (!lbContainer || !lightboxOpen) return;

    const onLbWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setLightboxZoom((z) => {
        const nz = Math.min(Math.max(Number((z + delta).toFixed(2)), 0.6), 4.0);
        if (nz <= 1.0) setLbPanPos({ x: 0, y: 0 });
        return nz;
      });
    };

    lbContainer.addEventListener('wheel', onLbWheel, { passive: false });
    return () => lbContainer.removeEventListener('wheel', onLbWheel);
  }, [lightboxOpen]);

  // 2D Transform Pan State for Main Viewer (Top, Bottom, Left, Right)
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // 2D Transform Pan State for Lightbox Modal
  const [lbPanPos, setLbPanPos] = useState({ x: 0, y: 0 });
  const [lbDragging, setLbDragging] = useState(false);
  const [lbDragStart, setLbDragStart] = useState({ x: 0, y: 0 });
  const [lbPanStart, setLbPanStart] = useState({ x: 0, y: 0 });
  const [lbHasMoved, setLbHasMoved] = useState(false);

  // Main Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ x: panPos.x, y: panPos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setHasMoved(true);
      }
      setPanPos({
        x: panStart.x + dx,
        y: panStart.y + dy,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Lightbox Drag Handlers
  const handleLbMouseDown = (e: React.MouseEvent) => {
    setLbDragging(true);
    setLbHasMoved(false);
    setLbDragStart({ x: e.clientX, y: e.clientY });
    setLbPanStart({ x: lbPanPos.x, y: lbPanPos.y });
  };

  const handleLbMouseMove = (e: React.MouseEvent) => {
    if (lbDragging) {
      const dx = e.clientX - lbDragStart.x;
      const dy = e.clientY - lbDragStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setLbHasMoved(true);
      }
      setLbPanPos({
        x: lbPanStart.x + dx,
        y: lbPanStart.y + dy,
      });
    }
  };

  const handleLbMouseUp = () => {
    setLbDragging(false);
  };

  // Touch Support for Mobile/Tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setHasMoved(false);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setPanStart({ x: panPos.x, y: panPos.y });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setHasMoved(true);
      }
      setPanPos({
        x: panStart.x + dx,
        y: panStart.y + dy,
      });
    }
  };

  const handleLbTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setLbHasMoved(false);
      setLbDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setLbPanStart({ x: lbPanPos.x, y: lbPanPos.y });
      setLbDragging(true);
    }
  };

  const handleLbTouchMove = (e: React.TouchEvent) => {
    if (lbDragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - lbDragStart.x;
      const dy = e.touches[0].clientY - lbDragStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setLbHasMoved(true);
      }
      setLbPanPos({
        x: lbPanStart.x + dx,
        y: lbPanStart.y + dy,
      });
    }
  };

  return (
    <div ref={mainViewerWrapperRef} className="w-full mx-auto py-2 px-1 sm:px-2 font-sans text-[#222222] bg-white">
      {/* Notice Banner when fallback date is loaded */}
      {noticeMessage && (
        <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-950 px-4 py-3 rounded-lg flex items-center gap-2.5 text-xs sm:text-sm font-bold shadow-2xs">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}
      
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

        {/* 2. TOP PAGE THUMBNAILS CONTAINER (.epaper-thumbnails-container - Auto Adjust & Center Grid) */}
        <div className="bg-[#f7f7f7] p-2 sm:p-3 rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-[#eeeeee]">
          <div 
            className="flex flex-wrap items-start justify-center gap-2 sm:gap-3"
          >
            {pages.map((imgUrl, idx) => {
              const label = getPageLabel(idx, pages.length);
              const isActive = activePageIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActivePageIndex(idx);
                    setLightboxZoom(1.0);
                    setLightboxOpen(true);
                    setViewMode('image');
                  }}
                  className={`p-1.5 rounded-[3px] cursor-pointer transition flex flex-col items-center select-none flex-1 min-w-[95px] max-w-[145px] sm:min-w-[115px] sm:max-w-[165px] ${
                    isActive
                      ? 'border-2 border-[#A00B01] bg-white shadow-xs'
                      : 'border-2 border-transparent hover:border-[#A00B01] bg-transparent'
                  }`}
                >
                  <div className="w-full aspect-[3/4] overflow-hidden bg-white rounded-xs shadow-2xs flex items-center justify-center border border-slate-200/60">
                    <img
                      src={imgUrl}
                      alt={label}
                      className="w-full h-full object-contain epaper-sharp bg-white"
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
        <div className="w-full mx-auto my-2 bg-white border border-[#e2e2e2] rounded shadow-2xs overflow-hidden">
          
          {/* Scrollable Container with Crisp HD Sharp Rendering */}
          <div 
            className="relative w-full overflow-hidden flex items-start justify-center bg-slate-200/40 p-1 sm:p-2 min-h-[520px] sm:min-h-[1100px] lg:min-h-[1350px] select-none rounded-lg border border-slate-200/60"
          >
            {/* Floating Left Overlay Button (Previous Page) */}
            {activePageIndex > 0 && (
              <button
                type="button"
                onClick={goToPrevPage}
                className="fixed sm:absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-slate-900/85 hover:bg-[#A00B01] text-white p-3 rounded-full shadow-2xl transition backdrop-blur-xs flex items-center justify-center cursor-pointer border border-white/20 hover:scale-110"
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
                className="fixed sm:absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-slate-900/85 hover:bg-[#A00B01] text-white p-3 rounded-full shadow-2xl transition backdrop-blur-xs flex items-center justify-center cursor-pointer border border-white/20 hover:scale-110"
                title="পরের পাতায় যান"
              >
                <ChevronRight size={24} />
              </button>
            )}

            <div className="flex justify-center items-start shrink-0 w-full max-w-[1250px] lg:max-w-[1450px] xl:max-w-[1600px]">
              <img
                src={pages[activePageIndex]}
                alt={getPageLabel(activePageIndex, pages.length)}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onClick={() => {
                  setLightboxZoom(1.0);
                  setLbPanPos({ x: 0, y: 0 });
                  setLightboxOpen(true);
                }}
                title="ক্লিক করুন আলাদা ফুল-উইন্ডোতে ইচ্ছেমতো জুম ইন/আউট করে দেখতে"
                className="w-full h-auto object-contain block border border-gray-300 shadow-2xl bg-white rounded-sm epaper-sharp cursor-pointer hover:opacity-95 transition-opacity"
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
                      setLightboxZoom(1.0);
                      setLightboxOpen(true);
                    }}
                    className={`group flex flex-col items-center gap-1 p-1 rounded-xl transition cursor-pointer select-none ${
                      isCurrent
                        ? 'bg-white border-2 border-[#A00B01] shadow-sm'
                        : 'bg-transparent border border-transparent hover:border-slate-300'
                    }`}
                  >
                    <div className="w-12 sm:w-14 aspect-[3/4] overflow-hidden rounded-md bg-white border border-slate-200 shadow-2xs group-hover:scale-105 transition flex items-center justify-center">
                      <img
                        src={imgUrl}
                        alt={label}
                        className="w-full h-full object-contain epaper-sharp bg-white"
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
          {/* Header Bar with Interactive Zoom Range Slider */}
          <div className="w-full flex flex-wrap items-center justify-between text-white max-w-6xl border-b border-white/20 pb-2.5 gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-sm sm:text-lg text-white">
                {getPageLabel(activePageIndex, pages.length)} - ই-পেপার (এইচডি ভিউ)
              </span>
              <span className="text-xs text-emerald-400 font-extrabold bg-white/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                জুম: {Math.round(lightboxZoom * 100)}%
              </span>
            </div>

            {/* Lightbox Zoom Controls with Range Slider */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.max(Number((z - 0.15).toFixed(2)), 0.5))}
                className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg transition cursor-pointer"
                title="জুম আউট (-)"
              >
                <Minus size={16} />
              </button>

              <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-2.5 py-1 rounded-lg">
                <input
                  type="range"
                  min="50"
                  max="600"
                  step="5"
                  value={Math.round(lightboxZoom * 100)}
                  onChange={(e) => {
                    const newZoom = Number(e.target.value) / 100;
                    setLightboxZoom(newZoom);
                    if (newZoom <= 1.05) {
                      setLbPanPos({ x: 0, y: 0 });
                    }
                  }}
                  className="w-24 sm:w-36 accent-emerald-400 cursor-pointer"
                  title="স্লাইডার টেনে ইচ্ছেমতো জুম কম-বেশি করুন"
                />
                <span className="text-emerald-400 font-extrabold min-w-[45px] text-center text-xs">
                  {toBanglaNum(Math.round(lightboxZoom * 100))}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.min(Number((z + 0.25).toFixed(2)), 6.0))}
                className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg transition cursor-pointer"
                title="জুম ইন (+)"
              >
                <Plus size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setLightboxZoom(1.0);
                  setLbPanPos({ x: 0, y: 0 });
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer border ${
                  lightboxZoom === 1.0 ? 'bg-[#A00B01] text-white border-[#A00B01]' : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                }`}
              >
                ১০০%
              </button>

              <button
                type="button"
                onClick={() => setLightboxZoom(2.0)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer border ${
                  lightboxZoom === 2.0 ? 'bg-[#A00B01] text-white border-[#A00B01]' : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                }`}
              >
                ২০০%
              </button>

              <button
                type="button"
                onClick={() => setLightboxZoom(3.0)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer border ${
                  lightboxZoom === 3.0 ? 'bg-[#A00B01] text-white border-[#A00B01]' : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                }`}
              >
                ৩০০%
              </button>

              <button
                type="button"
                onClick={() => setLightboxZoom(4.0)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer border ${
                  lightboxZoom === 4.0 ? 'bg-[#A00B01] text-white border-[#A00B01]' : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                }`}
              >
                ৪০০%
              </button>

              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="bg-white/20 hover:bg-[#A00B01] text-white p-1.5 rounded-full transition cursor-pointer ml-1 sm:ml-2"
                title="বন্ধ করুন"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Newspaper Image Display with 2D Drag and Pan & Wheel Zoom */}
          <div 
            ref={lightboxContainerRef}
            onMouseDown={handleLbMouseDown}
            onMouseMove={handleLbMouseMove}
            onMouseUp={handleLbMouseUp}
            onMouseLeave={handleLbMouseUp}
            onTouchStart={handleLbTouchStart}
            onTouchMove={handleLbTouchMove}
            onTouchEnd={handleLbMouseUp}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY < 0 ? 0.2 : -0.2;
              setLightboxZoom((z) => Math.max(0.5, Math.min(6.0, Number((z + delta).toFixed(2)))));
            }}
            className={`flex-1 w-full h-full overflow-hidden flex items-center justify-center p-2 my-1 select-none relative ${
              lbDragging ? 'cursor-grabbing' : lightboxZoom > 1.05 ? 'cursor-grab' : 'cursor-zoom-in'
            }`}
          >
            <div 
              style={{ 
                transform: `translate3d(${lbPanPos.x}px, ${lbPanPos.y}px, 0px) scale(${lightboxZoom})`,
                transition: lbDragging ? 'none' : 'transform 0.12s cubic-bezier(0.2, 0, 0, 1)',
                transformOrigin: 'center center',
              }}
              className="flex justify-center items-center shrink-0 max-w-full max-h-full"
            >
              <img
                src={pages[activePageIndex]}
                alt={getPageLabel(activePageIndex, pages.length)}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onClick={() => {
                  if (!lbHasMoved) {
                    if (lightboxZoom > 1.05) {
                      setLightboxZoom(1.0);
                      setLbPanPos({ x: 0, y: 0 });
                    } else {
                      setLightboxZoom(2.5);
                    }
                  }
                }}
                onDoubleClick={() => {
                  if (lightboxZoom > 1.05) {
                    setLightboxZoom(1.0);
                    setLbPanPos({ x: 0, y: 0 });
                  } else {
                    setLightboxZoom(2.5);
                  }
                }}
                title="মাউস দিয়ে ক্লিক করে বা হুইল ঘুরিয়ে জুম ইন করুন, মাউস টেনে যেকোনো দিকে সরান"
                className={`max-h-[84vh] max-w-[96vw] w-auto h-auto object-contain rounded bg-white shadow-2xl epaper-sharp ${
                  lbDragging ? 'cursor-grabbing' : lightboxZoom > 1.05 ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
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
