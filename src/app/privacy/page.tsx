import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 border-l-4 border-red-600 pl-2.5">
          গোপনীয়তা নীতি (Privacy Policy)
        </h2>
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-4 text-gray-700 leading-relaxed text-xs">
          <p>
            খুলনা গেজেট-এ আমরা আমাদের ভিজিটরদের গোপনীয়তা রক্ষা করতে বদ্ধপরিকর। এই গোপনীয়তা নীতির মাধ্যমে আমরা কীভাবে আপনার তথ্য সংগ্রহ ও ব্যবহার করি তা সংক্ষেপে আলোচনা করা হলো।
          </p>
          <h3 className="font-bold text-gray-800 text-sm mt-4">১. তথ্য সংগ্রহ</h3>
          <p>
            আমরা সাধারণত আমাদের সাইটে মন্তব্য করার সময় আপনার নাম ও ইমেইল সংরক্ষণ করি। এই তথ্য শুধুমাত্র স্প্যাম প্রতিরোধ ও আপনার সাথে যোগাযোগের জন্য ব্যবহৃত হয়।
          </p>
          <h3 className="font-bold text-gray-800 text-sm mt-4">২. কুকিজ ও ট্র্যাকিং</h3>
          <p>
            সাইটের পারফরম্যান্স ও ট্রাফিক অ্যানালিটিক্সের জন্য আমরা কুকিজ ব্যবহার করতে পারি, যা আপনার ব্রাউজিং অভিজ্ঞতাকে সহজ ও উন্নত করে।
          </p>
          <h3 className="font-bold text-gray-800 text-sm mt-4">৩. তৃতীয় পক্ষের সাথে শেয়ার</h3>
          <p>
            আমরা আপনার ব্যক্তিগত তথ্য বা ইমেইল ঠিকানা কোনো তৃতীয় পক্ষের কাছে বিক্রি বা ভাড়া দিই না।
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
