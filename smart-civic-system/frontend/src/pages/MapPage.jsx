import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MapComponent from '../components/MapComponent';
import IssueCard from '../components/IssueCard';
import api from '../services/api';

export default function MapPage() {
  const [issues, setIssues] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [radius, setRadius] = useState(null);
  const [searchCenter, setSearchCenter] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [radiusLoading, setRadiusLoading] = useState(false);

  useEffect(() => {
    api.get('/issues').then(res => {
      setIssues(res.data.issues || []);
      setFiltered(res.data.issues || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showHeatmap) {
      api.get('/issues/heatmap').then(res => setHeatmapData(res.data)).catch(() => {});
    } else {
      setHeatmapData([]);
    }
  }, [showHeatmap]);

  const handleRadiusSearch = async (r, center = searchCenter) => {
    setRadius(r);
    if (!r) { setFiltered(issues); setSearchCenter(null); return; }
    if (!center) {
      alert('Location not set. Please use GPS or click the map.');
      return;
    }
    setRadiusLoading(true);
    try {
      const res = await api.get('/issues/radius', {
        params: { lat: center.lat, lng: center.lng, radius: r }
      });
      setFiltered(res.data);
    } catch {} finally { setRadiusLoading(false); }
  };

  const handleMapClick = (lat, lng) => {
    setSearchCenter({ lat, lng });
    if (radius) handleRadiusSearch(radius, { lat, lng });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">🗺️ Live Issue Map</h1>
        <p className="text-slate-400 mb-6">
          Powered by <span className="text-violet-400">QuadTree</span> (radius search) + <span className="text-violet-400">R-Tree</span> (heatmap density)
        </p>

        {/* Controls */}
        <div className="glass-card p-5 mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                      setSearchCenter(center);
                      handleRadiusSearch(1, center);
                    },
                    () => alert('Unable to retrieve your location. Please check browser permissions.')
                  );
                } else {
                  alert('Geolocation is not supported by your browser.');
                }
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium border bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-all"
            >
              🎯 Find Issues Near Me (1km Radius)
            </button>

            {radius && (
              <button
                onClick={() => handleRadiusSearch(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
              >
                ✕ Clear Radius
              </button>
            )}
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                showHeatmap
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-violet-500/50 hover:text-white'
              }`}
            >
              🔥 {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'} (R-Tree)
            </button>
            {searchCenter && (
              <span className="text-xs text-slate-500">
                Center: {searchCenter.lat.toFixed(4)}, {searchCenter.lng.toFixed(4)}
              </span>
            )}
            {radiusLoading && <span className="text-xs text-violet-400 animate-pulse">Searching...</span>}
          </div>
          {!searchCenter && radius && (
            <p className="text-xs text-amber-400">Click on the map to set the search center point.</p>
          )}
        </div>

        {/* Map */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading map…</div>
        ) : (
          <MapComponent
            issues={radius ? filtered : issues}
            heatmapData={heatmapData}
            center={[20.5937, 78.9629]}
            zoom={5}
            height="550px"
            pickMode={!!radius}
            onLocationSelected={handleMapClick}
            selectedLocation={searchCenter}
            radiusKm={radius}
          />
        )}

        {/* Results count after radius search */}
        {radius && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {filtered.length} issue(s) near me (within {radius >= 1 ? `${radius}km` : `${radius * 1000}m`} radius)
            </h2>
            {filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((issue, idx) => (
                  <IssueCard key={issue.issue_id} issue={issue} index={idx} />
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No issues found in this area.</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
