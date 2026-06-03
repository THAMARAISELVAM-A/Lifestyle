import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Activity,
  Globe,
  Wind,
  Thermometer,
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  Snowflake,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Rocket,
  Newspaper,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  RefreshCw,
  Terminal,
  Wifi,
  Radio,
  BarChart2,
  Layers
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface BaseState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface EarthquakeFeature {
  type: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tz: number | null;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number | null;
    dmin: number | null;
    rms: number;
    gap: number | null;
    magType: string;
    type: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [longitude, latitude, depth]
  };
  id: string;
}

interface EarthquakeData extends BaseState {
  features: EarthquakeFeature[];
}

interface WeatherCity {
  name: string;
  lat: number;
  lon: number;
  temperature?: number;
  windSpeed?: number;
  weatherCode?: number;
}

interface WeatherData extends BaseState {
  cities: WeatherCity[];
}

interface NewsArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
  socialimage?: string;
}

interface NewsData extends BaseState {
  articles: NewsArticle[];
}

interface CurrencyRates {
  [currency: string]: number;
}

interface CurrencyData extends BaseState {
  rates: CurrencyRates;
  base: string;
}

interface SpaceArticle {
  id: number;
  title: string;
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
  updated_at: string;
}

interface SpaceData extends BaseState {
  articles: SpaceArticle[];
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source: string;
}

// ==========================================
// CONSTANTS & CONFIG
// ==========================================

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const MAJOR_CITIES: WeatherCity[] = [
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6917 },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 }
];

const TARGET_CURRENCIES = ['EUR', 'GBP', 'JPY', 'INR', 'CNY', 'AUD'];

// ==========================================
// UTILITIES
// ==========================================

const generateId = () => Math.random().toString(36).substring(2, 9);

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const mapWeatherCode = (code: number) => {
  if (code === 0) return { icon: Sun, desc: 'Clear sky', color: 'text-cyber-yellow' };
  if ([1, 2, 3].includes(code)) return { icon: Cloud, desc: 'Partly cloudy', color: 'text-cyber-cyan' };
  if ([45, 48].includes(code)) return { icon: Wind, desc: 'Fog', color: 'text-cyber-muted' };
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: CloudRain, desc: 'Drizzle', color: 'text-cyber-blue' };
  if ([61, 63, 65, 66, 67].includes(code)) return { icon: CloudRain, desc: 'Rain', color: 'text-cyber-blue' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: Snowflake, desc: 'Snow', color: 'text-white' };
  if ([80, 81, 82].includes(code)) return { icon: CloudRain, desc: 'Rain showers', color: 'text-cyber-blue' };
  if ([95, 96, 99].includes(code)) return { icon: CloudLightning, desc: 'Thunderstorm', color: 'text-cyber-purple' };
  return { icon: Cloud, desc: 'Unknown', color: 'text-cyber-muted' };
};

const mapGeoToSvg = (lon: number, lat: number, width = 800, height = 400) => {
  const x = (lon + 180) * (width / 360);
  const y = (90 - lat) * (height / 180);
  return { x, y };
};

const getMagColor = (mag: number) => {
  if (mag >= 6) return 'text-cyber-red';
  if (mag >= 5) return 'text-cyber-orange';
  if (mag >= 4) return 'text-cyber-yellow';
  return 'text-cyber-green';
};

