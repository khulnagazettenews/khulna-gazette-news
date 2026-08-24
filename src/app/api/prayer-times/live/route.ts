import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || 'Khulna';

    const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Bangladesh&method=1`;

    const res = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'এপিআই থেকে তথ্য পাওয়া যায়নি।' }, { status: 502 });
    }

    const data = await res.json();
    if (!data || !data.data || !data.data.timings) {
      return NextResponse.json({ error: 'সঠিক সময় পাওয়া যায়নি।' }, { status: 404 });
    }

    const t = data.data.timings;
    const timings = {
      fajr: t.Fajr.split(' ')[0],
      sunrise: t.Sunrise.split(' ')[0],
      zohr: t.Dhuhr.split(' ')[0],
      asr: t.Asr.split(' ')[0],
      magrib: t.Maghrib.split(' ')[0],
      esha: t.Isha.split(' ')[0],
    };

    let hijriDateStr = '';
    if (data.data.date && data.data.date.hijri) {
      const hijri = data.data.date.hijri;
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
        'Dhu al-Hijjah': 'জিলহজ',
      };
      const monthBn = hijriMonths[hijri.month.en] || hijri.month.en;
      hijriDateStr = `${hijri.day} ${monthBn} ${hijri.year}`;
    }

    return NextResponse.json({
      city,
      timings,
      hijriDate: hijriDateStr,
    });
  } catch (error) {
    console.error('Error fetching live prayer times:', error);
    return NextResponse.json({ error: 'সার্ভার সমস্যা হয়েছে।' }, { status: 500 });
  }
}
