'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Check, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  MessageCircle
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-650"></div>
      </div>
    );
  }

  // Security Check
  if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">অননুমোদিত অ্যাক্সেস!</h2>
        <p className="text-gray-600 text-sm mb-4">
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
    if (!confirm('আপনি কি নিশ্চিত যে এই মন্তব্যটি মুছে ফেলতে চান?')) {
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
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">মন্তব্য মডারেশন প্যানেল</h2>
        <p className="text-sm text-gray-500">পাঠকদের মন্তব্য রিভিউ, অনুমোদন ও মুছে ফেলার মাধ্যমে মডারেট করুন।</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'pending'
              ? 'border-red-600 text-red-650'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          অপেক্ষমান মন্তব্য (Pending)
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'approved'
              ? 'border-red-600 text-red-650'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          অনুমোদিত মন্তব্য (Approved)
        </button>
      </div>

      {/* Alert boxes */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3 text-sm animate-pulse">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 rounded-md flex items-center gap-3 text-sm">
          <CheckCircle size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Comments List Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <span className="text-xs mt-2 block">মন্তব্য তালিকা লোড হচ্ছে...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400 select-none">
          <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
          <span>কোনো মন্তব্য পাওয়া যায়নি।</span>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-sm transition space-y-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2 max-w-3xl flex-grow">
                {/* Meta details */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {comment.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 text-sm">{comment.name}</span>
                    <span className="text-[10px] text-gray-400 block">
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
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed pl-1">
                  {comment.comment}
                </p>

                {/* Article link */}
                {comment.news && (
                  <div className="pt-1 flex items-center gap-1 text-[11px] text-blue-650 hover:underline">
                    <span>সংবাদ: </span>
                    <Link href={`/${comment.news.slug}`} target="_blank" className="font-medium inline-flex items-center gap-1">
                      {comment.news.title}
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 md:self-center shrink-0">
                {activeTab === 'pending' ? (
                  <button
                    onClick={() => handleApproveToggle(comment.id, true)}
                    className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    <Check size={14} />
                    <span>অনুমোদন দিন</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleApproveToggle(comment.id, false)}
                    className="flex items-center gap-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    <X size={14} />
                    <span>অনুমোদন বাতিল</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  <Trash2 size={14} />
                  <span>মুছে ফেলুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
