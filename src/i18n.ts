import type { Language } from './types';

type TranslationKey =
  | 'app_title'
  | 'app_subtitle'
  | 'nav_dashboard'
  | 'nav_map'
  | 'nav_reports'
  | 'nav_forecast'
  | 'upload_report'
  | 'upload_title'
  | 'upload_desc'
  | 'upload_choose'
  | 'upload_drag'
  | 'upload_analyzing'
  | 'upload_submit'
  | 'upload_location'
  | 'upload_use_my_location'
  | 'upload_severity'
  | 'upload_type'
  | 'upload_description'
  | 'upload_ai_result'
  | 'forecast_title'
  | 'forecast_subtitle'
  | 'forecast_hour'
  | 'forecast_aqi'
  | 'forecast_confidence'
  | 'alerts_title'
  | 'alerts_empty'
  | 'alerts_sent_to'
  | 'alerts_clear'
  | 'stats_sensors'
  | 'stats_reports'
  | 'stats_alerts'
  | 'stats_avg_aqi'
  | 'reports_title'
  | 'reports_empty'
  | 'reports_severity'
  | 'reports_type'
  | 'reports_time'
  | 'reports_view'
  | 'map_legend'
  | 'map_hotspots'
  | 'map_sensors'
  | 'map_reports'
  | 'data_sources'
  | 'source_openaq'
  | 'source_sensor'
  | 'source_satellite'
  | 'aqi_good'
  | 'aqi_moderate'
  | 'aqi_unhealthy'
  | 'aqi_hazardous'
  | 'lang_toggle'
  | 'powered_by'
  | 'ai_analyzing'
  | 'ai_summary'
  | 'ai_generate'
  | 'alert_threshold'
  | 'alert_triggered';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    app_title: 'Clean Air & Climate Resilience',
    app_subtitle: 'AI-powered pollution monitoring & citizen reporting for BRICS communities',
    nav_dashboard: 'Dashboard',
    nav_map: 'Live Map',
    nav_reports: 'Reports',
    nav_forecast: 'Forecast',
    upload_report: 'Report Pollution',
    upload_title: 'Report Pollution Incident',
    upload_desc: 'Upload a photo of pollution in your area. Our AI will analyze it and classify the type and severity.',
    upload_choose: 'Choose Photo',
    upload_drag: 'Drag & drop or click to upload',
    upload_analyzing: 'AI is analyzing your photo…',
    upload_submit: 'Submit Report',
    upload_location: 'Location',
    upload_use_my_location: 'Use my location',
    upload_severity: 'Detected Severity',
    upload_type: 'Pollution Type',
    upload_description: 'Description (optional)',
    upload_ai_result: 'AI Analysis Result',
    forecast_title: 'Air Quality Forecast',
    forecast_subtitle: 'Next 24 hours AI-predicted AQI trend',
    forecast_hour: 'Hour',
    forecast_aqi: 'AQI',
    forecast_confidence: 'Confidence',
    alerts_title: 'Authority Alerts',
    alerts_empty: 'No alerts triggered yet. Alerts are sent when pollution severity crosses the critical threshold.',
    alerts_sent_to: 'Alert sent to: Municipal Environmental Authority',
    alerts_clear: 'Clear all',
    stats_sensors: 'Active Sensors',
    stats_reports: 'Citizen Reports',
    stats_alerts: 'Alerts Sent',
    stats_avg_aqi: 'Avg AQI',
    reports_title: 'Citizen Reports',
    reports_empty: 'No reports yet. Be the first to report pollution in your area.',
    reports_severity: 'Severity',
    reports_type: 'Type',
    reports_time: 'Time',
    reports_view: 'View on map',
    map_legend: 'Legend',
    map_hotspots: 'Pollution Hotspots',
    map_sensors: 'Sensor Stations',
    map_reports: 'Citizen Reports',
    data_sources: 'Data Sources',
    source_openaq: 'OpenAQ Live',
    source_sensor: 'Mock Sensors',
    source_satellite: 'Satellite (Simulated)',
    aqi_good: 'Good',
    aqi_moderate: 'Moderate',
    aqi_unhealthy: 'Unhealthy',
    aqi_hazardous: 'Hazardous',
    lang_toggle: 'PT',
    powered_by: 'Gemini AI · OpenAQ · Leaflet',
    ai_analyzing: 'AI analyzing photo…',
    ai_summary: 'AI Alert Summary',
    ai_generate: 'Generate Authority Alert',
    alert_threshold: 'Alert Threshold',
    alert_triggered: 'Alert triggered and sent to authorities!',
  },
  pt: {
    app_title: 'Ar Limpo & Resiliência Climática',
    app_subtitle: 'Monitoramento de poluição com IA e relatos cidadãos para comunidades dos BRICS',
    nav_dashboard: 'Painel',
    nav_map: 'Mapa ao Vivo',
    nav_reports: 'Relatos',
    nav_forecast: 'Previsão',
    upload_report: 'Relatar Poluição',
    upload_title: 'Relatar Incidente de Poluição',
    upload_desc: 'Envie uma foto da poluição em sua área. Nossa IA irá analisá-la e classificar o tipo e a severidade.',
    upload_choose: 'Escolher Foto',
    upload_drag: 'Arraste ou clique para enviar',
    upload_analyzing: 'A IA está analisando sua foto…',
    upload_submit: 'Enviar Relato',
    upload_location: 'Localização',
    upload_use_my_location: 'Usar minha localização',
    upload_severity: 'Severidade Detectada',
    upload_type: 'Tipo de Poluição',
    upload_description: 'Descrição (opcional)',
    upload_ai_result: 'Resultado da Análise IA',
    forecast_title: 'Previsão de Qualidade do Ar',
    forecast_subtitle: 'Tendência de AQI prevista por IA nas próximas 24 horas',
    forecast_hour: 'Hora',
    forecast_aqi: 'AQI',
    forecast_confidence: 'Confiança',
    alerts_title: 'Alertas às Autoridades',
    alerts_empty: 'Nenhum alerta disparado ainda. Alertas são enviados quando a severidade da poluição ultrapassa o limite crítico.',
    alerts_sent_to: 'Alerta enviado para: Autoridade Ambiental Municipal',
    alerts_clear: 'Limpar tudo',
    stats_sensors: 'Sensores Ativos',
    stats_reports: 'Relatos Cidadãos',
    stats_alerts: 'Alertas Enviados',
    stats_avg_aqi: 'AQI Médio',
    reports_title: 'Relatos Cidadãos',
    reports_empty: 'Nenhum relato ainda. Seja o primeiro a relatar poluição em sua área.',
    reports_severity: 'Severidade',
    reports_type: 'Tipo',
    reports_time: 'Hora',
    reports_view: 'Ver no mapa',
    map_legend: 'Legenda',
    map_hotspots: 'Pontos de Poluição',
    map_sensors: 'Estações de Sensor',
    map_reports: 'Relatos Cidadãos',
    data_sources: 'Fontes de Dados',
    source_openaq: 'OpenAQ Ao Vivo',
    source_sensor: 'Sensores Simulados',
    source_satellite: 'Satélite (Simulado)',
    aqi_good: 'Boa',
    aqi_moderate: 'Moderada',
    aqi_unhealthy: 'Insalubre',
    aqi_hazardous: 'Perigosa',
    lang_toggle: 'EN',
    powered_by: 'IA Gemini · OpenAQ · Leaflet',
    ai_analyzing: 'IA analisando foto…',
    ai_summary: 'Resumo de Alerta IA',
    ai_generate: 'Gerar Alerta para Autoridade',
    alert_threshold: 'Limite de Alerta',
    alert_triggered: 'Alerta disparado e enviado às autoridades!',
  },
};

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key] ?? key;
}
