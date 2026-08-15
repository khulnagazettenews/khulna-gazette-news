'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Share2, 
  Upload, 
  Sparkles, 
  User, 
  Heart, 
  RotateCcw, 
  Check, 
  Image as ImageIcon,
  ChevronRight,
  Palette,
  MessageSquare,
  Award,
  Copy
} from 'lucide-react';

// Preset categories & messages
const categories = [
  { id: 'eid', label: '🌙 ঈদ মোবারক', icon: '🌙' },
  { id: 'noboborsho', label: '☀️ পহেলা বৈশাখ', icon: '☀️' },
  { id: 'birthday', label: '🎂 শুভ জন্মদিন', icon: '🎂' },
  { id: 'congrats', label: '🏆 অভিনন্দন', icon: '🏆' },
  { id: 'victory', label: '🇧🇩 জাতীয় দিবস', icon: '🇧🇩' },
  { id: 'jumma', label: '🕌 জুম্মা মোবারক', icon: '🕌' },
  { id: 'general', label: '🌸 সাধারণ শুভেচ্ছা', icon: '🌸' }
];

const presetMessages: Record<string, string[]> = {
  eid: [
    "ঈদ মানেই আনন্দ, ঈদ মানেই খুশি। পবিত্র ঈদুল ফিতরের অনাবিল আনন্দ ছেয়ে যাক সবার প্রাণে। আপনাকে ও আপনার পুরো পরিবারকে ঈদের শুভেচ্ছা। ঈদ মোবারক!",
    "পবিত্র ঈদের আনন্দে ভরে উঠুক আপনার জীবন। সুখ, শান্তি আর সুস্বাস্থ্য কামনায়— ঈদ মোবারক!",
    "ত্যাগের মহিমায় উদ্ভাসিত হোক পবিত্র ঈদ। আপনার ও প্রিয়জনদের জন্য রইল ঈদ উল আজহার আন্তরিক শুভেচ্ছা ও মোবারকবাদ।"
  ],
  noboborsho: [
    "এসো হে বৈশাখ এসো এসো! নতুন বছর বয়ে আনুক অনাবিল শান্তি, অগ্রগতি ও নতুন আশা। আপনাকে জানাই শুভ নববর্ষের প্রীতি ও শুভেচ্ছা!",
    "মুছে যাক সব গ্লানি, ঘুচে যাক জরা। নতুন দিনের নতুন আলোয় আলোকিত হোক আপনার জীবন। শুভ পহেলা বৈশাখ!",
    "নতুন দিনের নতুন আলো, জীবন আপনার হোক আরো ভালো। শুভ বাংলা নববর্ষ ১৪৩১!"
  ],
  birthday: [
    "শুভ জন্মদিন! আপনার জীবনের প্রতিটি শুভ মুহূর্ত আলোকময় হোক, সাফল্য ও সুস্বাস্থ্য সর্বদা আপনার সঙ্গী হোক।",
    "জন্মদিনের অনেক অনেক প্রীতি ও শুভকামনা! আগামীর দিনগুলো আপনার হাসিখুশি ও সাফল্যে ভরে উঠুক।",
    "আজকের এই বিশেষ দিনে আপনার জন্য রইল একরাশ লাল গোলাপের শুভেচ্ছা। শুভ জন্মদিন!"
  ],
  congrats: [
    "আপনার অসাধারণ এই অর্জনে জানাই আন্তরিক অভিনন্দন ও শুভকামনা! আপনার অগ্রযাত্রা অব্যাহত থাকুক।",
    "কঠিন পরিশ্রম আর একাগ্রতার দুর্দান্ত সাফল্য! নতুন উচ্চতায় আপনাকে জানাই লাল গোলাপের শুভেচ্ছা।",
    "সাফল্যের এই ধারাবাহিকতা বজায় থাকুক। আপনার ভবিষ্যৎ দিনগুলোর জন্য অশেষ শুভকামনা!"
  ],
  victory: [
    "মহান স্বাধীনতা ও জাতীয় দিবসে সকল বীর শহীদদের প্রতি জানাই গভীর শ্রদ্ধাঞ্জলি ও দেশবাসীকে লাল-সবুজের শুভেচ্ছা।",
    "১৬ই ডিসেম্বর— আমাদের অহংকার, আমাদের বিজয় দিবস। দেশের সর্বস্তরের মানুষকে জানাই বিজয়ের রক্তিম শুভেচ্ছা!",
    "রক্তে অর্জিত স্বাধীন পতাকাতলে সবাইকে জানাই মহান বিজয় দিবসের রক্িতম শুভেচ্ছা।"
  ],
  jumma: [
    "জুম্মা মোবারক! মহান আল্লাহ তাআলা আজকের পবিত্র দিনে আপনার জীবনের সমস্ত নেক দোয়া ও ইবাদত কবুল করুন। আমীন।",
    "পবিত্র জুম্মার বরকতময় সময়ে আপনার ও আপনার পরিবারের সুস্বাস্থ্য ও হেদায়েত কামনা করি। জুম্মা মোবারক!",
    "শান্তিময় হোক আপনার প্রতিটা দিন। জুম্মা মোবারকের রূহানি শুভেচ্ছা।"
  ],
  general: [
    "আপনার ও আপনার প্রিয়জনদের জন্য শুভকামনা। জীবন ভরে উঠুক অনাবিল আনন্দে ও প্রশান্তিতে।",
    "একটি নতুন দিন, নতুন সম্ভাবনা। আজকের দিনটি আপনার জন্য সফল ও আনন্দদায়ক হোক!",
    "আন্তরিক শ্রদ্ধা ও অফুরন্ত ভালোবাসার শুভেচ্ছা গ্রহণ করুন।"
  ]
};

