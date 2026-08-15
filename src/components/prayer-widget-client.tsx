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
    <div className="w-full bg-white rounded-[8px] border border-gray-200 p-4 select-none">
      <div 
        className="rounded-[8px] overflow-hidden border border-gray-200 bg-white"
        style={{
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Dark Header Title */}
        <div 
          className="bg-[#353e54] text-white py-2.5 px-3 text-center font-bold"
          style={{
            fontFamily: 'Bangla, sans-serif',
            fontSize: '20px',
            lineHeight: '22px',
            letterSpacing: '-0.2px',
            textAlign: 'center',
            textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)',
          }}
        >
          নামাজের সময়সূচি
        </div>

        {/* Prayer Time Rows */}
        <div className="bg-white p-3 space-y-2.5">
          {list.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              {/* Left Grey Name Pill */}
              <div 
                className="bg-[#f1f3f5] text-[#333333] font-bold text-[16px] py-1.5 px-3 flex-1 rounded-[8px] text-center leading-tight shadow-2xs"
                style={{ fontFamily: 'Bangla, sans-serif' }}
              >
                {item.name}
              </div>

              {/* Right Blue Time Pill */}
              <div 
                className="bg-[#e7f5ff] text-[#1c7ed6] font-bold text-[16px] py-1.5 px-3 flex-1 rounded-[8px] text-center leading-tight shadow-2xs"
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
