import { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { t } from './i18n';
import MapView from './components/MapView';
import UploadReport from './components/UploadReport';
import ForecastChart from './components/ForecastChart';
import AlertsPanel from './components/AlertsPanel';
import StatsBar from './components/StatsBar';
import ReportsList from './components/ReportsList';
import {
  LayoutDashboard,
  Map,
  FileImage,
  TrendingUp,
  Upload,
  Wind,
  Globe,
  Satellite,
  Cpu,
  Radio,
  Sparkles,
} from 'lucide-react';

function Header() {
  const { language, setLanguage } = useApp();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-[1500] border-b border-slate-700/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-brand-600 shadow-lg shadow-cyan-500/20">
              <Wind className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold leading-tight text-white sm:text-lg">
                {t(language, 'app_title')}
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">{t(language, 'app_subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-400 md:flex">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              {t(language, 'powered_by')}
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-cyan-400 transition-colors hover:bg-slate-700"
            >
              <Globe className="h-4 w-4" />
              {t(language, 'lang_toggle')}
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-brand-500 sm:px-4"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{t(language, 'upload_report')}</span>
            </button>
          </div>
        </div>
      </header>
      {showUpload && <UploadReport onClose={() => setShowUpload(false)} />}
    </>
  );
}

function Sidebar() {
  const { language, selectedView, setSelectedView } = useApp();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t(language, 'nav_dashboard') },
    { id: 'map', icon: Map, label: t(language, 'nav_map') },
    { id: 'reports', icon: FileImage, label: t(language, 'nav_reports') },
    { id: 'forecast', icon: TrendingUp, label: t(language, 'nav_forecast') },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto p-2 sm:flex-col sm:p-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = selectedView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setSelectedView(item.id)}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all sm:w-full sm:px-4 ${
              active
                ? 'bg-gradient-to-r from-cyan-500/20 to-brand-600/10 text-cyan-400'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
            {active && <span className="ml-auto hidden h-2 w-2 rounded-full bg-cyan-400 sm:block" />}
          </button>
        );
      })}

      <div className="mt-4 hidden border-t border-slate-700/40 pt-4 sm:block">
        <div className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
          {t(language, 'data_sources')}
        </div>
        <div className="space-y-2 px-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            {t(language, 'source_openaq')}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Cpu className="h-3.5 w-3.5 text-eco-400" />
            {t(language, 'source_sensor')}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Satellite className="h-3.5 w-3.5 text-warn-500" />
            {t(language, 'source_satellite')}
          </div>
        </div>
      </div>
    </nav>
  );
}

function DashboardView() {
  return (
    <div className="space-y-4 animate-fade-in">
      <StatsBar />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[400px]">
          <MapView />
        </div>
        <div className="space-y-4">
          <AlertsPanel />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ForecastChart />
        <ReportsList />
      </div>
    </div>
  );
}

function MapViewFull() {
  return (
    <div className="h-[calc(100vh-180px)] animate-fade-in">
      <MapView />
    </div>
  );
}

function AppContent() {
  const { selectedView } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex h-16" />
      <Header />
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-60 shrink-0 border-r border-slate-700/50 bg-slate-950/50 p-2 backdrop-blur md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 p-4 sm:p-6">
          {/* Mobile nav */}
          <div className="mb-4 md:hidden">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/60 p-1.5 backdrop-blur">
              <Sidebar />
            </div>
          </div>

          {selectedView === 'dashboard' && <DashboardView />}
          {selectedView === 'map' && <MapViewFull />}
          {selectedView === 'reports' && (
            <div className="animate-fade-in">
              <ReportsList />
            </div>
          )}
          {selectedView === 'forecast' && (
            <div className="animate-fade-in">
              <ForecastChart />
              <div className="mt-4">
                <StatsBar />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
