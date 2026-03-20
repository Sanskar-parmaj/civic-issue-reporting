import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import IssueCard from '../components/IssueCard';
import api from '../services/api';

const stats = [
  { label: 'Issues Reported', value: '2,400+', icon: '📋', color: '#7c3aed' },
  { label: 'Issues Resolved', value: '1,800+', icon: '✅', color: '#10b981' },
  { label: 'Active Citizens', value: '12,000+', icon: '👥', color: '#3b82f6' },
  { label: 'Cities Covered', value: '48',     icon: '🏙️', color: '#f59e0b' },
];

const steps = [
  { step: '1', title: 'Report an Issue', desc: 'Submit civic issues with photo and location', icon: '📸' },
  { step: '2', title: 'Community Votes', desc: 'Citizens upvote to increase priority score', icon: '👍' },
  { step: '3', title: 'Admin Reviews',   desc: 'Municipal authorities verify and assign', icon: '🔍' },
  { step: '4', title: 'Resolution',      desc: 'Issue resolved with proof photo uploaded', icon: '🎉' },
];

export default function Home() {
  const [topIssues, setTopIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/issues/top-priority').then(res => {
      setTopIssues(res.data.slice(0, 3));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm"
             style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
          🚀 Powered by Advanced Data Structures
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
          <span style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Smart City
          </span>
          <br />
          <span className="text-white">Issue Management</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Report civic issues, track progress in real-time, and collaborate with your community using intelligent algorithms — Priority Queues, QuadTrees, and more.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/report" className="btn-primary text-base px-8 py-3">Report an Issue</Link>
          <Link to="/map" className="btn-secondary text-base px-8 py-3">Explore Map</Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }} className="stat-card text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-slate-400">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-center text-white mb-10">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }} className="glass-card p-5 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                   style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                {s.step}
              </div>
              <div className="text-3xl mt-2 mb-3">{s.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Priority Issues */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            ⚡ Top Priority Issues
            <span className="ml-2 text-sm text-violet-400 font-normal">Priority Queue ranked</span>
          </h2>
          <Link to="/issues" className="text-violet-400 hover:text-violet-300 text-sm">View All →</Link>
        </div>
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading priority issues...</div>
        ) : topIssues.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <p className="text-slate-400">No issues yet. <Link to="/report" className="text-violet-400">Report one!</Link></p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {topIssues.map((issue, i) => <IssueCard key={issue.issue_id} issue={issue} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
