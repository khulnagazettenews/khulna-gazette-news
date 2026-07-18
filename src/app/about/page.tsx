import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 border-l-4 border-red-600 pl-2.5">
          আমাদের সম্পর্কে
        </h2>
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-4 text-gray-700 leading-relaxed">
          <p>
            <strong>খুলনা গেজেট</strong> খুলনা বিভাগের সবচেয়ে নির্ভরযোগ্য এবং নির্ভীক অনলাইন নিউজ পোর্টাল। আমরা সর্বদা সত্য, সঠিক ও নিরপেক্ষ সংবাদ প্রকাশ করতে প্রতিশ্রুতিবদ্ধ।
          </p>
          <p>
            আমাদের প্রধান লক্ষ্য খুলনা অঞ্চলের দশটি জেলার সামগ্রিক উন্নয়ন, মানুষের সুখ-দুঃখের কথা দেশবাসীর কাছে তুলে ধরা। একই সাথে আমরা জাতীয় ও আন্তর্জাতিক খবরের নিখুঁত বিশ্লেষণ পাঠকদের উপহার দিই।
          </p>
          <p>
            আমরা বস্তুনিষ্ঠ সাংবাদিকতায় বিশ্বাসী। কোনো অপশক্তির কাছে নতি স্বীকার না করে সর্বদা জনস্বার্থে খবর প্রকাশ করাই আমাদের অন্যতম অঙ্গীকার।
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
