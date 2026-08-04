'use client';

import { useState } from 'react';
import { Plus, Trash2, Calendar, Upload, FileText, CheckCircle2 } from 'lucide-react';

interface EducationField {
  certificate: string;
  institute: string;
  passingYear: string;
}

interface JobField {
  designation: string;
  organization: string;
}

const bengaliDays = [
  '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০', 
  '১১', '১২', '১৩', '১৪', '১৫', '১৬', '১৭', '১৮', '১৯', '২০', 
  '২১', '২২', '২৩', '২৪', '২৫', '২৬', '২৭', '২৮', '২৯', '৩০', '৩১'
];

const bengaliMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const bengaliYears = [
  '২০২৬', '২০২৫', '২০২৪', '২০২৩', '২০২২', '২০২১', '২০২০', '২০১৯', '২০১৮', '২০১৭',
  '২০১৬', '২০১৫', '২০১৪', '২০১৩', '২০১২', '২০১১', '২০১০', '২০০৯', '২০০৮', '২০০৭',
  '২০০৬', '২০০৫', '২০০৪', '২০০৩', '২০০২', '২০০১', '২০০০', '১৯৯৯', '১৯৯৮', '১৯৯৭',
  '১৯৯৬', '১৯৯৫', '১৯৯৪', '১৯৯৩', '১৯৯২', '১৯৯১', '১৯৯০', '১৯৮৯', '১৯৮৮', '১৯৮৭',
  '১৯৮৬', '১৯৮৫', '১৯৮৪', '১৯৮৩', '১৯৮২', '১৯৮১', '১৯৮০', '১৯৭৯', '১৯৭৮', '১৯৭৭',
  '১৯৭৬', '১৯৭৫', '১৯৭৪', '১৯৭৩', '১৯৭২', '১৯৭১', '১৯৭০', '১৯৬৯', '১৯৬৮', '১৯৬৭',
  '১৯৬৬', '১৯৬৫', '১৯৬৪', '১৯৬৩', '১৯৬২', '১৯৬১', '১৯৬০'
];

