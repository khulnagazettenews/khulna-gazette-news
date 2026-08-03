'use client';

import Link from 'next/link';

const openPositions = [
  {
    id: 1,
    title: 'সাব এডিটর / সহ-সম্পাদক (ডিজিটাল নিউজ)',
    department: 'বার্তা বিভাগ',
    location: 'খুলনা',
    type: 'ফুল টাইম',
    deadline: '১৫ আগস্ট, ২০২৬'
  },
  {
    id: 2,
    title: 'স্টাফ রিপোর্টার (খুলনা ও দক্ষিণ-পশ্চিমাঞ্চল)',
    department: 'রিপোর্টিং বিভাগ',
    location: 'খুলনা / ফিল্ড',
    type: 'ফুল টাইম',
    deadline: '২০ আগস্ট, ২০২৬'
  },
  {
    id: 3,
    title: 'গ্রাফিক্স ডিজাইনার ও ভিডিও এডিটর',
    department: 'মাল্টিমিডিয়া বিভাগ',
    location: 'খুলনা',
    type: 'ফুল টাইম / পার্ট টাইম',
    deadline: '২৫ আগস্ট, ২০২৬'
  }
];

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-red-600">হোম</Link>
          <span>»</span>
          <span className="font-bold text-gray-900">খুলনা গেজেটে চাকরি</span>
        </div>

        {/* Header banner */}
        <div className="bg-gradient-to-r from-red-700 to-rose-900 text-white rounded-2xl p-8 sm:p-10 shadow-md">
          <h1 className="text-2xl sm:text-4xl font-black mb-3">
            খুলনা গেজেটে ক্যারিয়ার গড়ুন
          </h1>
          <p className="text-red-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            খুলনা ও দক্ষিণ-পশ্চিমাঞ্চলের শীর্ষস্থানীয় ডিজিটাল সংবাদ মাধ্যমে কাজ করার সুযোগ। আপনি কি বস্তুনিষ্ঠ সাংবাদিকতা ও ডিজিটাল কনটেন্ট তৈরিতে আগ্রহী? আমাদের দলে যোগ দিন!
          </p>
        </div>

        {/* Positions List */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-l-4 border-red-600 pl-3">
            চলতি চাকরির বিজ্ঞপ্তি (Current Openings)
          </h2>

          <div className="space-y-4">
            {openPositions.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-xl p-5 hover:border-red-500 transition shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 hover:text-red-600 transition">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 font-medium">
                    <span>विभाग: {job.department}</span>
                    <span>•</span>
                    <span>স্থান: {job.location}</span>
                    <span>•</span>
                    <span className="text-red-600 font-semibold">{job.type}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 space-y-1">
                  <span className="text-xs text-gray-500 block">আবেদনের শেষ তারিখ: {job.deadline}</span>
                  <a
                    href="mailto:khulnagazette@gmail.com?subject=Job Application"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                  >
                    আবেদন করুন
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-700 space-y-1">
            <h4 className="font-bold text-gray-900">জীবনবৃত্তান্ত পাঠানোর ঠিকানা:</h4>
            <p>আপনার সিভি (CV) এবং সাম্প্রতিক কাজের নমুনা পাঠাতে ইমেইল করুন: <strong className="text-red-600">khulnagazette@gmail.com</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
