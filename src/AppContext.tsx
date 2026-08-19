import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Language, SensorReading, PollutionReport, AlertNotification, ForecastPoint } from './types';
import { generateMockSensors, fetchOpenAQ, generateForecast, seedReports } from './mockData';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  sensors: SensorReading[];
  reports: PollutionReport[];
  alerts: AlertNotification[];
  forecast: ForecastPoint[];
  loadingSensors: boolean;
  addReport: (report: PollutionReport) => void;
  addAlert: (alert: AlertNotification) => void;
  clearAlerts: () => void;
  refreshForecast: (baseAqi: number) => void;
  selectedView: string;
  setSelectedView: (view: string) => void;
  mapFocus: { lat: number; lng: number } | null;
  setMapFocus: (focus: { lat: number; lng: number } | null) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [reports, setReports] = useState<PollutionReport[]>(seedReports());
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loadingSensors, setLoadingSensors] = useState(true);
  const [selectedView, setSelectedView] = useState('dashboard');
  const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number } | null>(null);

  // Load sensors: try OpenAQ first, always merge with mock data
  const loadSensors = useCallback(async () => {
    setLoadingSensors(true);
    const mock = generateMockSensors();
    const live = await fetchOpenAQ();
    // Merge: if OpenAQ returned data for a city, replace the mock entry for that city
    const merged: SensorReading[] = [];
    const liveCities = new Set(live.map((s) => s.location_name.split(' (')[0]));
    mock.forEach((s) => {
      const cityName = s.location_name.split(',')[0];
      if (s.source === 'mock_sensor' && liveCities.has(cityName)) {
        // Skip — live data replaces this
        return;
      }
      merged.push(s);
    });
    merged.push(...live);
    setSensors(merged);

    const avgAqi = merged.length > 0
      ? Math.round(merged.reduce((sum, s) => sum + s.aqi, 0) / merged.length)
      : 80;
    setForecast(generateForecast(avgAqi));
    setLoadingSensors(false);
  }, []);

  useEffect(() => {
    loadSensors();
  }, [loadSensors]);

  const addReport = useCallback((report: PollutionReport) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const addAlert = useCallback((alert: AlertNotification) => {
    setAlerts((prev) => [alert, ...prev]);
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  const refreshForecast = useCallback((baseAqi: number) => {
    setForecast(generateForecast(baseAqi));
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        sensors,
        reports,
        alerts,
        forecast,
        loadingSensors,
        addReport,
        addAlert,
        clearAlerts,
        refreshForecast,
        selectedView,
        setSelectedView,
        mapFocus,
        setMapFocus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
