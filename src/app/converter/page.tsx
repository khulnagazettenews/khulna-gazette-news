'use client';

import { useState } from 'react';
import Link from 'next/link';

const currencyRates: Record<string, number> = {
  BDT: 1,
  USD: 118.5,
  EUR: 128.2,
  GBP: 151.4,
  INR: 1.41,
  SAR: 31.6,
  AED: 32.2,
  MYR: 26.8,
};

export default function ConverterPage() {
  const [activeTab, setActiveTab] = useState<'currency' | 'unit'>('currency');

  // Currency state
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('BDT');

  // Unit converter state
  const [unitType, setUnitType] = useState<'length' | 'weight'>('weight');
  const [unitValue, setUnitValue] = useState<number>(1);
  const [unitFrom, setUnitFrom] = useState<string>('kg');
  const [unitTo, setUnitTo] = useState<string>('gram');

  // Convert Currency
  const convertCurrency = () => {
    const fromRate = currencyRates[fromCurrency] || 1;
    const toRate = currencyRates[toCurrency] || 1;
    const amountInBDT = amount * fromRate;
    return (amountInBDT / toRate).toFixed(2);
  };

  // Convert Units
  const convertUnit = () => {
    if (unitType === 'weight') {
      if (unitFrom === 'kg' && unitTo === 'gram') return (unitValue * 1000).toFixed(2);
      if (unitFrom === 'gram' && unitTo === 'kg') return (unitValue / 1000).toFixed(4);
      if (unitFrom === 'kg' && unitTo === 'mon') return (unitValue / 40).toFixed(3); // 1 mon = 40 kg
      if (unitFrom === 'mon' && unitTo === 'kg') return (unitValue * 40).toFixed(2);
    }
    return unitValue.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-red-600">হোম</Link>
          <span>»</span>
          <span className="font-bold text-gray-900">কনভার্টার</span>
        </div>

        {/* Title Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            অনলাইন ডিজিটাল কনভার্টার (Converter)
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            সহজেই যেকোনো মুদ্রার বিনিময় হার (Currency Rates) এবং একক রূপান্তর (Unit Converter) হিসাব করুন।
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('currency')}
            className={`pb-3 px-4 font-bold text-base border-b-2 transition ${
              activeTab === 'currency'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            মুদ্রা রূপান্তর (Currency Converter)
          </button>
          <button
            onClick={() => setActiveTab('unit')}
            className={`pb-3 px-4 font-bold text-base border-b-2 transition ${
              activeTab === 'unit'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            একক রূপান্তর (Unit Converter)
          </button>
        </div>

        {/* Currency Converter Form */}
        {activeTab === 'currency' && (
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-red-600 pl-3">
              মুদ্রা বিনিময় ক্যালকুলেটর
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">পরিমাণ (Amount)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">হতে (From)</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-base font-bold bg-white"
                >
                  <option value="BDT">BDT (বাংলাদেশি টাকা)</option>
                  <option value="USD">USD (ইউএস ডলার)</option>
                  <option value="EUR">EUR (ইউরো)</option>
                  <option value="GBP">GBP (পাউন্ড)</option>
                  <option value="INR">INR (রুপি)</option>
                  <option value="SAR">SAR (সৌদি রিয়াল)</option>
                  <option value="AED">AED (দুবাই দিরহাম)</option>
                  <option value="MYR">MYR (মালয়েশিয়ান রিঙ্গিত)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">প্রাপ্য (To)</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-base font-bold bg-white"
                >
                  <option value="BDT">BDT (বাংলাদেশি টাকা)</option>
                  <option value="USD">USD (ইউএস ডলার)</option>
                  <option value="EUR">EUR (ইউরো)</option>
                  <option value="GBP">GBP (পাউন্ড)</option>
                  <option value="INR">INR (রুপি)</option>
                  <option value="SAR">SAR (সৌদি রিয়াল)</option>
                  <option value="AED">AED (দুবাই দিরহাম)</option>
                  <option value="MYR">MYR (মালয়েশিয়ান রিঙ্গিত)</option>
                </select>
              </div>
            </div>

            {/* Output Box */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
              <span className="text-sm font-medium text-gray-600 block mb-1">রূপান্তরিত ফলাফল</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-red-600">
                {amount} {fromCurrency} = {convertCurrency()} {toCurrency}
              </div>
            </div>
          </div>
        )}

        {/* Unit Converter Form */}
        {activeTab === 'unit' && (
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-red-600 pl-3">
              ওজন ও পরিমাপ রূপান্তর
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">পরিমাণ</label>
                <input
                  type="number"
                  value={unitValue}
                  onChange={(e) => setUnitValue(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">একক হতে (From)</label>
                <select
                  value={unitFrom}
                  onChange={(e) => setUnitFrom(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-base font-bold bg-white"
                >
                  <option value="kg">কেজি (Kilogram)</option>
                  <option value="gram">গ্রাম (Gram)</option>
                  <option value="mon">মণ (Mon / 40kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">একক রূপান্তর (To)</label>
                <select
                  value={unitTo}
                  onChange={(e) => setUnitTo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-base font-bold bg-white"
                >
                  <option value="gram">গ্রাম (Gram)</option>
                  <option value="kg">কেজি (Kilogram)</option>
                  <option value="mon">মণ (Mon / 40kg)</option>
                </select>
              </div>
            </div>

            {/* Output Box */}
            <div className="bg-gray-100 border border-gray-300 rounded-xl p-5 text-center">
              <span className="text-sm font-medium text-gray-600 block mb-1">ফলাফল</span>
              <div className="text-3xl font-extrabold text-gray-900">
                {unitValue} {unitFrom} = {convertUnit()} {unitTo}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
