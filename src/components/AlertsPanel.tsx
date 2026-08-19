import { useApp } from '../AppContext';
import { t } from '../i18n';
import { severityColor, timeAgo } from '../lib/helpers';
import { SEVERITY_THRESHOLDS } from '../types';
import { Bell, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';

export default function AlertsPanel() {
  const { alerts, language, clearAlerts } = useApp();

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-red-400" />
          <h3 className="font-display text-base font-bold text-white">{t(language, 'alerts_title')}</h3>
          {alerts.length > 0 && (
            <span className="animate-pulse-ring rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {alerts.length}
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button
            onClick={clearAlerts}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t(language, 'alerts_clear')}
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-eco-500/40" />
          <p className="max-w-xs text-sm text-slate-500">{t(language, 'alerts_empty')}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="animate-slide-up rounded-xl border-l-4 bg-slate-800/50 p-3"
              style={{ borderLeftColor: severityColor(alert.severity) }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" style={{ color: severityColor(alert.severity) }} />
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: severityColor(alert.severity) }}
                  >
                    {language === 'pt'
                      ? SEVERITY_THRESHOLDS[alert.severity].label_pt
                      : SEVERITY_THRESHOLDS[alert.severity].label_en}
                  </span>
                  <span className="text-xs font-medium text-slate-300">{alert.location_name}</span>
                </div>
                <span className="text-xs text-slate-500">{timeAgo(alert.timestamp, language)}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{alert.message}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-eco-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t(language, 'alerts_sent_to')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
