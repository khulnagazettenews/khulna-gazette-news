'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Share2, 
  Sparkles, 
  User, 
  Check, 
  ChevronRight, 
  MessageSquare, 
  Copy,
  Camera,
  RefreshCw,
  Award
} from 'lucide-react';

export default function GreetingCardsClient() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // States for user inputs
  const [userName, setUserName] = useState('');
  const [userDesignation, setUserDesignation] = useState('');
  
  // User Photo State
  const [senderImage, setSenderImage] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle Photo Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSenderImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download Card as PNG Image
  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3, // Crisp 3x high density export
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `KhulnaGazette-GreetingCard-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      alert('ইমেজ ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে একটি স্ক্রিনশট নিন অথবা পুনরায় চেষ্টা করুন।');
    } finally {
      setIsDownloading(false);
    }
  };

  // Share Actions
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `খুলনা গেজেট অফিশিয়াল শুভেচ্ছা কার্ড:\nশুভেচ্ছা ও অভিনন্দন\n- ${userName || 'খুলনা গেজেট'}\n\nনিজের শুভেচ্ছা কার্ড বানিয়ে শেয়ার করুন: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="relative py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
        <Link href="/" className="hover:text-red-600 transition-colors">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">ডিজিটাল শুভেচ্ছা কার্ড জেনারেটর</span>
      </nav>

      {/* Top Banner Notice */}
      <div className="bg-[#e51a24] text-white p-5 sm:p-6 rounded-2xl shadow-lg text-center space-y-1.5 border border-red-700">
        <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-rose-100 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          খুলনা গেজেট অফিশিয়াল বিশেষ শুভেচ্ছা কার্ড
        </h2>
        <p className="text-xs sm:text-sm font-medium leading-relaxed max-w-4xl mx-auto opacity-95">
          আপনার ছবি, নাম ও পদবী দিয়ে ১-ক্লিকে তৈরি করুন 'খুলনা গেজেট'-এর আকর্ষণীয় অফিশিয়াল শুভেচ্ছা কার্ড
        </p>
      </div>

      {/* Main Generator Layout */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-8">
        
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
            শুভেচ্ছা কার্ড ফ্রেম মেকার
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-semibold mt-1">
            নিচের ফর্মে আপনার ছবি, নাম ও পদবী ফিল্ড টাইপ করুন এবং ১-ক্লিকে HD কার্ড ফ্রেম ডাউনলোড করুন
          </p>
        </div>

        {/* Form Inputs & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1: Upload Photo */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-gray-900">
                ১. আপনার ছবি আপলোড করুন <span className="text-red-600">*</span>
              </label>
              
              <div className="relative group">
                <label className="cursor-pointer block w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-[#e51a24] via-[#c6121b] to-[#990a11] text-white flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition duration-300 border-2 border-red-400/40 relative overflow-hidden">
                  
                  {senderImage ? (
                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-xl aspect-square shrink-0 mb-1" style={{ borderRadius: '9999px' }}>
                        <img 
                          src={senderImage} 
                          alt="Uploaded preview" 
                          className="w-full h-full object-cover" 
                          style={{ borderRadius: '9999px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-xs">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                        ছবি পরিবর্তন করতে ক্লিক করুন
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition" style={{ borderRadius: '9999px' }}>
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-base font-extrabold tracking-wide drop-shadow">
                        আপনার ছবি নির্বাচন করুন
                      </span>
                      <span className="text-xs text-rose-100 mt-1">
                        (মোবাইল বা কম্পিউটার থেকে সিলেক্ট করুন)
                      </span>
                    </>
                  )}

                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

            {/* Step 2: Input Name */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-gray-900">
                ২. আপনার নাম লিখুন <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="যেমন: মোহাম্মদ আব্দুল্লাহ"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-900 font-bold text-base focus:border-[#e51a24] focus:ring-4 focus:ring-red-100 outline-none transition bg-white shadow-sm placeholder:text-gray-400"
              />
            </div>

            {/* Step 3: Input Designation */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-gray-900">
                ৩. আপনার পদবী লিখুন <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={userDesignation}
                onChange={(e) => setUserDesignation(e.target.value)}
                placeholder="যেমন: ব্যবস্থাপনা পরিচালক / সমাজসেবক"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-900 font-bold text-base focus:border-[#e51a24] focus:ring-4 focus:ring-red-100 outline-none transition bg-white shadow-sm placeholder:text-gray-400"
              />
            </div>

          </div>

          {/* Right Column: Live Card Preview & Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-slate-950 space-y-5">
              
              <div className="flex items-center justify-between text-slate-300 text-xs font-bold px-1">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  লাইভ খুলনা গেজেট অফিশিয়াল কার্ড প্রিভিউ
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                  1:1 HD Template
                </span>
              </div>

              {/* CARD CANVAS TARGET (Overlaying photo, name & designation on official template image) */}
              <div className="w-full flex justify-center overflow-hidden">
                <div 
                  ref={cardRef}
                  className="w-full max-w-[500px] aspect-square relative overflow-hidden bg-white shadow-2xl rounded-lg select-none font-sans"
                  style={{ boxSizing: 'border-box' }}
                >
                  
                  {/* Base Template Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/greeting-card-frame.jpg" 
                    alt="Khulna Gazette Greeting Card Base Template" 
                    className="w-full h-full object-cover absolute inset-0 z-0"
                  />

                  {/* Circular User Photo Container Overlaid on Circle Frame (Clean, No Black/White Border) */}
                  <div 
                    className="absolute top-[35.5%] left-1/2 -translate-x-1/2 w-[40.5%] aspect-square rounded-full overflow-hidden z-10 flex items-center justify-center" 
                    style={{ 
                      borderRadius: '50%', 
                      clipPath: 'circle(50% at 50% 50%)',
                      WebkitClipPath: 'circle(50% at 50% 50%)',
                      aspectRatio: '1 / 1' 
                    }}
                  >
                    {senderImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={senderImage} 
                        alt="User Photo" 
                        className="w-full h-full object-cover rounded-full"
                        style={{ 
                          borderRadius: '50%', 
                          clipPath: 'circle(50% at 50% 50%)',
                          WebkitClipPath: 'circle(50% at 50% 50%)',
                          objectFit: 'cover', 
                          width: '100%', 
                          height: '100%' 
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-white/40 backdrop-blur-xs flex flex-col items-center justify-center text-slate-600 p-2 text-center" style={{ borderRadius: '50%' }}>
                        <User size={48} className="text-slate-500 mb-1 opacity-70" />
                        <span className="text-[11px] sm:text-xs font-bold text-slate-700">ছবি আপলোড করুন</span>
                      </div>
                    )}
                  </div>

                  {/* User Name Overlay (Displays 'নাম' by default or user typed name) */}
                  <div className="absolute top-[76.8%] left-1/2 -translate-x-1/2 z-20 text-center w-[88%] flex items-center justify-center pointer-events-none">
                    <div 
                      className="text-black font-black text-lg sm:text-2xl tracking-tight max-w-full truncate"
                      style={{ fontFamily: 'Bangla, sans-serif' }}
                    >
                      {userName || 'নাম'}
                    </div>
                  </div>

                  {/* User Designation Overlay (Displays 'পদবী' by default or user typed designation) */}
                  <div className="absolute top-[83.2%] left-1/2 -translate-x-1/2 z-20 text-center w-[88%] flex items-center justify-center pointer-events-none">
                    <div 
                      className="text-black font-bold text-xs sm:text-base tracking-tight max-w-full truncate opacity-90"
                      style={{ fontFamily: 'Bangla, sans-serif' }}
                    >
                      {userDesignation || 'পদবী'}
                    </div>
                  </div>

                </div>
              </div>

              {/* Download & Share Actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={downloadCard}
                  disabled={isDownloading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base shadow-xl flex items-center justify-center gap-3 transition active:scale-[0.99] disabled:opacity-50 border border-amber-300/30"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      HD ইমেজ প্রসেসিং হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-amber-300" />
                      HD ফ্রেম ডাউনলোড করুন (Download HD Image)
                    </>
                  )}
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <MessageSquare className="w-4 h-4" /> হোয়াটসঅ্যাপ
                  </button>

                  <button
                    onClick={handleShareFacebook}
                    className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Share2 className="w-4 h-4" /> ফেসবুক
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition shadow"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'কপি হয়েছে' : 'লিংক কপি'}
                  </button>
                </div>
              </div>

            </div>

            {/* Instruction Box */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-emerald-950 text-xs space-y-1.5 shadow-sm">
              <h5 className="font-black flex items-center gap-1.5 text-emerald-900 text-sm">
                <Award className="w-4 h-4 text-emerald-700" /> ব্যবহারের নিয়মাবলী:
              </h5>
              <p className="leading-relaxed text-emerald-900 font-medium">
                ১. "আপনার ছবি আপলোড করুন" সেকশনে ক্লিক করে ছবি যুক্ত করুন।<br />
                ২. "আপনার নাম" ও "আপনার পদবী" ফর্মে টাইপ করুন।<br />
                ৩. "HD ফ্রেম ডাউনলোড করুন" বাটনে ক্লিক করে হাই কোয়ালিটি ইমেজ ডাউনলোড করে আপনার ওয়ালে শেয়ার করুন।
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
