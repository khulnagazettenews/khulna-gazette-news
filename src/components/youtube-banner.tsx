import Link from 'next/link';

export default function YoutubeBanner() {
  return (
    <div className="w-full bg-[#2b354f] text-white p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-none my-4 shadow-2xs border border-slate-700/60 font-sans">
      {/* Icon & Text Container */}
      <div className="flex items-center gap-2.5 text-left">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#dc2626] text-white rounded-none flex items-center justify-center shrink-0 shadow-xs">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 
            className="text-[17px] sm:text-[19px] font-normal leading-tight text-white tracking-[-0.2px]"
            style={{ fontFamily: 'Bangla, sans-serif' }}
          >
            ইউটিউব চ্যানেলে সাবস্ক্রাইব করুন
          </h3>
          <p 
            className="text-xs text-slate-300 font-normal mt-0.5 leading-tight"
            style={{ fontFamily: 'Bangla, sans-serif' }}
          >
            ইউটিউবে খুলনা গেজেটের সব খবর দেখতে চ্যানেলটি সাবস্ক্রাইব করুন
          </p>
        </div>
      </div>

      {/* Subscribe Button */}
      <a
        href="https://www.youtube.com/@khulnagazette"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-normal text-xs sm:text-sm py-1.5 px-4 rounded-none transition shrink-0 text-center shadow-xs"
        style={{ fontFamily: 'Bangla, sans-serif' }}
      >
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <span>সাবস্ক্রাইব করুন</span>
      </a>
    </div>
  );
}
