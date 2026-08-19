import { useState, useRef, useCallback } from 'react';
import { useApp } from '../AppContext';
import { t } from '../i18n';
import { createReport } from '../mockData';
import { severityFromAqi, SEVERITY_THRESHOLDS, POLLUTION_TYPE_META } from '../types';
import { severityColor } from '../lib/helpers';
import type { PollutionType, Severity, AlertNotification, SensorReading } from '../types';
import { Upload, Loader2, MapPin, Sparkles, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface AIResult {
  pollution_type: string;
  severity: string;
  aqi_estimate: number;
  description: string;
  ai_analysis: string;
  alert_summary: string;
  source: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function UploadReport({ onClose }: { onClose: () => void }) {
  const { language, addReport, addAlert, sensors } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState(-23.5505);
  const [lng, setLng] = useState(-46.6333);
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(language === 'pt' ? 'Por favor envie um arquivo de imagem.' : 'Please upload an image file.');
      return;
    }
    setMimeType(file.type);
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setImage(base64);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, [language]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError(language === 'pt' ? 'Geolocalização não suportada.' : 'Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocation(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
      },
      () => {
        setError(language === 'pt' ? 'Não foi possível obter sua localização.' : 'Could not get your location.');
      }
    );
  };

  const findNearestSensor = (targetLat: number, targetLng: number): SensorReading | null => {
    let nearest: SensorReading | null = null;
    let minDist = Infinity;
    sensors.forEach((s) => {
      const dist = Math.sqrt((s.lat - targetLat) ** 2 + (s.lng - targetLng) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = s;
      }
    });
    return nearest;
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);
    setAiResult(null);

    const nearestSensor = findNearestSensor(lat, lng);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-pollution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          imageBase64: image,
          mimeType,
          location_name: location || `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
          sensorData: nearestSensor
            ? { aqi: nearestSensor.aqi, pm25: nearestSensor.pm25, pm10: nearestSensor.pm10, no2: nearestSensor.no2 }
            : undefined,
          language,
        }),
      });

      if (!res.ok) throw new Error(`Analysis failed (${res.status})`);

      const data: AIResult = await res.json();
      setAiResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const submitReport = () => {
    if (!aiResult) return;

    const sev = aiResult.severity as Severity;
    const type = aiResult.pollution_type as PollutionType;
    const report = createReport(
      lat,
      lng,
      location || `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
      type,
      sev,
      aiResult.aqi_estimate,
      description || aiResult.description,
      image ? `data:${mimeType};base64,${image}` : null,
      aiResult.ai_analysis
    );

    addReport(report);

    // Trigger alert if severity is high or critical
    if (sev === 'critical' || sev === 'high') {
      const alert: AlertNotification = {
        id: `alert_${report.id}`,
        report_id: report.id,
        location_name: report.location_name,
        severity: sev,
        message: aiResult.alert_summary,
        timestamp: new Date().toISOString(),
      };
      addAlert(alert);
      report.alert_sent = true;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto scrollbar-thin rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-cyan-400" />
            <h2 className="font-display text-lg font-bold text-white">{t(language, 'upload_title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <p className="text-sm text-slate-400">{t(language, 'upload_desc')}</p>

          {/* Upload area */}
          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/40 py-12 transition-colors hover:border-cyan-500 hover:bg-slate-800/60"
            >
              <Upload className="h-10 w-10 text-slate-500" />
              <p className="text-sm text-slate-400">{t(language, 'upload_drag')}</p>
              <span className="rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-400">
                {t(language, 'upload_choose')}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-slate-700">
                <img
                  src={`data:${mimeType};base64,${image}`}
                  alt="upload preview"
                  className="h-48 w-full object-cover"
                />
                <button
                  onClick={() => { setImage(null); setAiResult(null); setImageName(''); }}
                  className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-white hover:bg-black/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">{imageName}</p>
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">{t(language, 'upload_location')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lat, Lng or city name"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={useMyLocation}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-cyan-400 hover:bg-slate-700 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">{t(language, 'upload_use_my_location')}</span>
              </button>
            </div>
            <div className="flex gap-2 text-xs text-slate-500">
              <span>Lat: <input type="number" step="0.0001" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} className="w-24 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-white" /></span>
              <span>Lng: <input type="number" step="0.0001" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} className="w-24 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-white" /></span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">{t(language, 'upload_description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              placeholder="What do you see?"
            />
          </div>

          {/* Analyze button */}
          {image && !aiResult && (
            <button
              onClick={analyze}
              disabled={analyzing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-brand-600 py-3 font-semibold text-white transition-all hover:from-cyan-400 hover:to-brand-500 disabled:opacity-60"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t(language, 'upload_analyzing')}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  {language === 'pt' ? 'Analisar com IA' : 'Analyze with AI'}
                </>
              )}
            </button>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* AI Result */}
          {aiResult && (
            <div className="space-y-4 animate-slide-up rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
                <Sparkles className="h-4 w-4" />
                {t(language, 'upload_ai_result')}
                <span className={`ml-auto rounded px-2 py-0.5 text-xs ${aiResult.source === 'gemini' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-400'}`}>
                  {aiResult.source === 'gemini' ? 'Gemini AI' : 'Simulated AI'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500">{t(language, 'upload_type')}</div>
                  <div className="text-sm font-medium text-white">
                    {POLLUTION_TYPE_META[aiResult.pollution_type as PollutionType]?.[language] ?? aiResult.pollution_type}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">{t(language, 'upload_severity')}</div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ background: severityColor(aiResult.severity as Severity) }}
                    >
                      {language === 'pt'
                        ? SEVERITY_THRESHOLDS[aiResult.severity as Severity]?.label_pt
                        : SEVERITY_THRESHOLDS[aiResult.severity as Severity]?.label_en}
                    </span>
                    <span className="text-sm font-bold text-white">AQI ~{aiResult.aqi_estimate}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300">{aiResult.description}</p>
              <p className="text-xs text-slate-400">{aiResult.ai_analysis}</p>

              {(aiResult.severity === 'critical' || aiResult.severity === 'high') && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-400">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{aiResult.alert_summary}</span>
                </div>
              )}

              <button
                onClick={submitReport}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-eco-500 py-3 font-semibold text-white transition-all hover:bg-eco-400"
              >
                <CheckCircle2 className="h-5 w-5" />
                {t(language, 'upload_submit')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
