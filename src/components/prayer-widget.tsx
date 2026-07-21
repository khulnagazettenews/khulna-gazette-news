import { prisma } from '@/lib/prisma';
import { Clock } from 'lucide-react';

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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Dark Slate Header */}
      <div className="bg-[#1e293b] text-white py-3 px-4 text-center font-black text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2">
        <Clock size={16} className="text-red-400 animate-pulse" />
        <span>নামাজের সময়সূচি (খুলনা)</span>
      </div>

      <div className="p-3.5 space-y-1.5 bg-slate-50/50">
        {list.map((item) => (
          <div key={item.name} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-sky-100 shadow-2xs">
            <span className="font-bold text-xs text-slate-700">{item.name}</span>
            <span className="font-extrabold text-xs text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md font-mono border border-sky-100">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
