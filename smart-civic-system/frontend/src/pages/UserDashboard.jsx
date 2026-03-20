import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/IssueCard';
import api from '../services/api';

export default function UserDashboard() {
  const { user } = useAuth();
  const [myIssues, setMyIssues] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issuesRes, notifRes] = await Promise.all([
          api.get(`/issues/user/${user.user_id}`),
          api.get('/issues/notifications').catch(() => ({ data: [] }))
        ]);
        const userIssues = issuesRes.data;
        setMyIssues(userIssues);
        setNotifications(notifRes.data || []);

        // Build Stack-based activity timeline from user's issues
        const events = userIssues.map(i => ({
          type: 'reported',
          description: `Reported issue: "${i.title}"`,
          created_at: i.created_at,
          icon: '📋',
          status: i.status
        }));
        // Most recent first (Stack LIFO display)
        events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setTimeline(events.slice(0, 10));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user.user_id]);

  const stats = {
    total: myIssues.length,
    reported: myIssues.filter(i => i.status === 'reported').length,
    inProgress: myIssues.filter(i => i.status === 'in-progress').length,
    resolved: myIssues.filter(i => i.status === 'resolved').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="glass-card p-6 mb-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-slate-400 text-sm">{user.email} · Citizen Dashboard</p>
            <p className="text-xs text-violet-400 mt-1">Joined {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Reported', value: stats.total, icon: '📋', color: '#7c3aed' },
            { label: 'Pending',        value: stats.reported, icon: '⏳', color: '#64748b' },
            { label: 'In Progress',    value: stats.inProgress, icon: '🔄', color: '#3b82f6' },
            { label: 'Resolved',       value: stats.resolved, icon: '✅', color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Issues */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">📋 My Issues</h2>
            {loading ? (
              <div className="text-slate-500 text-center py-10">Loading…</div>
            ) : myIssues.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-500">
                No issues reported yet. <a href="/report" className="text-violet-400">Report one!</a>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {myIssues.map((issue, i) => <IssueCard key={issue.issue_id} issue={issue} index={i} />)}
              </div>
            )}
          </div>

          {/* Sidebar: Timeline + Notifications */}
          <div className="space-y-6">
            {/* Notifications Queue */}
            {notifications.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-semibold text-violet-300 mb-3">🔔 Notifications
                  <span className="ml-1 text-xs bg-violet-600/30 text-violet-300 px-1.5 py-0.5 rounded">{notifications.length}</span>
                </h3>
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((n, i) => (
                    <div key={i} className="text-xs p-2 rounded-lg bg-white/5 text-slate-300">
                      {n.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Timeline (Stack) */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-1">📅 Activity Timeline</h3>
              <p className="text-xs text-violet-400 mb-3">Stack — most recent first</p>
              <div className="space-y-3">
                {timeline.length === 0 ? (
                  <p className="text-slate-600 text-sm">No activity yet</p>
                ) : timeline.map((ev, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-lg shrink-0">{ev.icon}</span>
                    <div>
                      <p className="text-slate-300 text-xs">{ev.description}</p>
                      <p className="text-xs text-slate-600">{new Date(ev.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
