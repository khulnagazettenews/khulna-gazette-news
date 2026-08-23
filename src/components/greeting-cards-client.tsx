'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Download, 
  Share2, 
  Upload, 
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

// Preset Occasion Badges
const badgeOptions = [
  { id: 'opening', label: 'শুভ উদ্বোধন', badgeText: 'শুভ উদ্বোধন' },
  { id: 'eid', label: '🌙 ঈদ মোবারক', badgeText: 'ঈদ মোবারক' },
  { id: 'boishakh', label: '☀️ পহেলা বৈশাখ', badgeText: 'শুভ নববর্ষ' },
  { id: 'birthday', label: '🎂 শুভ জন্মদিন', badgeText: 'শুভ জন্মদিন' },
  { id: 'victory', label: '🇧🇩 জাতীয় দিবস', badgeText: 'মহান বিজয় দিবস' },
  { id: 'jumma', label: '🕌 জুম্মা মোবারক', badgeText: 'জুম্মা মোবারক' },
  { id: 'congrats', label: '🏆 অভিনন্দন', badgeText: 'আন্তরিক অভিনন্দন' },
];

// Preset Subtitle Messages
const presetMessages: Record<string, string[]> = {
  opening: [
    "শুভ উদ্বোধনে শুভেচ্ছা",
    "অনলাইন অগ্রযাত্রায় আন্তরিক শুভকামনা",
    "বস্তুনিষ্ঠ সংবাদ পরিবেশনে সাফল্য কামনা করি"
  ],
  eid: [
    "ঈদুল ফিতরের অনাবিল আনন্দের শুভেচ্ছা",
    "পবিত্র ঈদুল আজহার শুভেচ্ছা ও মোবারকবাদ",
    "পবিত্র ঈদ মোবারক"
  ],
  boishakh: [
    "শুভ বাংলা নববর্ষের প্রীতি ও শুভেচ্ছা",
    "এসো হে বৈশাখ এসো এসো",
    "নতুন বছরে অনাবিল আনন্দের শুভকামনা"
  ],
  birthday: [
    "শুভ জন্মদিন! আগামীর দিনগুলো আলোকময় হোক",
    "জন্মদিনের অনেক অনেক প্রীতি ও শুভকামনা",
    "সুস্বাস্থ্য ও সাফল্যময় দীর্ঘায়ু কামনা করি"
  ],
  victory: [
    "মহান বিজয় দিবসে রক্তিম শুভেচ্ছা",
    "স্বাধীনতা দিবসের সকল শহীদদের প্রতি শ্রদ্ধাঞ্জলি",
    "লাল-সবুজের শুভেচ্ছা ও অভিনন্দন"
  ],
  jumma: [
    "পবিত্র জুম্মা মোবারকের রূহানি শুভেচ্ছা",
    "জুম্মা মোবারক! আপনার জীবনে শান্তি নেমে আসুক",
    "বরকতময় জুম্মার মোবারকবাদ"
  ],
  congrats: [
    "অসাধারণ অর্জনে জানাই আন্তরিক অভিনন্দন",
    "সাফল্যের অগ্রযাত্রা অব্যাহত থাকুক",
    "নতুন উচ্চতায় আপনাকে লাল গোলাপের শুভেচ্ছা"
  ]
};

