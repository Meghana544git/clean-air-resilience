import { useApp } from '../AppContext';
import { t } from '../i18n';
import { severityColor, timeAgo } from '../lib/helpers';
import { SEVERITY_THRESHOLDS, POLLUTION_TYPE_META } from '../types';
import type { PollutionReport } from '../types';
import { FileImage, MapPin, Bell, Sparkles } from 'lucide-react';

export default function ReportsList() {
  const { reports, language, setMapFocus, setSelectedView } = useApp();

  const viewOnMap = (report: PollutionReport) => {
    setMapFocus({ lat: report.lat, lng: report.lng });
    setSelectedView('map');
  };

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 text-center backdrop-blur">
        <FileImage className="mx-auto mb-3 h-10 w-10 text-slate-600" />
        <p className="text-sm text-slate-500">{t(language, 'reports_empty')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur">
      <h3 className="mb-4 font-display text-base font-bold text-white">{t(language, 'reports_title')}</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
        {reports.map((report) => (
          <div
            key={report.id}
            className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 transition-colors hover:border-slate-600"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-2 py-0.5 text-xs font-bold text-white"
                  style={{ background: severityColor(report.severity) }}
                >
                  {language === 'pt'
                    ? SEVERITY_THRESHOLDS[report.severity].label_pt
                    : SEVERITY_THRESHOLDS[report.severity].label_en}
                </span>
                <span className="text-xs text-slate-400">
                  {POLLUTION_TYPE_META[report.type][language]}
                </span>
              </div>
              <span className="shrink-0 text-xs text-slate-500">{timeAgo(report.created_at, language)}</span>
            </div>

            <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              {report.location_name}
            </div>

            {report.photo_url && (
              <img
                src={report.photo_url}
                alt="pollution report"
                className="mb-2 h-28 w-full rounded-lg object-cover"
              />
            )}

            <p className="text-sm text-slate-300">{report.description}</p>

            {report.ai_analysis && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs text-slate-400">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span>{report.ai_analysis}</span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500">AQI ~<span className="font-bold" style={{ color: severityColor(report.severity) }}>{report.aqi_estimate}</span></span>
                {report.alert_sent && (
                  <span className="flex items-center gap-1 text-red-400">
                    <Bell className="h-3 w-3" />
                    {language === 'pt' ? 'Alerta enviado' : 'Alert sent'}
                  </span>
                )}
              </div>
              <button
                onClick={() => viewOnMap(report)}
                className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-cyan-400 hover:bg-slate-700 transition-colors"
              >
                {t(language, 'reports_view')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
