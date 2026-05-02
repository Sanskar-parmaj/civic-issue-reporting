import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import api from '../services/api';

const CATEGORIES = ['Road', 'Water', 'Electricity', 'Sanitation', 'Park', 'Safety', 'Environment', 'Other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export default function ReportIssue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'Road', severity: 'medium' });
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dupeWarning, setDupeWarning] = useState(null);
  const [checkingDupe, setCheckingDupe] = useState(false);

  // Duplicate check on title + location change
  useEffect(() => {
    if (!form.title.trim() || !location) { setDupeWarning(null); return; }
    const timer = setTimeout(async () => {
      setCheckingDupe(true);
      try {
        const res = await api.post('/issues/check-duplicate', {
          title: form.title,
          latitude: location.lat,
          longitude: location.lng
        });
        setDupeWarning(res.data.isDuplicate ? res.data : null);
      } catch {} finally { setCheckingDupe(false); }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.title, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) { setError('Please select a location on the map.'); return; }
    setLoading(true); setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('latitude', location.lat);
    fd.append('longitude', location.lng);
    if (image) fd.append('image', image);
    try {
      const res = await api.post('/issues', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/issues/${res.data.issue_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit issue');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">📋 Report a Civic Issue</h1>
        <p className="text-slate-400 mb-8">Fill in the details. Duplicate detection runs automatically.</p>

        {/* Duplicate Warning */}
        <AnimatePresence>
          {dupeWarning && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl border" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
              <p className="text-amber-400 font-semibold">⚠️ Similar issue already exists nearby!</p>
              <p className="text-amber-300/70 text-sm mt-1">
                {dupeWarning.message}
                {dupeWarning.existingIssueId && (
                  <> — <a href={`/issues/${dupeWarning.existingIssueId}`} target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-200">View existing issue ↗</a></>
                )}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Text similarity: {Math.round((dupeWarning.textScore || 0) * 100)}% | Nearby: {dupeWarning.nearbyCount} issue(s) checked
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
            {error && <div className="p-3 rounded-lg text-red-400 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Title {checkingDupe && <span className="text-violet-400 text-xs">Checking duplicates...</span>}
              </label>
              <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. Pothole on Main Street" className="form-input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Describe the issue in detail..." className="form-input resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="form-input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Severity</label>
                <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="form-input">
                  {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Photo (optional)</label>
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])}
                className="form-input cursor-pointer" />
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-3">
                <div className="flex-1">
                  {location ? (
                    <p className="text-xs text-emerald-400">
                      📍 Location selected: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-400">📍 Click on the map to set location</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        () => alert('Unable to retrieve your location. Please check browser permissions.')
                      );
                    } else {
                      alert('Geolocation is not supported by your browser.');
                    }
                  }}
                  className="px-3 py-1.5 bg-violet-600/20 text-violet-400 font-medium rounded-lg text-xs hover:bg-violet-600/40 transition-colors border border-violet-500/30"
                >
                  🎯 Use GPS
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !location} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? 'Submitting...' : '🚀 Submit Issue'}
            </button>
          </form>

          {/* Map picker */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Click on the map to mark the issue location:</p>
            <MapComponent
              pickMode
              onLocationSelected={(lat, lng) => setLocation({ lat, lng })}
              selectedLocation={location}
              center={[20.5937, 78.9629]}
              zoom={5}
              height="420px"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
