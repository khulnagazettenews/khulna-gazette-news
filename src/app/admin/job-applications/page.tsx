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
    if (!confirm('Are you sure you want to delete this job application?')) return;
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
    <div className="p-6 space-y-6 font-sans">
      {/* Top Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Briefcase className="text-[#e60023] w-7 h-7" />
            Job Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review applicant resumes and candidate submissions sent through the portal.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
            Total: {applications.length}
          </span>
          <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
            Pending: {applications.filter((a) => a.status === 'PENDING').length}
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
            Shortlisted: {applications.filter((a) => a.status === 'SHORTLISTED').length}
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
            placeholder="Search by candidate name, position, or phone..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2 outline-none"
          >
            <option value="ALL">All Applications</option>
            <option value="PENDING">Pending</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading applications...</div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">No job applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{app.fullName}</div>
                      {app.dob && <div className="text-xs text-slate-500">DOB: {app.dob}</div>}
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
                      {new Date(app.createdAt).toLocaleDateString('en-US')}
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
                          ? 'Shortlisted'
                          : app.status === 'REVIEWED'
                          ? 'Reviewed'
                          : app.status === 'REJECTED'
                          ? 'Rejected'
                          : 'Pending'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          title="Delete"
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
              <p className="text-sm font-semibold text-[#e60023] mt-0.5">Applied Position: {selectedApp.position}</p>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-xs text-slate-500 font-bold block">Mobile</span>
                <span className="font-semibold text-slate-900">{selectedApp.mobile}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block">Email</span>
                <span className="font-semibold text-slate-900">{selectedApp.email}</span>
              </div>
              {selectedApp.dob && (
                <div>
                  <span className="text-xs text-slate-500 font-bold block">Date of Birth</span>
                  <span className="font-semibold text-slate-900">{selectedApp.dob}</span>
                </div>
              )}
              {selectedApp.facebookLink && (
                <div>
                  <span className="text-xs text-slate-500 font-bold block">Facebook Profile</span>
                  <a href={selectedApp.facebookLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1 font-semibold">
                    <Globe className="w-3.5 h-3.5" /> View Profile
                  </a>
                </div>
              )}
            </div>

            {/* Address */}
            {(selectedApp.presentAddress || selectedApp.permanentAddress) && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" /> Address
                </h3>
                {selectedApp.presentAddress && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg">
                    <strong>Present Address:</strong> {selectedApp.presentAddress}
                  </p>
                )}
                {selectedApp.permanentAddress && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg">
                    <strong>Permanent Address:</strong> {selectedApp.permanentAddress}
                  </p>
                )}
              </div>
            )}

            {/* Educations */}
            {parseJSON(selectedApp.educations).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-slate-500" /> Educational Qualifications
                </h3>
                <div className="space-y-2">
                  {parseJSON(selectedApp.educations).map((edu: any, i: number) => (
                    <div key={i} className="text-xs bg-slate-50 p-3 rounded-lg flex justify-between">
                      <span className="font-semibold text-slate-900">{edu.certificate || 'Degree'}</span>
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
                  <Building2 className="w-4 h-4 text-slate-500" /> Work Experience
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
                <h3 className="text-sm font-bold text-slate-900">Work Portfolio Links</h3>
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
                <h3 className="text-sm font-bold text-slate-900">Additional Information</h3>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">{selectedApp.notes}</p>
              </div>
            )}

            {/* Status Change Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, 'SHORTLISTED')}
                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Shortlist
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, 'REVIEWED')}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                Mark Reviewed
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, 'REJECTED')}
                className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
