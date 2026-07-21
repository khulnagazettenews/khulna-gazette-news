import Link from 'next/link';

export default function YoutubeBanner() {
  return (
    <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 rounded-xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
      <div className="flex items-center gap-3.5 text-center sm:text-left">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white text-red-600 rounded-full flex items-center justify-center shrink-0 shadow-lg">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
            খুলনা গেজেট সংক্রান্ত ভিডিও খবর
          </h3>
          <p className="text-xs sm:text-sm text-red-100 font-medium">
            ইউটিউবে আমাদের সাম্প্রতিক সব খবর দেখতে চ্যানেলটি সাবস্ক্রাইব করুন
          </p>
        </div>
      </div>
      <a
        href="https://www.youtube.com/@khulnagazette"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-white text-red-700 hover:bg-slate-100 font-black text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow transition shrink-0 uppercase tracking-wide"
      >
        <span>সাবস্ক্রাইব করুন</span>
      </a>
    </div>
  );
}
