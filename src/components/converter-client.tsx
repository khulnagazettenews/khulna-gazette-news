'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, Trash2, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { convertBijoyToUnicode, convertUnicodeToBijoy } from '@/lib/bangla-converter';

export default function ConverterClient() {
  const [mode, setMode] = useState<'bijoyToUnicode' | 'unicodeToBijoy'>('bijoyToUnicode');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [inputFullscreen, setInputFullscreen] = useState(false);
  const [outputFullscreen, setOutputFullscreen] = useState(false);

  // Perform conversion whenever input text or mode changes
  useEffect(() => {
    if (!inputText) {
      setOutputText('');
      return;
    }

    if (mode === 'bijoyToUnicode') {
      setOutputText(convertBijoyToUnicode(inputText));
    } else {
      setOutputText(convertUnicodeToBijoy(inputText));
    }
  }, [inputText, mode]);

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section matching asia-post design */}
        <div className="border-b border-gray-200 mb-4 pb-3">
          <h1 className="text-[#1a1a1a] lg:text-3xl text-2xl font-bold text-center lg:text-start">
            বিজয় ↔ ইউনিকোড কনভার্টার
          </h1>
        </div>
        <p className="mx-auto mt-4 max-w-3xl text-center text-base sm:text-lg leading-relaxed text-gray-700 lg:mx-0 lg:text-start">
          বিজয় থেকে ইউনিকোড ও ইউনিকোড থেকে বিজয়ে রূপান্তর—সংবাদ ও সম্পাদনার কাজের জন্য দ্রুত ও নির্ভুল।
        </p>

        {/* Main Card Container */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-[#f9fafb] shadow-sm">
          
          {/* Action Toolbar */}
          <div className="flex flex-col gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            
            {/* Left Badge */}
            <div className="flex items-center gap-2.5 text-gray-800">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#e60023]">
                <ArrowRightLeft className="h-4 w-4" />
              </span>
              <span className="text-base font-medium leading-snug">ওয়েব টুল · Bijoy–Unicode</span>
            </div>

            {/* Right Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
              <button
                type="button"
                onClick={() => setMode('bijoyToUnicode')}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  mode === 'bijoyToUnicode'
                    ? 'bg-[#222222] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bijoy → Unicode
              </button>

              <button
                type="button"
                onClick={() => setMode('unicodeToBijoy')}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  mode === 'unicodeToBijoy'
                    ? 'bg-[#222222] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unicode → Bijoy
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e60023] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-700 active:scale-[0.98]"
              >
                <Trash2 className="h-4 w-4" />
                মুছুন
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!outputText}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none"
                aria-label="আউটপুট কপি করুন"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 opacity-80" />
                    কপি
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Textareas Area */}
          <div className="grid gap-6 p-5 sm:p-6 lg:p-8">
            
            {/* Input Box */}
            <div className={`flex flex-col gap-2 ${inputFullscreen ? 'fixed inset-4 z-50 bg-white p-6 rounded-2xl shadow-2xl border border-gray-300' : ''}`}>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="converter-input" className="text-base font-semibold uppercase tracking-wide text-gray-600">
                  ইনপুট ({mode === 'bijoyToUnicode' ? 'Bijoy / ANSI' : 'Unicode'})
                </label>
                <button
                  type="button"
                  onClick={() => setInputFullscreen(!inputFullscreen)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-100"
                  title="Fullscreen"
                >
                  {inputFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
              <textarea
                id="converter-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={`w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-xl leading-relaxed text-gray-900 shadow-inner outline-none transition duration-200 placeholder:text-gray-400 focus:border-[#e60023] focus:ring-2 focus:ring-red-100 ${
                  inputFullscreen ? 'h-[calc(100%-40px)]' : 'min-h-[220px]'
                }`}
                placeholder="এখানে লিখুন বা পেস্ট করুন..."
                spellCheck={false}
              />
            </div>

            {/* Output Box */}
            <div className={`flex flex-col gap-2 ${outputFullscreen ? 'fixed inset-4 z-50 bg-white p-6 rounded-2xl shadow-2xl border border-gray-300' : ''}`}>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="converter-output" className="text-base font-semibold uppercase tracking-wide text-gray-600">
                  আউটপুট ({mode === 'bijoyToUnicode' ? 'Unicode' : 'Bijoy / ANSI'})
                </label>
                <button
                  type="button"
                  onClick={() => setOutputFullscreen(!outputFullscreen)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-100"
                  title="Fullscreen"
                >
                  {outputFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
              <textarea
                id="converter-output"
                value={outputText}
                readOnly
                className={`w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-xl leading-relaxed text-gray-900 shadow-inner outline-none transition duration-200 placeholder:text-gray-400 focus:border-[#e60023] focus:ring-2 focus:ring-red-100 ${
                  outputFullscreen ? 'h-[calc(100%-40px)]' : 'min-h-[220px]'
                }`}
                placeholder="রূপান্তরিত লেখা এখানে দেখা যাবে..."
                spellCheck={false}
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
