import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 border-l-4 border-red-600 pl-2.5">
          ব্যবহারের শর্তাবলী (Terms of Use)
        </h2>
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-4 text-gray-700 leading-relaxed text-xs">
          <p>
            খুলনা গেজেট-এ আপনাকে স্বাগতম। এই নিউজ পোর্টালটি ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলী মেনে চলছেন বলে গণ্য হবে:
          </p>
          <h3 className="font-bold text-gray-800 text-sm mt-4">১. মেধা স্বত্ব ও কপিরাইট</h3>
          <p>
            খুলনা গেজেট-এ প্রকাশিত সকল সংবাদ, ছবি, ভিডিও এবং অন্যান্য কন্টেন্ট খুলনা গেজেটের নিজস্ব সম্পদ। অনুমতি ব্যতীত কোনো কন্টেন্ট হুবহু কপি বা অন্য কোথাও পুনরায় প্রকাশ করা আইনত দণ্ডনীয়।
          </p>
          <h3 className="font-bold text-gray-800 text-sm mt-4">২. কন্টেন্টের ব্যবহার</h3>
          <p>
            আপনি আমাদের কন্টেন্ট শুধুমাত্র ব্যক্তিগত ও অ-ব্যবসায়িক প্রয়োজনে পড়তে ও শেয়ার করতে পারেন। তবে সূত্র উল্লেখ ব্যতিরেকে কোনো অংশ ব্যবহার করা যাবে না।
          </p>
          <h3 className="font-bold text-gray-800 text-sm mt-4">৩. মন্তব্য নীতিমালা</h3>
          <p>
            খবরের নিচে মন্তব্য করার সময় কোনো অশালীন, মানহানিকর, উস্কানিমূলক বা বেআইনি ভাষা ব্যবহার করা যাবে না। অশালীন মন্তব্যগুলো এডমিন প্যানেল কর্তৃক মুছে ফেলা হবে।
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
