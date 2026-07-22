'use client';

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

export default function PrayerWidgetClient({ timings }: PrayerWidgetClientProps) {
  const parseTo12hBengali = (val: string, name: string) => {
    let cleanVal = toEnglishNumber(val).trim();
    const isPm = cleanVal.toLowerCase().includes('pm');
    const isAm = cleanVal.toLowerCase().includes('am');
    cleanVal = cleanVal.replace(/(am|pm)/i, '').trim();

    let [hStr, mStr] = cleanVal.split(':');
    let h = parseInt(hStr, 10);
    let m = mStr || '00';

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
    <div className="bg-white border border-gray-200 rounded-md shadow-xs overflow-hidden w-full max-w-[280px] sm:max-w-xs mx-auto font-sans select-none p-2 sm:p-2.5">
      {/* Dark Slate Top Header Bar */}
      <div className="bg-[#3c4656] text-white rounded-xs py-1.5 text-center mb-2">
        <h3 className="text-sm sm:text-base font-bold tracking-wide">
          নামাজের সময়সূচি
        </h3>
      </div>

      {/* Prayer Times List */}
      <div className="space-y-1.5 px-0.5">
        {list.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-2">
            {/* Left Gray Name Badge */}
            <div className="bg-[#f1f3f5] text-slate-800 font-bold text-xs sm:text-sm py-1 flex-1 rounded-xs text-center shadow-2xs">
              {item.name}
            </div>

            {/* Right Light Blue Time Badge */}
            <div className="bg-[#e7f5ff] text-[#1971c2] font-bold text-xs sm:text-sm py-1 flex-1 rounded-xs text-center shadow-2xs">
              {item.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
