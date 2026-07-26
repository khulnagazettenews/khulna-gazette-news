'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  ShieldAlert, 
  Lock, 
  Mail, 
  User as UserIcon, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Users,
  ShieldCheck
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string | null;
  createdAt: string;
}

export default function RoleManagementPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'REPORTER',
    bio: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'ব্যবহারকারী তালিকা লোড করা যায়নি।');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    } finally {
      setLoading(false);
    }
  };

  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (session && ['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      fetchUsers();
    }
  }, [session, role]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Security Check: Only SUPER_ADMIN and ADMIN allowed
  if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-2xl mx-auto my-12 shadow-sm font-sans">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">অননুমোদিত অ্যাক্সেস!</h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-4">
          এই পৃষ্ঠাটি শুধুমাত্র অ্যাডমিন বা সুপার অ্যাডমিনদের জন্য সংরক্ষিত।
        </p>
      </div>
    );
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ব্যবহারকারী তৈরি করা সম্ভব হয়নি।');
      }

      setSuccess('নতুন ব্যবহারকারী সফলভাবে যোগ করা হয়েছে।');
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'REPORTER', bio: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentUser) return;

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        bio: formData.bio,
      };

      if (formData.password.trim() !== '') {
        payload.password = formData.password;
      }

      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ব্যবহারকারী আপডেট করা সম্ভব হয়নি।');
      }

      setSuccess('ব্যবহারকারীর তথ্য সফলভাবে আপডেট করা হয়েছে।');
      setIsEditModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'REPORTER', bio: '' });
      setCurrentUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === (session.user as any).id) {
      alert('আপনি নিজের অ্যাকাউন্ট মুছে ফেলতে পারবেন না!');
      return;
    }

    if (!confirm(`${user.name}-কে কি আপনি নিশ্চিতভাবে মুছে ফেলতে চান?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ব্যবহারকারী মুছে ফেলা সম্ভব হয়নি।');
      }

      setSuccess('ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে।');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    }
  };

  const openEditModal = (user: User) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      bio: user.bio || '',
    });
    setIsEditModalOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldCheck size={13} />
            <span>সুপার অ্যাডমিন</span>
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-purple-50 text-purple-750 border border-purple-200">
            <span>অ্যাডমিন</span>
          </span>
        );
      case 'EDITOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200">
            <span>সম্পাদক</span>
          </span>
        );
      case 'SUB_EDITOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span>সহকারী সম্পাদক</span>
          </span>
        );
      case 'REPORTER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span>প্রতিবেদক</span>
          </span>
        );
      case 'CONTRIBUTOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-teal-50 text-teal-700 border border-teal-200">
            <span>কন্ট্রিবিউটর</span>
          </span>
        );
      case 'ADVERTISEMENT_MANAGER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200">
            <span>বিজ্ঞাপন ম্যানেজার</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <Users size={16} />
            <span>টিম পারমিশন ও এক্সেস কন্ট্রোল</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>ইউজার ও রোলস ব্যবস্থাপনা</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              মোট {users.length} জন
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            খুলনা গেজেটের সম্পাদকীয় এবং প্রযুক্তিগত দলের রোল পারমিশন পরিচালনা করুন।
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', email: '', password: '', role: 'REPORTER', bio: '' });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md shadow-red-600/20 transition transform hover:-translate-y-0.5 shrink-0"
        >
          <UserPlus size={18} />
          <span>নতুন সদস্য যোগ করুন</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">সদস্যের নাম</th>
                <th className="px-6 py-4">ইমেইল ঠিকানা</th>
                <th className="px-6 py-4">রোল / পদবী</th>
                <th className="px-6 py-4">যোগদানের তারিখ</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
                    ইউজার তালিকা লোড হচ্ছে...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    কোনো ব্যবহারকারী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-sm">{user.name}</span>
                          {user.bio && <span className="text-[11px] text-slate-400 block line-clamp-1">{user.bio}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          disabled={user.role === 'SUPER_ADMIN' && role === 'ADMIN'}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition disabled:opacity-30"
                          title="সম্পাদনা"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={user.id === (session.user as any).id || (user.role === 'SUPER_ADMIN' && role === 'ADMIN')}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition disabled:opacity-30"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <UserPlus size={18} className="text-red-600" />
                <span>নতুন সদস্য যোগ করুন</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1.5 font-bold text-slate-900">সম্পূর্ণ নাম</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: সাকিব আল হাসান"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white font-bold transition"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="যেমন: mail@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white font-bold transition"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">পাসওয়ার্ড</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="কমপক্ষে ৬টি অক্ষর"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white font-bold transition"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">রোল / পদবী</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 bg-slate-50 font-bold transition cursor-pointer"
                >
                  <option value="SUBSCRIBER">সাবস্ক্রাইবার (Subscriber)</option>
                  <option value="CONTRIBUTOR">কন্ট্রিবিউটর (Contributor)</option>
                  <option value="REPORTER">প্রতিবেদক (Reporter)</option>
                  <option value="SUB_EDITOR">সহকারী সম্পাদক (Sub Editor)</option>
                  <option value="EDITOR">সম্পাদক (Editor)</option>
                  <option value="ADVERTISEMENT_MANAGER">বিজ্ঞাপন ম্যানেজার (Advertisement Manager)</option>
                  <option value="ADMIN">অ্যাডমিন (Admin)</option>
                  {role === 'SUPER_ADMIN' && (
                    <option value="SUPER_ADMIN">সুপার অ্যাডমিন (Super Admin)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">সংক্ষিপ্ত বায়ো (ঐচ্ছিক)</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="যেমন: খুলনা ব্যুরো প্রধান"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 font-semibold transition"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-3 rounded-2xl shadow-xs transition"
                >
                  সদস্য যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Pencil size={18} className="text-blue-600" />
                <span>সদস্যের তথ্য সম্পাদন</span>
              </h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1.5 font-bold text-slate-900">সম্পূর্ণ নাম</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white font-bold transition"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white font-bold transition"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">
                  পাসওয়ার্ড পরিবর্তন করুন (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="অপরিবর্তিত রাখতে খালি রাখুন"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white font-bold transition"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">রোল / পদবী</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={currentUser.id === (session.user as any).id}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 bg-slate-50 font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <option value="SUBSCRIBER">সাবস্ক্রাইবার (Subscriber)</option>
                  <option value="CONTRIBUTOR">কন্ট্রিবিউটর (Contributor)</option>
                  <option value="REPORTER">প্রতিবেদক (Reporter)</option>
                  <option value="SUB_EDITOR">সহকারী সম্পাদক (Sub Editor)</option>
                  <option value="EDITOR">সম্পাদক (Editor)</option>
                  <option value="ADVERTISEMENT_MANAGER">বিজ্ঞাপন ম্যানেজার (Advertisement Manager)</option>
                  <option value="ADMIN">অ্যাডমিন (Admin)</option>
                  {role === 'SUPER_ADMIN' && (
                    <option value="SUPER_ADMIN">সুপার অ্যাডমিন (Super Admin)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-900">সংক্ষিপ্ত বায়ো (ঐচ্ছিক)</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 font-semibold transition"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentUser(null);
                  }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl shadow-xs transition"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
