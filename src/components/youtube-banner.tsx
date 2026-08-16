import Link from 'next/link';

export default function YoutubeBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#991b1b] rounded-xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 my-6">
      {/* Icon & Text Container */}
      <div className="flex items-center gap-3 sm:gap-4 text-left">
        <div className="w-11 h-11 sm:w-13 sm:h-13 bg-white text-[#dc2626] rounded-full flex items-center justify-center shrink-0 shadow-md">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] sm:text-[19px] font-bold tracking-normal leading-snug text-white">
            খুলনা গেজেট সংক্রান্ত ভিডিও খবর
          </h3>
          <p className="text-[12px] sm:text-sm text-red-100 font-medium mt-0.5 leading-snug">
            ইউটিউবে আমাদের সাম্প্রতিক সব খবর দেখতে চ্যানেলটি সাবস্ক্রাইব করুন
          </p>
        </div>
      </div>

      {/* Subscribe Button */}
      <a
        href="https://www.youtube.com/@khulnagazette"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#dc2626] hover:bg-slate-100 font-bold text-sm sm:text-base py-2.5 px-5 rounded-lg shadow-sm transition shrink-0 tracking-wide text-center"
      >
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <span>সাবস্ক্রাইব করুন</span>
      </a>
    </div>
  );
}