// Card Themes
const cardThemes = [
  {
    id: 'kg-signature',
    name: 'খুলনা গেজেট সিগনেচার (Image 2)',
    waveGradient: 'from-[#0a1128] via-[#1c1d54] to-[#360847]',
    textColor: 'text-white',
    titleGradient: 'from-white via-slate-100 to-slate-200',
    subtitleColor: '#facc15', // Gold / Yellow font
    nameColor: '#ffffff',
    borderColor: 'border-blue-500/30',
    topBadgeBg: 'from-red-700 to-rose-900 text-white border-white',
  },
  {
    id: 'royal-emerald',
    name: 'রাজকীয় ঈদ ও জুম্মা',
    waveGradient: 'from-[#042f2e] via-[#064e3b] to-[#022c22]',
    textColor: 'text-emerald-50',
    titleGradient: 'from-amber-200 via-yellow-300 to-amber-400',
    subtitleColor: '#fef08a',
    nameColor: '#ffffff',
    borderColor: 'border-emerald-500/30',
    topBadgeBg: 'from-amber-600 to-yellow-800 text-amber-100 border-amber-300',
  },
  {
    id: 'crimson-victory',
    name: 'রক্তিম স্বাধীনতা ও বিজয়',
    waveGradient: 'from-[#450a0a] via-[#881337] to-[#1e1b4b]',
    textColor: 'text-rose-50',
    titleGradient: 'from-amber-200 via-yellow-200 to-amber-300',
    subtitleColor: '#fef08a',
    nameColor: '#ffffff',
    borderColor: 'border-red-500/30',
    topBadgeBg: 'from-emerald-700 to-teal-900 text-white border-emerald-300',
  },
  {
    id: 'boishakhi-amber',
    name: 'বৈশাখী বৈচিত্র্য',
    waveGradient: 'from-[#7c2d12] via-[#9a3412] to-[#450a0a]',
    textColor: 'text-amber-50',
    titleGradient: 'from-yellow-200 via-amber-200 to-yellow-400',
    subtitleColor: '#fef08a',
    nameColor: '#ffffff',
    borderColor: 'border-orange-500/30',
    topBadgeBg: 'from-red-600 to-amber-800 text-white border-yellow-300',
  }
];

