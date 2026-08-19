import { useApp } from '../AppContext';
import { t } from '../i18n';
import { aqiColor } from '../lib/helpers';
import { Radio, FileImage, Bell, Activity } from 'lucide-react';

export default function StatsBar() {
  const { sensors, reports, alerts, language, loadingSensors } = useApp();

  const avgAqi = sensors.length > 0
    ? Math.round(sensors.reduce((s, sensor) => s + sensor.aqi, 0) / sensors.length)
    : 0;

  const stats = [
    {
      label: t(language, 'stats_sensors'),
      value: loadingSensors ? '…' : sensors.length.toString(),
      icon: Radio,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: t(language, 'stats_reports'),
      value: reports.length.toString(),
      icon: FileImage,
      color: 'text-eco-400',
      bg: 'bg-eco-500/10',
    },
    {
      label: t(language, 'stats_alerts'),
      value: alerts.length.toString(),
      icon: Bell,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: t(language, 'stats_avg_aqi'),
      value: avgAqi.toString(),
      icon: Activity,
      color: loadingSensors ? 'text-slate-400' : avgAqi > 100 ? 'text-red-400' : avgAqi > 50 ? 'text-warn-500' : 'text-eco-400',
      bg: 'bg-slate-700/30',
      valueColor: loadingSensors ? undefined : aqiColor(avgAqi),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="animate-slide-up rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className={`rounded-lg ${stat.bg} p-2`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div
              className="font-display text-2xl font-bold text-white"
              style={stat.valueColor ? { color: stat.valueColor } : undefined}
            >
              {stat.value}
            </div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
