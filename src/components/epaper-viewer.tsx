'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Calendar, FileText, Download, ZoomIn, ZoomOut, RotateCcw, X, 
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Sparkles, BookOpen, 
  Image as ImageIcon, Focus, Crop, ArrowRight, Layers, LayoutGrid, Check,
  Newspaper, Sliders
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

interface PartViewFocus {
  percentX: number;
  percentY: number;
  scale: number;
  pageIdx: number;
}

// Helper to convert numbers to Bengali digits
const toBengaliNumber = (num: number | string): string => {
  const englishToBengaliMap: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(num).split('').map(char => englishToBengaliMap[char] || char).join('');
};

// Formats date to Bengali readable string
const formatBengaliDate = (dateInput: Date | string, includeWeekday = true): string => {
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeWeekday ? { weekday: 'long' } : {}),
  });
};

// BD-Pratidin Page Label Helper (১ম পৃষ্ঠা, ২য় পৃষ্ঠা, ৩য় পৃষ্ঠা...)
const getBengaliPageOrdinal = (index: number): string => {
  const ordinals = [
    '১ম পৃষ্ঠা', '২য় পৃষ্ঠা', '৩য় পৃষ্ঠা', '৪র্থ পৃষ্ঠা', 
    '৫ম পৃষ্ঠা', '৬ষ্ঠ পৃষ্ঠা', '৭ম পৃষ্ঠা', '৮ম পৃষ্ঠা', 
    '৯ম পৃষ্ঠা', '১০ম পৃষ্ঠা', '১১দশ পৃষ্ঠা', '১২দশ পৃষ্ঠা'
  ];
  if (ordinals[index]) return ordinals[index];
  return `পৃষ্ঠা ${toBengaliNumber(index + 1)}`;
};