// Card design themes
const cardThemes = [
  {
    id: 'emerald-gold',
    name: 'রাজকীয় জুম্মা/ঈদ',
    bg: 'bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950',
    accentColor: 'text-amber-300',
    badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    border: 'border-amber-400/30',
    headerGlow: 'bg-amber-400/10',
    pattern: 'radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.15), transparent 70%)',
    textColor: 'text-emerald-50',
    titleColor: 'text-amber-300',
    footerBg: 'bg-emerald-950/70 border-amber-500/20'
  },
  {
    id: 'crimson-victory',
    name: 'রক্তিম স্বাধীনতা/বিজয়',
    bg: 'bg-gradient-to-br from-red-950 via-rose-900 to-slate-950',
    accentColor: 'text-amber-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    border: 'border-rose-500/30',
    headerGlow: 'bg-red-500/10',
    pattern: 'radial-gradient(circle at 80% 20%, rgba(225, 29, 72, 0.2), transparent 70%)',
    textColor: 'text-rose-50',
    titleColor: 'text-amber-300',
    footerBg: 'bg-red-950/70 border-rose-500/20'
  },
  {
    id: 'royal-midnight',
    name: 'রয়্যাল নাইট প্রিমিয়াম',
    bg: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950',
    accentColor: 'text-yellow-300',
    badgeBg: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
    border: 'border-indigo-400/30',
    headerGlow: 'bg-yellow-400/10',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.2), transparent 70%)',
    textColor: 'text-indigo-50',
    titleColor: 'text-yellow-300',
    footerBg: 'bg-slate-950/80 border-indigo-500/20'
  },
  {
    id: 'boishakhi-festive',
    name: 'বৈশাখী বৈচিত্র্য',
    bg: 'bg-gradient-to-br from-amber-700 via-orange-800 to-red-950',
    accentColor: 'text-yellow-200',
    badgeBg: 'bg-yellow-300/20 text-yellow-200 border-yellow-300/40',
    border: 'border-yellow-400/30',
    headerGlow: 'bg-orange-400/10',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2), transparent 70%)',
    textColor: 'text-amber-50',
    titleColor: 'text-yellow-200',
    footerBg: 'bg-amber-950/70 border-amber-500/20'
  },
  {
    id: 'purple-bloom',
    name: 'বসন্ত ও জন্মদিন',
    bg: 'bg-gradient-to-br from-purple-950 via-fuchsia-950 to-slate-950',
    accentColor: 'text-pink-300',
    badgeBg: 'bg-pink-400/20 text-pink-300 border-pink-400/40',
    border: 'border-pink-400/30',
    headerGlow: 'bg-pink-400/10',
    pattern: 'radial-gradient(circle at 70% 30%, rgba(217, 70, 239, 0.2), transparent 70%)',
    textColor: 'text-purple-50',
    titleColor: 'text-pink-300',
    footerBg: 'bg-purple-950/70 border-pink-500/20'
  }
];

