'use client';

import { useState } from 'react';
import Link from 'next/link';

const cardTemplates = [
  { id: 'eid', title: 'ঈদুল ফিতর ও আজহার শুভেচ্ছা', bg: 'from-emerald-600 to-teal-800', text: 'ঈদ মোবারক! আপনাকে ও আপনার পরিবারকে পবিত্র ঈদের শুভেচ্ছা।' },
  { id: 'newyear', title: 'শুভ নববর্ষের শুভেচ্ছা', bg: 'from-red-600 to-rose-800', text: 'নতুন বছর আপনার জীবনে বয়ে আনুক অনাবিল আনন্দ ও সাফল্য।' },
  { id: 'birthday', title: 'শুভ জন্মদিনের শুভেচ্ছা', bg: 'from-purple-600 to-indigo-800', text: 'শুভ জন্মদিন! আপনার জীবনের প্রতিটি দিন আলোকময় ও সফল হোক।' },
  { id: 'congrats', title: 'অভিনন্দন ও শুভকামনা', bg: 'from-amber-500 to-orange-700', text: 'আপনার সাফল্য ও নতুন যাত্রায় জানাই আন্তরিক অভিনন্দন ও শুভকামনা।' }
];

export default function GreetingCardsClient() {
  const [senderName, setSenderName] = useState<string>('আপনার নাম');
  const [recipientName, setRecipientName] = useState<string>('প্রিয় বন্ধু');
  const [selectedTemplate, setSelectedTemplate] = useState(cardTemplates[0]);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-red-600">হোম</Link>
          <span>»</span>
          <span className="font-bold text-gray-900">শুভেচ্ছা কার্ড</span>
        </div>

        {/* Title */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            ডিজিটাল শুভেচ্ছা কার্ড মেকার (Greeting Cards)
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            আপনার প্রিয়জনদের জন্য পছন্দের ডিজিটাল শুভেচ্ছা কার্ড তৈরি করুন ও শেয়ার করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="md:col-span-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-l-4 border-red-600 pl-2.5">
              কার্ড কাস্টমাইজ করুন
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">শুভেচ্ছা বার্তা টেমপ্লেট</label>
              <select
                onChange={(e) => {
                  const found = cardTemplates.find((t) => t.id === e.target.value);
                  if (found) setSelectedTemplate(found);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium"
              >
                {cardTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">যার উদ্দেশ্যে (Recipient Name)</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">প্রেরকের নাম (Your Name)</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
              />
            </div>
          </div>

          {/* Card Preview */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <div className={`w-full aspect-[4/3] max-w-[480px] bg-gradient-to-br ${selectedTemplate.bg} text-white rounded-2xl shadow-xl p-8 flex flex-col justify-between relative overflow-hidden`}>
              <div className="text-right font-light text-xs tracking-wider opacity-80">
                খুলনা গেজেট ডিজিটাল কার্ড
              </div>

              <div className="space-y-3 text-center my-auto">
                <h3 className="text-xl sm:text-2xl font-extrabold drop-shadow">
                  {recipientName}
                </h3>
                <p className="text-sm sm:text-base font-medium leading-relaxed opacity-95">
                  "{selectedTemplate.text}"
                </p>
              </div>

              <div className="border-t border-white/20 pt-3 flex justify-between items-center text-xs font-semibold">
                <span>শুভেচ্ছান্তে: {senderName}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">khulnagazette.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
