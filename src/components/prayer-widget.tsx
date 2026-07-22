import { prisma } from '@/lib/prisma';

const toBengaliNumber = (numStr: string) => {
  const bnNums: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return numStr.replace(/[0-9]/g, (w) => bnNums[w] || w);
};

const formatTime12h = (time24?: string) => {
  if (!time24) return '';
  const cleanTime = time24.split(' ')[0];
  const [hStr, mStr] = cleanTime.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  const formattedH = h < 10 ? `0${h}` : `${h}`;
  return toBengaliNumber(`${formattedH}:${m}`);
};

const getBengaliDate = (date: Date) => {
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const dayStr = toBengaliNumber(date.getDate().toString());
  const monthStr = months[date.getMonth()];
  const yearStr = toBengaliNumber(date.getFullYear().toString());
  return `${dayStr} ${monthStr}, ${yearStr}`;
};

const getBengaliDayName = (date: Date) => {
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  return days[date.getDay()];
};

export default async function PrayerWidget() {
  const today = new Date();
  const cleanDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Check DB custom override
  const dbTimes = await prisma.prayerTime.findUnique({
    where: { date: cleanDate }
  });

  let timings = {
    fajr: '০৪:০৪',
    sunrise: '০৫:২৮',
    zohr: '১২:০৮',
    asr: '০৩:২৮',
    magrib: '০৬:৪৮',
    esha: '০৮:১২'
  };

  if (dbTimes) {
    timings = {
      fajr: dbTimes.fajr,
      sunrise: dbTimes.sunrise,
      zohr: dbTimes.zohr,
      asr: dbTimes.asr,
      magrib: dbTimes.magrib,
      esha: dbTimes.esha
    };
  } else {
    // Fetch live real prayer times from Aladhan API for Khulna, Bangladesh
    try {
      const res = await fetch(
        'http://api.aladhan.com/v1/timingsByCity?city=Khulna&country=Bangladesh&method=1',
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.timings) {
          const t = json.data.timings;
          timings = {
            fajr: formatTime12h(t.Fajr),
            sunrise: formatTime12h(t.Sunrise),
            zohr: formatTime12h(t.Dhuhr),
            asr: formatTime12h(t.Asr),
            magrib: formatTime12h(t.Maghrib),
            esha: formatTime12h(t.Isha),
          };
        }
      }
    } catch (err) {
      console.error('Failed to fetch live prayer timings:', err);
    }
  }

  const list = [
    { name: 'ফজর', time: timings.fajr },
    { name: 'সূর্যোদয়', time: timings.sunrise },
    { name: 'জোহর', time: timings.zohr },
    { name: 'আছর', time: timings.asr },
    { name: 'মাগরিব', time: timings.magrib },
    { name: 'এশা', time: timings.esha },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#01241c] via-[#023326] to-[#011d16] text-white shadow-lg p-5">
      {/* Decorative Arch Border (Mihrab) */}
      <svg className="absolute inset-0 w-full h-full text-amber-500/10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path 
          d="M 6 94 L 6 28 C 6 14, 26 14, 46 14 C 48 14, 49 12, 50 9 C 51 12, 52 14, 54 14 C 74 14, 94 14, 94 28 L 94 94 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.75" 
          strokeDasharray="2 2"
        />
      </svg>

      {/* Mosque Dome Silhouette Background at top */}
      <div className="absolute top-0 inset-x-0 opacity-10 pointer-events-none flex justify-center overflow-hidden">
        <svg className="w-full h-20 text-amber-400" viewBox="0 0 100 30" preserveAspectRatio="none" fill="currentColor">
          <path d="M 5 30 L 5 10 L 8 10 L 8 4 L 9.5 2 L 11 4 L 11 10 L 14 10 L 14 30 Z" />
          <path d="M 18 30 L 18 15 L 20 15 L 20 8 L 21 6 L 22 8 L 22 15 L 24 15 L 24 30 Z" />
          <path d="M 32 30 L 32 20 Q 32 12, 42 12 Q 42 6, 50 2 C 58 6, 58 12, 68 12 Q 68 20, 68 30 Z" />
          <path d="M 76 30 L 76 15 L 78 15 L 78 8 L 79 6 L 80 8 L 80 15 L 82 15 L 82 30 Z" />
          <path d="M 86 30 L 86 10 L 89 10 L 89 4 L 90.5 2 L 92 4 L 92 10 L 95 10 L 95 30 Z" />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Glowing crescent moon & star */}
        <div className="mb-2">
          <svg className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-8.9 8.2-9.8.5-.1 1 .2 1.1.7.2.5-.1 1.1-.6 1.3-3.2.9-5.4 3.8-5.4 7.2 0 4.1 3.4 7.5 7.5 7.5 2.7 0 5.2-1.5 6.4-3.9.2-.5.8-.7 1.3-.5.5.2.7.8.5 1.3-1.8 3.7-5.5 6.2-9.6 6.2z"/>
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-center text-amber-300 tracking-tight">
          নামাজের সময়সূচি
        </h3>
        
        <p className="text-[10px] font-bold text-amber-400/80 tracking-wide mt-0.5">
          খুলনা ও পার্শ্ববর্তী এলাকা
        </p>

        {/* Date Display */}
        <div className="text-[10px] font-medium text-emerald-200/90 text-center mt-2 bg-emerald-950/50 py-1 px-3.5 rounded-full border border-emerald-800/40 shadow-inner">
          {getBengaliDayName(today)} • {getBengaliDate(today)}
        </div>

        {/* Timings List */}
        <div className="w-full mt-4 space-y-1.5">
          {list.map((item) => {
            const isSunrise = item.name === 'সূর্যোদয়';
            return (
              <div
                key={item.name}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-300 ${
                  isSunrise
                    ? 'bg-amber-950/20 border-amber-500/10 hover:border-amber-500/35 hover:bg-amber-950/30'
                    : 'bg-emerald-950/30 border-emerald-500/10 hover:border-amber-500/30 hover:bg-emerald-900/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Rub el Hizb 8-pointed star icon */}
                  <div className="relative flex items-center justify-center w-4 h-4 text-amber-500/80 group-hover:text-amber-400 group-hover:rotate-45 transition-all duration-500">
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="5" y="5" width="14" height="14" rx="1.5" transform="rotate(0 12 12)" />
                      <rect x="5" y="5" width="14" height="14" rx="1.5" transform="rotate(45 12 12)" />
                      <circle cx="12" cy="12" r="2" className="fill-[#023326] group-hover:fill-amber-900/50 transition-colors" />
                    </svg>
                  </div>
                  <span className={`font-bold text-xs tracking-wide ${isSunrise ? 'text-amber-300/80' : 'text-emerald-100 group-hover:text-white'}`}>
                    {item.name}
                  </span>
                </div>
                
                {/* Time Badge */}
                <span className={`font-extrabold text-xs px-2.5 py-0.5 rounded-lg font-mono border transition-all duration-300 ${
                  isSunrise
                    ? 'text-amber-400 bg-amber-950/60 border-amber-500/30 group-hover:border-amber-400 group-hover:bg-amber-950/80'
                    : 'text-amber-300 bg-emerald-950/60 border-emerald-800/40 group-hover:border-amber-400 group-hover:bg-amber-950/60'
                }`}>
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>

        {/* Forbidden times note */}
        <div className="w-full mt-4 pt-3 border-t border-emerald-800/40 text-center">
          <p className="text-[9px] text-emerald-200/50 font-medium leading-relaxed select-none">
            * সূর্যোদয়, দ্বী-প্রহর ও সূর্যাস্তের সময় নামাজ পড়া নিষেধ।
          </p>
        </div>
      </div>
    </div>
  );
}
