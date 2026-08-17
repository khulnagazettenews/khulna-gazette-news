'use client';

import { useState, useEffect } from 'react';

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

const BD_CITIES = [
  'Khulna', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi',
  'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Jessore',
  'Kushtia', 'Satkhira', 'Bagerhat', 'Cox\'s Bazar', 'Bograbd', 'Tangail'
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
  const [timings, setTimings] = useState<Timings>(initialTimings);

  // Background auto-adjust timings based on visitor device IP location
  useEffect(() => {
    const autoAdjustLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          const detectedCity = data.city;
          if (detectedCity) {
            const matchedCity = BD_CITIES.find(
              (c) =>
                c.toLowerCase() === detectedCity.toLowerCase() ||
                detectedCity.toLowerCase().includes(c.toLowerCase()) ||
                c.toLowerCase().includes(detectedCity.toLowerCase())
            );
            if (matchedCity && matchedCity !== 'Khulna') {
              const liveRes = await fetch(`/api/prayer-times/live?city=${encodeURIComponent(matchedCity)}`);
              if (liveRes.ok) {
                const liveData = await liveRes.json();
                if (liveData && liveData.timings) {
                  setTimings(liveData.timings);
                }
              }
            }
          }
        }
      } catch (e) {
        // Fallback silently to initial DB timings if IP geolocation unavailable
      }
    };

    autoAdjustLocation();
  }, []);

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
        {/* Dark Clean Centered Header Title */}
        <div 
          className="bg-[#353d4c] text-white py-2 px-3 text-center border-b border-gray-200"
        >
          <div 
            className="font-normal text-[20px] text-center tracking-tight text-white"
            style={{
              fontFamily: 'Bangla, sans-serif',
              lineHeight: '22px',
            }}
          >
            নামাজের সময়সূচি
          </div>
        </div>

        {/* Prayer Time Rows */}
        <div className="bg-white p-2 space-y-1.5">
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



