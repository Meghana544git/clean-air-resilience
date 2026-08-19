import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { useApp } from '../AppContext';
import { t } from '../i18n';
import { aqiColor, severityColor, timeAgo } from '../lib/helpers';
import type { SensorReading, PollutionReport } from '../types';
import { SEVERITY_THRESHOLDS, POLLUTION_TYPE_META } from '../types';

// Custom report marker icon
function createReportIcon(severity: string): L.DivIcon {
  const color = SEVERITY_THRESHOLDS[severity as keyof typeof SEVERITY_THRESHOLDS]?.color ?? '#ef4444';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 2px solid rgba(255,255,255,0.8);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 12px rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
    "><div style="transform: rotate(45deg); width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}



export default function MapView() {
  const { sensors, reports, language, mapFocus, loadingSensors } = useApp();

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-700/50">
      <MapContainer
        center={[10, 20]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        className="h-full w-full"
        style={{ background: '#0f1a22' }}
        ref={(map: LeafletMap | null) => {
          if (map && mapFocus) {
            map.flyTo([mapFocus.lat, mapFocus.lng], 10, { duration: 1.5 });
          }
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap, &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Sensor readings as circle markers */}
        {sensors.map((sensor: SensorReading) => {
          const color = aqiColor(sensor.aqi);
          return (
            <CircleMarker
              key={sensor.id}
              center={[sensor.lat, sensor.lng]}
              radius={sensor.source === 'satellite' ? 6 : 10}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.6,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="font-semibold text-sm">{sensor.location_name}</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>AQI</span>
                      <span className="font-bold" style={{ color }}>{sensor.aqi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PM2.5</span>
                      <span>{sensor.pm25} µg/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PM10</span>
                      <span>{sensor.pm10} µg/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NO₂</span>
                      <span>{sensor.no2} µg/m³</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-slate-600 pt-1">
                      <span>{t(language, 'data_sources')}</span>
                      <span className="text-cyan-400">{sensor.source}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Citizen reports as pin markers */}
        {reports.map((report: PollutionReport) => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={createReportIcon(report.severity)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="mb-2">
                  <span className="font-semibold text-sm">{report.location_name}</span>
                </div>
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <span
                    className="rounded px-2 py-0.5 font-semibold text-white"
                    style={{ background: severityColor(report.severity) }}
                  >
                    {language === 'pt'
                      ? SEVERITY_THRESHOLDS[report.severity].label_pt
                      : SEVERITY_THRESHOLDS[report.severity].label_en}
                  </span>
                  <span className="text-slate-400">
                    {POLLUTION_TYPE_META[report.type][language]}
                  </span>
                </div>
                {report.photo_url && (
                  <img
                    src={report.photo_url}
                    alt="report"
                    className="mb-2 h-24 w-full rounded object-cover"
                  />
                )}
                <p className="text-xs text-slate-300">{report.description}</p>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>AQI ~{report.aqi_estimate}</span>
                  <span>{timeAgo(report.created_at, language)}</span>
                </div>
                {report.alert_sent && (
                  <div className="mt-2 rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">
                    {t(language, 'alerts_sent_to')}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend overlay */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-[1000] rounded-xl border border-slate-700/60 bg-slate-900/90 p-3 backdrop-blur-md">
        <div className="mb-2 text-xs font-semibold text-slate-300">{t(language, 'map_legend')}</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-full" style={{ background: '#22c55e' }} />
            <span className="text-slate-400">{t(language, 'aqi_good')} (0-50)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-full" style={{ background: '#f59e0b' }} />
            <span className="text-slate-400">{t(language, 'aqi_moderate')} (51-100)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-full" style={{ background: '#ef4444' }} />
            <span className="text-slate-400">{t(language, 'aqi_unhealthy')} (101-150)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-full" style={{ background: '#991b1b' }} />
            <span className="text-slate-400">{t(language, 'aqi_hazardous')} (151+)</span>
          </div>
        </div>
      </div>

      {loadingSensors && (
        <div className="absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-900/90 px-4 py-2 text-sm text-cyan-400 backdrop-blur">
          Loading sensors…
        </div>
      )}

    </div>
  );
}
