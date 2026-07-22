import { prisma } from '@/lib/prisma';
import PrayerWidgetClient from './prayer-widget-client';

const toBengaliNumber = (numStr: string) => {
  const bnNums: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return numStr.replace(/[0-9]/g, (w) => bnNums[w] || w);
};

const getBengaliDate = (date: Date) => {
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const dayStr = toBengaliNumber(date.getDate().toString());
  const monthStr = months[date.getMonth()];
  const yearStr = toBengaliNumber(date.getFullYear().toString());
  return `${dayStr} ${monthStr} ${yearStr}`;
};

const getBengaliDayName = (date: Date) => {
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  return days[date.getDay()];
};

export default async function PrayerWidget() {
  const today = new Date();
  const cleanDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Check DB custom overrides first
  const dbTimes = await prisma.prayerTime.findUnique({
    where: { date: cleanDate }
  });

  let timings = {
    fajr: '04:04',
    sunrise: '05:28',
    zohr: '12:08',
    asr: '15:28',
    magrib: '18:48',
    esha: '20:12'
  };

  let hijriDateStr = '৮ সফর ১৪৪৮'; // default fallback for July 22, 2026

  if (dbTimes) {
    timings = {
      fajr: dbTimes.fajr,
      sunrise: dbTimes.sunrise,
      zohr: dbTimes.zohr,
      asr: dbTimes.asr,
      magrib: dbTimes.magrib,
      esha: dbTimes.esha
    };
  }

  // Fetch live prayer times and date info from Aladhan API
  try {
    const res = await fetch(
      'http://api.aladhan.com/v1/timingsByCity?city=Khulna&country=Bangladesh&method=1',
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.timings) {
        const t = json.data.timings;
        // Keep English 24h format for client processing
        if (!dbTimes) {
          timings = {
            fajr: t.Fajr.split(' ')[0],
            sunrise: t.Sunrise.split(' ')[0],
            zohr: t.Dhuhr.split(' ')[0],
            asr: t.Asr.split(' ')[0],
            magrib: t.Maghrib.split(' ')[0],
            esha: t.Isha.split(' ')[0],
          };
        }

        const hijri = json.data.date.hijri;
        const hijriMonths: Record<string, string> = {
          'Muharram': 'মহররম',
          'Safar': 'সফর',
          'Rabi\' al-awwal': 'রবিউল আউয়াল',
          'Rabi\' ath-thani': 'রবিউস সানি',
          'Jumada al-awwal': 'জমাদিউল আউয়াল',
          'Jumada ath-thani': 'জমাদিউস সানি',
          'Rajab': 'রজব',
          'Sha\'ban': 'শাবান',
          'Ramadan': 'রমজান',
          'Shawwal': 'শাওয়াল',
          'Dhu al-Qa\'dah': 'জিলকদ',
          'Dhu al-Hijjah': 'জিলহজ'
        };
        const monthBn = hijriMonths[hijri.month.en] || hijri.month.en;
        hijriDateStr = `${toBengaliNumber(hijri.day)} ${monthBn} ${toBengaliNumber(hijri.year)}`;
      }
    }
  } catch (err) {
    console.error('Failed to fetch live prayer timings:', err);
  }

  const gregorianDateStr = `${getBengaliDayName(today)} - ${getBengaliDate(today)}`;

  return (
    <PrayerWidgetClient 
      timings={timings}
      hijriDate={hijriDateStr}
      gregorianDate={gregorianDateStr}
    />
  );
}
