import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import api from '../services/api';

const STATUS_OPTIONS = ['reported', 'in-progress', 'resolved'];
const sevLabels = { low: '🟢 Low', medium: '🟡 Medium', high: '🔴 High', critical: '🚨 Critical' };

export default function IssueDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await api.get(`/issues/${id}`);
        setIssue(res.data);
        setHistory(res.data.history || []);
        setNewStatus(res.data.status);
        if (user) {
          const vres = await api.get(`/issues/${id}/has-voted`);
          setHasVoted(vres.data.hasVoted);
        }
      } catch { setError('Issue not found'); }
      finally { setLoading(false); }
    };
    fetchIssue();
  }, [id, user]);

  const handleVote = async () => {
    if (!user || hasVoted || voting) return;
    setVoting(true);
    try {
      const res = await api.post(`/issues/${id}/vote`);
      setHasVoted(true);
      setIssue(prev => ({ ...prev, votes: res.data.votes }));
    } catch (err) {
      if (err.response?.status === 409) setHasVoted(true);
    } finally { setVoting(false); }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const fd = new FormData();
    fd.append('status', newStatus);
    if (proofImage) fd.append('proof_image', proofImage);
    try {
      const res = await api.patch(`/issues/${id}/status`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIssue(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    } finally { setUpdating(false); }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;
  if (error)   return <div className="text-center py-20 text-red-400">{error}</div>;
  if (!issue)  return null;

  const priority = ({ low: 1, medium: 2, high: 3, critical: 4 }[issue.severity] || 0) + (issue.votes || 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/issues" className="text-violet-400 hover:text-violet-300 text-sm mb-6 inline-block">← Back to Issues</Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            {/* Issue image */}
            {issue.image && (
              <img src={`/uploads/${issue.image}`} alt={issue.title}
                className="w-full h-56 object-cover rounded-xl mb-5" />
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium badge-${issue.severity}`}>{sevLabels[issue.severity]}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium status-${issue.status}`}>{issue.status}</span>
              <span className="text-xs text-slate-500">{issue.category}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{issue.title}</h1>
            {issue.description && <p className="text-slate-400 mb-4">{issue.description}</p>}
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>📅 {new Date(issue.created_at).toLocaleDateString()}</span>
              <span>👤 {issue.reporter_name}</span>
              <span>📍 {parseFloat(issue.latitude).toFixed(4)}, {parseFloat(issue.longitude).toFixed(4)}</span>
            </div>

            {/* Vote button */}
            <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleVote}
                disabled={!user || hasVoted || voting}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium border transition-all ${
                  hasVoted
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300 cursor-default'
                    : 'border-white/20 text-white hover:border-violet-500 hover:bg-violet-500/10'
                }`}
              >
                👍 {issue.votes || 0} {hasVoted ? '(Voted)' : 'Upvote'}
              </motion.button>
              <span className="text-slate-400 text-sm">
                ⚡ Priority Score: <strong className="text-violet-300">{priority}</strong>
              </span>
            </div>
          </motion.div>

          {/* Resolution proof image */}
          {issue.proof_image && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
              <h3 className="font-semibold text-emerald-400 mb-3">✅ Resolution Proof</h3>
              <img src={`/uploads/${issue.proof_image}`} alt="Resolution proof"
                className="w-full rounded-xl object-cover max-h-60" />
            </motion.div>
          )}

          <CommentSection issueId={id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Admin Controls */}
          {isAdmin() && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5">
              <h3 className="font-semibold text-violet-300 mb-4">⚙️ Admin Controls</h3>
              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Update Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="form-input text-sm">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {newStatus === 'resolved' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Proof Image</label>
                    <input type="file" accept="image/*" onChange={e => setProofImage(e.target.files[0])} className="form-input text-sm cursor-pointer" />
                  </div>
                )}
                <button type="submit" disabled={updating} className="btn-primary w-full text-sm disabled:opacity-50">
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </form>
            </motion.div>
          )}

          {/* Status History */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">📜 History</h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={h.history_id} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    h.status === 'resolved' ? 'bg-emerald-500' :
                    h.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-500'
                  }`} />
                  <div>
                    <span className="text-slate-300 capitalize">{h.status}</span>
                    <span className="text-slate-600 ml-1 text-xs">by {h.updated_by_name || 'System'}</span>
                    <p className="text-xs text-slate-600">{new Date(h.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
