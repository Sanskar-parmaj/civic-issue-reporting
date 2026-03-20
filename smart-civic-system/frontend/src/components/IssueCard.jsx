import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const severityMap = {
  low:      { label: 'Low',      class: 'badge-low',      emoji: '🟢' },
  medium:   { label: 'Medium',   class: 'badge-medium',   emoji: '🟡' },
  high:     { label: 'High',     class: 'badge-high',     emoji: '🔴' },
  critical: { label: 'Critical', class: 'badge-critical', emoji: '🚨' },
};

const statusMap = {
  'reported':    { label: 'Reported',    class: 'status-reported'    },
  'in-progress': { label: 'In Progress', class: 'status-in-progress' },
  'resolved':    { label: 'Resolved',    class: 'status-resolved'    },
};

export default function IssueCard({ issue, index = 0 }) {
  const sev = severityMap[issue.severity] || severityMap.low;
  const stat = statusMap[issue.status] || statusMap.reported;
  const priority = (({ low: 1, medium: 2, high: 3, critical: 4 })[issue.severity] || 0) + (issue.votes || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(124,58,237,0.2)' }}
      className="glass-card overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      {issue.image ? (
        <div className="h-40 overflow-hidden bg-slate-800">
          <img
            src={`/uploads/${issue.image}`}
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-5xl"
             style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(79,70,229,0.05))' }}>
          🏙️
        </div>
      )}

      <div className="p-4">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sev.class}`}>
            {sev.emoji} {sev.label}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.class}`}>
            {stat.label}
          </span>
          <span className="text-xs text-slate-500 ml-auto">{issue.category}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-violet-300 transition-colors">
          {issue.title}
        </h3>

        {/* Description excerpt */}
        {issue.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">{issue.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span title="Votes">👍 {issue.votes || 0}</span>
            <span title={`Priority score: ${priority}`} className="text-violet-400 font-medium">⚡ {priority}</span>
          </div>
          <Link to={`/issues/${issue.issue_id}`}
            className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">
            View Details →
          </Link>
        </div>

        {/* Reporter */}
        {issue.reporter_name && (
          <p className="text-xs text-slate-600 mt-2">By {issue.reporter_name}</p>
        )}
      </div>
    </motion.div>
  );
}
