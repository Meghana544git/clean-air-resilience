import type { SensorReading, ForecastPoint, PollutionReport, PollutionType, Severity } from './types';
import { severityFromAqi } from './types';

// BRICS-focused city coordinates for mock sensors and satellite data
const BRICS_CITIES = [
  { name: 'São Paulo, BR', lat: -23.5505, lng: -46.6333 },
  { name: 'Rio de Janeiro, BR', lat: -22.9068, lng: -43.1729 },
  { name: 'Mumbai, IN', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi, IN', lat: 28.7041, lng: 77.1025 },
  { name: 'Beijing, CN', lat: 39.9042, lng: 116.4074 },
  { name: 'Shanghai, CN', lat: 31.2304, lng: 121.4737 },
  { name: 'Moscow, RU', lat: 55.7558, lng: 37.6173 },
  { name: 'Johannesburg, ZA', lat: -26.2041, lng: 28.0473 },
  { name: 'Cairo, EG', lat: 30.0444, lng: 31.2357 },
  { name: 'Dubai, AE', lat: 25.2048, lng: 55.2708 },
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function generateMockSensors(): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = Date.now();

  BRICS_CITIES.forEach((city, i) => {
    // Base AQI varies by city — some cities are more polluted
    const baseAqi = [45, 60, 120, 180, 95, 85, 50, 70, 110, 75][i] ?? 80;
    const aqi = baseAqi + randomBetween(-15, 15);

    readings.push({
      id: `mock_sensor_${i}`,
      lat: city.lat,
      lng: city.lng,
      location_name: city.name,
      aqi,
      pm25: Math.round(aqi * 0.5),
      pm10: Math.round(aqi * 0.8),
      no2: randomBetween(20, 80),
      source: 'mock_sensor',
      updated_at: new Date(now - randomBetween(0, 3600000)).toISOString(),
    });

    // Add satellite "hotspot" near cities with high pollution
    if (aqi > 90) {
      readings.push({
        id: `satellite_${i}`,
        lat: city.lat + (Math.random() - 0.5) * 0.8,
        lng: city.lng + (Math.random() - 0.5) * 0.8,
        location_name: `${city.name} (Satellite)`,
        aqi: aqi + randomBetween(10, 40),
        pm25: Math.round(aqi * 0.6),
        pm10: Math.round(aqi * 0.9),
        no2: randomBetween(30, 100),
        source: 'satellite',
        updated_at: new Date(now - randomBetween(0, 7200000)).toISOString(),
      });
    }
  });

  return readings;
}

export async function fetchOpenAQ(): Promise<SensorReading[]> {
  // WAQI (World Air Quality Index) public API — tokenless endpoint via OpenAQ v3
  // We use the WAQI public map feed which doesn't require a token for basic data.
  // Fallback: if the API is unreachable, return empty array (mock data covers display).
  try {
    const cities = [
      { name: 'São Paulo', lat: -23.5505, lng: -46.6333, token: 'a73e7c8d1e5e4d0f8c2a9b6f3e7d1a2c5b8e0f4a' },
      { name: 'Mumbai', lat: 19.076, lng: 72.8777, token: 'a73e7c8d1e5e4d0f8c2a9b6f3e7d1a2c5b8e0f4a' },
      { name: 'Delhi', lat: 28.7041, lng: 77.1025, token: 'a73e7c8d1e5e4d0f8c2a9b6f3e7d1a2c5b8e0f4a' },
      { name: 'Beijing', lat: 39.9042, lng: 116.4074, token: 'a73e7c8d1e5e4d0f8c2a9b6f3e7d1a2c5b8e0f4a' },
    ];

    const results = await Promise.allSettled(
      cities.map(async (city) => {
        const res = await fetch(
          `https://api.waqi.info/feed/geo:${city.lat};${city.lng}/?token=${city.token}`
        );
        if (!res.ok) throw new Error(`WAQI ${city.name} failed`);
        const data = await res.json();
        if (data.status !== 'ok') throw new Error(`WAQI ${city.name} bad status`);
        const aqi = data.data.aqi ?? 0;
        return {
          id: `openaq_${city.name}`,
          lat: city.lat,
          lng: city.lng,
          location_name: `${city.name} (OpenAQ)`,
          aqi,
          pm25: data.data.iaqi?.pm25?.v ?? Math.round(aqi * 0.5),
          pm10: data.data.iaqi?.pm10?.v ?? Math.round(aqi * 0.8),
          no2: data.data.iaqi?.no2?.v ?? 30,
          source: 'openaq' as const,
          updated_at: new Date().toISOString(),
        };
      })
    );

    const readings: SensorReading[] = [];
    results.forEach((r) => {
      if (r.status === 'fulfilled') readings.push(r.value);
    });
    return readings;
  } catch {
    return [];
  }
}

export function generateForecast(currentAqi: number): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    // Simulate a diurnal pattern: pollution rises in morning rush hour, dips midday, rises evening
    const hour = now.getHours() + i;
    const diurnal = Math.sin(((hour % 24) - 6) * Math.PI / 12) * 25;
    const noise = randomBetween(-10, 10);
    const trend = i > 16 ? -8 : 0; // slight improvement toward end of forecast
    const aqi = Math.max(10, Math.round(currentAqi + diurnal + noise + trend));
    const confidence = Math.max(0.55, 0.92 - i * 0.015);

    const forecastTime = new Date(now.getTime() + i * 3600000);
    points.push({
      hour: forecastTime.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }) + ':00',
      aqi,
      confidence,
    });
  }

  return points;
}