export default function EpaperViewer({ initialIssues }: EpaperViewerProps) {
  const [issues] = useState<EpaperIssue[]>(initialIssues);
  
  // Selected issue (Defaults to latest edition)
  const [activeIssue, setActiveIssue] = useState<EpaperIssue | null>(
    initialIssues.length > 0 ? initialIssues[0] : null
  );
  
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Mobile Touch Swipe Coordinates
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Clicked Article Section Focus Modal
  const [partView, setPartView] = useState<PartViewFocus | null>(null);

  // Search date state for archive
  const [archiveSearchDate, setArchiveSearchDate] = useState<string>('');

  const mainViewerRef = useRef<HTMLDivElement>(null);

  // Pages array for current active issue
  const pages = useMemo(() => {
    if (!activeIssue) return [];
    if (activeIssue.imageUrls && activeIssue.imageUrls.length > 0) {
      return activeIssue.imageUrls;
    }
    return activeIssue.imageUrl ? [activeIssue.imageUrl] : [];
  }, [activeIssue]);

  // Switch edition
  const handleSelectIssue = (issue: EpaperIssue) => {
    setActiveIssue(issue);
    setPageIndex(0);
    setScale(1);
    setPartView(null);
    
    // Smooth scroll to top reader
    if (mainViewerRef.current) {
      mainViewerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Switch date from top date picker
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (!selectedDate) return;

    const matchedIssue = issues.find((item) => {
      const itemDateStr = new Date(item.date).toISOString().split('T')[0];
      return itemDateStr === selectedDate;
    });

    if (matchedIssue) {
      handleSelectIssue(matchedIssue);
    } else {
      alert('দুঃখিত, নির্বাচিত তারিখে কোনো ই-পেপার প্রকাশ করা হয়নি।');
    }
  };

  // CHANGE SLIDE PAGE
  const changePage = (index: number) => {
    if (index < 0 || index >= pages.length) return;
    setPageIndex(index);
    setScale(1);
    setPartView(null);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!mainViewerRef.current) return;
    if (!document.fullscreenElement) {
      mainViewerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => console.error(err));
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeIssue) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === 'ArrowLeft') {
        changePage(pageIndex - 1);
      } else if (e.key === 'ArrowRight') {
        changePage(pageIndex + 1);
      } else if (e.key === 'Escape') {
        setPartView(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIssue, pageIndex, pages.length, partView]);

  // MOBILE TOUCH SWIPE FOR HORIZONTAL SLIDER
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    // Swipe Threshold 40px
    if (deltaX < -40) {
      changePage(pageIndex + 1);
    } else if (deltaX > 40) {
      changePage(pageIndex - 1);
    }

    setTouchStartX(null);
  };

  // Zoom control helpers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1));

  // Click on newspaper page image to zoom into that exact article!
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, idx: number) => {
    if (scale > 1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = Math.round((x / rect.width) * 100);
    const percentY = Math.round((y / rect.height) * 100);

    // Open article focus view modal
    setPartView({
      percentX,
      percentY,
      scale: 3.2,
      pageIdx: idx,
    });
  };

  // Download page image
  const handleDownloadImage = () => {
    if (!pages[pageIndex]) return;
    const link = document.createElement('a');
    link.href = pages[pageIndex];
    link.download = `khulna-gazette-epaper-${activeIssue?.id || 'issue'}-page-${pageIndex + 1}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Archive filtered list
  const archiveIssues = useMemo(() => {
    if (!archiveSearchDate) return issues;
    return issues.filter((item) => {
      const itemDateStr = new Date(item.date).toISOString().split('T')[0];
      return itemDateStr === archiveSearchDate;
    });
  }, [issues, archiveSearchDate]);

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      {/* ========================================================================= */}
      {/* SMOOTH HORIZONTAL PAGE SLIDE CAROUSEL READER */}
      {/* ========================================================================= */}
      <div ref={mainViewerRef} className="space-y-4">
        {/* CLEAN TOP CONTROL BAR 1 (Header Controls) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-slate-800">
          {/* Brand Logo & Date Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-700 inline-block animate-pulse"></span>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                খুলনা গেজেট ই-পেপার
              </h1>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="text-xs text-slate-500 font-bold hidden sm:inline">তারিখ:</span>
              <input
                type="date"
                value={activeIssue ? new Date(activeIssue.date).toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 cursor-pointer shadow-2xs"
              />
            </div>
          </div>

          {/* Page Counter & Action Tool Buttons */}
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {pages.length > 0 && (
              <span className="text-xs font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl">
                {getBengaliPageOrdinal(pageIndex)} (মোট {toBengaliNumber(pages.length)} পৃষ্ঠা)
              </span>
            )}

            {/* Navigation Buttons */}
            <button
              onClick={() => changePage(pageIndex - 1)}
              disabled={pageIndex === 0}
              className="bg-slate-100 hover:bg-red-700 hover:text-white text-slate-800 disabled:text-slate-300 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
              title="পূর্ববর্তী পৃষ্ঠা"
            >
              <ChevronLeft size={15} />
              <span>আগের পৃষ্ঠা</span>
            </button>

            <button
              onClick={() => changePage(pageIndex + 1)}
              disabled={pageIndex === pages.length - 1}
              className="bg-slate-100 hover:bg-red-700 hover:text-white text-slate-800 disabled:text-slate-300 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
              title="পরবর্তী পৃষ্ঠা"
            >
              <span>পরবর্তী পৃষ্ঠা</span>
              <ChevronRight size={15} />
            </button>

            <div className="w-px h-5 bg-slate-200 my-auto"></div>

            {/* Quick Zoom Buttons */}
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-30 p-1.5 rounded-xl border border-slate-200 transition"
              title="জুম আউট"
            >
              <ZoomOut size={15} />
            </button>

            <span className="text-xs font-black text-slate-700 w-11 text-center select-none bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              {toBengaliNumber((scale * 100).toFixed(0))}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-30 p-1.5 rounded-xl border border-slate-200 transition"
              title="জুম ইন"
            >
              <ZoomIn size={15} />
            </button>

            <div className="w-px h-5 bg-slate-200 my-auto"></div>

            {/* Download Image Button */}
            <button
              onClick={handleDownloadImage}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-1.5 rounded-xl border border-slate-200 transition"
              title="ছবি ডাউনলোড"
            >
              <ImageIcon size={15} />
            </button>

            {/* Download PDF Button */}
            {activeIssue?.pdfUrl && (
              <a
                href={activeIssue.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-700 hover:bg-red-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                title="পিডিএফ ফাইল ডাউনলোড"
              >
                <Download size={14} />
                <span className="hidden sm:inline">পিডিএফ</span>
              </a>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="bg-slate-800 hover:bg-slate-900 text-white p-1.5 rounded-xl transition"
              title="ফুলস্ক্রিন"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* CLEAN TOP CONTROL BAR 2: HORIZONTAL PAGE NUMBER TABS (১ম পৃষ্ঠা, ২য় পৃষ্ঠা...) */}
        {activeIssue && pages.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 shadow-sm">
            <span className="text-xs font-extrabold text-slate-600 flex-shrink-0 mr-1 flex items-center gap-1">
              <Layers size={14} className="text-red-700" />
              <span>পৃষ্ঠাসমূহ:</span>
            </span>
            {pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => changePage(idx)}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition flex-shrink-0 ${
                  pageIndex === idx
                    ? 'bg-red-700 text-white shadow-md shadow-red-700/30 scale-105'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {getBengaliPageOrdinal(idx)}
              </button>
            ))}
          </div>
        )}

        {/* SMOOTH HORIZONTAL PAGE SLIDE CANVAS */}
        {activeIssue && pages.length > 0 ? (
          <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            {/* Helper Banner */}
            <div className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-2xs flex items-center gap-1.5 animate-pulse z-10">
              <Sparkles size={14} />
              <span>স্ক্রিনে সোয়াইপ বা অ্যারো বাটন টিপে সব পৃষ্ঠা স্লাইড করুন — সংবাদের অংশে ক্লিক করে জুম দেখুন</span>
            </div>

            {/* Left Page Floating Navigation Arrow */}
            <button
              onClick={() => changePage(pageIndex - 1)}
              disabled={pageIndex === 0}
              className="absolute left-3 sm:left-5 z-30 p-3.5 rounded-full bg-slate-900/80 hover:bg-red-700 text-white border border-white/20 shadow-2xl backdrop-blur-md disabled:opacity-10 hover:scale-110 transition cursor-pointer"
              title="পূর্ববর্তী পৃষ্ঠা"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Right Page Floating Navigation Arrow */}
            <button
              onClick={() => changePage(pageIndex + 1)}
              disabled={pageIndex === pages.length - 1}
              className="absolute right-3 sm:right-5 z-30 p-3.5 rounded-full bg-slate-900/80 hover:bg-red-700 text-white border border-white/20 shadow-2xl backdrop-blur-md disabled:opacity-10 hover:scale-110 transition cursor-pointer"
              title="পরবর্তী পৃষ্ঠা"
            >
              <ChevronRight size={24} />
            </button>

            {/* HORIZONTAL SLIDING TRACK FOR ALL PAGES */}
            <div 
              className="w-full overflow-hidden select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="flex transition-transform duration-300 ease-out w-full"
                style={{ transform: `translateX(-${pageIndex * 100}%)` }}
              >
                {pages.map((url, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 flex items-center justify-center p-1 sm:p-2">
                    <img
                      src={url}
                      alt={`Khulna Gazette Epaper Page ${idx + 1}`}
                      onClick={(e) => handleImageClick(e, idx)}
                      style={{
                        transform: pageIndex === idx ? `scale(${scale})` : 'scale(1)',
                        maxHeight: '660px',
                        maxWidth: '100%',
                      }}
                      className="object-contain bg-white rounded-xl shadow-xl border border-slate-300 transition-transform duration-200 cursor-pointer"
                      title="সংবাদের যেকোনো অংশে ক্লিক করে জুম পপআপ দেখুন"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Horizontal Thumbnails Strip */}
            {pages.length > 1 && (
              <div className="w-full mt-5 pt-4 border-t border-slate-200">
                <div className="flex gap-3 overflow-x-auto justify-start sm:justify-center py-1 px-1 scrollbar-thin scrollbar-thumb-slate-300">
                  {pages.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => changePage(idx)}
                      className={`relative h-16 sm:h-20 aspect-[3/4] rounded-xl border transition-all flex-shrink-0 overflow-hidden ${
                        pageIndex === idx 
                          ? 'border-red-700 ring-2 ring-red-700/30 scale-105 shadow-md' 
                          : 'border-slate-300 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-white text-[9px] font-extrabold text-center py-0.5">
                        {getBengaliPageOrdinal(idx)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <FileText size={44} className="mx-auto mb-2 opacity-40" />
            <p className="font-bold text-xs">কোনো ই-পেপার পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CLICKED ARTICLE CROPPED FOCUS MODAL */}
      {/* ========================================================================= */}
      {partView && pages[partView.pageIdx !== undefined ? partView.pageIdx : pageIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-3 sm:p-6 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            {/* Modal Top Header */}
            <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <Crop size={18} className="text-red-500" />
                <span className="font-black text-sm text-white">
                  সংবাদ অংশ (Focused Article View)
                </span>
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-lg font-bold border border-slate-700">
                  {toBengaliNumber((partView.scale * 100).toFixed(0))}% জুম
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPartView(prev => prev ? { ...prev, scale: Math.max(prev.scale - 0.5, 1.5) } : null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs transition"
                  title="জুম কমান"
                >
                  <ZoomOut size={15} />
                </button>
                <button
                  onClick={() => setPartView(prev => prev ? { ...prev, scale: Math.min(prev.scale + 0.5, 5) } : null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs transition"
                  title="জুম বাড়ান"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  onClick={() => setPartView(null)}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-md shadow-red-600/30"
                  title="বন্ধ করুন (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Cropped Article Focus Canvas */}
            <div className="flex-grow relative bg-slate-950 flex items-center justify-center overflow-auto p-4 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
                <img
                  src={pages[partView.pageIdx !== undefined ? partView.pageIdx : pageIndex]}
                  alt="Focused Article Part"
                  style={{
                    transformOrigin: `${partView.percentX}% ${partView.percentY}%`,
                    transform: `scale(${partView.scale})`,
                    maxHeight: '65vh',
                    objectFit: 'contain',
                  }}
                  className="transition duration-200"
                />
              </div>
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="bg-slate-950 px-5 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">* ক্রপ করা সংবাদটি স্পষ্ট পড়ুন</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadImage}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition border border-slate-700 flex items-center gap-1.5 text-xs"
                >
                  <ImageIcon size={14} />
                  <span>ইমেজ ডাউনলোড</span>
                </button>
                <button
                  onClick={() => setPartView(null)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition text-xs shadow-md shadow-red-600/30"
                >
                  সম্পূর্ণ পৃষ্ঠা
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM ARCHIVE SECTION */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 border-l-4 border-red-700 pl-3 flex items-center gap-2">
              <span>পূর্ববর্তী ই-পেপার সংস্করণ (আর্কাইভ)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              অতীতের যেকোনো দিনের ই-পেপার পত্রিকা পড়তে নিচে নির্বাচন করুন
            </p>
          </div>

          {/* Date Search for Archive */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={archiveSearchDate}
              onChange={(e) => setArchiveSearchDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 shadow-xs"
            />
            {archiveSearchDate && (
              <button
                onClick={() => setArchiveSearchDate('')}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl text-xs"
                title="ফিল্টার রিসেট"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Compact 4-Column Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {archiveIssues.length === 0 ? (
            <div className="col-span-full text-center py-10 text-slate-400 font-bold text-xs">
              কোনো পূর্ববর্তী সংস্করণ পাওয়া যায়নি।
            </div>
          ) : (
            archiveIssues.map((item) => {
              const isSelected = activeIssue?.id === item.id;
              const pageCount = item.imageUrls?.length || (item.imageUrl ? 1 : 0);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectIssue(item)}
                  className={`bg-slate-50 rounded-2xl border overflow-hidden shadow-xs hover:shadow-xl transition duration-300 cursor-pointer flex flex-col justify-between group ${
                    isSelected ? 'border-red-700 ring-2 ring-red-700/20 bg-red-50/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="aspect-[3/4] w-full bg-slate-200 overflow-hidden relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt="Epaper Cover"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <FileText size={36} />
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow">
                      {toBengaliNumber(pageCount)} পৃষ্ঠা
                    </div>
                  </div>

                  <div className="p-3 text-center space-y-2">
                    <p className="font-extrabold text-xs text-slate-800 truncate">
                      {formatBengaliDate(item.date, false)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectIssue(item);
                      }}
                      className={`w-full text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                        isSelected 
                          ? 'bg-red-700 text-white shadow-md shadow-red-700/30' 
                          : 'bg-slate-200 hover:bg-red-700 hover:text-white text-slate-700'
                      }`}
                    >
                      <BookOpen size={13} />
                      <span>{isSelected ? 'পড়া হচ্ছে' : 'পত্রিকা পড়ুন'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}