export default function GreetingCardsClient() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // State
  const [selectedCat, setSelectedCat] = useState('eid');
  const [selectedTheme, setSelectedTheme] = useState(cardThemes[0]);
  const [recipientName, setRecipientName] = useState('প্রিয় সুহৃদ');
  const [senderName, setSenderName] = useState('আপনার নাম');
  const [designation, setDesignation] = useState('খুলনা গেজেট সুহৃদ');
  const [customMessage, setCustomMessage] = useState(presetMessages.eid[0]);
  const [senderImage, setSenderImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle Category Change
  const handleCatChange = (catId: string) => {
    setSelectedCat(catId);
    const msgs = presetMessages[catId] || presetMessages.general;
    setCustomMessage(msgs[0]);
  };

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSenderImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Download Card as PNG Image
  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      // Dynamic import of html-to-image
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `KhulnaGazette-GreetingCard-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      alert('ইমেজ ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে স্ন্যাপশট নিন অথবা আবার চেষ্টা করুন।');
    } finally {
      setIsDownloading(false);
    }
  };

  // Share Card Link
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `"${recipientName}"-কে পাঠানো শুভেচ্ছা কার্ড:\n${customMessage}\n- শুভেচ্ছান্তে: ${senderName}\n\nখুলনা গেজেট ডিজিটাল শুভেচ্ছা কার্ড: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const activeCategoryObj = categories.find(c => c.id === selectedCat) || categories[0];

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <Link href="/" className="hover:text-red-600 transition-colors">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">ডিজিটাল শুভেচ্ছা কার্ড মেকার</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> খুলনা গেজেট বিশেষ সংযোজন
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            ডিজিটাল শুভেচ্ছা কার্ড তৈরি করুন
          </h1>
          <p className="text-sm sm:text-base text-rose-100 font-medium leading-relaxed">
            পবিত্র ঈদ, নববর্ষ, জন্মদিন বা যেকোনো বিশেষ দিনে নিজের ছবি ও কাস্টম বার্তাসহ চমৎকার HD শুভেচ্ছা কার্ড বানিয়ে সোশ্যাল মিডিয়ায় শেয়ার করুন।
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Generator Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Customization Controls (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
            
            {/* Step 1: Choose Occasion Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">১</span>
                শুভেচ্ছার ধরন বা উপলক্ষ নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCatChange(cat.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-1.5 border ${
                      selectedCat === cat.id
                        ? 'bg-red-600 text-white border-red-600 shadow-md scale-[1.02]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label.replace(/^.+?\s/, '')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Choose Theme */}
            <div>
              <label className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">২</span>
                কার্ড থিম ও কালার ব্যাকগ্রাউন্ড
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cardThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex flex-col justify-between h-16 ${
                      selectedTheme.id === theme.id
                        ? 'ring-2 ring-red-600 border-transparent shadow-md scale-[1.02]'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${theme.bg}`}
                  >
                    <span className="text-white text-[11px] font-bold truncate drop-shadow">{theme.name}</span>
                    <span className={`w-3.5 h-3.5 rounded-full border border-white/50 ${theme.badgeBg}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Text Inputs */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">৩</span>
                তথ্য ও বার্তা লিখুন
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">যার উদ্দেশ্যে (Recipient Name)</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="যেমন: প্রিয় সুহৃদ / প্রিয় বন্ধু"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">আপনার নাম (Sender Name)</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="যেমন: মো: রফিকুল ইসলাম"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পদবি / পরিচয় (Tagline)</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="যেমন: সমাজসেবক, খুলনা"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার ছবি যুক্ত করুন (ঐচ্ছিক)</label>
                <div className="flex items-center gap-3">
                  {senderImage ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-500 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={senderImage} alt="Uploaded" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setSenderImage(null)}
                        className="absolute inset-0 bg-black/50 text-white text-[10px] flex items-center justify-center font-bold opacity-0 hover:opacity-100 transition"
                      >
                        রিমুভ
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <label className="flex-grow cursor-pointer px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition">
                    <Upload className="w-4 h-4 text-red-600" />
                    {senderImage ? 'ছবি পরিবর্তন করুন' : 'কম্পিউটার/মোবাইল থেকে ছবি নির্বাচন করুন'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Message Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">শুভেচ্ছা বার্তা</label>
                  <span className="text-[11px] text-red-600 font-semibold">রেডিমেড বা কাস্টম টেক্সট</span>
                </div>
                
                {/* Preset pills */}
                <div className="space-y-2 mb-2">
                  {(presetMessages[selectedCat] || presetMessages.general).map((msg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCustomMessage(msg)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition border ${
                        customMessage === msg
                          ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      "{msg}"
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="এখানে আপনার নিজের কাস্টম বার্তা লিখুন..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                />
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Live Card Preview & Share Actions (7 Columns) */}
        <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
          
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                লাইভ ডিজিটাল কার্ড প্রিভিউ (HD Card)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[11px]">
                khulnagazette.com
              </span>
            </div>

            {/* THE CARD DESIGN CONTAINER (EXPORTABLE canvas target) */}
            <div className="w-full flex justify-center overflow-hidden">
              <div 
                ref={cardRef}
                style={{ backgroundImage: selectedTheme.pattern }}
                className={`w-full max-w-[540px] aspect-[4/3] ${selectedTheme.bg} ${selectedTheme.textColor} rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border-2 ${selectedTheme.border} shadow-2xl transition-all duration-300`}
              >
                
                {/* Decorative Frame Elements */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${selectedTheme.headerGlow} rounded-full blur-2xl pointer-events-none`} />
                <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 rounded-tl-xl pointer-events-none" />
                <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-xl pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-xl pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 rounded-br-xl pointer-events-none" />

                {/* Card Header Badge */}
                <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                      খ
                    </div>
                    <span className="text-xs font-black tracking-wider uppercase opacity-90">
                      খুলনা গেজেট
                    </span>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${selectedTheme.badgeBg}`}>
                    {activeCategoryObj.label}
                  </div>
                </div>

                {/* Card Middle Content */}
                <div className="my-auto py-4 text-center space-y-3 relative z-10">
                  <div className="space-y-1">
                    <span className="text-xs font-medium opacity-75 tracking-widest uppercase block">
                      — শুভেচ্ছা বার্তা —
                    </span>
                    <h2 className={`text-xl sm:text-3xl font-extrabold ${selectedTheme.titleColor} drop-shadow-md tracking-tight`}>
                      {recipientName || 'প্রিয় সুহৃদ'}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-base font-medium leading-relaxed max-w-md mx-auto px-4 opacity-95 text-balance">
                    "{customMessage}"
                  </p>
                </div>

                {/* Card Footer Sender Info */}
                <div className={`mt-auto pt-3.5 px-4 py-2.5 rounded-xl backdrop-blur-md border ${selectedTheme.footerBg} flex items-center justify-between relative z-10`}>
                  <div className="flex items-center gap-3">
                    {senderImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={senderImage}
                        alt="Sender Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 font-bold text-sm shrink-0">
                        {senderName ? senderName.charAt(0) : 'খ'}
                      </div>
                    )}
                    <div className="text-left">
                      <span className="text-[10px] opacity-75 block font-mono uppercase tracking-wider">শুভেচ্ছান্তে</span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                        {senderName || 'আপনার নাম'}
                      </h4>
                      {designation && (
                        <p className="text-[10px] text-amber-300/90 font-medium">
                          {designation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-white/60 font-mono block">ডিজিটাল সংস্করণ</span>
                    <span className="text-[11px] font-bold text-amber-300">khulnagazette.com</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={downloadCard}
                disabled={isDownloading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-red-900/30 flex items-center justify-center gap-2.5 transition active:scale-[0.99] disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    HD কার্ড তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 text-amber-300" />
                    HD ইমেজ ডাউনলোড করুন (Download Image)
                  </>
                )}
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-4 h-4" /> হোয়াটসঅ্যাপ
                </button>

                <button
                  onClick={handleShareFacebook}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Share2 className="w-4 h-4" /> ফেসবুক
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'কপি হয়েছে' : 'লিংক কপি'}
                </button>
              </div>
            </div>

          </div>

          {/* Tips / Instructions Box */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <h5 className="font-bold flex items-center gap-1.5 text-amber-950">
              <Award className="w-4 h-4 text-amber-700" /> কার্ড তৈরি সহায়িকা:
            </h5>
            <p className="leading-relaxed text-amber-800">
              ১. পছন্দের উৎসবের ক্যাটাগরি ও থিম বেছে নিন।<br />
              ২. আপনার ছবি ও নাম/পদবি যুক্ত করে "HD ইমেজ ডাউনলোড করুন" বাটনে ক্লিক করুন।<br />
              ৩. ইমেজটি আপনার ডিভাইসে সেভ হয়ে যাবে যা ফেসবুক ও হোয়াটসঅ্যাপে সরাসরি পোস্ট করতে পারবেন।
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
