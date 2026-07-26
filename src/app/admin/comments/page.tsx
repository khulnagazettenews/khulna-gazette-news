'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Check, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  User as UserIcon,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface Comment {
  id: string;
  name: string;
  comment: string;
  approved: boolean;
  createdAt: string;
  news: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CommentsModerationPage() {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const isApproved = activeTab === 'approved';
      const res = await fetch(`/api/comments?approved=${isApproved}`);
      if (!res.ok) {
        throw new Error('মন্তব্য তালিকা লোড করা সম্ভব হয়নি।');
      }
      const data = await res.json();
      setComments(data);
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    } finally {
      setLoading(false);
    }
  };

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (session && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
      fetchComments();
    }
  }, [session, userRole, activeTab]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Security Check
  if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-2xl mx-auto my-12 shadow-xs font-sans">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">অননুমোদিত অ্যাক্সেস!</h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-4">
          এই পৃষ্ঠাটি শুধুমাত্র মডারেটর এবং এডিটরদের জন্য সংরক্ষিত।
        </p>
      </div>
    );
  }

  const handleApproveToggle = async (commentId: string, approve: boolean) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: approve }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'মন্তব্যের স্থিতি পরিবর্তন করা সম্ভব হয়নি।');
      }

      setSuccess(approve ? 'মন্তব্যটি সফলভাবে অনুমোদন করা হয়েছে।' : 'মন্তব্যের অনুমোদন বাতিল করা হয়েছে।');
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই মন্তব্যটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'মন্তব্য মুছে ফেলা সম্ভব হয়নি।');
      }

      setSuccess('মন্তব্যটি সফলভাবে মুছে ফেলা হয়েছে।');
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <MessageSquare size={16} />
            <span>পাঠকদের মন্তব্য ও ফিডব্যাক মডারেশন</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>মন্তব্য মডারেশন প্যানেল</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {comments.length} টি মন্তব্য
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            পাঠকদের প্রকাশিত বা অপেক্ষমান মন্তব্যের মডারেশন নিয়ন্ত্রণ করুন।
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock size={15} />
          <span>অপেক্ষমান মন্তব্য (Pending)</span>
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === 'approved'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 size={15} />
          <span>অনুমোদিত মন্তব্য (Approved)</span>
        </button>
      </div>

      {/* Alert boxes */}
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

      {/* Comments List Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center text-slate-400 font-bold">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600 mx-auto mb-2"></div>
          মন্তব্য তালিকা লোড হচ্ছে...
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center text-slate-400 select-none font-medium">
          <MessageCircle size={40} className="mx-auto text-slate-300 mb-3" />
          <span>কোনো মন্তব্য পাওয়া যায়নি।</span>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 hover:shadow-md transition duration-200 space-y-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2.5 max-w-3xl flex-grow">
                {/* Meta details */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-sm shrink-0">
                    {comment.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm block">{comment.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {new Date(comment.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed pl-1 font-medium bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                  "{comment.comment}"
                </p>

                {/* Article link */}
                {comment.news && (
                  <div className="pt-1 flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-bold">
                    <span className="text-slate-400 font-semibold">সংবাদ:</span>
                    <Link href={`/${comment.news.slug}`} target="_blank" className="inline-flex items-center gap-1">
                      <span>{comment.news.title}</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 md:self-center shrink-0 text-xs font-extrabold">
                {activeTab === 'pending' ? (
                  <button
                    onClick={() => handleApproveToggle(comment.id, true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-2xl shadow-xs transition"
                  >
                    <Check size={15} />
                    <span>অনুমোদন দিন</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleApproveToggle(comment.id, false)}
                    className="flex items-center gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-4 py-2.5 rounded-2xl transition"
                  >
                    <X size={15} />
                    <span>অনুমোদন বাতিল</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3.5 py-2.5 rounded-2xl transition"
                >
                  <Trash2 size={15} />
                  <span>মুছুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
