import { prisma } from '@/lib/prisma';
import { Clock } from 'lucide-react';

export default async function PrayerWidget() {
  const today = new Date();
  const cleanDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const times = await prisma.prayerTime.findUnique({
    where: { date: cleanDate }
  });

  // Fallback default times for Khulna location
  const timings = times || {
    fajr: '০৪:১৫ মি.',
    sunrise: '০৫:৪০ মি.',
    zohr: '১২:১৫ মি.',
    asr: '০৪:৩০ মি.',
    magrib: '০৬:৫০ মি.',
    esha: '০৮:১৫ মি.'
  };

  const list = [
    { name: 'ফজর', time: timings.fajr },
    { name: 'সূর্যোদয়', time: timings.sunrise },
    { name: 'যোহর', time: timings.zohr },
    { name: 'আছর', time: timings.asr },
    { name: 'মাগরিব', time: timings.magrib },
    { name: 'এশা', time: timings.esha },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
      <h3 className="font-bold text-gray-800 text-sm border-l-4 border-red-600 pl-2.5 flex items-center gap-2">
        <Clock size={16} className="text-red-600" />
        <span>নামাজের সময়সূচি (খুলনা)</span>
      </h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {list.map((item) => (
          <div key={item.name} className="flex justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span className="font-medium text-gray-500">{item.name}</span>
            <span className="font-bold text-slate-800">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
