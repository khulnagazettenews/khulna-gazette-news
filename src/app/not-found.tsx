import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 font-sans py-16">
      <h1 className="text-6xl font-extrabold text-[#e60023] mb-4">৪০৪</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">পৃষ্ঠাটি পাওয়া যায়নি</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি স্থানান্তরিত হয়েছে বা মুছে ফেলা হয়েছে।
      </p>
      <Link
        href="/"
        className="bg-[#e60023] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg transition"
      >
        প্রচ্ছদে ফিরে যান
      </Link>
    </div>
  );
}
