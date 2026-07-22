import { prisma } from '@/lib/prisma';
import PublicHeaderClient from './public-header-client';

function getBengaliFullDate() {
  const date = new Date();
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  const toBengaliNumber = (num: number | string) => {
    const numbers: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return num.toString().split('').map(digit => numbers[digit] || digit).join('');
  };

  const dayName = days[date.getDay()];
  const dateNum = toBengaliNumber(date.getDate());
  const monthName = months[date.getMonth()];
  const yearNum = toBengaliNumber(date.getFullYear());

  // Gregorian part: বুধবার, ২২শে জুলাই, ২০২৬
  const gregorianPart = `${dayName} । ${dateNum}শে ${monthName}, ${yearNum}`;

  // Bengali calendar part: ৭ই শ্রাবণ, ১৪৩৩
  let bYear = date.getFullYear() - 593;
  if (date.getMonth() < 3 || (date.getMonth() === 3 && date.getDate() < 14)) {
    bYear = date.getFullYear() - 594;
  }

  const monthStarts = [
    { name: 'বৈশাখ', m: 3, d: 14 },
    { name: 'জ্যৈষ্ঠ', m: 4, d: 15 },
    { name: 'আষাঢ়', m: 5, d: 16 },
    { name: 'শ্রাবণ', m: 6, d: 16 },
    { name: 'ভাদ্র', m: 7, d: 16 },
    { name: 'আশ্বিন', m: 8, d: 16 },
    { name: 'কার্তিক', m: 9, d: 16 },
    { name: 'অগ্রহায়ণ', m: 10, d: 15 },
    { name: 'পৌষ', m: 11, d: 15 },
    { name: 'মাঘ', m: 0, d: 15 },
    { name: 'ফাল্গুন', m: 1, d: 14 },
    { name: 'চৈত্র', m: 2, d: 15 },
  ];

  let bMonthName = '';
  let bDay = 1;

  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  for (let i = 11; i >= 0; i--) {
    const start = monthStarts[i];
    const startDate = new Date(date.getFullYear(), start.m, start.d);
    if (d1 >= startDate) {
      bMonthName = start.name;
      const diffTime = d1.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      bDay = diffDays + 1;
      break;
    }
  }

  if (!bMonthName) {
    bMonthName = 'পৌষ';
    const startDate = new Date(date.getFullYear() - 1, 11, 15);
    const diffTime = d1.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    bDay = diffDays + 1;
  }

  const suffix = bDay === 1 ? 'লা' : (bDay === 2 || bDay === 3 || bDay === 4) ? 'রা' : 'ই';
  const bengaliPart = `${toBengaliNumber(bDay)}${suffix} ${bMonthName}, ${toBengaliNumber(bYear)}`;

  return `${gregorianPart} । ${bengaliPart}`;
}

export default async function PublicHeader() {
  // Fetch categories with nested subcategories
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { parentId: null },
        { parentId: { isSet: false } }
      ]
    },
    orderBy: { order: 'asc' },
    include: {
      subCategories: {
        orderBy: { order: 'asc' },
      },
    },
  });

  const formattedDate = getBengaliFullDate();

  return (
    <header className="bg-white">
      <PublicHeaderClient categories={categories} formattedDate={formattedDate} />
    </header>
  );
}
