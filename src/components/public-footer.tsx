import Link from 'next/link';
import Image from 'next/image';

export default async function PublicFooter() {
  return (
    <footer className="bg-[#151515] text-white text-[17px] mt-12">
      {/* Top Footer Section with 6 columns */}
      <div className="w-full max-w-full px-4 sm:px-8 lg:px-12 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

        {/* Col 1 */}
        <div>
          <ul className="space-y-3">
            <li>
              <Link href="/bangladesh" className="font-semibold hover:text-red-500 transition-colors">
                বাংলাদেশ
              </Link>
            </li>
            <li>
              <Link href="/politics" className="font-semibold hover:text-red-500 transition-colors">
                রাজনীতি
              </Link>
            </li>
            <li>
              <Link href="/economy" className="font-semibold hover:text-red-500 transition-colors">
                অর্থনীতি
              </Link>
            </li>
            <li>
              <Link href="/international" className="font-semibold hover:text-red-500 transition-colors">
                আন্তর্জাতিক
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 2 */}
        <div>
          <ul className="space-y-3">
            <li>
              <Link href="/khulnanchal" className="font-semibold hover:text-red-500 transition-colors">
                খুলনাঞ্চল
              </Link>
            </li>
            <li>
              <Link href="/sports" className="font-semibold hover:text-red-500 transition-colors">
                খেলা
              </Link>
            </li>
            <li>
              <Link href="/it" className="font-semibold hover:text-red-500 transition-colors">
                আইটি
              </Link>
            </li>
            <li>
              <Link href="/education" className="font-semibold hover:text-red-500 transition-colors">
                শিক্ষা
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <ul className="space-y-3">
            <li>
              <Link href="/lifestyle" className="font-semibold hover:text-red-500 transition-colors">
                লাইফ স্টাইল
              </Link>
            </li>
            <li>
              <Link href="/entertainment" className="font-semibold hover:text-red-500 transition-colors">
                বিনোদন
              </Link>
            </li>
            <li>
              <Link href="/muktobhabna" className="font-semibold hover:text-red-500 transition-colors">
                মুক্তভাবনা
              </Link>
            </li>
            <li>
              <Link href="/islam-and-life" className="font-semibold hover:text-red-500 transition-colors">
                ইসলাম ও জীবন
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <ul className="space-y-3">
            <li>
              <Link href="/social-media" className="font-semibold hover:text-red-500 transition-colors">
                সোশ্যাল মিডিয়া
              </Link>
            </li>
            <li>
              <Link href="/health" className="font-semibold hover:text-red-500 transition-colors">
                চিকিৎসা
              </Link>
            </li>
            <li>
              <Link href="/weird-news" className="font-semibold hover:text-red-500 transition-colors">
                চিত্র বিচিত্র
              </Link>
            </li>
            <li>
              <Link href="/photo-gallery" className="font-semibold hover:text-red-500 transition-colors">
                ফটো গ্যালারী
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 5 */}
        <div>
          <ul className="space-y-3">
            <li>
              <Link href="/about" className="font-semibold hover:text-red-500 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/terms" className="font-semibold hover:text-red-500 transition-colors">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="font-semibold hover:text-red-500 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="font-semibold hover:text-red-500 transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 6 - App Download */}
        <div className="flex flex-col justify-start">
          <a
            href="https://play.google.com/store/apps/details?id=com.kg.khl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition hover:opacity-90 max-w-[140px]"
          >
            <Image
              src="/google-play.png"
              alt="Get it on Google Play"
              width={140}
              height={42}
              className="w-full h-auto object-contain"
            />
          </a>
        </div>

      </div>

      {/* Middle Footer Section with Logo and Editorial details */}
      <div className="border-t border-[#333] bg-[#151515] py-8">
        <div className="w-full max-w-full px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-start gap-12">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/logo-footer.png"
                alt="খুলনা গেজেট"
                width={240}
                height={60}
                className="h-16 w-auto max-w-full object-contain"
              />
            </Link>
          </div>
          <div className="text-center md:text-left text-white max-w-2xl">
            <p className="leading-relaxed text-[17px]">
              <strong className="text-white font-bold block mb-1">সম্পাদক ও প্রকাশক : মোঃ মাহমুদ আহসান</strong>
              বার্তা বিভাগ : আনসারী কমপ্লেক্স, ১৬০ শের-ই-বাংলা সড়ক, খুলনা ৯১০০।<br />
              Mobile : 01794744579 &nbsp;&nbsp; E-mail : khulnagazette@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Copyright & Legal strip */}
      <div className="bg-[#202731] py-5 text-sm text-gray-300">
        <div className="w-full max-w-full px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-semibold">
            এই ওয়েবসাইটের কোনো লেখা, ছবি, অডিও, ভিডিও অনুমতি ছাড়া ব্যবহার বেআইনি।
          </p>
          <p className="font-semibold">
            © 2026 khulnagazette all rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

