import { motion } from 'framer-motion';

const RADIUS_OPTIONS = [
  { label: '100m', value: 0.1 },
  { label: '300m', value: 0.3 },
  { label: '500m', value: 0.5 },
  { label: '1 km', value: 1 },
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
];

export default function RadiusSelector({ selected, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-2">
        🔍 Search Radius — QuadTree powered
      </label>
      <div className="flex gap-2 flex-wrap">
        {RADIUS_OPTIONS.map(opt => (
          <motion.button
            key={opt.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              selected === opt.value
                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-violet-500/50 hover:text-white'
            }`}
          >
            {opt.label}
          </motion.button>
        ))}
        {selected && (
          <button
            onClick={() => onChange(null)}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
          >
            ✕ Clear
          </button>
        )}
      </div>
      {selected && (
        <p className="text-xs text-violet-400 mt-2">
          Showing issues within {selected >= 1 ? `${selected}km` : `${selected * 1000}m`} radius
        </p>
      )}
    </div>
  );
}
