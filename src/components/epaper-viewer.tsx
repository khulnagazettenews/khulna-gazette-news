'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, FileText, Download, ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react';

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

// Helper to convert numbers to Bengali digits
const toBengaliNumber = (num: number | string): string => {
  const englishToBengaliMap: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(num).split('').map(char => englishToBengaliMap[char] || char).join('');
};

export default function EpaperViewer({ initialIssues }: EpaperViewerProps) {
  const [activeIssue, setActiveIssue] = useState<EpaperIssue | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Derived pages array for the active issue
  const pages = activeIssue?.imageUrls && activeIssue.imageUrls.length > 0
    ? activeIssue.imageUrls
    : (activeIssue?.imageUrl ? [activeIssue.imageUrl] : []);

  // Reset parameters when opening/closing or changing active issue
  const openReader = (issue: EpaperIssue) => {
    setActiveIssue(issue);
    setPageIndex(0);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
  };

  const closeReader = () => {
    setActiveIssue(null);
    setPageIndex(0);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const changePage = (index: number) => {
    if (index < 0 || index >= pages.length) return;
    setPageIndex(index);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
  };

  // Keyboard navigation for page flip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeIssue) return;
      if (e.key === 'ArrowLeft') {
        changePage(pageIndex - 1);
      } else if (e.key === 'ArrowRight') {
        changePage(pageIndex + 1);
      } else if (e.key === 'Escape') {
        closeReader();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIssue, pageIndex, pages.length]);

  // Reset position when zoom scale returns to 1:1
  useEffect(() => {
    if (scale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  // Support scroll wheel zoom inside modal
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomStep = 0.25;
      setScale((prev) => {
        const nextScale = prev + (e.deltaY < 0 ? zoomStep : -zoomStep);
        return Math.min(Math.max(nextScale, 1), 4);
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [activeIssue]);

  // Zoom control helpers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (scale > 1) {
      handleResetZoom();
    } else {
      setScale(2.5);
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const clickX = e.clientX - (rect.left + rect.width / 2);
        const clickY = e.clientY - (rect.top + rect.height / 2);
        setPosition({
          x: -clickX * 1.5,
          y: -clickY * 1.5
        });
      }
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return; // Only pan when zoomed in
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);
  const [touchStartScale, setTouchStartScale] = useState<number>(1);

  // Mobile Touch drag & Pinch Zoom handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Calculate initial pinch distance
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      setTouchStartDist(dist);
      setTouchStartScale(scale);
      setIsDragging(false); // Stop panning when pinching
    } else if (e.touches.length === 1) {
      if (scale <= 1) return; // Only pan when zoomed in
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist !== null) {
      // Dynamic Pinch Zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const newScale = touchStartScale * (dist / touchStartDist);
      setScale(Math.min(Math.max(newScale, 1), 4));
    } else if (e.touches.length === 1 && isDragging) {
      // Panning
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStartDist(null);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Brand & Heading section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 border-l-4 border-red-600 pl-2.5">
          ই-পেপার আর্কাইভ
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          খুলনা গেজেট ছাপা পত্রিকার ডিজিটাল সংস্করণ (ইমেজ সংস্করণ পড়তে কভারে ক্লিক করুন)
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        {initialIssues.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            কোনো ই-পেপার প্রকাশ করা হয়নি।
          </div>
        ) : (
          initialIssues.map((item) => {
            const itemCount = item.imageUrls?.length || (item.imageUrl ? 1 : 0);
            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between bg-slate-50 relative group"
              >
                {item.imageUrl ? (
                  <div
                    onClick={() => openReader(item)}
                    className="aspect-[3/4] w-full bg-white border-b border-gray-200 overflow-hidden relative cursor-zoom-in group"
                  >
                    <img
                      src={item.imageUrl}
                      alt="Epaper Cover"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {itemCount > 0 && (
                      <span className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded font-bold">
                        {toBengaliNumber(itemCount)} পৃষ্ঠা
                      </span>
                    )}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md">
                        পড়ুন
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] w-full bg-slate-200 flex flex-col items-center justify-center text-gray-400 border-b border-gray-200">
                    <FileText size={48} />
                    <span className="text-[10px] mt-2">ইমেজ সংস্করণ উপলব্ধ নয়</span>
                  </div>
                )}

                <div className="p-4 text-center space-y-3">
                  <p className="font-extrabold text-xs text-gray-700">
                    {new Date(item.date).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <button
                    onClick={() => openReader(item)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>পত্রিকা পড়ুন</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fullscreen Zoomable Epaper Reader Modal */}
      {activeIssue && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md select-none font-sans">
          {/* Top Header bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 text-white">
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-slate-400">খুলনা গেজেট ই-পেপার</span>
              <span className="text-sm font-extrabold">
                {new Date(activeIssue.date).toLocaleDateString('bn-BD', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </span>
            </div>

            {/* Middle Page Indicator */}
            {pages.length > 1 && (
              <div className="bg-slate-900 border border-white/15 px-3 py-1 rounded-full text-xs font-bold text-red-500">
                পৃষ্ঠা: {toBengaliNumber(pageIndex + 1)} / {toBengaliNumber(pages.length)}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={closeReader}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition shadow"
                title="বন্ধ করুন"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Interactive Viewer Area */}
          <div 
            ref={containerRef}
            className={`flex-grow relative flex items-center justify-center overflow-hidden ${
              scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
          >
            {/* Previous Page Floating Button */}
            {pages.length > 1 && (
              <button
                onClick={() => changePage(pageIndex - 1)}
                disabled={pageIndex === 0}
                className="absolute left-4 z-10 p-3 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-white/10 text-white disabled:opacity-20 hover:scale-105 transition disabled:hover:scale-100"
                title="পূর্ববর্তী পৃষ্ঠা"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next Page Floating Button */}
            {pages.length > 1 && (
              <button
                onClick={() => changePage(pageIndex + 1)}
                disabled={pageIndex === pages.length - 1}
                className="absolute right-4 z-10 p-3 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-white/10 text-white disabled:opacity-20 hover:scale-105 transition disabled:hover:scale-100"
                title="পরবর্তী পৃষ্ঠা"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Loading spinner */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 space-x-2">
                <div className="w-6 h-6 border-2 border-dashed border-red-500 rounded-full animate-spin"></div>
                <span className="text-xs font-semibold">ইমেজ লোড হচ্ছে...</span>
              </div>
            )}

            {pages.length > 0 && pages[pageIndex] && (
              <img
                src={pages[pageIndex]}
                alt={`Epaper Page ${pageIndex + 1}`}
                onLoad={() => setImageLoaded(true)}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  maxHeight: '100%',
                  maxWidth: '100%',
                }}
                className={`object-contain select-none pointer-events-none transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </div>

          {/* Premium Bottom Thumbnail Strip */}
          {pages.length > 1 && (
            <div className="w-full bg-slate-950/90 border-t border-white/10 py-2 px-4 flex justify-center overflow-x-auto gap-2">
              <div className="flex gap-3 mx-auto max-w-full overflow-x-auto py-0.5 px-2 scrollbar-thin scrollbar-thumb-slate-800">
                {pages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => changePage(idx)}
                    className={`relative h-12 md:h-16 aspect-[3/4] rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${
                      pageIndex === idx 
                        ? 'border-red-600 scale-105 shadow-lg shadow-red-600/30' 
                        : 'border-white/10 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-white text-[8px] font-bold text-center py-0.5">
                      {toBengaliNumber(idx + 1)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Floating Toolbar */}
          <div className="flex flex-col items-center justify-center py-2 md:py-4 px-4 border-t border-white/10 gap-2">
            {/* Zoom / Pan instructions */}
            <p className="text-[10px] text-slate-455 font-medium text-center hidden md:block">
              * মাউস হুইল ঘুরিয়ে অথবা নিচের বাতন চেপে জুম করুন। জুম করা অবস্থায় মাউস দিয়ে টেনে ক্যানভাস সরান। কিবোর্ডের ← এবং → বাটন দিয়ে পৃষ্ঠা পরিবর্তন করতে পারবেন।
            </p>

            <div className="flex items-center bg-slate-900 border border-white/10 px-3 md:px-4 py-2 rounded-2xl shadow-xl gap-4 md:gap-6">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 1}
                className="text-white hover:text-red-500 disabled:text-slate-600 transition flex items-center gap-1"
                title="জুম আউট"
              >
                <ZoomOut size={16} />
              </button>

              <div className="text-white text-xs font-black select-none w-16 text-center">
                {toBengaliNumber((scale * 100).toFixed(0))}% জুম
              </div>

              <button
                onClick={handleZoomIn}
                disabled={scale >= 4}
                className="text-white hover:text-red-500 disabled:text-slate-600 transition flex items-center gap-1"
                title="জুম ইন"
              >
                <ZoomIn size={16} />
              </button>

              <div className="w-px h-5 bg-white/10"></div>

              <button
                onClick={handleResetZoom}
                className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
                title="রিসেট"
              >
                <RotateCcw size={14} />
                <span>রিসেট</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
