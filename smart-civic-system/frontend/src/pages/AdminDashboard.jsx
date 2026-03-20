import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [topPriority, setTopPriority] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

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

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await api.patch(`/issues/${issueId}/status`, { status: newStatus });
      setIssues(prev => prev.map(i => i.issue_id === issueId ? { ...i, status: newStatus } : i));
      setTopPriority(prev => prev.map(i => i.issue_id === issueId ? { ...i, status: newStatus } : i));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
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

          {/* Top Priority Issues — PriorityQueue */}
          <div className="lg:col-span-2 glass-card p-5">
            <h3 className="font-semibold text-white mb-1">⚡ Top Priority Issues</h3>
            <p className="text-xs text-violet-400 mb-3">PriorityQueue max-heap — severity + votes</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {topPriority.slice(0, 8).map((issue, i) => (
                <div key={issue.issue_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-lg font-bold text-violet-300 w-6 text-center shrink-0">#{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <Link to={`/issues/${issue.issue_id}`} className="text-sm font-medium text-white hover:text-violet-300 truncate block">
                      {issue.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className={`badge-${issue.severity} px-1.5 py-0.5 rounded`}>{issue.severity}</span>
                      <span>👍 {issue.votes}</span>
                      <span>⚡ {getPriority(issue)}</span>
                    </div>
                  </div>
                  <select
                    value={issue.status}
                    onChange={e => handleStatusChange(issue.issue_id, e.target.value)}
                    className="form-input text-xs py-1 px-2"
                    style={{ width: 'auto', minWidth: '110px' }}
                  >
                    <option value="reported">Reported</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              ))}
              {topPriority.length === 0 && <p className="text-slate-600 text-sm py-4 text-center">No issues yet</p>}
            </div>
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
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={issue.status}
                        onChange={e => handleStatusChange(issue.issue_id, e.target.value)}
                        className="form-input text-xs py-1 px-2"
                        style={{ width: 'auto', minWidth: '100px' }}
                      >
                        <option value="reported">Reported</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
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
    </div>
  );
}
