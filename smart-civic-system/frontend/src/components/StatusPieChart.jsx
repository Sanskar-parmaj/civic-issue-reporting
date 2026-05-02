export default function StatusPieChart({ stats }) {
  const reported = stats?.reported || 0;
  const inProgress = stats?.['in-progress'] || 0;
  const resolved = stats?.resolved || 0;
  const total = reported + inProgress + resolved;

  if (total === 0) {
    return (
      <div className="glass-card p-5 flex flex-col items-center justify-center h-full min-h-[250px]">
        <h3 className="font-semibold text-white mb-1">🥧 Issue Status Overview</h3>
        <p className="text-xs text-violet-400 mb-4">HashMap — status → count</p>
        <p className="text-slate-500 text-sm">No data available</p>
      </div>
    );
  }

  const repPct = Math.round((reported / total) * 100);
  const inProgPct = Math.round((inProgress / total) * 100);
  const resPct = 100 - repPct - inProgPct;

  const conicString = `conic-gradient(
    #64748b 0% ${repPct}%, 
    #3b82f6 ${repPct}% ${repPct + inProgPct}%, 
    #10b981 ${repPct + inProgPct}% 100%
  )`;

  return (
    <div className="glass-card p-5 flex flex-col h-full min-h-[250px]">
      <h3 className="font-semibold text-white mb-1">🥧 Issue Status Overview</h3>
      <p className="text-xs text-violet-400 mb-6">HashMap — status → count</p>
      
      <div className="flex flex-col sm:flex-row items-center gap-8 justify-center flex-1">
        {/* Pie Chart */}
        <div 
          className="w-36 h-36 rounded-full shadow-lg border-4 border-slate-800 shrink-0 transition-transform duration-500 hover:scale-105"
          style={{ background: conicString }}
        />
        
        {/* Legend */}
        <div className="space-y-4 w-full sm:max-w-[150px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#64748b] shadow-[0_0_8px_#64748b]"></span>
              <span className="text-sm text-slate-300">Reported</span>
            </div>
            <span className="font-bold text-white">{repPct}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]"></span>
              <span className="text-sm text-slate-300">In Progress</span>
            </div>
            <span className="font-bold text-white">{inProgPct}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></span>
              <span className="text-sm text-slate-300">Resolved</span>
            </div>
            <span className="font-bold text-white">{resPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
