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
  Check, 
  AlertCircle 
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

  useEffect(() => {
    if (session && (session.user as any)?.role === 'SUPER_ADMIN') {
      fetchUsers();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-650"></div>
      </div>
    );
  }

  // Security Check: Only SUPER_ADMIN allowed
  if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">অননুমোদিত অ্যাক্সেস!</h2>
        <p className="text-gray-600 text-sm mb-4">
          এই পৃষ্ঠাটি শুধুমাত্র সুপার অ্যাডমিনদের জন্য সংরক্ষিত। আপনার কাছে এই কন্টেন্টটি দেখার অনুমতি নেই।
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

      setSuccess('ব্যবহারকারী সফলভাবে তৈরি করা হয়েছে।');
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            সুপার অ্যাডমিন
          </span>
        );
      case 'EDITOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            সম্পাদক
          </span>
        );
      case 'REPORTER':
        default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            প্রতিবেদক
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ইউজার ও রোলস ম্যানেজমেন্ট</h2>
          <p className="text-sm text-gray-500">খুলনা গেজেট টিমের সদস্যদের পরিচালনা করুন এবং তাদের রোল সেট করুন।</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', password: '', role: 'REPORTER', bio: '' });
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition"
        >
          <UserPlus size={18} />
          <span>নতুন সদস্য যোগ করুন</span>
        </button>
      </div>

      {/* Error/Success alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3 text-sm animate-pulse">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 rounded-md flex items-center gap-3 text-sm">
          <Check size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500">নাম</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500">ইমেইল</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500">রোল / পদবী</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500">যোগদানের তারিখ</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <span className="text-xs mt-2 block">ইউজার তালিকা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    কোনো ব্যবহারকারী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block text-sm">{user.name}</span>
                          {user.bio && <span className="text-[10px] text-gray-400 block line-clamp-1">{user.bio}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-650">{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="সম্পাদনা"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={user.id === (session.user as any).id}
                          className="p-1.5 text-gray-500 hover:text-red-650 hover:bg-red-50 rounded transition disabled:opacity-30 disabled:hover:bg-transparent"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <UserPlus size={18} className="text-red-600" />
                <span>নতুন সদস্য যোগ করুন</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">সম্পূর্ণ নাম</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: সাকিব আল হাসান"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="যেমন: mail@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">পাসওয়ার্ড</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="কমপক্ষে ৬টি অক্ষর"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">রোল / পদবী</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650 bg-white"
                >
                  <option value="REPORTER">প্রতিবেদক (Reporter - শুধুমাত্র খবর লিখতে পারবে)</option>
                  <option value="EDITOR">সম্পাদক (Editor - খবর প্রকাশ ও কন্টেন্ট ম্যানেজমেন্ট)</option>
                  <option value="SUPER_ADMIN">সুপার অ্যাডমিন (Super Admin - সম্পূর্ণ অ্যাক্সেস)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">সংক্ষিপ্ত বায়ো (ঐচ্ছিক)</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="যেমন: খুলনা ব্যুরো প্রধান"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 border border-gray-300 text-gray-600 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-red-600 hover:bg-red-750 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm hover:shadow transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Pencil size={18} className="text-blue-600" />
                <span>সদস্যের তথ্য সম্পাদন</span>
              </h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">সম্পূর্ণ নাম</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  পাসওয়ার্ড পরিবর্তন করুন (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="অপরিবর্তিত রাখতে খালি রাখুন"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">রোল / পদবী</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={currentUser.id === (session.user as any).id}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650 bg-white disabled:opacity-60"
                >
                  <option value="REPORTER">প্রতিবেদক (Reporter)</option>
                  <option value="EDITOR">সম্পাদক (Editor)</option>
                  <option value="SUPER_ADMIN">সুপার অ্যাডমিন (Super Admin)</option>
                </select>
                {currentUser.id === (session.user as any).id && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    নিরাপত্তার স্বার্থে আপনি নিজের রোল পরিবর্তন করতে পারবেন না।
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">সংক্ষিপ্ত বায়ো (ঐচ্ছিক)</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-650 focus:border-red-650"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentUser(null);
                  }}
                  className="w-1/2 border border-gray-300 text-gray-600 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-750 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm hover:shadow transition"
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
