'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, User, Send } from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  comment: string;
  createdAt: string;
}

interface CommentSectionProps {
  newsId: string;
}

export default function CommentSection({ newsId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/news/${newsId}/comments`);
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            setComments(data);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newsId) {
      fetchComments();
    }
  }, [newsId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !commentText.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/news/${newsId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), comment: commentText.trim() }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok) {
        setSuccess('আপনার মন্তব্যটি সফলভাবে জমা দেওয়া হয়েছে এবং অনুমোদনের অপেক্ষায় রয়েছে।');
        setName('');
        setCommentText('');
      } else {
        setError(data.error || 'মন্তব্য জমা দিতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setError('একটি সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-8 border-t border-slate-200 [font-family:Bangla,'Noto_Sans_Bengali','Hind_Siliguri',sans-serif]">
      {/* Header Title */}
      <div className="flex items-center justify-between border-l-4 border-red-600 pl-3">
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
          <MessageSquare size={24} className="text-red-600" />
          <span>মন্তব্যসমূহ</span>
        </h3>
        <span className="text-sm sm:text-base font-bold bg-red-50 text-red-600 border border-red-200 px-3.5 py-1 rounded-full shadow-2xs">
          {comments.length} টি মন্তব্য
        </span>
      </div>

      {/* Form Submission */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm sm:text-base font-bold">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm sm:text-base font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-base sm:text-lg font-bold text-slate-900 mb-2">আপনার নাম</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-base sm:text-lg font-medium border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 focus:bg-white bg-slate-50 transition placeholder:text-slate-400 placeholder:font-normal"
              placeholder="আপনার নাম লিখুন"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-base sm:text-lg font-bold text-slate-900 mb-2">আপনার মন্তব্য</label>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={4}
            className="w-full text-base sm:text-lg font-medium border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 focus:bg-white bg-slate-50 transition placeholder:text-slate-400 placeholder:font-normal"
            placeholder="আপনার মন্তব্যটি এখানে লিখুন..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-base sm:text-lg px-7 py-3 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Send size={18} />
          <span>{submitting ? 'জমা দেওয়া হচ্ছে...' : 'মন্তব্য সাবমিট করুন'}</span>
        </button>
      </form>

      {/* Approved comments list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-6 text-base text-slate-500 font-bold">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mx-auto mb-2"></div>
            মন্তব্য লোড করা হচ্ছে...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-base text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-200 p-6">
            এই খবরের অধীনে এখনো কোনো মন্তব্য নেই। আপনি প্রথম মন্তব্যটি করুন!
          </div>
        ) : (
          comments.map((item) => (
            <div key={item.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-2xs flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                {item.name.charAt(0)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-base sm:text-lg text-slate-900">{item.name}</span>
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">
                    {new Date(item.createdAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal pt-1">{item.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
