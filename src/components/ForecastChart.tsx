import { useApp } from '../AppContext';
import { t } from '../i18n';
import { aqiColor } from '../lib/helpers';
import type { ForecastPoint } from '../types';
import { TrendingUp, Activity } from 'lucide-react';

export default function ForecastChart() {
  const { forecast, language } = useApp();

  if (forecast.length === 0) return null;

  const maxAqi = Math.max(...forecast.map((p) => p.aqi), 200);
  const chartHeight = 180;
  const chartWidth = 100; // percentage based

  // Build SVG path for the AQI line
  const points = forecast.map((p: ForecastPoint, i: number) => {
    const x = (i / (forecast.length - 1)) * chartWidth;
    const y = chartHeight - (p.aqi / maxAqi) * chartHeight;
    return { x, y, aqi: p.aqi, hour: p.hour, confidence: p.confidence };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `M 0 ${chartHeight} ${linePath.replace('M', 'L')} L ${chartWidth} ${chartHeight} Z`;

  // Mark every 4th hour for labels
  const labelPoints = points.filter((_, i) => i % 4 === 0);

  const avgAqi = Math.round(forecast.reduce((s, p) => s + p.aqi, 0) / forecast.length);
  const peakAqi = Math.max(...forecast.map((p) => p.aqi));
  const peakHour = forecast.find((p) => p.aqi === peakAqi)?.hour ?? '';

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="font-display text-base font-bold text-white">{t(language, 'forecast_title')}</h3>
            <p className="text-xs text-slate-500">{t(language, 'forecast_subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <div className="text-xs text-slate-500">Avg</div>
            <div className="font-display text-lg font-bold" style={{ color: aqiColor(avgAqi) }}>{avgAqi}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Peak</div>
            <div className="font-display text-lg font-bold" style={{ color: aqiColor(peakAqi) }}>{peakAqi}</div>
            <div className="text-[10px] text-slate-600">{peakHour}</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="h-[180px] w-full"
        >
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Threshold lines */}
          <line x1="0" y1={chartHeight - (50 / maxAqi) * chartHeight} x2={chartWidth} y2={chartHeight - (50 / maxAqi) * chartHeight} stroke="#22c55e" strokeWidth="0.3" strokeDasharray="1 1" opacity="0.4" />
          <line x1="0" y1={chartHeight - (100 / maxAqi) * chartHeight} x2={chartWidth} y2={chartHeight - (100 / maxAqi) * chartHeight} stroke="#f59e0b" strokeWidth="0.3" strokeDasharray="1 1" opacity="0.4" />
          <line x1="0" y1={chartHeight - (150 / maxAqi) * chartHeight} x2={chartWidth} y2={chartHeight - (150 / maxAqi) * chartHeight} stroke="#ef4444" strokeWidth="0.3" strokeDasharray="1 1" opacity="0.4" />

          {/* Area fill */}
          <path d={areaPath} fill="url(#aqiGradient)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#22d3ee" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="0.8"
              fill={aqiColor(p.aqi)}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          {labelPoints.map((p, i) => (
            <span key={i}>{p.hour}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Activity className="h-3.5 w-3.5" />
        <span>{language === 'pt' ? 'Gerado por IA com base nos dados atuais dos sensores' : 'AI-generated based on current sensor data'}</span>
      </div>
    </div>
  );
}
