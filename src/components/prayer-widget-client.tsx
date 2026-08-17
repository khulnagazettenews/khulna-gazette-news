'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface Timings {
  fajr: string;
  sunrise: string;
  zohr: string;
  asr: string;
  magrib: string;
  esha: string;
}

interface PrayerWidgetClientProps {
  timings: Timings;
  hijriDate?: string;
  gregorianDate?: string;
}

const BD_DISTRICTS = [
  { city: 'Khulna', bn: 'খুলনা' },
  { city: 'Dhaka', bn: 'ঢাকা' },
  { city: 'Chittagong', bn: 'চট্টগ্রাম' },
  { city: 'Sylhet', bn: 'সিলেট' },
  { city: 'Rajshahi', bn: 'রাজশাহী' },
  { city: 'Barisal', bn: 'বরিশাল' },
  { city: 'Rangpur', bn: 'রংপুর' },
  { city: 'Mymensingh', bn: 'ময়মনসিংহ' },
  { city: 'Comilla', bn: 'কুমিল্লা' },
  { city: 'Jessore', bn: 'যশোর' },
  { city: 'Kushtia', bn: 'কুষ্টিয়া' },
  { city: 'Satkhira', bn: 'সাতক্ষীরা' },
  { city: 'Bagerhat', bn: 'বাগেরহাট' },
  { city: 'Cox\'s Bazar', bn: 'কক্সবাজার' },
  { city: 'Bograbd', bn: 'বগুড়া' },
  { city: 'Tangail', bn: 'টাঙ্গাইল' },
];

const toBengaliNumber = (numStr: string) => {
  const bnNums: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return numStr.replace(/[0-9]/g, (w) => bnNums[w] || w);
};

const toEnglishNumber = (numStr: string) => {
  const bnNums: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return numStr.replace(/[০-৯]/g, (w) => bnNums[w] || w);
};

export default function PrayerWidgetClient({ timings: initialTimings }: PrayerWidgetClientProps) {
  const [selectedCity, setSelectedCity] = useState('Khulna');
  const [timings, setTimings] = useState<Timings>(initialTimings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCity === 'Khulna') {
      setTimings(initialTimings);
      return;
    }

    const fetchLiveTimings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prayer-times/live?city=${encodeURIComponent(selectedCity)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.timings) {
            setTimings(data.timings);
          }
        }
      } catch (err) {
        console.error('Error fetching district prayer times:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveTimings();
  }, [selectedCity, initialTimings]);

  const parseTo12hBengali = (val: string, name: string) => {
    if (!val) return '--:--';
    let cleanVal = toEnglishNumber(val).trim();
    const isPm = cleanVal.toLowerCase().includes('pm');
    const isAm = cleanVal.toLowerCase().includes('am');
    cleanVal = cleanVal.replace(/(am|pm)/i, '').trim();

    const [hStr, mStr] = cleanVal.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';

    if (isNaN(h)) return val;

    if (isPm && h < 12) h += 12;
    if (isAm && h === 12) h = 0;

    if (!isPm && !isAm) {
      if (name === 'zohr' && h < 12) h += 12;
      if (name === 'asr' && h < 12) h += 12;
      if (name === 'magrib' && h < 12) h += 12;
      if (name === 'esha' && h < 12) h += 12;
    }

    if (h > 12) h -= 12;
    if (h === 0) h = 12;

    return `${toBengaliNumber(h.toString())}:${toBengaliNumber(m)}`;
  };

  const list = [
    { name: 'ফজর', time: parseTo12hBengali(timings.fajr, 'fajr') },
    { name: 'যোহর', time: parseTo12hBengali(timings.zohr, 'zohr') },
    { name: 'আছর', time: parseTo12hBengali(timings.asr, 'asr') },
    { name: 'মাগরিব', time: parseTo12hBengali(timings.magrib, 'magrib') },
    { name: 'এশা', time: parseTo12hBengali(timings.esha, 'esha') },
    { name: 'সূর্যোদয়', time: parseTo12hBengali(timings.sunrise, 'sunrise') },
  ];

  return (
    <div className="w-full bg-white rounded-[8px] border border-gray-200 p-2.5 select-none font-sans">
      <div 
        className="rounded-[6px] overflow-hidden border border-gray-200 bg-white"
        style={{
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Dark Header Title */}
        <div 
          className="bg-[#353d4c] text-white py-1 px-2 text-center font-normal border-b border-gray-200 flex items-center justify-between"
          style={{
            fontFamily: 'Bangla, sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: '22px',
          }}
        >
          <span>নামাজের সময়সূচি</span>

          {/* District Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded text-xs border border-slate-700">
            <MapPin size={12} className="text-amber-400 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
            >
              {BD_DISTRICTS.map((d) => (
                <option key={d.city} value={d.city} className="bg-slate-900 text-white">
                  {d.bn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prayer Time Rows */}
        <div className="bg-white p-2 space-y-1.5 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center text-xs font-bold text-slate-600">
              সময় লোড হচ্ছে...
            </div>
          )}

          {list.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              {/* Left Grey Name Pill */}
              <div 
                className="bg-[#f1f3f5] text-[#333333] font-bold text-[14px] py-1 px-2 flex-1 rounded-[6px] text-center leading-tight shadow-2xs"
                style={{ fontFamily: 'Bangla, sans-serif' }}
              >
                {item.name}
              </div>

              {/* Right Blue Time Pill */}
              <div 
                className="bg-[#e7f5ff] text-[#1c7ed6] font-bold text-[14px] py-1 px-2 flex-1 rounded-[6px] text-center leading-tight shadow-2xs"
                style={{ fontFamily: 'Bangla, sans-serif' }}
              >
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

