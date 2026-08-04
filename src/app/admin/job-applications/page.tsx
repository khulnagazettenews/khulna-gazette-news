'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle, 
  UserCheck, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  MapPin, 
  GraduationCap, 
  Building2, 
  ExternalLink,
  X
} from 'lucide-react';

interface JobApplication {
  id: string;
  position: string;
  fullName: string;
  dob: string;
  mobile: string;
  email: string;
  facebookLink: string;
  presentAddress: string;
  permanentAddress: string;
  educations: string;
  currentJobs: string;
  experiences: string;
  workLinks: string;
  photoUrl: string;
  nidUrl: string;
  notes: string;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED';
  createdAt: string;
}

export default function AdminJobApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/job-applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Failed to fetch job applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/job-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus as any } : app))
        );
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp({ ...selectedApp, status: newStatus as any });
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই আবেদনটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/job-applications/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((app) => app.id !== id));
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete application', err);
    }
  };

  // Filtered Applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.position.toLowerCase().includes(search.toLowerCase()) ||
      app.mobile.includes(search) ||
      app.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const parseJSON = (str: string) => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Briefcase className="text-[#e60023] w-7 h-7" />
            চাকরির আবেদনসমূহ (Job Applications)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ওয়েবসাইট থেকে আবেদনকারী সকল প্রার্থীর জীবনবৃত্তান্ত ও তথ্য এখানে জমা হচ্ছে।
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
            মোট: {applications.length} জন
          </span>
          <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
            অপেক্ষমাণ: {applications.filter((a) => a.status === 'PENDING').length} জন
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
            বাছাইকৃত: {applications.filter((a) => a.status === 'SHORTLISTED').length} জন
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="আবেদনকারীর নাম, পদ বা মোবাইল দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600">স্ট্যাটাস:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2 outline-none"
          >
            <option value="ALL">সকল আবেদন</option>
            <option value="PENDING">অপেক্ষমাণ (Pending)</option>
            <option value="REVIEWED">প্যালোচিত (Reviewed)</option>
            <option value="SHORTLISTED">বাছাইকৃত (Shortlisted)</option>
            <option value="REJECTED">বাতিলকৃত (Rejected)</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">আবেদনগুলো লোড হচ্ছে...</div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">কোনো চাকরির আবেদন পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">আবেদনকারী</th>
                  <th className="p-4">আবেদনের পদ</th>
                  <th className="p-4">যোগাযোগ</th>
                  <th className="p-4">তারিখ</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{app.fullName}</div>
                      {app.dob && <div className="text-xs text-slate-500">জন্ম: {app.dob}</div>}
                    </td>

                    <td className="p-4">
                      <span className="inline-block bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                        {app.position}
                      </span>
                    </td>

                    <td className="p-4 space-y-0.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-mono font-semibold text-slate-900">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {app.mobile}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {app.email}
                      </div>
                    </td>

                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString('bn-BD')}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          app.status === 'SHORTLISTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'REVIEWED'
                            ? 'bg-blue-100 text-blue-800'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status === 'SHORTLISTED' && <UserCheck className="w-3 h-3" />}
                        {app.status === 'REVIEWED' && <CheckCircle className="w-3 h-3" />}
                        {app.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {app.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {app.status === 'SHORTLISTED'
                          ? 'বাছাইকৃত'
                          : app.status === 'REVIEWED'
                          ? 'প্যালোচিত'
                          : app.status === 'REJECTED'
                          ? 'বাতিল'
                          : 'অপেক্ষমাণ'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="বিস্তারিত দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-900">{selectedApp.fullName}</h2>
              <p className="text-sm font-semibold text-[#e60023] mt-0.5">আবেদনের পদ: {selectedApp.position}</p>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-xs text-slate-500 font-bold block">মোবাইল</span>
                <span className="font-semibold text-slate-900">{selectedApp.mobile}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block">ইমেইল</span>
                <span className="font-semibold text-slate-900">{selectedApp.email}</span>
              </div>
              {selectedApp.dob && (
                <div>
                  <span className="text-xs text-slate-500 font-bold block">জন্মতারিখ</span>
                  <span className="font-semibold text-slate-900">{selectedApp.dob}</span>
                </div>
              )}
              {selectedApp.facebookLink && (
                <div>
                  <span className="text-xs text-slate-500 font-bold block">ফেসবুক প্রোফাইল</span>
                  <a href={selectedApp.facebookLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1 font-semibold">
                    <Globe className="w-3.5 h-3.5" /> প্রোফাইল দেখুন
                  </a>
                </div>
              )}
            </div>

            {/* Address */}
            {(selectedApp.presentAddress || selectedApp.permanentAddress) && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" /> ঠিকানা
                </h3>
                {selectedApp.presentAddress && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg">
                    <strong>বর্তমান ঠিকানা:</strong> {selectedApp.presentAddress}
                  </p>
                )}
                {selectedApp.permanentAddress && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg">
                    <strong>স্থায়ী ঠিকানা:</strong> {selectedApp.permanentAddress}
                  </p>
                )}
              </div>
            )}

            {/* Educations */}
            {parseJSON(selectedApp.educations).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-slate-500" /> শিক্ষাগত যোগ্যতা
                </h3>
                <div className="space-y-2">
                  {parseJSON(selectedApp.educations).map((edu: any, i: number) => (
                    <div key={i} className="text-xs bg-slate-50 p-3 rounded-lg flex justify-between">
                      <span className="font-semibold text-slate-900">{edu.certificate || 'সনদ'}</span>
                      <span className="text-slate-600">{edu.institute}</span>
                      <span className="text-slate-500 font-bold">{edu.passingYear}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experiences */}
            {parseJSON(selectedApp.experiences).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-500" /> অভিজ্ঞতা
                </h3>
                <div className="space-y-2">
                  {parseJSON(selectedApp.experiences).map((exp: any, i: number) => (
                    <div key={i} className="text-xs bg-slate-50 p-3 rounded-lg flex justify-between">
                      <span className="font-semibold text-slate-900">{exp.designation}</span>
                      <span className="text-slate-600">{exp.organization}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Links */}
            {parseJSON(selectedApp.workLinks).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">কাজের লিংকসমূহ</h3>
                <div className="space-y-1">
                  {parseJSON(selectedApp.workLinks).map((link: string, i: number) => (
                    <a key={i} href={link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline block truncate">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedApp.notes && (
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">অন্যান্য তথ্য</h3>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">{selectedApp.notes}</p>
              </div>
            )}

            {/* Status Change Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, 'SHORTLISTED')}
                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
              >
                বাছাই করুন (Shortlist)
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, 'REVIEWED')}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                পর্যালোচিত (Reviewed)
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, 'REJECTED')}
                className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
              >
                বাতিল করুন (Reject)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
