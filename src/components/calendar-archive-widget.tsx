'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banglaMonths = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const englishMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const weekDaysBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

const toBanglaNum = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((char) => (/\d/.test(char) ? bnDigits[parseInt(char)] : char))
    .join('');
};

export default function CalendarArchiveWidget() {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // Default August
  const [selectedDay, setSelectedDay] = useState<number>(12);

  useEffect(() => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  }, []);

  // Generate Year Options (e.g., from 2020 to current year + 1)
  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Create grid cells (previous month days + current month days + next month days to make 35 or 42 grid cells)
  const days = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPrev: true,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    days.push({
      day: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let n = 1; n <= remainingCells; n++) {
    days.push({
      day: n,
      isCurrentMonth: false,
      isNext: true,
    });
  }

  const handleSearch = () => {
    const monthFormatted = String(currentMonth + 1).padStart(2, '0');
    const dayFormatted = String(selectedDay).padStart(2, '0');
    const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;
    router.push(`/archive?date=${dateStr}`);
  };

  return (
    <div className="w-full bg-white p-2 rounded-lg border border-gray-200 shadow-2xs select-none">
      <div className="rounded overflow-hidden border border-gray-200">
        {/* Dark Header Banner */}
        <div 
          className="bg-[#353d4c] text-white py-1 px-2 text-center font-normal border-b border-gray-200"
          style={{
            fontFamily: 'Bangla, sans-serif',
            fontSize: '20px',
            fontWeight: 400,
            lineHeight: '22px',
            letterSpacing: '-0.2px',
            textAlign: 'center',
          }}
        >
          আর্কাইভ
        </div>

        {/* Content Body */}
        <div className="bg-white p-2 space-y-1.5">
          {/* Month Year Banner with Nav Buttons */}
          <div className="flex items-center justify-between text-[#000000] font-bold text-[14px] sm:text-[15px] px-1">
            <button
              onClick={handlePrevMonth}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-800 transition cursor-pointer"
              aria-label="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="tracking-tight font-bold text-[#000000]">
              {banglaMonths[currentMonth]} {toBanglaNum(currentYear)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-800 transition cursor-pointer"
              aria-label="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dropdown Pickers */}
          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="bg-white border border-gray-300 rounded px-1.5 py-1 text-[12px] sm:text-[13px] font-bold text-[#000000] outline-none focus:ring-1 focus:ring-red-500 cursor-pointer text-center"
            >
              {banglaMonths.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="bg-white border border-gray-300 rounded px-1.5 py-1 text-[12px] sm:text-[13px] font-bold text-[#000000] outline-none focus:ring-1 focus:ring-red-500 cursor-pointer text-center"
            >
              {years.map((yr) => (
                <option key={yr} value={yr}>
                  {toBanglaNum(yr)}
                </option>
              ))}
            </select>
          </div>

          {/* Calendar Grid Container */}
          <div className="bg-white rounded border border-gray-200 p-1 sm:p-1.5">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 text-center font-bold text-[11px] sm:text-[12px] text-[#1e293b] mb-1 border-b border-gray-200 pb-0.5">
              {weekDaysBn.map((day) => (
                <div key={day} className="py-0.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 text-center gap-y-0.5 gap-x-0.5 text-[12px] sm:text-[13px] font-bold">
              {days.map((item, idx) => {
                if (!item.isCurrentMonth) {
                  return (
                    <div
                      key={idx}
                      className="py-0.5 text-gray-300 pointer-events-none select-none font-normal"
                    >
                      {toBanglaNum(item.day)}
                    </div>
                  );
                }

                const isSelected = selectedDay === item.day;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(item.day)}
                    className={`py-0.5 rounded transition-colors text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#1d4ed8] text-white font-bold shadow-2xs'
                        : 'text-[#000000] hover:bg-gray-100 font-bold'
                    }`}
                  >
                    {toBanglaNum(item.day)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Archive Button */}
          <button
            onClick={handleSearch}
            className="w-full bg-[#bd081c] hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded text-[13px] sm:text-[14px] transition shadow-xs cursor-pointer flex items-center justify-center gap-1"
          >
            আর্কাইভ খুঁজুন
          </button>
        </div>
      </div>
    </div>
  );
}