export default function GreetingCardsClient() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // States
  const [selectedBadge, setSelectedBadge] = useState(badgeOptions[0]);
  const [selectedTheme, setSelectedTheme] = useState(cardThemes[0]);
  
  // Custom texts matching Image 2 defaults
  const [mainTitle, setMainTitle] = useState('এশিয়া পোস্ট'); // default or user customizable
  const [subHeading, setSubHeading] = useState('শুভ উদ্বোধনে শুভেচ্ছা');
  const [userName, setUserName] = useState('Khulna Gazette');
  
  // User Photo State (Default demo image loaded initially so preview matches Image 2 right away)
  const [senderImage, setSenderImage] = useState<string>('/uploads/greeting_demo.jpg');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle Badge/Occasion Change
  const handleBadgeChange = (badge: typeof badgeOptions[0]) => {
    setSelectedBadge(badge);
    const msgs = presetMessages[badge.id] || presetMessages.opening;
    setSubHeading(msgs[0]);
  };

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
      `খুলনা গেজেট ডিজিটাল শুভেচ্ছা কার্ড:\n"${subHeading}"\n- ${userName}\n\nনিজের শুভেচ্ছা কার্ড বানিয়ে শেয়ার করুন: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="relative py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 min-h-screen overflow-hidden">
      
      {/* Decorative Floating Confetti Pieces (Matching Image 1 background) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-70">
        <div className="absolute top-10 left-[5%] w-3 h-3 bg-red-500 rotate-12 rounded-sm animate-pulse" />
        <div className="absolute top-20 right-[10%] w-4 h-2 bg-blue-500 -rotate-45" />
        <div className="absolute top-40 left-[15%] w-2 h-4 bg-amber-400 rotate-45" />
        <div className="absolute top-1/4 right-[20%] w-3 h-3 bg-teal-400 rounded-full" />
        <div className="absolute top-1/3 left-[8%] w-4 h-2 bg-purple-500 rotate-12" />
        <div className="absolute top-1/2 right-[5%] w-3 h-4 bg-emerald-500 -rotate-12" />
        <div className="absolute bottom-40 left-[12%] w-4 h-3 bg-rose-500 rotate-45" />
        <div className="absolute bottom-20 right-[15%] w-3 h-3 bg-yellow-400 rounded-sm" />
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
        <Link href="/" className="hover:text-red-600 transition-colors">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">ডিজিটাল শুভেচ্ছা কার্ড ও প্রোফাইল ফ্রেম মেকার</span>
      </nav>

      {/* Top Banner Notice (Matching Image 1 top red box) */}
      <div className="bg-[#921c1c] text-white p-6 sm:p-7 rounded-2xl shadow-xl text-center space-y-2 border border-red-900/40">
        <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-rose-100 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          খুলনা গেজেট অফিশিয়াল বিশেষ সংযোজন
        </h2>
        <p className="text-sm sm:text-lg font-medium leading-relaxed max-w-5xl mx-auto opacity-95 text-balance">
          খুলনা গেজেট বাংলাদেশের একটি নির্ভরযোগ্য বাংলা অনলাইন নিউজ পোর্টাল, যা সমসাময়িক বিষয়াবলী, জাতীয় ও আঞ্চলিক সংবাদ, বিশেষ প্রতিবেদন এবং আলোচিত ঘটনাবলির বস্তুনিষ্ঠ, সময়োপযোগী ও গভীর বিশ্লেষণধর্মী সংবাদ পরিবেশন করে।
        </p>
      </div>

      {/* Main Container Card (Matching Image 1 Generator Box Layout) */}
      <div className="bg-gradient-to-b from-[#fbf4f4] via-[#f8ebeb] to-[#f4e4e4] rounded-3xl p-6 sm:p-8 border border-red-200/80 shadow-xl space-y-8">
        
        {/* Generator Header Title */}
        <div className="text-center border-b border-red-200/60 pb-5">
          <h1 className="text-xl sm:text-3xl font-extrabold text-[#921c1c] tracking-tight">
            পছন্দের ফ্রেমে পরিবর্তন করুন আপনার ফেসবুক প্রোফাইল ছবি
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">
            আপনার ছবি, পছন্দসই ফ্রেম ও কাস্টম নাম দিয়ে ১ ক্লিকে HD শুভেচ্ছা কার্ড ডাউনলোড বা শেয়ার করুন
          </p>
        </div>

        {/* Form Inputs & Live Preview Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1: Upload Photo Box (Matching Image 1 red upload box) */}
            <div className="space-y-2">
              <label className="block text-sm font-extrabold text-slate-900">
                ১. আপনার ছবি দিন
              </label>
              
              <div className="relative group">
                <label className="cursor-pointer block w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-[#b81d24] via-[#921c1c] to-[#6e0a0f] text-white flex flex-col items-center justify-center p-6 text-center shadow-lg hover:shadow-xl transition duration-300 border-2 border-red-400/40 relative overflow-hidden">
                  
                  {senderImage ? (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={senderImage} 
                        alt="Uploaded preview" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md mb-2" 
                      />
                      <div className="absolute bottom-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                        ছবি পরিবর্তন করতে ক্লিক করুন
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition">
                        <Camera className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-base font-extrabold tracking-wide drop-shadow">
                        আপনার ছবি দিন
                      </span>
                      <span className="text-xs text-rose-200 mt-1">
                        (কম্পিউটার বা মোবাইল থেকে সিলেক্ট করুন)
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

            {/* Step 2: Name Input Field */}
            <div className="space-y-2">
              <label className="block text-sm font-extrabold text-slate-900">
                ২. আপনার নাম লিখুন <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="w-full px-4 py-3 rounded-xl border-2 border-red-500/70 text-slate-900 font-bold text-base focus:ring-4 focus:ring-red-200 outline-none transition bg-white shadow-sm placeholder:text-slate-400"
              />
            </div>

            {/* Step 3: Choose Badge / Occasion */}
            <div className="space-y-2">
              <label className="block text-sm font-extrabold text-slate-900">
                ৩. উপলক্ষ বা ব্যাজ নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {badgeOptions.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => handleBadgeChange(badge)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all text-left flex items-center gap-1.5 border-2 ${
                      selectedBadge.id === badge.id
                        ? 'bg-red-700 text-white border-red-700 shadow-md scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:border-red-300'
                    }`}
                  >
                    <span className="truncate">{badge.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Custom Heading & Sub-heading */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  কার্ডের প্রধান শিরোনাম (Main Title)
                </label>
                <input
                  type="text"
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  placeholder="যেমন: এশিয়া পোস্ট / খুলনা গেজেট"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:ring-2 focus:ring-red-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  শুভেচ্ছা বার্তা (Sub Heading)
                </label>
                <input
                  type="text"
                  value={subHeading}
                  onChange={(e) => setSubHeading(e.target.value)}
                  placeholder="যেমন: শুভ উদ্বোধনে শুভেচ্ছা"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:ring-2 focus:ring-red-500 outline-none transition"
                />
              </div>
            </div>

            {/* Step 5: Choose Color Theme */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-extrabold text-slate-900">
                ৫. ফ্রেমে থিম কালার নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 gap-2">
                {cardThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-3 rounded-xl text-xs font-extrabold border-2 transition-all text-left flex items-center justify-between ${
                      selectedTheme.id === theme.id
                        ? 'border-red-600 bg-white shadow-md text-red-900 ring-2 ring-red-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{theme.name}</span>
                    <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.waveGradient} border border-slate-300 shrink-0 ml-1`} />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Live Frame Preview & Download (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
            
            {/* PREVIEW CONTAINER */}
            <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-slate-900 space-y-5">
              
              <div className="flex items-center justify-between text-slate-300 text-xs font-bold px-1">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  লাইভ খুলনা গেজেট ডিজিটাল ফ্রেম
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px]">
                  www.khulnagazette.com
                </span>
              </div>

              {/* CARD CANVAS TARGET (EXPORTABLE HTML CONTAINER - Image 2 Exact Replica!) */}
              <div className="w-full flex justify-center overflow-hidden">
                <div 
                  ref={cardRef}
                  className="w-full max-w-[500px] aspect-square relative overflow-hidden bg-slate-900 shadow-2xl rounded-2xl select-none"
                  style={{
                    boxSizing: 'border-box'
                  }}
                >
                  
                  {/* Photo Layer (Top/Middle background image) */}
                  <div className="absolute inset-0 w-full h-[72%] overflow-hidden bg-slate-800">
                    {senderImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={senderImage} 
                        alt="User Photo" 
                        className="w-full h-full object-cover object-top"
                        style={{ borderRadius: '0px' }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-6 text-center">
                        <User className="w-20 h-20 mb-2 opacity-50" />
                        <p className="text-sm font-bold">আপনার ছবি আপলোড করুন</p>
                      </div>
                    )}
                  </div>

                  {/* Top-Left Badge (Image 2 Top-Left Circle Badge) */}
                  <div className="absolute top-4 left-4 z-20">
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-red-600 via-rose-700 to-red-900 p-[3px] shadow-2xl flex items-center justify-center text-center"
                      style={{ borderRadius: '9999px' }}
                    >
                      <div 
                        className="w-full h-full rounded-full border-2 border-white/90 flex flex-col items-center justify-center p-1 bg-gradient-to-br from-red-700 to-rose-900 text-white shadow-inner"
                        style={{ borderRadius: '9999px' }}
                      >
                        <span className="text-[10px] sm:text-xs font-black tracking-tight leading-tight drop-shadow-md">
                          {selectedBadge.badgeText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top-Right Badge: Khulna Gazette Official Logo (Image 2 Top-Right Circle Logo) */}
                  <div className="absolute top-4 right-4 z-20">
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-[3px] shadow-2xl flex items-center justify-center border-2 border-slate-900"
                      style={{ borderRadius: '9999px' }}
                    >
                      <div 
                        className="w-full h-full rounded-full border border-slate-300 flex items-center justify-center p-1.5 bg-white overflow-hidden relative"
                        style={{ borderRadius: '9999px' }}
                      >
                        {/* Khulna Gazette Logo Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src="/logo.png" 
                          alt="Khulna Gazette Logo" 
                          className="w-full h-full object-contain"
                          style={{ borderRadius: '0px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Curved Wave Container (Image 2 Wave Curve & Typography) */}
                  <div className="absolute bottom-0 inset-x-0 w-full h-[58%] z-10 flex flex-col justify-end pointer-events-none">
                    
                    {/* SVG Wave Arc Shape Background */}
                    <div className="absolute inset-0 w-full h-full">
                      <svg 
                        viewBox="0 0 500 300" 
                        preserveAspectRatio="none" 
                        className="w-full h-full drop-shadow-2xl"
                      >
                        <defs>
                          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0f172a" />
                            <stop offset="50%" stopColor="#1e1b4b" />
                            <stop offset="100%" stopColor="#31103f" />
                          </linearGradient>
                          <pattern id="gridDots" width="16" height="16" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="#ffffff" fillOpacity="0.08" />
                          </pattern>
                        </defs>
                        
                        {/* Smooth Curved Wave Path matching Image 2 Arc */}
                        <path 
                          d="M 0,110 C 120,10 380,10 500,110 L 500,300 L 0,300 Z" 
                          fill="url(#waveGradient)" 
                        />
                        <path 
                          d="M 0,110 C 120,10 380,10 500,110 L 500,300 L 0,300 Z" 
                          fill="url(#gridDots)" 
                        />
                        {/* Subtle Top White Arc Border */}
                        <path 
                          d="M 0,110 C 120,10 380,10 500,110" 
                          fill="none" 
                          stroke="#ffffff" 
                          strokeOpacity="0.25" 
                          strokeWidth="3" 
                        />
                      </svg>
                    </div>

                    {/* Content inside the wave arc (Matching Image 2 exact text structure & font styles) */}
                    <div className="relative z-20 pb-5 pt-8 px-6 text-center flex flex-col items-center justify-end space-y-1.5 pointer-events-auto">
                      
                      {/* Main Title: "এশিয়া পোস্ট" / "খুলনা গেজেট" styled with bold Bengali calligraphy */}
                      <h2 
                        className="text-3xl sm:text-5xl font-black text-white tracking-wide drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] leading-tight"
                        style={{
                          textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(30,27,75,0.8)'
                        }}
                      >
                        {mainTitle || 'খুলনা গেজেট'}
                      </h2>

                      {/* Sub Heading: "শুভ উদ্বোধনে শুভেচ্ছা" in Yellow / Gold Font */}
                      <p 
                        className="text-lg sm:text-2xl font-extrabold tracking-tight drop-shadow-md"
                        style={{ color: selectedTheme.subtitleColor }}
                      >
                        {subHeading || 'শুভ উদ্বোধনে শুভেচ্ছা'}
                      </p>

                      {/* User Name: "Khulna Gazette" or user input name */}
                      <h3 
                        className="text-base sm:text-xl font-bold tracking-wide pt-1 drop-shadow"
                        style={{ color: selectedTheme.nameColor }}
                      >
                        {userName || 'Khulna Gazette'}
                      </h3>

                      {/* Bottom Footer Branding: Logo & Domain */}
                      <div className="pt-2 flex items-center justify-center gap-2 opacity-95">
                        <div className="flex items-center gap-1.5 bg-red-700/80 px-2.5 py-0.5 rounded-full border border-red-500/50 shadow-sm">
                          <span className="text-[11px] sm:text-xs font-black text-white tracking-widest uppercase">
                            Khulna Gazette
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-xs font-mono font-medium text-slate-300">
                          www.khulnagazette.com
                        </span>
                      </div>

                    </div>

                  </div>

                </div>
              </div>

              {/* Action Buttons Below Canvas Preview */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={downloadCard}
                  disabled={isDownloading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base shadow-xl shadow-red-950/50 flex items-center justify-center gap-3 transition active:scale-[0.99] disabled:opacity-50 border border-amber-300/30"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      HD ইমেজ তৈরি হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-amber-300" />
                      HD ফ্রেম ইমেজ ডাউনলোড করুন (Download HD)
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

            {/* Help / Guide Box */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-900 text-xs space-y-1.5 shadow-sm">
              <h5 className="font-extrabold flex items-center gap-1.5 text-amber-950 text-sm">
                <Award className="w-4 h-4 text-amber-700" /> খুলনা গেজেট ফ্রেম নির্দেশনা:
              </h5>
              <p className="leading-relaxed text-amber-900 font-medium">
                ১. "আপনার ছবি দিন" বাটনে ক্লিক করে নিজের পছন্দমতো ছবি আপলোড করুন।<br />
                ২. "আপনার নাম লিখুন" ঘরে নিজের নাম বা প্রতিষ্ঠানের নাম লিখুন।<br />
                ৩. "HD ফ্রেম ইমেজ ডাউনলোড করুন" বাটনে ক্লিক করে কার্ড সেভ করুন এবং আপনার ফেসবুকে শেয়ার বা প্রোফাইল ছবি হিসেবে ব্যবহার করুন।
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
