import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const severityColors = {
  low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626'
};

const createSeverityIcon = (severity) => L.divIcon({
  className: '',
  html: `<div style="
    width:28px; height:28px; border-radius:50%;
    background:${severityColors[severity] || '#7c3aed'};
    border:2px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.5);
    display:flex; align-items:center; justify-content:center;
    font-size:12px; color:white; font-weight:bold;
  ">${{ low:'L', medium:'M', high:'H', critical:'C' }[severity] || '?'}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

// Component for picking location on click
function LocationPicker({ onLocationSelected }) {
  useMapEvents({
    click(e) {
      onLocationSelected && onLocationSelected(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function MapComponent({
  issues = [],
  heatmapData = [],
  center = [20.5937, 78.9629],
  zoom = 5,
  pickMode = false,
  onLocationSelected,
  selectedLocation = null,
  height = '450px',
  radiusKm = null,
}) {
  const maxDensity = heatmapData.length > 0 ? Math.max(...heatmapData.map(c => c.count)) : 1;

  const getHeatmapColor = (count) => {
    if (count > (2 * maxDensity / 3)) return '#ef4444'; // Red for most dense
    if (count > (maxDensity / 3)) return '#eab308'; // Yellow for medium dense
    return '#22c55e'; // Green for least dense
  };

  return (
    <div style={{ height, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(124,58,237,0.2)' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Pick mode — click to set location */}
        {pickMode && <LocationPicker onLocationSelected={onLocationSelected} />}

        {/* Radius circle */}
        {selectedLocation && radiusKm && (
          <Circle
            center={[selectedLocation.lat, selectedLocation.lng]}
            radius={radiusKm * 1000}
            pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.05, weight: 2, dashArray: '4' }}
          />
        )}

        {/* Selected location marker (pick mode) */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>📍 Selected Location<br />{selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}</Popup>
          </Marker>
        )}

        {/* Issue markers */}
        {issues.map(issue => (
          <Marker
            key={issue.issue_id}
            position={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
            icon={createSeverityIcon(issue.severity)}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <strong>{issue.title}</strong>
                <br />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {issue.category} · {issue.severity} · {issue.status}
                </span>
                <br />
                <a href={`/issues/${issue.issue_id}`} style={{ color: '#a78bfa', fontSize: '11px' }}>
                  View Details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Heatmap circles from R-Tree */}
        {heatmapData.map((cell, i) => (
          <CircleMarker
            key={i}
            center={[cell.lat, cell.lng]}
            radius={Math.min(25 + cell.count * 8, 60)}
            pathOptions={{
              stroke: false,
              fillColor: getHeatmapColor(cell.count),
              fillOpacity: 0.4 + Math.min(cell.count * 0.1, 0.5),
            }}
          >
            <Popup>{cell.count} issue{cell.count !== 1 ? 's' : ''} in this area</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
