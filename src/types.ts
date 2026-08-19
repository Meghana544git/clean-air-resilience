export type Language = 'en' | 'pt';

export type PollutionType = 'smoke' | 'burning' | 'industrial_haze' | 'dust' | 'vehicle_emissions';

export type Severity = 'low' | 'moderate' | 'high' | 'critical';

export interface SensorReading {
  id: string;
  lat: number;
  lng: number;
  location_name: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  source: 'openaq' | 'mock_sensor' | 'satellite';
  updated_at: string;
}

export interface PollutionReport {
  id: string;
  lat: number;
  lng: number;
  location_name: string;
  type: PollutionType;
  severity: Severity;
  aqi_estimate: number;
  description: string;
  photo_url: string | null;
  ai_analysis: string | null;
  alert_sent: boolean;
  created_at: string;
}

export interface ForecastPoint {
  hour: string;
  aqi: number;
  confidence: number;
}

export interface AlertNotification {
  id: string;
  report_id: string;
  location_name: string;
  severity: Severity;
  message: string;
  timestamp: string;
}

export const SEVERITY_THRESHOLDS: Record<Severity, { min: number; label_en: string; label_pt: string; color: string }> = {
  low: { min: 0, label_en: 'Low', label_pt: 'Baixo', color: '#22c55e' },
  moderate: { min: 51, label_en: 'Moderate', label_pt: 'Moderado', color: '#f59e0b' },
  high: { min: 101, label_en: 'High', label_pt: 'Alto', color: '#ef4444' },
  critical: { min: 151, label_en: 'Critical', label_pt: 'Crítico', color: '#991b1b' },
};

export function severityFromAqi(aqi: number): Severity {
  if (aqi >= 151) return 'critical';
  if (aqi >= 101) return 'high';
  if (aqi >= 51) return 'moderate';
  return 'low';
}

export const POLLUTION_TYPE_META: Record<PollutionType, { icon: string; en: string; pt: string }> = {
  smoke: { icon: 'Cloud', en: 'Smoke', pt: 'Fumaça' },
  burning: { icon: 'Flame', en: 'Open Burning', pt: 'Queimada' },
  industrial_haze: { icon: 'Factory', en: 'Industrial Haze', pt: 'Névoa Industrial' },
  dust: { icon: 'Wind', en: 'Dust', pt: 'Poeira' },
  vehicle_emissions: { icon: 'Car', en: 'Vehicle Emissions', pt: 'Emissões Veiculares' },
};
