import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CommentSection({ issueId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/issues/${issueId}/comments`);
        setComments(res.data); // Already ordered by LinkedList on backend
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally { setLoading(false); }
    };
    fetch();
  }, [issueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/issues/${issueId}/comments`, { comment: text });
      setComments(prev => [...prev, { ...res.data, author_name: user.name, author_role: user.role }]);
      setText('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post comment');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="glass-card p-5">
      <h3 className="text-lg font-semibold mb-4 text-white">
        💬 Comments
        <span className="ml-2 text-sm text-slate-400">({comments.length})</span>
        <span className="ml-2 text-xs text-violet-400 font-normal">Linked List ordering</span>
      </h3>

      {/* Comment list */}
      <div className="space-y-3 mb-5 max-h-80 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No comments yet. Be the first!</div>
        ) : (
          <AnimatePresence>
            {comments.map((c, i) => (
              <motion.div
                key={c.comment_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                     style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  {(c.author_name || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{c.author_name || 'Unknown'}</span>
                    {c.author_role === 'admin' && (
                      <span className="text-xs bg-violet-600/30 text-violet-300 px-1.5 py-0.5 rounded">Admin</span>
                    )}
                    <span className="text-xs text-slate-500 ml-auto">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{c.comment}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment..."
            className="form-input flex-1"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '...' : 'Post'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-500 text-center">
          <a href="/login" className="text-violet-400 hover:underline">Login</a> to post a comment.
        </p>
      )}
    </div>
  );
}
