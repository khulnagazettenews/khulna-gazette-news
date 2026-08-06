import Link from 'next/link';
import Image from 'next/image';

export default async function PublicFooter() {
  return (
    <footer className="bg-[#1c1c1c] text-white font-sans mt-12 select-none">
      {/* Top Footer Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap lg:flex-nowrap justify-between gap-6 lg:gap-10 border-b border-[#333]">
        {/* Links Col 1 */}
        <div className="flex flex-col gap-2">
          <Link href="/bangladesh" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            বাংলাদেশ
          </Link>
          <Link href="/politics" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            রাজনীতি
          </Link>
          <Link href="/economy" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            অর্থনীতি
          </Link>
          <Link href="/international" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            আন্তর্জাতিক
          </Link>
        </div>

        {/* Links Col 2 */}
        <div className="flex flex-col gap-2">
          <Link href="/khulna" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            খুলনাঞ্চল
          </Link>
          <Link href="/sports" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            খেলা
          </Link>
          <Link href="/technology" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            আইটি
          </Link>
          <Link href="/education" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            শিক্ষা
          </Link>
        </div>

        {/* Links Col 3 */}
        <div className="flex flex-col gap-2">
          <Link href="/lifestyle" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            লাইফ স্টাইল
          </Link>
          <Link href="/entertainment" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            বিনোদন
          </Link>
          <Link href="/free-thinking" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            মুক্তভাবনা
          </Link>
          <Link href="/islam-life" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            ইসলাম ও জীবন
          </Link>
        </div>

        {/* Links Col 4 */}
        <div className="flex flex-col gap-2">
          <Link href="/social-media" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            সোশ্যাল মিডিয়া
          </Link>
          <Link href="/health" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            চিকিৎসা
          </Link>
          <Link href="/chitro-bichitro" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            চিত্র বিচিত্র
          </Link>
          <Link href="/photo-gallery" className="text-white hover:text-[#ff4444] transition duration-300 text-[15px] sm:text-[17px]">
            ফটো গ্যালারী
          </Link>
        </div>

        {/* Links Col 5 */}
        <div className="flex flex-col gap-2">
          <Link href="/about" className="text-white hover:text-[#ff4444] transition duration-300 text-[14px] sm:text-[16px]">
            About Us
          </Link>
          <Link href="/terms" className="text-white hover:text-[#ff4444] transition duration-300 text-[14px] sm:text-[16px]">
            Terms of Use
          </Link>
          <Link href="/privacy" className="text-white hover:text-[#ff4444] transition duration-300 text-[14px] sm:text-[16px]">
            Privacy Policy
          </Link>
          <Link href="/contact" className="text-white hover:text-[#ff4444] transition duration-300 text-[14px] sm:text-[16px]">
            Contact Us
          </Link>
        </div>

        {/* Feature Links & Playstore Badge Column */}
        <div className="shrink-0 flex flex-col gap-3.5 items-start">
          <div className="flex flex-col gap-2 font-bold text-[15px] sm:text-[17px]">
            <Link href="/converter" className="text-white hover:text-[#ff4444] transition duration-300 flex items-center gap-1.5">
              <span className="text-[#ed0022] font-extrabold">•</span> কনভার্টার
            </Link>
            <Link href="/greeting-cards" className="text-white hover:text-[#ff4444] transition duration-300 flex items-center gap-1.5">
              <span className="text-[#ed0022] font-extrabold">•</span> শুভেচ্ছা কার্ড
            </Link>
            <Link href="/jobs" className="text-white hover:text-[#ff4444] transition duration-300 flex items-center gap-1.5">
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
              className="w-[150px] sm:w-[170px] h-auto object-contain rounded"
            />
          </a>
        </div>
      </div>

      {/* Middle Footer Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center gap-6 lg:gap-10 text-center md:text-left">
        <div className="shrink-0">
          <Link href="/">
            <Image
              src="/logo-footer.png"
              alt="Logo"
              width={260}
              height={65}
              className="w-[200px] md:w-[260px] h-auto object-contain"
            />
          </Link>
        </div>

        <div className="space-y-1">
          <h3 className="text-[17px] md:text-[19px] font-bold">
            সম্পাদক ও প্রকাশক : মোঃ মাহমুদ আহসান
          </h3>

          <p className="text-[15px] md:text-[17px] text-gray-200 font-normal">
            বার্তা বিভাগ : আনসারী কমপ্লেক্স, ১৬০ শের-ই-বাংলা সড়ক, খুলনা ৯১০০।
          </p>

          <p className="text-[15px] md:text-[17px] text-gray-200 font-normal">
            Mobile : 01794744579 &nbsp;&nbsp;&nbsp; E-mail : khulnagazette@gmail.com
          </p>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="bg-[#2c3547] py-3.5 border-t border-[#262f3d]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2 text-xs sm:text-sm text-gray-200 text-center md:text-left font-normal">
          <div>
            এই ওয়েবসাইটের কোনো লেখা, ছবি, অডিও, ভিডিও অনুমতি ছাড়া ব্যবহার বেআইনি।
          </div>

          <div>
            © 2026 khulnagazette all rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
}

