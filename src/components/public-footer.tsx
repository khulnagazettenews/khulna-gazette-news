import Link from 'next/link';
import Image from 'next/image';

export default async function PublicFooter() {
  return (
    <footer className="bg-[#1c1c1c] text-white font-sans mt-12 select-none w-full overflow-hidden">
      {/* Top Footer Section (Uniform Grid for Mobile and Desktop) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-[#333]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-6 sm:gap-6 lg:gap-8 items-start">
          {/* Links Col 1 */}
          <div className="flex flex-col gap-2">
            <Link href="/bangladesh" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              বাংলাদেশ
            </Link>
            <Link href="/politics" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              রাজনীতি
            </Link>
            <Link href="/economy" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              অর্থনীতি
            </Link>
            <Link href="/international" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              আন্তর্জাতিক
            </Link>
          </div>

          {/* Links Col 2 */}
          <div className="flex flex-col gap-2">
            <Link href="/khulna" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              খুলনাঞ্চল
            </Link>
            <Link href="/sports" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              খেলা
            </Link>
            <Link href="/technology" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              আইটি
            </Link>
            <Link href="/education" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              শিক্ষা
            </Link>
          </div>

          {/* Links Col 3 */}
          <div className="flex flex-col gap-2">
            <Link href="/lifestyle" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              লাইফ স্টাইল
            </Link>
            <Link href="/entertainment" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              বিনোদন
            </Link>
            <Link href="/free-thinking" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              মুক্তভাবনা
            </Link>
            <Link href="/islam-life" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              ইসলাম ও জীবন
            </Link>
          </div>

          {/* Links Col 4 */}
          <div className="flex flex-col gap-2">
            <Link href="/social-media" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              সোশ্যাল মিডিয়া
            </Link>
            <Link href="/health" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              চিকিৎসা
            </Link>
            <Link href="/chitro-bichitro" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              চিত্র বিচিত্র
            </Link>
            <Link href="/photo-gallery" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px] leading-tight">
              ফটো গ্যালারী
            </Link>
          </div>

          {/* Links Col 5 */}
          <div className="flex flex-col gap-2">
            <Link href="/about" className="text-white hover:text-[#ff4444] transition duration-300 text-[14px] sm:text-[16px] leading-tight">
              About Us
            </Link>
            <Link href="/terms" className="text-white hover:text-[#ff4444] transition duration-300 text-[14px] sm:text-[16px] leading-tight">
              Terms of Use
            </Link>
            <Link href="/privacy" className="text-white hover:text-[#ff4444] transition duration-300 text-[14px] sm:text-[16px] leading-tight">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-white hover:text-[#ff4444] transition duration-300 text-[14px] sm:text-[16px] leading-tight">
              Contact Us
            </Link>
          </div>

          {/* Feature Links & Playstore Badge Column */}
          <div className="col-span-1 flex flex-col gap-3.5 items-start">
            <div className="flex flex-col gap-2 font-bold text-[15px] sm:text-[17px] leading-tight">
              <Link href="/converter" className="text-[#ffffff] hover:text-[#ff4444] transition duration-300 flex items-center gap-1.5">
                <span className="text-[#ed0022] font-extrabold">•</span> কনভার্টার
              </Link>
              <Link href="/greeting-cards" className="text-[#ffffff] hover:text-[#ff4444] transition duration-300 flex items-center gap-1.5">
                <span className="text-[#ed0022] font-extrabold">•</span> শুভেচ্ছা কার্ড
              </Link>
              <Link href="/jobs" className="text-[#ffffff] hover:text-[#ff4444] transition duration-300 flex items-center gap-1.5">
                <span className="text-[#ed0022] font-extrabold">•</span> খুলনা গেজেটে চাকরি
              </Link>
            </div>

            <a
              href="https://play.google.com/store/apps/details?id=com.kg.khl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition hover:opacity-90 mt-1"
            >
              <img
                src="/google-play.png"
                alt="Google Play"
                className="w-[130px] sm:w-[170px] h-auto object-contain rounded max-w-full"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Middle Footer Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center gap-6 lg:gap-10 text-center md:text-left">
        <div className="shrink-0 flex justify-center">
          <Link href="/">
            <Image
              src="/logo-footer.png"
              alt="Logo"
              width={260}
              height={65}
              className="w-[190px] sm:w-[220px] md:w-[260px] h-auto object-contain"
            />
          </Link>
        </div>

        <div className="space-y-1.5 w-full">
          <h3 className="text-[16px] sm:text-[17px] md:text-[19px] font-bold leading-snug">
            সম্পাদক ও প্রকাশক : মোঃ মাহমুদ আহসান
          </h3>

          <p className="text-[14px] sm:text-[15px] md:text-[17px] text-gray-200 font-normal leading-relaxed">
            বার্তা বিভাগ : আনসারী কমপ্লেক্স, ১৬০ শের-ই-বাংলা সড়ক, খুলনা ৯১০০।
          </p>

          <p className="text-[13px] sm:text-[15px] md:text-[17px] text-gray-200 font-normal flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 leading-relaxed">
            <span>Mobile : 01794744579</span>
            <span className="whitespace-nowrap">E-mail : khulnagazette@gmail.com</span>
          </p>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="bg-[#2c3547] py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] border-t border-[#262f3d]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2 text-xs sm:text-sm text-gray-200 text-center md:text-left font-normal">
          <div>
            এই ওয়েবসাইটের কোনো লেখা, ছবি, অডিও, ভিডিও অনুমতি ছাড়া ব্যবহার বেআইনি।
          </div>

          <div className="whitespace-nowrap">
            © 2026 khulnagazette all rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
}

