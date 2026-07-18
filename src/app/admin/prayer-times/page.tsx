'use client';

import { useEffect, useState } from 'react';
import { Clock, Save, Info } from 'lucide-react';

export default function PrayerTimesManagement() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  
  // Timings inputs
  const [fajr, setFajr] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [zohr, setZohr] = useState('');
  const [asr, setAsr] = useState('');
  const [magrib, setMagrib] = useState('');
  const [esha, setEsha] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch timings for the selected date
  const fetchTimings = async (targetDate: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/prayer-times?date=${targetDate}`);
      const data = await res.json();
      if (res.ok && data) {
        setFajr(data.fajr);
        setSunrise(data.sunrise);
        setZohr(data.zohr);
        setAsr(data.asr);
        setMagrib(data.magrib);
        setEsha(data.esha);
      } else {
        // Clear inputs if no data exists for this date
        setFajr('');
        setSunrise('');
        setZohr('');
        setAsr('');
        setMagrib('');
        setEsha('');
      }
    } catch (err) {
      setError('ডাটা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      fetchTimings(date);
    }
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !fajr || !sunrise || !zohr || !asr || !magrib || !esha) {
      setError('সকল ওয়াক্তের সময় প্রদান করা আবশ্যক।');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = { date, fajr, sunrise, zohr, asr, magrib, esha };

    try {
      const res = await fetch('/api/prayer-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('নামাজের সময়সূচি সফলভাবে সংরক্ষণ করা হয়েছে।');
      } else {
        setError(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setError('অনুরোধ পাঠানো সম্ভব হয়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">নামাজের সময়সূচি</h2>
        <p className="text-sm text-gray-500">খুলনা জেলা অনুযায়ী প্রতিদিনের নামাজের সময়সূচি হালনাগাদ করুন।</p>
      </div>

      {success && (
        <div className="bg-green-150 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        {/* Date Selector */}
        <div className="flex items-center gap-4 border-b border-gray-150 pb-4">
          <Clock className="text-red-600" size={24} />
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">তারিখ নির্বাচন করুন</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 w-full sm:w-auto"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">লোডিং হচ্ছে...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>দয়া করে বাংলা ফরম্যাটে সময় লিখুন (যেমন: ০৪:১৫ মি. অথবা ০৫:৪০ মি.)। এটি সরাসরি পাবলিক উইজেটে প্রদর্শিত হবে।</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ফজর (Fajr)</label>
                <input
                  type="text"
                  value={fajr}
                  onChange={(e) => setFajr(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 font-medium"
                  placeholder="যেমন: ০৪:১৫ মি."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">সূর্যোদয় (Sunrise)</label>
                <input
                  type="text"
                  value={sunrise}
                  onChange={(e) => setSunrise(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 font-medium"
                  placeholder="যেমন: ০৫:৪০ মি."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">যোহর (Dhuhr)</label>
                <input
                  type="text"
                  value={zohr}
                  onChange={(e) => setZohr(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 font-medium"
                  placeholder="যেমন: ১২:১৫ মি."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">আছর (Asr)</label>
                <input
                  type="text"
                  value={asr}
                  onChange={(e) => setAsr(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 font-medium"
                  placeholder="যেমন: ০৪:৩০ মি."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">মাগরিব (Maghrib)</label>
                <input
                  type="text"
                  value={magrib}
                  onChange={(e) => setMagrib(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 font-medium"
                  placeholder="যেমন: ০৬:৫০ মি."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">এশা (Isha)</label>
                <input
                  type="text"
                  value={esha}
                  onChange={(e) => setEsha(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 font-medium"
                  placeholder="যেমন: ০৮:১৫ মি."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{submitting ? 'সংরক্ষণ করা হচ্ছে...' : 'সময়সূচি সংরক্ষণ করুন'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