const getMagBgColor = (mag: number) => {
  if (mag >= 6) return 'bg-cyber-red/20 border-cyber-red';
  if (mag >= 5) return 'bg-cyber-orange/20 border-cyber-orange';
  if (mag >= 4) return 'bg-cyber-yellow/20 border-cyber-yellow';
  return 'bg-cyber-green/20 border-cyber-green';
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const TerminalLogs = ({ logs }: { logs: LogEntry[] }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-4 flex flex-col h-full bg-black/60">
      <div className="flex items-center gap-2 mb-3 border-b border-cyber-border pb-2">
        <Terminal className="w-5 h-5 text-cyber-green" />
        <h3 className="font-mono text-cyber-green text-sm font-bold tracking-wider">SYSTEM.LOGS</h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px] sm:text-xs">
        {logs.map((log) => {
          let colorClass = 'text-cyber-muted';
          if (log.level === 'error') colorClass = 'text-cyber-red';
          if (log.level === 'warn') colorClass = 'text-cyber-orange';
          if (log.level === 'success') colorClass = 'text-cyber-green';
          if (log.level === 'info') colorClass = 'text-cyber-cyan';

          return (
            <div key={log.id} className="flex items-start gap-2 break-words">
              <span className="text-cyber-muted opacity-50 shrink-0">[{formatTime(log.timestamp)}]</span>
              <span className={`shrink-0 font-bold ${colorClass}`}>[{log.source.toUpperCase()}]</span>
              <span className={colorClass}>{log.message}</span>
            </div>
          );
        })}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

const ThreatLevelIndicator = ({ earthquakes }: { earthquakes: EarthquakeData }) => {
  const threatScore = useMemo(() => {
    if (!earthquakes.features.length) return 0;
    // Calculate a threat score based on recent significant earthquakes
    const score = earthquakes.features.reduce((acc, eq) => {
      const mag = eq.properties.mag;
      if (mag >= 7) return acc + 20;
      if (mag >= 6) return acc + 10;
      if (mag >= 5) return acc + 5;
      return acc + 1;
    }, 0);
    return Math.min(Math.max(score, 0), 100);
  }, [earthquakes]);

  let threatLevel = 'LOW';
  let threatColor = 'text-cyber-green';
  let strokeColor = '#00ff00';

  if (threatScore >= 80) {
    threatLevel = 'CRITICAL';
    threatColor = 'text-cyber-red';
    strokeColor = '#ff003c';
  } else if (threatScore >= 50) {
    threatLevel = 'ELEVATED';
    threatColor = 'text-cyber-orange';
    strokeColor = '#ff9d00';
  } else if (threatScore >= 20) {
    threatLevel = 'MODERATE';
    threatColor = 'text-cyber-yellow';
    strokeColor = '#fcee0a';
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (threatScore / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-6 flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center gap-2 mb-4 w-full justify-start">
        <ShieldAlert className={`w-5 h-5 ${threatColor} animate-pulse`} />
        <h3 className="font-mono text-cyber-muted text-sm font-bold tracking-wider uppercase">Global Threat Level</h3>
      </div>
      
      <div className="relative w-40 h-40 flex items-center justify-center mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${strokeColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black font-mono ${threatColor}`}>{Math.round(threatScore)}</span>
          <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest mt-1">DEFCON</span>
        </div>
      </div>
      
      <div className={`mt-2 font-mono text-xl font-bold tracking-widest ${threatColor} ${earthquakes.isLoading ? 'animate-pulse' : ''}`}>
        {threatLevel}
      </div>
      <div className="mt-1 text-xs text-cyber-muted font-mono text-center px-4">
        Computed via real-time seismic anomaly detection algorithms
      </div>
    </div>
  );
};

const EarthquakeFeed = ({ earthquakes }: { earthquakes: EarthquakeData }) => {
  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyber-red animate-pulse" />
          <h3 className="font-mono text-cyber-red text-sm font-bold tracking-wider">SEISMIC.ACTIVITY</h3>
        </div>
        <div className="text-xs font-mono text-cyber-muted">
          {earthquakes.features.length} EVENTS RECORDED
        </div>
      </div>
      
      <div className="relative w-full h-48 mb-4 bg-black/40 rounded-xl border border-cyber-border/50 overflow-hidden flex-shrink-0">
        <svg viewBox="0 0 800 400" className="w-full h-full opacity-60">
          {/* Simple Grid Background */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 255, 255, 0.05)" strokeWidth="1"/>
          </pattern>
          <rect width="800" height="400" fill="url(#grid)" />
          
          {/* Equator & Meridian */}
          <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(0,255,255,0.2)" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="400" y1="0" x2="400" y2="400" stroke="rgba(0,255,255,0.2)" strokeWidth="1" strokeDasharray="5,5" />

          {/* Dots for Earthquakes */}
          {earthquakes.features.map(eq => {
            const [lon, lat] = eq.geometry.coordinates;
            const { x, y } = mapGeoToSvg(lon, lat);
            const mag = eq.properties.mag;
            const radius = Math.max(2, mag * 1.5);
            
            let fill = '#00ff00';
            if (mag >= 6) fill = '#ff003c';
            else if (mag >= 5) fill = '#ff9d00';
            else if (mag >= 4) fill = '#fcee0a';

            return (
              <g key={eq.id}>
                <circle cx={x} cy={y} r={radius} fill={fill} opacity="0.6" />
                {mag >= 5 && (
                  <circle cx={x} cy={y} r={radius * 3} fill="none" stroke={fill} strokeWidth="1" className="animate-ping" opacity="0.4" />
                )}
              </g>
            );
          })}
        </svg>
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 px-2 py-1 rounded border border-cyber-border/30 backdrop-blur-sm">
          <Globe className="w-3 h-3 text-cyber-cyan" />
          <span className="text-[9px] font-mono text-cyber-cyan tracking-wider">GLOBAL SENSOR NET</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {earthquakes.isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-cyber-border/20 rounded-xl animate-pulse border border-cyber-border/10" />
          ))
        ) : (
          earthquakes.features.map(eq => (
            <div key={eq.id} className={`p-3 rounded-xl border flex items-center gap-3 transition-colors hover:bg-black/40 ${getMagBgColor(eq.properties.mag)}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold font-mono text-sm bg-black/50 border border-current shadow-glass ${getMagColor(eq.properties.mag)}`}>
                {eq.properties.mag.toFixed(1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono font-bold text-white truncate group-hover:text-cyber-cyan transition-colors" title={eq.properties.place}>
                  {eq.properties.place}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[10px] text-cyber-muted font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(eq.properties.time).toLocaleDateString()} {new Date(eq.properties.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-cyber-muted font-mono">
                    <Layers className="w-3 h-3" />
                    {eq.geometry.coordinates[2].toFixed(1)} km
                  </div>
                </div>
              </div>
              <a 
                href={eq.properties.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-cyber-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors border border-cyber-border/30"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const WeatherGrid = ({ weather }: { weather: WeatherData }) => {
  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Thermometer className="w-5 h-5 text-cyber-blue" />
        <h3 className="font-mono text-cyber-blue text-sm font-bold tracking-wider">CLIMATE.GRID</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 flex-1">
        {weather.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-cyber-border/10 rounded-xl border border-cyber-border/20 animate-pulse h-24" />
          ))
        ) : (
          weather.cities.map((city, i) => {
            const { icon: WeatherIcon, color } = mapWeatherCode(city.weatherCode ?? -1);
            return (
              <div key={i} className="bg-black/40 rounded-xl border border-cyber-border/50 p-3 flex flex-col justify-between hover:border-cyber-blue/50 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyber-blue/5 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:bg-cyber-blue/10 transition-colors" />
                <div className="flex justify-between items-start z-10">
                  <span className="font-mono text-xs font-bold text-cyber-muted uppercase tracking-wider">{city.name}</span>
                  <WeatherIcon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="mt-2 z-10">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-bold text-white">
                      {city.temperature !== undefined ? city.temperature.toFixed(1) : '--'}
                    </span>
                    <span className="font-mono text-xs text-cyber-blue">°C</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-cyber-muted">
                      <Wind className="w-3 h-3 text-cyber-cyan" />
                      {city.windSpeed !== undefined ? city.windSpeed.toFixed(1) : '--'} km/h
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const CurrencyMonitor = ({ currency }: { currency: CurrencyData }) => {
  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 flex flex-col h-full relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
        <DollarSign className="w-48 h-48 text-cyber-green" />
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyber-green" />
          <h3 className="font-mono text-cyber-green text-sm font-bold tracking-wider">FX.EXCHANGE</h3>
        </div>
        <div className="bg-cyber-green/10 text-cyber-green border border-cyber-green/30 px-2 py-1 rounded text-[10px] font-mono">
          BASE: USD
        </div>
      </div>

      <div className="space-y-3 relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {currency.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-cyber-border/10 rounded-lg border border-cyber-border/20 animate-pulse" />
          ))
        ) : (
          TARGET_CURRENCIES.map(curr => {
            const rate = currency.rates[curr] || 0;
            // Generate a deterministic fake sparkline path for visual flavor
            const sparklineData = Array.from({ length: 20 }, (_, i) => 
              20 - (Math.sin(i * 0.5 + rate) * 10 + (curr.charCodeAt(0) % 5))
            );
            const pathD = `M 0 ${sparklineData[0]} ` + sparklineData.map((y, i) => `L ${i * 5} ${y}`).join(' ');
            
            // Deterministic trend
            const isUp = curr.charCodeAt(0) % 2 === 0;

            return (
              <div key={curr} className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-cyber-border/40 hover:bg-cyber-green/5 hover:border-cyber-green/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-cyber-green/10 border border-cyber-green/20 flex items-center justify-center font-mono font-bold text-cyber-green text-xs">
                    {curr}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-white text-sm font-bold group-hover:text-cyber-green transition-colors">
                      {rate.toFixed(4)}
                    </span>
                    <span className="font-mono text-[9px] text-cyber-muted flex items-center gap-1">
                      {isUp ? <TrendingUp className="w-3 h-3 text-cyber-green" /> : <TrendingDown className="w-3 h-3 text-cyber-red" />}
                      {(curr.charCodeAt(1) % 5) / 2}%
                    </span>
                  </div>
                </div>
                <div className="w-20 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                  <svg viewBox="0 0 100 40" className="w-full h-full preserve-aspect-ratio-none">
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isUp ? "#00ff00" : "#ff003c"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const SpaceMonitor = ({ space }: { space: SpaceData }) => {
  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="w-5 h-5 text-cyber-purple" />
        <h3 className="font-mono text-cyber-purple text-sm font-bold tracking-wider">AEROSPACE.INTEL</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {space.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-cyber-border/10 rounded-xl border border-cyber-border/20 animate-pulse" />
          ))
        ) : (
          space.articles.slice(0, 4).map(article => (
            <a 
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col block bg-black/40 border border-cyber-border/40 rounded-xl overflow-hidden hover:border-cyber-purple/60 hover:shadow-neon-purple transition-all group"
            >
              <div className="h-20 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-cyber-purple/20 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src={article.image_url} 
                  alt={article.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYTFhMWEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzMzMyIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMnB4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tk8gSU1BR0U8L3RleHQ+PC9zdmc+';
                  }}
                />
                <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-mono text-cyber-purple border border-cyber-purple/30 z-20">
                  {article.news_site}
                </div>
              </div>
              <div className="p-2 flex-1 flex flex-col justify-between">
                <h4 className="text-xs font-mono font-bold text-white line-clamp-2 leading-tight group-hover:text-cyber-purple transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-[9px] text-cyber-muted font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(article.published_at).toLocaleDateString()}
                  </div>
                  <ChevronRight className="w-3 h-3 text-cyber-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};

const NewsFeed = ({ news }: { news: NewsData }) => {
  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 flex flex-col col-span-1 lg:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-cyber-yellow" />
        <h3 className="font-mono text-cyber-yellow text-sm font-bold tracking-wider">CRISIS.COMMUNICATIONS</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-yellow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-yellow"></span>
          </span>
          <span className="text-[10px] font-mono text-cyber-yellow animate-pulse">LIVE INTERCEPT</span>
        </div>
      </div>

      <div className="flex-1 bg-black/50 border border-cyber-border/30 rounded-xl overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />
        
        {news.isLoading ? (
          <div className="flex items-center justify-center h-full h-24">
            <div className="animate-pulse flex items-center gap-3 text-cyber-muted font-mono text-sm">
              <Radio className="w-4 h-4 animate-spin" />
              INTERCEPTING GLOBAL SIGNALS...
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto h-full flex items-center px-4 custom-scrollbar-horizontal py-2">
            <div className="flex gap-4 w-max">
              {news.articles.map((article, i) => (
                <a 
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-[350px] bg-black/60 border border-cyber-border/40 rounded-lg overflow-hidden hover:border-cyber-yellow/50 transition-colors group flex-shrink-0"
                >
                  <div className="w-1 bg-cyber-border/40 group-hover:bg-cyber-yellow transition-colors" />
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-mono text-cyber-yellow bg-cyber-yellow/10 px-1.5 py-0.5 rounded border border-cyber-yellow/20 uppercase">
                          {article.domain || 'UNKNOWN SOURCE'}
                        </span>
                        <span className="text-[9px] font-mono text-cyber-muted">
                          {article.sourcecountry || 'INTL'}
                        </span>
                      </div>
                      <h4 className="text-xs font-mono font-bold text-white line-clamp-2 mt-1 leading-snug group-hover:text-cyber-yellow transition-colors">
                        {article.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-cyber-muted font-mono mt-2 opacity-60">
                      <ExternalLink className="w-3 h-3" />
                      ACCESS SECURE TERMINAL
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const GlobalActivityTimeline = ({ earthquakes }: { earthquakes: EarthquakeData }) => {
  const [now] = useState(() => Date.now());

  // Process earthquake data into a histogram of the last 7 days
  const chartData = useMemo(() => {
    if (!earthquakes.features.length) return [];
    
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now - (6 - i) * msPerDay);
      return {
        date,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        count: 0,
        avgMag: 0,
        maxMag: 0
      };
    });

    earthquakes.features.forEach(eq => {
      const eqTime = eq.properties.time;
      const dayIndex = 6 - Math.floor((now - eqTime) / msPerDay);
      if (dayIndex >= 0 && dayIndex < 7) {
        days[dayIndex].count++;
        days[dayIndex].avgMag += eq.properties.mag;
        if (eq.properties.mag > days[dayIndex].maxMag) {
          days[dayIndex].maxMag = eq.properties.mag;
        }
      }
    });

    days.forEach(day => {
      if (day.count > 0) {
        day.avgMag /= day.count;
      }
    });

    return days;
  }, [earthquakes, now]);

  const maxCount = Math.max(...chartData.map(d => d.count), 10);

  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-cyber-cyan" />
          <h3 className="font-mono text-cyber-cyan text-sm font-bold tracking-wider">TEMPORAL.ANALYSIS</h3>
        </div>
        <div className="text-[10px] font-mono text-cyber-muted">7-DAY SEISMIC TREND</div>
      </div>

      <div className="flex-1 relative flex items-end justify-between pt-6 pb-6 border-b border-cyber-border/30">
        {/* Y-Axis lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (
            <div key={i} className="flex items-center w-full relative">
              <span className="absolute -left-1 transform -translate-x-full text-[8px] font-mono text-cyber-muted/50">
                {Math.round(maxCount * tick)}
              </span>
              <div className="w-full h-px bg-cyber-border/10 border-dashed border-t border-cyber-border/20" />
            </div>
          ))}
        </div>

        {chartData.map((day, i) => {
          const heightPct = (day.count / maxCount) * 100;
          let barColor = 'bg-cyber-cyan/60';
          if (day.maxMag >= 6) barColor = 'bg-cyber-red/80';
          else if (day.maxMag >= 5) barColor = 'bg-cyber-orange/80';
          else if (day.maxMag >= 4) barColor = 'bg-cyber-yellow/80';

          return (
            <div key={i} className="flex flex-col items-center gap-2 relative z-10 w-1/7 px-1 group">
              <div 
                className="w-full flex items-end justify-center h-32 relative"
              >
                <div 
                  className={`w-full max-w-[20px] rounded-t-sm transition-all duration-700 ease-out border-t border-white/30 ${barColor}`}
                  style={{ height: `${heightPct}%` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-cyber-border text-white text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap z-20">
                    {day.count} EVENTS
                    <br/>
                    MAX MAG: {day.maxMag.toFixed(1)}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyber-muted group-hover:text-cyber-cyan transition-colors">{day.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RegionSelector = () => {
  const regions = ['GLOBAL', 'NORAM', 'LATAM', 'EMEA', 'APAC'];
  const [active, setActive] = useState('GLOBAL');

  return (
    <div className="glass-panel rounded-full border border-cyber-border shadow-glass p-1.5 flex items-center justify-between mx-auto w-full max-w-xl bg-black/60 backdrop-blur-md">
      {regions.map(r => (
        <button
          key={r}
          onClick={() => setActive(r)}
          className={`px-4 py-2 rounded-full font-mono text-xs font-bold transition-all ${
            active === r 
              ? 'bg-cyber-purple/20 text-cyber-purple shadow-[inset_0_0_10px_rgba(188,19,254,0.3)] border border-cyber-purple/50' 
              : 'text-cyber-muted hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export const WorldMonitor: React.FC = () => {
  // State
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [earthquakes, setEarthquakes] = useState<EarthquakeData>({ features: [], isLoading: true, error: null, lastUpdated: null });
  const [weather, setWeather] = useState<WeatherData>({ cities: MAJOR_CITIES, isLoading: true, error: null, lastUpdated: null });
  const [news, setNews] = useState<NewsData>({ articles: [], isLoading: true, error: null, lastUpdated: null });
  const [currency, setCurrency] = useState<CurrencyData>({ rates: {}, base: 'USD', isLoading: true, error: null, lastUpdated: null });
  const [space, setSpace] = useState<SpaceData>({ articles: [], isLoading: true, error: null, lastUpdated: null });

  // Custom Logger
  const addLog = useCallback((level: LogEntry['level'], message: string, source: string) => {
    setLogs(prev => [...prev.slice(-49), { id: generateId(), timestamp: new Date(), level, message, source }]);
  }, []);

  // Fetch Logic
  const fetchEarthquakes = async () => {
    addLog('info', 'INITIATING SEISMIC SENSOR SWEEP...', 'USGS');
    try {
      const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEarthquakes({ features: data.features || [], isLoading: false, error: null, lastUpdated: new Date() });
      addLog('success', `SEISMIC SWEEP COMPLETE. FOUND ${data.features?.length || 0} ANOMALIES.`, 'USGS');
    } catch (err) {
      setEarthquakes(prev => ({ ...prev, isLoading: false, error: (err as Error).message }));
      addLog('error', `SEISMIC SENSOR FAILURE: ${(err as Error).message}`, 'USGS');
    }
  };

  const fetchWeather = async () => {
    addLog('info', 'CONNECTING TO METEOROLOGICAL SATELLITES...', 'OPEN-METEO');
    try {
      const results = await Promise.all(
        MAJOR_CITIES.map(async city => {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&timezone=auto`);
          if (!res.ok) throw new Error(`HTTP ${res.status} for ${city.name}`);
          const data = await res.json();
          return {
            ...city,
            temperature: data.current_weather?.temperature ?? null,
            windSpeed: data.current_weather?.windspeed ?? null,
            weatherCode: data.current_weather?.weathercode ?? -1
          };
        })
      );
      setWeather({ cities: results, isLoading: false, error: null, lastUpdated: new Date() });
      addLog('success', 'CLIMATE DATA SYNCHRONIZED ACROSS 6 SECTORS.', 'OPEN-METEO');
    } catch (err) {
      setWeather(prev => ({ ...prev, isLoading: false, error: (err as Error).message }));
      addLog('warn', `METEOROLOGICAL LINK DEGRADED: ${(err as Error).message}`, 'OPEN-METEO');
    }
  };

  const fetchNews = async () => {
    addLog('info', 'SCANNING GLOBAL COMM FREQUENCIES...', 'GDELT');
    try {
      const res = await fetch('https://api.gdeltproject.org/api/v2/doc/doc?query=world%20crisis&mode=artlist&maxrecords=10&format=json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNews({ articles: data.articles || [], isLoading: false, error: null, lastUpdated: new Date() });
      addLog('success', `COMM INTERCEPT SUCCESSFUL. DECODED ${data.articles?.length || 0} TRANSMISSIONS.`, 'GDELT');
    } catch (err) {
      setNews(prev => ({ ...prev, isLoading: false, error: (err as Error).message }));
      addLog('error', `COMM ARRAY INTERFERENCE: ${(err as Error).message}`, 'GDELT');
    }
  };

  const fetchCurrency = async () => {
    addLog('info', 'ACCESSING FINANCIAL MARKETS DATABANK...', 'ER-API');
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCurrency({ rates: data.rates || {}, base: data.base_code || 'USD', isLoading: false, error: null, lastUpdated: new Date() });
      addLog('success', 'MARKET RATES UPDATED.', 'ER-API');
    } catch (err) {
      setCurrency(prev => ({ ...prev, isLoading: false, error: (err as Error).message }));
      addLog('warn', `FINANCIAL DATABANK UNAVAILABLE: ${(err as Error).message}`, 'ER-API');
    }
  };

  const fetchSpace = async () => {
    addLog('info', 'DOWNLOADING ORBITAL TELEMETRY...', 'SNAPI');
    try {
      const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=6');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSpace({ articles: data.results || [], isLoading: false, error: null, lastUpdated: new Date() });
      addLog('success', 'ORBITAL TELEMETRY ACQUIRED.', 'SNAPI');
    } catch (err) {
      setSpace(prev => ({ ...prev, isLoading: false, error: (err as Error).message }));
      addLog('error', `TELEMETRY DOWNLINK FAILED: ${(err as Error).message}`, 'SNAPI');
    }
  };

  const fetchAll = useCallback(async () => {
    addLog('info', '--- COMMENCING GLOBAL SENSOR SYNCHRONIZATION ---', 'SYSTEM');
    await Promise.allSettled([
      fetchEarthquakes(),
      fetchWeather(),
      fetchNews(),
      fetchCurrency(),
      fetchSpace()
    ]);
    addLog('info', '--- SYNCHRONIZATION CYCLE COMPLETE ---', 'SYSTEM');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addLog]);

  // Boot Sequence Effect
  useEffect(() => {
    const bootInterval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(bootInterval);
          setTimeout(() => setIsBooting(false), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    return () => clearInterval(bootInterval);
  }, []);

  // Main Lifecycle Effect
  useEffect(() => {
    if (isBooting) return;
    
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isBooting, fetchAll]);

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 justify-center animate-pulse">
            <Globe className="w-12 h-12 text-cyber-purple" />
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple to-cyber-cyan tracking-[0.2em]">
              O.S.I.R.I.S.
            </h1>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-cyber-cyan font-bold tracking-widest">
              <span>SYSTEM INITIALIZATION</span>
              <span>{Math.min(100, bootProgress)}%</span>
            </div>
            
            <div className="h-2 w-full bg-cyber-border/20 rounded-full overflow-hidden border border-cyber-border/30">
              <div 
                className="h-full bg-gradient-to-r from-cyber-purple via-cyber-cyan to-cyber-blue transition-all duration-200 ease-out shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                style={{ width: `${Math.min(100, bootProgress)}%` }}
              />
            </div>

            <div className="text-center mt-8 text-[10px] text-cyber-muted tracking-widest opacity-70">
              <p>{bootProgress < 30 ? 'LOADING KERNEL MODULES...' : 
                  bootProgress < 60 ? 'ESTABLISHING SECURE UPLINKS...' : 
                  bootProgress < 90 ? 'CALIBRATING SENSOR ARRAYS...' : 
                  'BRINGING SYSTEMS ONLINE...'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-cyber-muted p-2 sm:p-4 lg:p-6 overflow-x-hidden selection:bg-cyber-purple/30">
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --cyber-purple: #bc13fe;
          --cyber-cyan: #00f3ff;
          --cyber-green: #00ff00;
          --cyber-red: #ff003c;
          --cyber-orange: #ff9d00;
          --cyber-yellow: #fcee0a;
          --cyber-blue: #0051ff;
        }
        
        .text-cyber-purple { color: var(--cyber-purple); }
        .text-cyber-cyan { color: var(--cyber-cyan); }
        .text-cyber-green { color: var(--cyber-green); }
        .text-cyber-red { color: var(--cyber-red); }
        .text-cyber-orange { color: var(--cyber-orange); }
        .text-cyber-yellow { color: var(--cyber-yellow); }
        .text-cyber-blue { color: var(--cyber-blue); }
        
        .bg-cyber-purple { background-color: var(--cyber-purple); }
        .bg-cyber-cyan { background-color: var(--cyber-cyan); }
        
        .border-cyber-border { border-color: rgba(0, 243, 255, 0.15); }
        .glass-panel {
          background: linear-gradient(135deg, rgba(10, 10, 12, 0.8) 0%, rgba(5, 5, 5, 0.95) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .shadow-glass {
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.05);
        }
        .shadow-neon-purple { box-shadow: 0 0 15px rgba(188, 19, 254, 0.4); }
        .shadow-neon-cyan { box-shadow: 0 0 15px rgba(0, 243, 255, 0.4); }
        .shadow-neon-green { box-shadow: 0 0 15px rgba(0, 255, 0, 0.4); }
        .shadow-neon-red { box-shadow: 0 0 15px rgba(255, 0, 60, 0.4); }
        .shadow-neon-orange { box-shadow: 0 0 15px rgba(255, 157, 0, 0.4); }
        .shadow-neon-yellow { box-shadow: 0 0 15px rgba(252, 238, 10, 0.4); }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 243, 255, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 243, 255, 0.6); }

        .custom-scrollbar-horizontal::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb { background: rgba(252, 238, 10, 0.3); border-radius: 4px; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover { background: rgba(252, 238, 10, 0.6); }
      `}} />

      {/* HEADER */}
      <header className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Globe className="w-10 h-10 text-cyber-cyan animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 border-2 border-cyber-cyan/30 rounded-full animate-ping opacity-20" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-purple tracking-[0.2em] uppercase">
              O.S.I.R.I.S.
            </h1>
            <p className="text-[10px] font-mono text-cyber-muted tracking-widest uppercase">
              Omni-Spectral Intelligence & Reconnaissance Information System
            </p>
          </div>
        </div>

        <div className="flex-1 w-full md:w-auto">
          <RegionSelector />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] font-mono text-cyber-muted uppercase">System Status</span>
            <span className="text-xs font-mono font-bold text-cyber-green flex items-center gap-1">
              <Wifi className="w-3 h-3" /> ONLINE
            </span>
          </div>
          <button 
            onClick={fetchAll}
            className="w-10 h-10 rounded-full glass-panel border border-cyber-border flex items-center justify-center hover:bg-cyber-cyan/10 hover:text-cyber-cyan transition-colors group"
            title="Force Synchronization"
          >
            <RefreshCw className="w-4 h-4 group-active:animate-spin" />
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-[1920px] mx-auto">
        
        {/* LEFT COLUMN: 3/12 */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 lg:gap-6 h-full">
          <ThreatLevelIndicator earthquakes={earthquakes} />
          <div className="flex-1 min-h-[300px]">
            <WeatherGrid weather={weather} />
          </div>
          <div className="h-[250px]">
            <TerminalLogs logs={logs} />
          </div>
        </div>

        {/* CENTER COLUMN: 6/12 */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4 lg:gap-6 h-full">
          <EarthquakeFeed earthquakes={earthquakes} />
          <NewsFeed news={news} />
          <div className="h-[200px]">
            <GlobalActivityTimeline earthquakes={earthquakes} />
          </div>
        </div>

        {/* RIGHT COLUMN: 3/12 */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 lg:gap-6 h-full">
          <div className="h-[300px]">
            <CurrencyMonitor currency={currency} />
          </div>
          <div className="flex-1 min-h-[400px]">
            <SpaceMonitor space={space} />
          </div>
        </div>

      </div>
    </div>
  );
};
