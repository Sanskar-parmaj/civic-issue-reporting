import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import StatusPieChart from '../components/StatusPieChart';

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [topPriority, setTopPriority] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [resolveModalIssue, setResolveModalIssue] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofDescription, setProofDescription] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, topRes] = await Promise.all([
          api.get('/issues'),
          api.get('/issues/top-priority')
        ]);
        setIssues(allRes.data.issues || []);
        setStats({
          category: allRes.data.categoryStats || {},
          status:   allRes.data.statusStats || {},
          total:    allRes.data.total || 0
        });
        setTopPriority(topRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleStatusSelect = (issue, newStatus) => {
    if (newStatus === 'resolved') {
      setResolveModalIssue(issue);
    } else {
      handleStatusChange(issue.issue_id, newStatus);
    }
  };

  const handleStatusChange = async (issueId, newStatus, imageFile = null, proofDesc = '') => {
    try {
      if (newStatus === 'resolved') {
        setUpdating(true);
        const fd = new FormData();
        fd.append('status', newStatus);
        if (imageFile) fd.append('proof_image', imageFile);
        if (proofDesc) fd.append('proof_description', proofDesc);
        await api.patch(`/issues/${issueId}/status`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.patch(`/issues/${issueId}/status`, { status: newStatus });
      }
      setIssues(prev => prev.map(i => i.issue_id === issueId ? { ...i, status: newStatus } : i));
      setTopPriority(prev => prev.map(i => i.issue_id === issueId ? { ...i, status: newStatus } : i));
      if (newStatus === 'resolved') {
        setResolveModalIssue(null);
        setProofImage(null);
        setProofDescription('');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      if (newStatus === 'resolved') setUpdating(false);
    }
  };

  const severityValue = { low: 1, medium: 2, high: 3, critical: 4 };
  const getPriority = (i) => (severityValue[i.severity] || 0) + (i.votes || 0);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading admin dashboard…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">⚙️ Admin Dashboard</h1>
        <p className="text-slate-400 mb-8">
          Powered by <span className="text-violet-400">PriorityQueue</span>, <span className="text-violet-400">HashMap</span> &amp; <span className="text-violet-400">R-Tree</span>
        </p>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Issues',  value: stats.total || 0,                       icon: '📋', color: '#7c3aed' },
            { label: 'Pending',       value: stats.status?.reported || 0,            icon: '⏳', color: '#64748b' },
            { label: 'In Progress',   value: stats.status?.['in-progress'] || 0,     icon: '🔄', color: '#3b82f6' },
            { label: 'Resolved',      value: stats.status?.resolved || 0,            icon: '✅', color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Category Breakdown — HashMap */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-1">📊 Category Stats</h3>
            <p className="text-xs text-violet-400 mb-3">HashMap — category → count</p>
            <div className="space-y-2">
              {Object.entries(stats.category || {}).sort(([,a],[,b]) => b-a).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-violet-600/30" style={{ width: `${Math.round(count / (stats.total || 1) * 100)}px`, minWidth: '4px', background: 'linear-gradient(90deg, #7c3aed, #4f46e5)' }} />
                    <span className="text-white font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(stats.category || {}).length === 0 && <p className="text-slate-600 text-sm">No data yet</p>}
            </div>
          </div>

          {/* Escalated Issues */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-red-400 mb-1">⚠ Escalated Issues</h3>
            <p className="text-xs text-red-400/70 mb-3">Missed resolution deadlines</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {issues.filter(i => i.escalated).map((issue) => (
                <div key={`esc-${issue.issue_id}`} className="flex flex-col gap-1 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <Link to={`/issues/${issue.issue_id}`} className="text-sm font-medium text-white hover:text-red-300 truncate">
                    #{issue.issue_id} - {issue.title}
                  </Link>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">By {issue.reporter_name}</span>
                    <span className="text-red-400 font-bold">Severity: {issue.severity}</span>
                  </div>
                </div>
              ))}
              {issues.filter(i => i.escalated).length === 0 && <p className="text-slate-600 text-sm py-4 text-center">No escalated issues</p>}
            </div>
          </div>

          {/* Status Pie Chart */}
          <div className="lg:col-span-1">
            <StatusPieChart stats={stats.status} />
          </div>
        </div>

        {/* All Issues Table */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">📋 All Issues — Manage</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['ID', 'Title', 'Category', 'Severity', 'Votes', 'Priority', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-slate-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
                  <tr key={issue.issue_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2 px-3 text-slate-500">#{issue.issue_id}</td>
                    <td className="py-2 px-3">
                      <Link to={`/issues/${issue.issue_id}`} className="text-white hover:text-violet-300 truncate max-w-[200px] block">
                        {issue.title}
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-slate-400">{issue.category}</td>
                    <td className="py-2 px-3">
                      <span className={`badge-${issue.severity} px-2 py-0.5 rounded-full text-xs`}>{issue.severity}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">👍 {issue.votes}</td>
                    <td className="py-2 px-3 text-violet-400 font-semibold">⚡ {getPriority(issue)}</td>
                    <td className="py-2 px-3">
                      <span className={`status-${issue.status} px-2 py-0.5 rounded-full text-xs`}>{issue.status}</span>
                      {issue.escalated && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold bg-red-600/30 text-red-400 border border-red-500/30">
                          ⚠ Escalated
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div style={{ width: 'auto', minWidth: '100px' }}>
                        {issue.status === 'reported' && (
                          <button onClick={() => handleStatusSelect(issue, 'in-progress')} className="px-3 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40 text-xs font-medium transition-colors">
                            Mark In-Progress
                          </button>
                        )}
                        {issue.status === 'in-progress' && (
                          <button onClick={() => handleStatusSelect(issue, 'resolved')} className="px-3 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 text-xs font-medium transition-colors">
                            Resolve Issue
                          </button>
                        )}
                        {issue.status === 'resolved' && (
                          <span className="text-emerald-500 text-xs font-medium">✅ Resolved</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {issues.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-slate-600">No issues in the system yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Resolve Issue Modal */}
      {resolveModalIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 relative">
            <button 
              onClick={() => { setResolveModalIssue(null); setProofImage(null); setProofDescription(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >✕</button>
            <h2 className="text-xl font-bold text-white mb-2">Resolve Issue #{resolveModalIssue.issue_id}</h2>
            <p className="text-sm text-slate-400 mb-4">Please upload a proof photo and description to mark this issue as resolved.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleStatusChange(resolveModalIssue.issue_id, 'resolved', proofImage, proofDescription);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Proof Image (Required)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  required
                  onChange={e => setProofImage(e.target.files[0])} 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Resolution Description (Optional)</label>
                <textarea
                  rows="3"
                  value={proofDescription}
                  onChange={e => setProofDescription(e.target.value)}
                  className="form-input w-full text-sm"
                  placeholder="Describe how the issue was resolved..."
                />
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => { setResolveModalIssue(null); setProofImage(null); setProofDescription(''); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!proofImage || updating}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {updating ? 'Uploading...' : 'Submit & Resolve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
