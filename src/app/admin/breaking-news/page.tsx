'use client';

import { useEffect, useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Type,
  ToggleLeft,
  ToggleRight,
  Info,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  Radio,
  Newspaper,
} from 'lucide-react';

export default function BreakingNewsAdminPage() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [titles, setTitles] = useState<string[]>(['']);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTickerConfig();
  }, []);

  const fetchTickerConfig = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/breaking-news');
      const data = await res.json();
      if (res.ok) {
        setIsActive(Boolean(data.isActive));
        if (Array.isArray(data.titles) && data.titles.length > 0) {
          setTitles(data.titles);
        } else {
          setTitles(['']);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'কনফিগারেশন লোড করা যায়নি' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে' });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (index: number, value: string) => {
    const updated = [...titles];
    updated[index] = value;
    setTitles(updated);
  };

  const handleAddTitle = () => {
    setTitles([...titles, '']);
  };

  const handleRemoveTitle = (index: number) => {
    if (titles.length === 1) {
      setTitles(['']);
      return;
    }
    const updated = titles.filter((_, i) => i !== index);
    setTitles(updated);
  };

  const moveTitle = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= titles.length) return;
    const updated = [...titles];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTitles(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const cleanTitles = titles.map((t) => t.trim()).filter(Boolean);

      const res = await fetch('/api/breaking-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive,
          titles: cleanTitles,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'সফলভাবে সংরক্ষিত হয়েছে।' });
        if (cleanTitles.length > 0) {
          setTitles(cleanTitles);
        } else {
          setTitles(['']);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'সংরক্ষণ করতে সমস্যা হয়েছে' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'সংরক্ষণকালে নেটওয়ার্ক সমস্যা হয়েছে' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3 text-slate-600 font-medium">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">সর্বশেষ টিকারে সেটিংস লোড করা হচ্ছে...</span>
        </div>
      </div>
    );
  }

  const activeTitles = titles.filter((t) => t.trim().length > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-7 font-sans">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800 text-white">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" />
              <span>Live Ticker Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              'সর্বশেষ' কাস্টম টেক্সট টিকার
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              মূল সংবাদের সাথে কোনোরকম লিঙ্ক ছাড়াই স্বাধীন হেডিং বা জরুরী বিজ্ঞপ্তি লিখুন, যা পোর্টালের শীর্ষে লাল 'সর্বশেষ' বারে স্ক্রোল করবে।
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg hover:shadow-red-900/40 active:scale-98 disabled:opacity-50 text-sm shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 border text-sm font-semibold shadow-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Mode Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode 1: Custom Text Mode */}
        <div
          onClick={() => setIsActive(true)}
          className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            isActive
              ? 'bg-red-50/60 border-red-600 shadow-md ring-1 ring-red-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  isActive ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">কাস্টম টেক্সট মোড</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">স্বাধীন কাস্টম হেডিং দেখাবে</p>
              </div>
            </div>
            <input
              type="radio"
              checked={isActive}
              onChange={() => setIsActive(true)}
              className="w-4 h-4 text-red-600 focus:ring-red-600 accent-red-600 cursor-pointer mt-1"
            />
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-200/60">
            নিচে আপনার দেওয়া স্বাধীন টেক্সটসমূহ ওয়েবসাইট শীর্ষে লাল বারে দেখাবে। মূল খবরের পেজের সাথে কোনো কানেকশন থাকবে না।
          </p>
        </div>

        {/* Mode 2: Auto News Mode */}
        <div
          onClick={() => setIsActive(false)}
          className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            !isActive
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  !isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className={`font-bold text-base ${!isActive ? 'text-white' : 'text-slate-900'}`}
                >
                  অটো নিউজ মোড (ডিফল্ট)
                </h3>
                <p
                  className={`text-xs font-medium mt-0.5 ${
                    !isActive ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  সরাসরি ওয়েবসাইটের সংবাদ স্ক্রোল করবে
                </p>
              </div>
            </div>
            <input
              type="radio"
              checked={!isActive}
              onChange={() => setIsActive(false)}
              className="w-4 h-4 text-red-600 focus:ring-red-600 accent-red-600 cursor-pointer mt-1"
            />
          </div>

          <p
            className={`text-xs leading-relaxed p-3 rounded-xl border ${
              !isActive
                ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                : 'bg-slate-50 border-slate-200/60 text-slate-600'
            }`}
          >
            পাবলিশ হওয়া লেটেস্ট ব্রেকিং নিউজ এবং সংবাদগুলো স্বয়ংক্রিয়ভাবে হেডলাইন আকারে রিডারদের দেখানো হবে।
          </p>
        </div>
      </div>

      {/* 3. Live Marquee Preview */}
      {isActive && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-red-600" />
              <span>লাইভ ওয়েবসাইট প্রিভিউ (Live Preview)</span>
            </span>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {activeTitles.length} টি টেক্সট অ্যাক্টিভ
            </span>
          </div>

          <div className="w-full bg-slate-900 p-2 rounded-xl overflow-hidden shadow-inner">
            <div className="flex items-center overflow-hidden rounded-md bg-[#cc2b2b]">
              <div className="bg-black text-white px-4 py-1 text-sm font-bold shrink-0">
                সর্বশেষ
              </div>
              <div className="overflow-hidden whitespace-nowrap py-1.5 px-3 flex items-center gap-6 text-white text-sm font-medium w-full">
                {activeTitles.length > 0 ? (
                  activeTitles.map((t, idx) => (
                    <span key={idx} className="flex items-center gap-3">
                      <span>{t}</span>
                      <span className="text-yellow-300 text-xs">◆</span>
                    </span>
                  ))
                ) : (
                  <span className="text-white/70 italic text-xs">
                    (কোনো টেক্সট ইনপুট দেওয়া হয়নি)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Headline Text Inputs */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2.5">
              <Type className="w-5 h-5 text-red-600" />
              <span>কাস্টম শিরোনামের তালিকা</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              পর পর টেক্সট ইনপুট দিন। টিকারে এগুলো পর পর স্বয়ংক্রিয়ভাবে লুপ হতে থাকবে।
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddTitle}
            className="inline-flex items-center justify-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন শিরোনাম যোগ করুন</span>
          </button>
        </div>

        <div className="space-y-3">
          {titles.map((title, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-white transition shadow-2xs group"
            >
              <div className="flex flex-col gap-0.5 px-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveTitle(index, 'up')}
                  className="text-slate-400 hover:text-slate-800 disabled:opacity-20 transition"
                  title="উপরে সরান"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === titles.length - 1}
                  onClick={() => moveTitle(index, 'down')}
                  className="text-slate-400 hover:text-slate-800 disabled:opacity-20 transition"
                  title="নিচে সরান"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xs font-bold text-slate-400 w-6 text-center shrink-0">
                #{index + 1}
              </span>

              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                placeholder="যেমন: খুলনা অঞ্চলে তীব্র তাপপ্রবাহের সতর্কতা..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition font-medium"
              />

              <button
                type="button"
                onClick={() => handleRemoveTitle(index)}
                title="মুছে ফেলুন"
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleAddTitle}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-5 py-2.5 rounded-xl transition"
          >
            <Plus className="w-4 h-4 text-red-600" />
            <span>আরেকটি শিরোনাম লাইন যুক্ত করুন</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-8 py-2.5 rounded-xl transition shadow-md hover:shadow-red-900/30 disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তনগুলো সেভ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
