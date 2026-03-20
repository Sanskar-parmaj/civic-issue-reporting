import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import IssueCard from '../components/IssueCard';
import api from '../services/api';

const STATUS_COLS = [
  { key: 'reported',    label: 'Reported',    color: '#64748b', icon: '📋' },
  { key: 'in-progress', label: 'In Progress', color: '#3b82f6', icon: '🔄' },
  { key: 'resolved',    label: 'Resolved',    color: '#10b981', icon: '✅' },
];

const CATEGORIES = ['All', 'Road', 'Water', 'Electricity', 'Sanitation', 'Park', 'Safety', 'Environment', 'Other'];

export default function ViewIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('All');
  const [filterSev, setFilterSev] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/issues').then(res => setIssues(res.data.issues || [])).catch(() => {})
       .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return issues.filter(i => {
      if (filterCat !== 'All' && i.category !== filterCat) return false;
      if (filterSev !== 'All' && i.severity !== filterSev) return false;
      if (search && !(i.title.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [issues, filterCat, filterSev, search]);

  const byStatus = useMemo(() => {
    const groups = { reported: [], 'in-progress': [], resolved: [] };
    for (const iss of filtered) (groups[iss.status] || groups.reported).push(iss);
    return groups;
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">📋 All Issues</h1>
        <p className="text-slate-400 mb-6">Sorted by Priority Queue (severity + votes).</p>

        {/* Filters */}
        <div className="glass-card p-4 mb-8 flex flex-wrap gap-4 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search issues..."
            className="form-input flex-1 min-w-48" style={{ maxWidth: '260px' }} />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="form-input" style={{ width: 'auto' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)} className="form-input" style={{ width: 'auto' }}>
            <option value="All">All Severities</option>
            {['low','medium','high','critical'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <span className="text-sm text-slate-500">{filtered.length} results</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading issues...</div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {STATUS_COLS.map(col => (
              <div key={col.key}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{col.icon}</span>
                  <h2 className="font-semibold text-white">{col.label}</h2>
                  <span className="ml-auto text-sm px-2 py-0.5 rounded-full text-white"
                    style={{ background: col.color + '33', color: col.color }}>
                    {byStatus[col.key].length}
                  </span>
                </div>
                <div className="space-y-4">
                  {byStatus[col.key].length === 0 ? (
                    <div className="glass-card p-6 text-center text-slate-600 text-sm">No issues</div>
                  ) : (
                    byStatus[col.key].map((issue, i) => <IssueCard key={issue.issue_id} issue={issue} index={i} />)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