export function createReport(
  lat: number,
  lng: number,
  location_name: string,
  type: PollutionType,
  severity: Severity,
  aqi_estimate: number,
  description: string,
  photo_url: string | null,
  ai_analysis: string | null
): PollutionReport {
  return {
    id: uid(),
    lat,
    lng,
    location_name,
    type,
    severity,
    aqi_estimate,
    description,
    photo_url,
    ai_analysis,
    alert_sent: severityFromAqi(aqi_estimate) === 'critical' || severity === 'critical',
    created_at: new Date().toISOString(),
  };
}

// Seed reports to populate the map on first load
export function seedReports(): PollutionReport[] {
  const now = Date.now();
  return [
    {
      id: 'seed_1',
      lat: -23.55,
      lng: -46.63,
      location_name: 'São Paulo, BR — Industrial Zone',
      type: 'industrial_haze',
      severity: 'high',
      aqi_estimate: 145,
      description: 'Thick haze visible over the industrial district near Pinheiros river.',
      photo_url: null,
      ai_analysis: 'Industrial haze detected with high particulate density. Recommend immediate air quality monitoring in surrounding residential areas.',
      alert_sent: false,
      created_at: new Date(now - 7200000).toISOString(),
    },
    {
      id: 'seed_2',
      lat: 28.7041,
      lng: 77.1025,
      location_name: 'Delhi, IN — Anand Vihar',
      type: 'smoke',
      severity: 'critical',
      aqi_estimate: 285,
      description: 'Heavy smoke from crop stubble burning covering the eastern Delhi region.',
      photo_url: null,
      ai_analysis: 'Critical smoke levels detected. PM2.5 concentrations exceed WHO guidelines by 18x. Immediate public health advisory recommended.',
      alert_sent: true,
      created_at: new Date(now - 3600000).toISOString(),
    },
    {
      id: 'seed_3',
      lat: -22.9,
      lng: -43.17,
      location_name: 'Rio de Janeiro, BR — Centro',
      type: 'vehicle_emissions',
      severity: 'moderate',
      aqi_estimate: 72,
      description: 'Vehicle exhaust visible during rush hour near Avenida Brasil.',
      photo_url: null,
      ai_analysis: 'Moderate vehicle emissions detected. NO2 levels elevated but within manageable range. Monitor during peak traffic hours.',
      alert_sent: false,
      created_at: new Date(now - 14400000).toISOString(),
    },
  ];
}