export default function JobApplicationClient() {
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [facebookLink, setFacebookLink] = useState('');

  // Bengali DOB states
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  // Present Address
  const [presentHouse, setPresentHouse] = useState('');
  const [presentWard, setPresentWard] = useState('');
  const [presentThana, setPresentThana] = useState('');
  const [presentDistrict, setPresentDistrict] = useState('');

  // Permanent Address
  const [permHouse, setPermHouse] = useState('');
  const [permWard, setPermWard] = useState('');
  const [permThana, setPermThana] = useState('');
  const [permDistrict, setPermDistrict] = useState('');

  // Dynamic Lists
  const [educations, setEducations] = useState<EducationField[]>([
    { certificate: '', institute: '', passingYear: '' }
  ]);

  const [currentJobs, setCurrentJobs] = useState<JobField[]>([
    { designation: '', organization: '' }
  ]);

  const [experiences, setExperiences] = useState<JobField[]>([
    { designation: '', organization: '' }
  ]);

  const [workLinks, setWorkLinks] = useState<string[]>(['']);
  
  const [photoName, setPhotoName] = useState('');
  const [nidName, setNidName] = useState('');
  const [notes, setNotes] = useState('');

  // Education Helpers
  const addEducation = () => {
    setEducations([...educations, { certificate: '', institute: '', passingYear: '' }]);
  };
  const updateEducation = (index: number, field: keyof EducationField, val: string) => {
    const next = [...educations];
    next[index][field] = val;
    setEducations(next);
  };
  const removeEducation = (index: number) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index));
    }
  };

  // Current Job Helpers
  const addCurrentJob = () => {
    setCurrentJobs([...currentJobs, { designation: '', organization: '' }]);
  };
  const updateCurrentJob = (index: number, field: keyof JobField, val: string) => {
    const next = [...currentJobs];
    next[index][field] = val;
    setCurrentJobs(next);
  };
  const removeCurrentJob = (index: number) => {
    if (currentJobs.length > 1) {
      setCurrentJobs(currentJobs.filter((_, i) => i !== index));
    }
  };

  // Experience Helpers
  const addExperience = () => {
    setExperiences([...experiences, { designation: '', organization: '' }]);
  };
  const updateExperience = (index: number, field: keyof JobField, val: string) => {
    const next = [...experiences];
    next[index][field] = val;
    setExperiences(next);
  };
  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index));
    }
  };

  // Work Links Helpers
  const addWorkLink = () => setWorkLinks([...workLinks, '']);
  const updateWorkLink = (index: number, val: string) => {
    const next = [...workLinks];
    next[index] = val;
    setWorkLinks(next);
  };
  const removeWorkLink = (index: number) => {
    if (workLinks.length > 1) setWorkLinks(workLinks.filter((_, i) => i !== index));
  };

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const dobFormatted = (dobDay && dobMonth && dobYear) ? `${dobDay} ${dobMonth}, ${dobYear}` : '';
      const presentAddressStr = [presentHouse, presentWard, presentThana, presentDistrict].filter(Boolean).join(', ');
      const permanentAddressStr = [permHouse, permWard, permThana, permDistrict].filter(Boolean).join(', ');

      const res = await fetch('/api/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position,
          fullName,
          dob: dobFormatted,
          mobile,
          email,
          facebookLink,
          presentAddress: presentAddressStr,
          permanentAddress: permanentAddressStr,
          educations: educations.filter((e) => e.certificate || e.institute),
          currentJobs: currentJobs.filter((j) => j.designation || j.organization),
          experiences: experiences.filter((ex) => ex.designation || ex.organization),
          workLinks: workLinks.filter(Boolean),
          photoUrl: photoName,
          nidUrl: nidName,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'আবেদন জমা দিতে সমস্যা হয়েছে');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'আবেদন জমা দেওয়া যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 46 }, (_, i) => (2025 - i).toString());

  if (submitted) {
    return (
      <div className="py-12 px-4 max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">
            ধন্যবাদ! আপনার আবেদনটি সফলভাবে জমা হয়েছে।
          </h2>
          <p className="text-gray-600 leading-relaxed">
            খুলনা গেজেটের বার্তা বিভাগ আপনার আবেদন পর্যালোচনা করবে। প্রাথমিক বাছাইয়ে নির্বাচিত হলে আপনার সাথে ইমেইল বা মোবাইলে যোগাযোগ করা হবে।
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="inline-block bg-[#e60023] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
          >
            নতুন আবেদন করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 bg-gray-50">
      <div className="mx-auto max-w-4xl px-3 sm:px-4">
        
        {/* Title Header */}
        <h1 className="bg-[#e60023] py-3.5 text-center text-xl font-bold text-white sm:py-4 sm:text-2xl rounded-t-lg shadow-sm">
          খুলনা গেজেটে চাকরির আবেদন
        </h1>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-5 border border-gray-200 bg-white p-4 sm:p-8 rounded-b-lg shadow-sm">
          
          {/* Position Selector */}
          <div>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-base outline-none focus:border-gray-500 bg-white"
            >
              <option value="">পদ নির্বাচন করুন *</option>
              <option value="সহ-সম্পাদক / সাব এডিটর">সহ-সম্পাদক / সাব এডিটর (Sub Editor)</option>
              <option value="সিনিয়র সহ-সম্পাদক">সিনিয়র সহ-সম্পাদক (Senior Sub Editor)</option>
              <option value="ডেপুটি নিউজ এডিটর">ডেপুটি নিউজ এডিটর (Deputy News Editor)</option>
              <option value="জয়েন্ট নিউজ এডিটর">জয়েন্ট নিউজ এডিটর (Joint News Editor)</option>
              <option value="চিফ রিপোর্টার">চিফ রিপোর্টার (Chief Reporter)</option>
              <option value="সিনিয়র রিপোর্টার">সিনিয়র রিপোর্টার (Senior Reporter)</option>
              <option value="স্টাফ রিপোর্টার">স্টাফ রিপোর্টার (Staff Reporter)</option>
              <option value="বিশেষ সংবাদদাতা">বিশেষ সংবাদদাতা (Special Correspondent)</option>
              <option value="জেলা প্রতিনিধি">জেলা প্রতিনিধি (District Correspondent)</option>
              <option value="উপজেলা / থানা প্রতিনিধি">উপজেলা / থানা প্রতিনিধি (Upazila Correspondent)</option>
              <option value="বিশ্ববিদ্যালয় প্রতিনিধি">বিশ্ববিদ্যালয় প্রতিনিধি (University Correspondent)</option>
              <option value="ক্যাম্পাস প্রতিনিধি">ক্যাম্পাস প্রতিনিধি (Campus Correspondent)</option>
              <option value="ফিচার লেখক / প্রদায়ক">ফিচার লেখক / প্রদায়ক (Feature Writer)</option>
              <option value="গ্রাফিক্স ডিজাইনার">গ্রাফিক্স ডিজাইনার (Graphics Designer)</option>
              <option value="ভিডিও এডিটর">ভিডিও এডিটর (Video Editor)</option>
              <option value="ক্যামেরা পারসন / ফটোগ্রাফার">ক্যামেরা পারসন / ফটো সাংবাদিক (Photographer)</option>
              <option value="ডিজিটাল ও সোশ্যাল মিডিয়া এক্সিকিউটিভ">ডিজিটাল ও সোশ্যাল মিডিয়া এক্সিকিউটিভ (Social Media Manager)</option>
              <option value="আইটি ও ওয়েব ডেভেলপার">আইটি ও ওয়েব ডেভেলপার (IT / Web Developer)</option>
              <option value="বিজ্ঞাপন ও বিপণন নির্বাহী">বিজ্ঞাপন ও বিপণন নির্বাহী (Advertisement & Marketing)</option>
              <option value="সার্কুলেশন এক্সিকিউটিভ">সার্কুলেশন এক্সিকিউটিভ (Circulation Executive)</option>
              <option value="প্রুফ রিডার">প্রুফ রিডার (Proof Reader)</option>
              <option value="শিক্ষানবিশ / ইন্টার্নশিপ">শিক্ষানবিশ / ইন্টার্নশিপ (Intern)</option>
              <option value="অন্যান্য">অন্যান্য (Other)</option>
            </select>
          </div>

          {/* Full Name */}
          <div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="আপনার নাম: *"
              className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-base outline-none focus:border-gray-500"
            />
          </div>

          {/* Date of Birth in 100% Bengali */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="shrink-0 text-base font-medium text-gray-700 sm:min-w-[7rem]">
              জন্মতারিখ: *
            </span>
            <div className="grid w-full flex-1 grid-cols-3 gap-2.5">
              <select
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-gray-500 bg-white"
              >
                <option value="">দিন</option>
                {bengaliDays.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-gray-500 bg-white"
              >
                <option value="">মাস</option>
                {bengaliMonths.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-gray-500 bg-white"
              >
                <option value="">বছর</option>
                {bengaliYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="মোবাইল নম্বর: *"
              className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-base outline-none focus:border-gray-500"
            />
          </div>

          {/* Email Address */}
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ই-মেইল ঠিকানা *"
              className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-base outline-none focus:border-gray-500"
            />
          </div>

          {/* Facebook Link */}
          <div>
            <input
              type="url"
              value={facebookLink}
              onChange={(e) => setFacebookLink(e.target.value)}
              placeholder="ফেসবুক আইডি লিংক"
              className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-base outline-none focus:border-gray-500"
            />
          </div>

          <hr className="border-gray-200 my-4" />

          {/* Present Address */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
            <span className="shrink-0 text-base font-semibold text-gray-700 sm:min-w-[7rem] sm:pt-2">
              বর্তমান ঠিকানা
            </span>
            <div className="grid w-full flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={presentHouse}
                onChange={(e) => setPresentHouse(e.target.value)}
                placeholder="বাসা/গ্রাম/মহল্লা"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
              />
              <input
                type="text"
                value={presentWard}
                onChange={(e) => setPresentWard(e.target.value)}
                placeholder="পোস্ট/ওয়ার্ড"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
              />
              <input
                type="text"
                value={presentThana}
                onChange={(e) => setPresentThana(e.target.value)}
                placeholder="থানা"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
              />
              <input
                type="text"
                value={presentDistrict}
                onChange={(e) => setPresentDistrict(e.target.value)}
                placeholder="জেলা"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
              />
            </div>
          </div>

          {/* Permanent Address */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
            <span className="shrink-0 text-base font-semibold text-gray-700 sm:min-w-[7rem] sm:pt-2">
              স্থায়ী ঠিকানা
            </span>
            <div className="grid w-full flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={permHouse}
                onChange={(e) => setPermHouse(e.target.value)}
                placeholder="বাসা/গ্রাম/মহল্লা"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
              />
              <input
                type="text"
                value={permWard}
                onChange={(e) => setPermWard(e.target.value)}
                placeholder="পোস্ট/ওয়ার্ড"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
              />
              <input
                type="text"
                value={permThana}
                onChange={(e) => setPermThana(e.target.value)}
                placeholder="থানা"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
              />
              <input
                type="text"
                value={permDistrict}
                onChange={(e) => setPermDistrict(e.target.value)}
                placeholder="জেলা"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <hr className="border-gray-200 my-4" />

          {/* Educational Qualifications */}
          <div>
            {educations.map((edu, idx) => (
              <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3 mb-3">
                <span className="shrink-0 text-base font-semibold text-gray-700 sm:min-w-[7rem] sm:pt-2">
                  {idx === 0 ? 'শিক্ষাগত যোগ্যতা' : ''}
                </span>
                <div className="grid w-full flex-1 grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <select
                    value={edu.certificate}
                    onChange={(e) => updateEducation(idx, 'certificate', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 bg-white"
                  >
                    <option value="">সনদ নির্বাচন করুন</option>
                    <option value="মাধ্যমিক / সমমান">মাধ্যমিক / সমমান</option>
                    <option value="উচ্চমাধ্যমিক / সমমান">উচ্চমাধ্যমিক / সমমান</option>
                    <option value="স্নাতক / সমমান">স্নাতক / সমমান</option>
                    <option value="স্নাতকোত্তর / সমমান">স্নাতকোত্তর / সমমান</option>
                  </select>

                  <input
                    type="text"
                    value={edu.institute}
                    onChange={(e) => updateEducation(idx, 'institute', e.target.value)}
                    placeholder="প্রতিষ্ঠান"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500"
                  />

                  <div className="flex gap-2 items-center">
                    <select
                      value={edu.passingYear}
                      onChange={(e) => updateEducation(idx, 'passingYear', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 bg-white"
                    >
                      <option value="">পাশের সাল</option>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    {educations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                <Plus className="w-4 h-4" /> আরো
              </button>
            </div>
          </div>

          <hr className="border-gray-200 my-4" />

          {/* Current Job */}
          <div>
            {currentJobs.map((job, idx) => (
              <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3 mb-3">
                <span className="shrink-0 text-base font-semibold text-gray-700 sm:min-w-[7rem] sm:pt-2">
                  {idx === 0 ? 'বর্তমান পেশা' : ''}
                </span>
                <div className="grid w-full flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <input
                    type="text"
                    value={job.designation}
                    onChange={(e) => updateCurrentJob(idx, 'designation', e.target.value)}
                    placeholder="পদবী"
                    className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
                  />
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={job.organization}
                      onChange={(e) => updateCurrentJob(idx, 'organization', e.target.value)}
                      placeholder="প্রতিষ্ঠান"
                      className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
                    />
                    {currentJobs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCurrentJob(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={addCurrentJob}
                className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                <Plus className="w-4 h-4" /> আরো
              </button>
            </div>
          </div>

          {/* Experience */}
          <div>
            {experiences.map((exp, idx) => (
              <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3 mb-3">
                <span className="shrink-0 text-base font-semibold text-gray-700 sm:min-w-[7rem] sm:pt-2">
                  {idx === 0 ? 'অভিজ্ঞতা' : ''}
                </span>
                <div className="grid w-full flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <input
                    type="text"
                    value={exp.designation}
                    onChange={(e) => updateExperience(idx, 'designation', e.target.value)}
                    placeholder="পদবী"
                    className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
                  />
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={exp.organization}
                      onChange={(e) => updateExperience(idx, 'organization', e.target.value)}
                      placeholder="প্রতিষ্ঠান"
                      className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
                    />
                    {experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                <Plus className="w-4 h-4" /> আরো
              </button>
            </div>
          </div>

          <hr className="border-gray-200 my-4" />

          {/* Work Links */}
          <div>
            {workLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => updateWorkLink(idx, e.target.value)}
                  placeholder="আপনার কাজের লিংক"
                  className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-500"
                />
                {workLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWorkLink(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={addWorkLink}
                className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                <Plus className="w-4 h-4" /> আরো
              </button>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="w-full border border-gray-300 rounded-md px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-gray-400 bg-white">
              <div className="flex items-center gap-2 text-gray-500 text-base">
                <Upload className="w-4 h-4 text-gray-400" />
                <span>{photoName || 'আপনার ছবি (Upload Photo)'}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && setPhotoName(e.target.files[0].name)}
                className="hidden"
              />
              <span className="text-xs bg-gray-100 px-2.5 py-1 rounded text-gray-600">ব্রাউজ করুন</span>
            </label>
          </div>

          {/* NID Upload */}
          <div>
            <label className="w-full border border-gray-300 rounded-md px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-gray-400 bg-white">
              <div className="flex items-center gap-2 text-gray-500 text-base">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>{nidName || 'আপনার জাতীয় পরিচয়পত্র (ছবি / PDF)'}</span>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => e.target.files?.[0] && setNidName(e.target.files[0].name)}
                className="hidden"
              />
              <span className="text-xs bg-gray-100 px-2.5 py-1 rounded text-gray-600">ব্রাউজ করুন</span>
            </label>
          </div>

          {/* Additional Info / Notes */}
          <div>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="অন্যান্য তথ্য"
              className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-base outline-none focus:border-gray-400 min-h-[5rem] resize-y"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#e60023] hover:bg-red-700 text-white font-bold px-8 py-3 rounded-md transition text-base shadow-sm cursor-pointer"
            >
              জমা/সাবমিট
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
