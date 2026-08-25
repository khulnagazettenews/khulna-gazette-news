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
  Briefcase,
  Trash2,
  ShieldCheck,
  CheckCircle2
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

  // Reset form
  const handleReset = () => {
    setSenderImage('');
    setUserName('');
    setUserDesignation('');
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
    <div className="min-h-screen bg-slate-50/60 pb-16 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-semibold">
          <Link href="/" className="hover:text-red-600 transition-colors">হোম</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-extrabold">শুভেচ্ছা কার্ড জেনারেটর</span>
        </nav>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              নিজের নামে তৈরি করুন ডিজিটাল শুভেচ্ছা কার্ড
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              আপনার পছন্দের ছবি আপলোড করুন, নাম ও পদবী লিখুন এবং ১-ক্লিকে হাই-কোয়ালিটি অফিশিয়াল এইচডি কার্ড ফ্রেম ডাউনলোড করুন।
            </p>
          </div>
        </div>

        {/* Workspace Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Controls Panel (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 
                  className="text-slate-900"
                  style={{ 
                    fontFamily: 'Bangla, sans-serif', 
                    fontSize: '21px', 
                    fontWeight: 700, 
                    lineHeight: '26px', 
                    letterSpacing: '-0.2px' 
                  }}
                >
                  কার্ড কাস্টমাইজেশন
                </h2>
                <p 
                  className="text-slate-500 font-medium mt-1"
                  style={{ fontFamily: 'Bangla, sans-serif', fontSize: '15px' }}
                >
                  নিচের ফিল্ডগুলো পূরণ করুন
                </p>
              </div>

              {(senderImage || userName || userDesignation) && (
                <button
                  onClick={handleReset}
                  className="text-slate-600 hover:text-red-600 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-red-50 transition border border-slate-200 hover:border-red-200"
                  style={{ fontFamily: 'Bangla, sans-serif', fontSize: '15px' }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  রিসেট
                </button>
              )}
            </div>

            {/* Step 1: Upload Photo */}
            <div className="space-y-2.5">
              <label 
                className="text-slate-800 flex items-center gap-2.5"
                style={{ 
                  fontFamily: 'Bangla, sans-serif', 
                  fontSize: '21px', 
                  fontWeight: 600, 
                  lineHeight: '24px', 
                  letterSpacing: '-0.2px' 
                }}
              >
                <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">১</span>
                আপনার ছবি আপলোড করুন
              </label>
              
              <div className="relative group">
                <label className="cursor-pointer block w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50/50 hover:bg-red-50/20 p-6 text-center transition-all duration-200">
                  
                  {senderImage ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md aspect-square" style={{ borderRadius: '50%' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={senderImage} 
                          alt="Uploaded preview" 
                          className="w-full h-full object-cover" 
                          style={{ borderRadius: '50%', objectFit: 'cover' }}
                        />
                      </div>
                      <div 
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-800 font-bold shadow-xs border border-slate-200"
                        style={{ fontFamily: 'Bangla, sans-serif', fontSize: '15px' }}
                      >
                        <RefreshCw className="w-4 h-4 text-red-600" />
                        ছবি পরিবর্তন করুন
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-3 space-y-2.5">
                      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <span 
                          className="text-slate-900 block"
                          style={{ fontFamily: 'Bangla, sans-serif', fontSize: '18px', fontWeight: 600 }}
                        >
                          ছবি সিলেক্ট করতে ক্লিক করুন
                        </span>
                        <span 
                          className="text-slate-500 block"
                          style={{ fontFamily: 'Bangla, sans-serif', fontSize: '14px' }}
                        >
                          PNG, JPG বা JPEG ফাইল সাপোর্ট করবে
                        </span>
                      </div>
                    </div>
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
            <div className="space-y-2.5">
              <label 
                className="text-slate-800 flex items-center gap-2.5"
                style={{ 
                  fontFamily: 'Bangla, sans-serif', 
                  fontSize: '21px', 
                  fontWeight: 600, 
                  lineHeight: '24px', 
                  letterSpacing: '-0.2px' 
                }}
              >
                <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">২</span>
                আপনার নাম লিখুন
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="যেমন: মোহাম্মদ আব্দুল্লাহ"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition bg-slate-50/40 focus:bg-white placeholder:text-slate-400"
                  style={{ fontFamily: 'Bangla, sans-serif', fontSize: '17px' }}
                />
              </div>
            </div>

            {/* Step 3: Input Designation */}
            <div className="space-y-2.5">
              <label 
                className="text-slate-800 flex items-center gap-2.5"
                style={{ 
                  fontFamily: 'Bangla, sans-serif', 
                  fontSize: '21px', 
                  fontWeight: 600, 
                  lineHeight: '24px', 
                  letterSpacing: '-0.2px' 
                }}
              >
                <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">৩</span>
                আপনার পদবী লিখুন
              </label>
              <div className="relative">
                <Briefcase className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userDesignation}
                  onChange={(e) => setUserDesignation(e.target.value)}
                  placeholder="যেমন: ব্যবস্থাপনা পরিচালক / সমাজসেবক"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition bg-slate-50/40 focus:bg-white placeholder:text-slate-400"
                  style={{ fontFamily: 'Bangla, sans-serif', fontSize: '17px' }}
                />
              </div>
            </div>

            <div 
              className="pt-3 border-t border-slate-100 flex items-center gap-2 text-slate-600 font-medium"
              style={{ fontFamily: 'Bangla, sans-serif', fontSize: '15px' }}
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              আপনার সকল আপলোডকৃত ফাইল ও তথ্য গোপনীয় থাকবে।
            </div>

          </div>

          {/* Right Live Preview Panel (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-lg space-y-6">
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  লাইভ কার্ড প্রিভিউ
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  1:1 HD Standard
                </span>
              </div>

              {/* CARD CANVAS TARGET */}
              <div className="w-full flex justify-center bg-slate-100/60 p-4 sm:p-6 rounded-2xl border border-slate-200/60">
                <div 
                  ref={cardRef}
                  className="w-full max-w-[460px] aspect-square relative overflow-hidden bg-white shadow-2xl rounded-xl select-none font-sans"
                  style={{ boxSizing: 'border-box' }}
                >
                  
                  {/* Base Template Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/greeting-card-frame.jpg" 
                    alt="Khulna Gazette Greeting Card Base Template" 
                    className="w-full h-full object-cover absolute inset-0 z-0"
                  />

                  {/* Circular User Photo Container (Clean, No Black/White Border) */}
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
                        <User size={44} className="text-slate-500 mb-1 opacity-70" />
                        <span className="text-[11px] font-bold text-slate-700">ছবি আপলোড করুন</span>
                      </div>
                    )}
                  </div>

                  {/* User Name Overlay */}
                  <div className="absolute top-[76.8%] left-1/2 -translate-x-1/2 z-20 text-center w-[88%] flex items-center justify-center pointer-events-none">
                    <div 
                      className="text-black font-black text-lg sm:text-2xl tracking-tight max-w-full truncate"
                      style={{ fontFamily: 'Bangla, sans-serif' }}
                    >
                      {userName || 'নাম'}
                    </div>
                  </div>

                  {/* User Designation Overlay */}
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

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={downloadCard}
                  disabled={isDownloading}
                  className="w-full py-4 px-6 rounded-2xl bg-[#e51a24] hover:bg-red-700 text-white font-extrabold text-base shadow-lg shadow-red-600/20 flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ইমেজ তৈরি হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-white" />
                      ডাউনলোড করুন
                    </>
                  )}
                </button>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={handleShareWhatsApp}
                    className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" /> হোয়াটসঅ্যাপ
                  </button>

                  <button
                    onClick={handleShareFacebook}
                    className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <Share2 className="w-4 h-4" /> ফেসবুক
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    {copied ? 'কপি হয়েছে' : 'লিংক কপি'}
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
