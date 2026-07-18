import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 border-l-4 border-red-600 pl-2.5">
          যোগাযোগ
        </h2>
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 text-gray-700">
          <p className="text-sm">খুলনা গেজেট-এর বার্তা বিভাগ বা বিজ্ঞাপন সংক্রান্ত যেকোনো প্রয়োজনে যোগাযোগ করুন:</p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-red-600 shrink-0 mt-1" size={20} />
              <div>
                <p className="font-bold text-sm text-gray-800">প্রধান কার্যালয়</p>
                <p className="text-xs text-gray-500">সোনাডাঙ্গা আবাসিক এলাকা, ২য় ফেজ, খুলনা, বাংলাদেশ।</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="text-red-600 shrink-0 mt-1" size={20} />
              <div>
                <p className="font-bold text-sm text-gray-800">ফোন নম্বর</p>
                <p className="text-xs text-gray-500">+৮৮০ ১৭০০-০০০০০০ (বার্তা বিভাগ), +৮৮০ ১৭০১-০০০০০০ (বিজ্ঞাপন)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="text-red-600 shrink-0 mt-1" size={20} />
              <div>
                <p className="font-bold text-sm text-gray-800">ইমেইল ঠিকানা</p>
                <p className="text-xs text-gray-500">info@khulnagazette.com, news@khulnagazette.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
