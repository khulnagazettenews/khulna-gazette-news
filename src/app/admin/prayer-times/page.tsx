'use client';

import { useEffect, useState } from 'react';
import { Clock, Save, Info, RefreshCw, Sparkles } from 'lucide-react';

const BD_DISTRICTS = [
  { city: 'Khulna', bn: 'খুলনা' },
  { city: 'Dhaka', bn: 'ঢাকা' },
  { city: 'Chittagong', bn: 'চট্টগ্রাম' },
  { city: 'Sylhet', bn: 'সিলেট' },
  { city: 'Rajshahi', bn: 'রাজশাহী' },
  { city: 'Barisal', bn: 'বরিশাল' },
  { city: 'Rangpur', bn: 'রংপুর' },
  { city: 'Mymensingh', bn: 'ময়মনসিংহ' },
  { city: 'Comilla', bn: 'কুমিল্লা' },
  { city: 'Jessore', bn: 'যশোর' },
  { city: 'Kushtia', bn: 'কুষ্টিয়া' },
  { city: 'Satkhira', bn: 'সাতক্ষীরা' },
  { city: 'Bagerhat', bn: 'বাগেরহাট' },
];

export default function PrayerTimesManagement() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedCity, setSelectedCity] = useState('Khulna');
  
  // Timings inputs
  const [fajr, setFajr] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [zohr, setZohr] = useState('');
  const [asr, setAsr] = useState('');
  const [magrib, setMagrib] = useState('');
  const [esha, setEsha] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingLive, setFetchingLive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch timings for the selected date from DB
  const fetchTimings = async (targetDate: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/prayer-times?date=${targetDate}`);
      const data = await res.json();
      if (res.ok && data) {
        setFajr(data.fajr);
        setSunrise(data.sunrise);
        setZohr(data.zohr);
        setAsr(data.asr);
        setMagrib(data.magrib);
        setEsha(data.esha);
      } else {
        setFajr('');
        setSunrise('');
        setZohr('');
        setAsr('');
        setMagrib('');
        setEsha('');
      }
    } catch (err) {
      setError('Failed to load prayer time data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      fetchTimings(date);
    }
  }, [date]);

  // Auto-fetch from live BD API for selected district
  const handleFetchLiveApi = async () => {
    setFetchingLive(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/prayer-times/live?city=${encodeURIComponent(selectedCity)}`);
      const data = await res.json();
      if (res.ok && data && data.timings) {
        setFajr(data.timings.fajr);
        setSunrise(data.timings.sunrise);
        setZohr(data.timings.zohr);
        setAsr(data.timings.asr);
        setMagrib(data.timings.magrib);
        setEsha(data.timings.esha);
        setSuccess(`Live prayer timings for ${selectedCity} fetched successfully. You may customize or save them.`);
      } else {
        setError(data.error || 'Failed to load live prayer timings.');
      }
    } catch (err) {
      setError('Live service connection failed.');
    } finally {
      setFetchingLive(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !fajr || !sunrise || !zohr || !asr || !magrib || !esha) {
      setError('All prayer time fields are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = { date, fajr, sunrise, zohr, asr, magrib, esha };

    try {
      const res = await fetch('/api/prayer-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Prayer schedule saved successfully.');
      } else {
        setError(data.error || 'Failed to save prayer timings.');
      }
    } catch (err) {
      setError('Failed to send request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl font-sans">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Prayer Times Management</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Fetch live prayer timings from BD API or manually customize prayer schedules.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        {/* Date Selector & Live API Fetch Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <Clock className="text-red-600 shrink-0" size={24} />
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-red-500 bg-slate-50"
              />
            </div>
          </div>

          {/* District selector + Fetch Live Button */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-slate-50 text-slate-700 cursor-pointer"
            >
              {BD_DISTRICTS.map((d) => (
                <option key={d.city} value={d.city}>
                  {d.city}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleFetchLiveApi}
              disabled={fetchingLive}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-indigo-200 flex items-center gap-1.5 transition shrink-0 disabled:opacity-50"
            >
              {fetchingLive ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} className="text-indigo-600" />
              )}
              <span>Fetch Live</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 font-bold text-xs">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
            Loading prayer schedule...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 text-xs text-blue-800 font-semibold flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
              <p>
                Enter custom prayer times below (e.g. 04:15 or 05:40). These will be displayed on the public widget.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Fajr</label>
                <input
                  type="text"
                  value={fajr}
                  onChange={(e) => setFajr(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-red-500 bg-slate-50 transition"
                  placeholder="e.g. 04:15"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Sunrise</label>
                <input
                  type="text"
                  value={sunrise}
                  onChange={(e) => setSunrise(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-red-500 bg-slate-50 transition"
                  placeholder="e.g. 05:40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Dhuhr (Zohr)</label>
                <input
                  type="text"
                  value={zohr}
                  onChange={(e) => setZohr(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-red-500 bg-slate-50 transition"
                  placeholder="e.g. 12:15"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Asr</label>
                <input
                  type="text"
                  value={asr}
                  onChange={(e) => setAsr(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-red-500 bg-slate-50 transition"
                  placeholder="e.g. 15:30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Maghrib</label>
                <input
                  type="text"
                  value={magrib}
                  onChange={(e) => setMagrib(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-red-500 bg-slate-50 transition"
                  placeholder="e.g. 18:48"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Isha</label>
                <input
                  type="text"
                  value={esha}
                  onChange={(e) => setEsha(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-red-500 bg-slate-50 transition"
                  placeholder="e.g. 20:15"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{submitting ? 'Saving...' : 'Save Prayer Schedule'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

