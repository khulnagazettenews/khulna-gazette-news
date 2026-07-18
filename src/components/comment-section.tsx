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
      const data = await res.json();
      if (res.ok) {
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
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
      const data = await res.json();

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
    <div className="space-y-6 pt-6 border-t border-gray-250">
      <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2 border-l-4 border-red-600 pl-2.5">
        <MessageSquare size={18} className="text-red-650" />
        <span>মন্তব্যসমূহ ({comments.length})</span>
      </h3>

      {/* Form Submission */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        {success && (
          <div className="bg-green-150 border border-green-200 text-green-700 p-3 rounded-lg text-xs">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">আপনার নাম</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
              placeholder="নাম লিখুন"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">আপনার মন্তব্য</label>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
            placeholder="মন্তব্য লিখুন..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
        >
          <Send size={12} />
          <span>{submitting ? 'জমা দেওয়া হচ্ছে...' : 'মন্তব্য করুন'}</span>
        </button>
      </form>

      {/* Approved comments list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4 text-xs text-gray-400">মন্তব্য লোড করা হচ্ছে...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-400">এই খবরের অধীনে এখনো কোনো মন্তব্য নেই।</div>
        ) : (
          comments.map((item) => (
            <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-gray-150 shadow-inner flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">
                {item.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-800">{item.name}</span>
                  <span className="text-[9px] text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-650 leading-relaxed">{item.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
