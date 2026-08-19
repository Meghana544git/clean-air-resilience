import type { SensorReading, Severity } from '../types';
import { SEVERITY_THRESHOLDS, severityFromAqi } from '../types';

export function aqiColor(aqi: number): string {
  const sev = severityFromAqi(aqi);
  return SEVERITY_THRESHOLDS[sev].color;
}

export function aqiLabel(aqi: number, lang: 'en' | 'pt'): string {
  const sev = severityFromAqi(aqi);
  if (lang === 'pt') return SEVERITY_THRESHOLDS[sev].label_pt;
  return SEVERITY_THRESHOLDS[sev].label_en;
}

export function severityColor(severity: Severity): string {
  return SEVERITY_THRESHOLDS[severity].color;
}

export function timeAgo(iso: string, lang: 'en' | 'pt'): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (lang === 'pt') {
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (mins > 0) return `${mins}min atrás`;
    return 'agora';
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function getSourceIcon(source: SensorReading['source']): string {
  switch (source) {
    case 'openaq': return 'Radio';
    case 'satellite': return 'Satellite';
    case 'mock_sensor': return 'Cpu';
  }
}
