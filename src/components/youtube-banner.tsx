import Link from 'next/link';

export default function YoutubeBanner() {
  return (
    <section className="w-full my-0 font-sans select-none flex justify-center">
      <div 
        className="w-full py-2 px-3 sm:px-5 lg:px-6 bg-gradient-to-r from-[#d90429] via-[#ef233c] to-[#b7094c] text-white shadow-md border border-red-300/40 relative overflow-hidden group rounded-none flex items-center justify-between min-h-[65px] sm:min-h-[75px] lg:min-h-[80px]"
      >
        {/* Subtle Network Lines Grid Texture */}
        <div 
          className="absolute inset-0 opacity-[0.09] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Floating Broadcast Radio Wave Rings in Background */}
        <div className="absolute -top-12 -left-12 w-44 h-44 border border-white/20 rounded-full animate-ping opacity-30 pointer-events-none" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 border border-white/20 rounded-full animate-ping opacity-30 pointer-events-none" style={{ animationDuration: '3s' }} />

        {/* Ambient Soft Red Glows */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-white/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />

        {/* Content Container (832x131 Optimized Compact Layout) */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6 text-center lg:text-left">
          
          {/* Left Block: Animated Lottie-Style YouTube Badge */}
          <div className="flex flex-row items-center gap-3 shrink-0">
            {/* Animated YouTube Play Badge */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white text-[#d90429] rounded-none flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300 relative border border-white">
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-90"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-[#d90429]"></span>
              </span>
              <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6 fill-current ml-0.5 animate-pulse" style={{ animationDuration: '2s' }} viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>

            <div className="space-y-0.5 text-left">
              <span className="block text-xs sm:text-sm text-white font-black tracking-wide drop-shadow-xs">
                খুলনা গেজেট মিডিয়া নেটওয়ার্ক
              </span>
            </div>
          </div>

          {/* Thin Vertical Newsroom Divider (Desktop Only) */}
          <div className="hidden lg:block w-[1px] h-9 bg-gradient-to-b from-transparent via-white/40 to-transparent shrink-0" />

          {/* Center Block: Animated News Globe + Headline */}
          <div className="flex-1 flex flex-row items-center gap-3 max-w-xl">
            {/* Animated News Network Satellite Broadcast Lottie Graphic */}
            <div className="relative w-10 h-10 shrink-0 hidden md:flex items-center justify-center select-none">
              {/* Outer Spinning Globe Orbit Ring */}
              <div className="absolute inset-0 border border-dashed border-white/60 rounded-full animate-[spin_10s_linear_infinite]" />
              {/* Signal Wave Pulse Ring */}
              <div className="absolute inset-0.5 border border-yellow-300/80 rounded-full animate-ping opacity-80" style={{ animationDuration: '2s' }} />
              {/* Center Broadcast Globe Icon Node */}
              <div className="w-7 h-7 bg-white text-[#d90429] rounded-full flex items-center justify-center shadow-md relative z-10">
                <svg className="w-4 h-4 fill-current animate-pulse" style={{ animationDuration: '1.5s' }} viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
            </div>

            <div className="space-y-0.5 text-center sm:text-left">
              <h2 
                className="text-[19px] sm:text-[22px] lg:text-[24px] font-black text-white leading-tight tracking-tight drop-shadow-md"
                style={{ fontFamily: 'Bangla, sans-serif' }}
              >
                খবরের লাইভ ব্রডকাস্ট দেখতে সাথে থাকুন
              </h2>
              <p 
                className="text-xs sm:text-sm text-amber-100 font-semibold leading-tight max-w-lg mx-auto sm:mx-0 drop-shadow-xs"
                style={{ fontFamily: 'Bangla, sans-serif' }}
              >
                মাঠপর্যায়ের বিশেষ বুলেটিন, সরাসরি টকশো ও ব্রেকিং নিউজ সরাসরি পেতে সাবস্ক্রাইব করুন।
              </p>
            </div>
          </div>

          {/* Right Block: High-Impact Animated White Button */}
          <div className="shrink-0 w-full sm:w-auto">
            <a
              href="https://www.youtube.com/@khulnagazette"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-yellow-300 text-[#d90429] hover:text-black font-black text-xs sm:text-sm py-2 px-5 rounded-none shadow-md hover:scale-105 transition-all duration-300 relative overflow-hidden group/btn border border-white"
              style={{ fontFamily: 'Bangla, sans-serif' }}
            >
              {/* Continuous Light Sweep Animation Loop */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />

              <svg className="w-4 h-4 fill-current shrink-0 group-hover/btn:scale-110 transition-transform duration-300 animate-bounce" style={{ animationDuration: '1.5s' }} viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>▶ সাবস্ক্রাইব করুন</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
