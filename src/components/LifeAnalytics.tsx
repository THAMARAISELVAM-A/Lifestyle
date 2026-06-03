import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  Activity, 
  Brain, 
  Target, 
  PieChart, 
  ActivitySquare, 
  Zap, 
  Heart,
  Droplet,
  Flame,
  Wind,
  Shield,
  Award,
  ListTodo
} from 'lucide-react';
import type { Task, Expense, HealthMetric, Goal } from '../types';

/**
 * ==========================================
 * TYPE DEFINITIONS & INTERFACES
 * ==========================================
 */

export interface LifeAnalyticsProps {
  onScoreUpdate: (score: number) => void;
  tasks: Task[];
  expenses: Expense[];
  healthToday: HealthMetric;
  goals: Goal[];
}

interface Point {
  x: number;
  y: number;
}

/**
 * ==========================================
 * THEME & CONSTANTS
 * ==========================================
 */

const THEME = {
  purple: { hex: '#8b5cf6', rgb: '139, 92, 246' },
  pink: { hex: '#ec4899', rgb: '236, 72, 153' },
  green: { hex: '#10b981', rgb: '16, 185, 129' },
  blue: { hex: '#3b82f6', rgb: '59, 130, 246' },
  cyan: { hex: '#06b6d4', rgb: '6, 182, 212' },
  orange: { hex: '#f97316', rgb: '249, 115, 22' },
  yellow: { hex: '#eab308', rgb: '234, 179, 8' },
  red: { hex: '#ef4444', rgb: '239, 68, 68' },
  muted: { hex: '#64748b', rgb: '100, 116, 139' },
  border: { hex: '#1e293b', rgb: '30, 41, 59' },
  background: { hex: '#020617', rgb: '2, 6, 23' }
};

const CHART_COLORS = [
  THEME.cyan.hex,
  THEME.purple.hex,
  THEME.pink.hex,
  THEME.blue.hex,
  THEME.green.hex,
  THEME.orange.hex,
  THEME.yellow.hex,
];

/**
 * ==========================================
 * UTILITY FUNCTIONS
 * ==========================================
 */

/**
 * Converts polar coordinates to Cartesian coordinates.
 * Useful for drawing SVG arcs and radial charts.
 */
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number): Point => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

/**
 * Describes an SVG path for an arc.
 */
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

/**
 * Generates an SVG path for a polygon based on points and radius.
 */
const generatePolygonPath = (centerX: number, centerY: number, radius: number, sides: number, offsetAngle: number = 0): string => {
  const points: string[] = [];
  const angleStep = (Math.PI * 2) / sides;
  
  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep + offsetAngle;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push(`${x},${y}`);
  }
  return `M ${points.join(' L ')} Z`;
};

/**
 * Normalises a value between a min and max to a 0-1 range.
 */
const normalize = (val: number, min: number, max: number): number => {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (val - min) / (max - min)));
};

/**
 * ==========================================
 * SUBCOMPONENTS (PURE SVG CHARTS)
 * ==========================================
 */

/**
 * 1. LIFESCORE RADIAL GAUGE
 * Large animated SVG circular gauge showing the computed LifeScore.
 */
const LifeScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    // Smoothly animate the score on mount and update
    const start = animatedScore;
    const end = score;
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedScore(Math.round(start + (end - start) * easeProgress));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;
  
  // Determine color based on score
  const getScoreColor = (s: number) => {
    if (s < 40) return THEME.red.hex;
    if (s < 70) return THEME.orange.hex;
    if (s < 90) return THEME.cyan.hex;
    return THEME.purple.hex;
  };
  
  const currentColor = getScoreColor(animatedScore);

  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-6 flex flex-col items-center justify-center h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-purple/10 animate-pulse opacity-20 pointer-events-none" />
      <h3 className="text-cyber-cyan font-mono text-lg mb-6 flex items-center gap-2 self-start w-full">
        <Target className="w-5 h-5 text-cyber-purple" />
        SYSTEM_LIFESCORE
      </h3>
      
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 200 200">
          <defs>
            <filter id="glow-gauge" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={THEME.cyan.hex} />
              <stop offset="100%" stopColor={THEME.purple.hex} />
            </linearGradient>
          </defs>
          
          {/* Background Track */}
          <circle 
            cx="100" 
            cy="100" 
            r={radius} 
            fill="none" 
            stroke={THEME.border.hex} 
            strokeWidth="12" 
            strokeDasharray={circumference}
            className="opacity-50"
          />
          
          {/* Active Track */}
          <circle 
            cx="100" 
            cy="100" 
            r={radius} 
            fill="none" 
            stroke="url(#scoreGrad)" 
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#glow-gauge)"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
          
          {/* Inner decorative rings */}
          <circle cx="100" cy="100" r={radius - 18} fill="none" stroke={currentColor} strokeWidth="1" strokeDasharray="4 4" className="opacity-30 animate-[spin_20s_linear_infinite]" />
          <circle cx="100" cy="100" r={radius + 15} fill="none" stroke={THEME.cyan.hex} strokeWidth="1" strokeDasharray="1 8" className="opacity-40 animate-[spin_30s_linear_infinite_reverse]" />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-5xl font-bold font-mono text-glow-purple" style={{ color: currentColor }}>
            {animatedScore}
          </span>
          <span className="text-xs text-cyber-muted mt-2 tracking-widest font-mono uppercase">
            Overall Rating
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * 2. WEEKLY PRODUCTIVITY HEATMAP
 * 7-day heatmap grid showing simulated productivity levels per hour (24 cols x 7 rows).
 */
const HEATMAP_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HEATMAP_HOURS = Array.from({ length: 24 }, (_, i) => i);

const ProductivityHeatmap: React.FC = () => {
  const heatmapData = useMemo(() => {
    return HEATMAP_DAYS.map((day, dIdx) => 
      HEATMAP_HOURS.map((hour, hIdx) => {
        // Assume peak productivity at 10:00 and 15:00
        const base = Math.sin((hour - 8) * Math.PI / 12) * 0.5 + 0.5;
        const random = (Math.sin(dIdx * 13 + hIdx * 7) + 1) / 2;
        // Reduce productivity on weekends
        const weekendFactor = (dIdx > 4) ? 0.4 : 1.0;
        const intensity = Math.max(0, Math.min(1, (base * 0.6 + random * 0.4) * weekendFactor));
        return { day, hour, intensity };
      })
    );
  }, []);

  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-6 h-full flex flex-col">
      <h3 className="text-cyber-cyan font-mono text-lg mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyber-green" />
        NEURAL_ACTIVITY_MAP
      </h3>
      
      <div className="flex-1 w-full relative overflow-x-auto overflow-y-hidden custom-scrollbar">
        <svg viewBox="0 0 760 220" className="w-full min-w-[600px] h-full">
          {/* X Axis Labels (Hours) */}
          <g className="fill-cyber-muted font-mono text-[10px]">
            {HEATMAP_HOURS.filter(h => h % 2 === 0).map(hour => (
              <text key={`h-${hour}`} x={50 + hour * 28 + 10} y="15" textAnchor="middle">
                {hour.toString().padStart(2, '0')}:00
              </text>
            ))}
          </g>
          
          {/* Grid */}
          {heatmapData.map((dayData, rIdx) => (
            <g key={`row-${rIdx}`}>
              {/* Y Axis Labels (Days) */}
              <text x="10" y={35 + rIdx * 25 + 12} className="fill-cyber-cyan/70 font-mono text-xs">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][rIdx]}
              </text>
              
              {/* Cells */}
              {dayData.map((cell, cIdx) => (
                <rect
                  key={`cell-${rIdx}-${cIdx}`}
                  x={50 + cIdx * 28}
                  y={35 + rIdx * 25}
                  width="22"
                  height="18"
                  rx="3"
                  fill={`rgba(${THEME.purple.rgb}, ${Math.max(0.05, cell.intensity)})`}
                  className="hover:stroke-cyber-cyan cursor-crosshair transition-all duration-200"
                  strokeWidth="1"
                  stroke="rgba(6, 182, 212, 0)"
                >
                  <title>{`${cell.day} ${cell.hour.toString().padStart(2, '0')}:00 - Activity: ${Math.round(cell.intensity * 100)}%`}</title>
                </rect>
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

/**
 * 3. EXPENSE BREAKDOWN DONUT CHART
 * Donut chart showing expense categories derived from actual `expenses` prop data.
 */
const ExpenseDonutChart: React.FC<{ expenses: Expense[] }> = ({ expenses }) => {
  const categoryTotals = useMemo(() => {
    // Use fallback if empty
    const activeExpenses = expenses.length > 0 ? expenses : [
      { id: '1', category: 'Housing', amount: 1500, date: '', description: '', recurring: true },
      { id: '2', category: 'Food', amount: 600, date: '', description: '', recurring: false },
      { id: '3', category: 'Transport', amount: 300, date: '', description: '', recurring: false },
      { id: '4', category: 'Tech', amount: 450, date: '', description: '', recurring: false },
      { id: '5', category: 'Fitness', amount: 150, date: '', description: '', recurring: true },
    ];

    const totals: Record<string, number> = {};
    activeExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const total = categoryTotals.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate SVG paths
  const radius = 70;
  const strokeWidth = 25;
  const centerX = 120;
  const centerY = 120;

  const paths = categoryTotals.reduce<{ paths: {name: string; value: number; path: string; color: string; percent: number}[], currentAngle: number }>((acc, item, index) => {
    const sliceAngle = (item.value / total) * 360;
    const path = sliceAngle === 360 
      ? `M ${centerX},${centerY - radius} A ${radius},${radius} 0 1,1 ${centerX - 0.1},${centerY - radius}`
      : describeArc(centerX, centerY, radius, acc.currentAngle, acc.currentAngle + sliceAngle - 2);
    
    acc.paths.push({
      ...item,
      path,
      color: CHART_COLORS[index % CHART_COLORS.length],
      percent: Math.round((item.value / total) * 100)
    });
    acc.currentAngle += sliceAngle;
    return acc;
  }, { paths: [], currentAngle: 0 }).paths;

  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-6 flex flex-col h-full">
      <h3 className="text-cyber-cyan font-mono text-lg mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-cyber-orange" />
        RESOURCE_ALLOCATION
      </h3>
      
      <div className="flex-1 flex items-center justify-between gap-4">
        <div className="relative w-60 h-60 flex-shrink-0 group">
          <svg viewBox="0 0 240 240" className="w-full h-full transform transition-transform duration-500 hover:scale-105">
            <defs>
              <filter id="glow-donut" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {paths.map((p) => (
              <path
                key={p.name}
                d={p.path}
                fill="none"
                stroke={p.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-80 hover:stroke-[30px] cursor-pointer"
                filter="url(#glow-donut)"
              >
                <title>{`${p.name}: $${p.value} (${p.percent}%)`}</title>
              </path>
            ))}
            
            {/* Center Text */}
            <text x={centerX} y={centerY - 10} textAnchor="middle" className="fill-cyber-muted font-mono text-sm">TOTAL</text>
            <text x={centerX} y={centerY + 15} textAnchor="middle" className="fill-cyber-cyan font-mono font-bold text-xl">${total.toLocaleString()}</text>
          </svg>
        </div>
        
        {/* Legend */}
        <div className="flex-1 flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {paths.map((p) => (
            <div key={p.name} className="flex items-center justify-between text-xs font-mono bg-cyber-border/20 p-2 rounded border border-cyber-border/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: p.color, color: p.color }} />
                <span className="text-gray-300 truncate max-w-[80px]">{p.name}</span>
              </div>
              <span className="text-cyber-cyan font-bold">{p.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 4. TASK COMPLETION FUNNEL
 * Horizontal funnel/bar chart showing todo -> progress -> done task counts.
 */
const TaskFunnel: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  // Use fallback if empty
  const activeTasks = tasks.length > 0 ? tasks : [
    { id: '1', title: 'A', description: '', status: 'todo', priority: 'low', dueDate: '', project: '' },
    { id: '2', title: 'B', description: '', status: 'todo', priority: 'low', dueDate: '', project: '' },
    { id: '3', title: 'C', description: '', status: 'todo', priority: 'low', dueDate: '', project: '' },
    { id: '4', title: 'D', description: '', status: 'todo', priority: 'low', dueDate: '', project: '' },
    { id: '5', title: 'E', description: '', status: 'progress', priority: 'low', dueDate: '', project: '' },
    { id: '6', title: 'F', description: '', status: 'progress', priority: 'low', dueDate: '', project: '' },
    { id: '7', title: 'G', description: '', status: 'done', priority: 'low', dueDate: '', project: '' },
  ] as Task[];

  const counts = {
    todo: activeTasks.filter(t => t.status === 'todo').length,
    progress: activeTasks.filter(t => t.status === 'progress').length,
    done: activeTasks.filter(t => t.status === 'done').length,
  };

  const maxCount = Math.max(counts.todo, counts.progress, counts.done, 1);
  
  const stages = [
    { id: 'todo', label: 'BACKLOG', count: counts.todo, color: THEME.pink.hex },
    { id: 'progress', label: 'ACTIVE', count: counts.progress, color: THEME.purple.hex },
    { id: 'done', label: 'RESOLVED', count: counts.done, color: THEME.cyan.hex },
  ];

  const svgWidth = 500;
  const svgHeight = 200;
  const stageWidth = 100;
  const gap = 60;
  const maxBarHeight = 160;

  // Calculate geometries
  const geometries = stages.map((stage, i) => {
    const x = 30 + i * (stageWidth + gap);
    const height = Math.max((stage.count / maxCount) * maxBarHeight, 20); // Min height of 20
    const y = (svgHeight - height) / 2;
    return { ...stage, x, y, width: stageWidth, height };
  });

  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-6 h-full flex flex-col">
      <h3 className="text-cyber-cyan font-mono text-lg mb-4 flex items-center gap-2">
        <ListTodo className="w-5 h-5 text-cyber-pink" />
        EXECUTION_PIPELINE
      </h3>
      
      <div className="flex-1 w-full relative flex items-center justify-center min-h-[220px]">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full max-w-full">
          <defs>
            <filter id="glow-funnel" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Gradients for connecting polygons */}
            {geometries.map((geo, i) => {
              if (i === geometries.length - 1) return null;
              const next = geometries[i + 1];
              return (
                <linearGradient key={`grad-${i}`} id={`polyGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={geo.color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={next.color} stopOpacity="0.2" />
                </linearGradient>
              );
            })}
          </defs>

          {/* Draw connecting polygons first so they are behind */}
          {geometries.map((geo, i) => {
            if (i === geometries.length - 1) return null;
            const next = geometries[i + 1];
            const p1 = `${geo.x + geo.width},${geo.y}`; // top-left
            const p2 = `${next.x},${next.y}`; // top-right
            const p3 = `${next.x},${next.y + next.height}`; // bottom-right
            const p4 = `${geo.x + geo.width},${geo.y + geo.height}`; // bottom-left
            
            return (
              <polygon
                key={`poly-${i}`}
                points={`${p1} ${p2} ${p3} ${p4}`}
                fill={`url(#polyGrad-${i})`}
                className="transition-all duration-500"
              />
            );
          })}

          {/* Draw stage bars */}
          {geometries.map((geo) => (
            <g key={`stage-${geo.id}`} className="group cursor-default">
              <rect
                x={geo.x}
                y={geo.y}
                width={geo.width}
                height={geo.height}
                fill={geo.color}
                fillOpacity="0.8"
                stroke={geo.color}
                strokeWidth="2"
                rx="4"
                filter="url(#glow-funnel)"
                className="transition-all duration-300 group-hover:fill-opacity-100"
              />
              <text
                x={geo.x + geo.width / 2}
                y={geo.y + geo.height / 2 + 8} // rough vertical center
                textAnchor="middle"
                className="fill-white font-mono font-bold text-2xl drop-shadow-md"
              >
                {geo.count}
              </text>
              {/* Labels below */}
              <text
                x={geo.x + geo.width / 2}
                y={svgHeight - 5}
                textAnchor="middle"
                className="fill-cyber-muted font-mono text-xs tracking-wider"
              >
                {geo.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

/**
 * 5. HEALTH METRICS RADAR CHART
 * SVG radar/spider chart with 6 axes.
 */
const HealthRadarChart: React.FC<{ healthToday: HealthMetric }> = ({ healthToday }) => {
  // Normalize metrics to 0.0 - 1.0 for the radar chart
  const metrics = useMemo(() => {
    const data = healthToday || {} as HealthMetric;
    return [
      { label: 'HEART', value: normalize(data.heartRate || 75, 40, 140), icon: Heart }, // 40-140 bpm range
      { label: 'SLEEP', value: normalize(data.sleep || 7, 0, 10), icon: Wind }, // 0-10 hours
      { label: 'CALORIC', value: normalize(data.calories || 2200, 0, 4000), icon: Flame }, // 0-4000 kcal
      { label: 'KINETIC', value: normalize(data.steps || 6000, 0, 15000), icon: Activity }, // 0-15k steps
      { label: 'H2O', value: normalize(data.hydration || 2, 0, 5), icon: Droplet }, // 0-5 liters
      { label: 'ZEN', value: 1 - normalize(data.stress || 4, 0, 10), icon: Brain }, // Invert stress (lower is better)
    ];
  }, [healthToday]);

  const size = 260;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  
  const angleStep = (Math.PI * 2) / metrics.length;
  const offsetAngle = -Math.PI / 2; // Start from top

  // Generate data polygon
  const dataPoints = metrics.map((m, i) => {
    const angle = i * angleStep + offsetAngle;
    // ensure minimum visible radius (0.1)
    const r = Math.max(m.value, 0.1) * maxRadius; 
    return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
  }).join(' ');

  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-6 h-full flex flex-col items-center">
      <h3 className="text-cyber-cyan font-mono text-lg mb-4 flex items-center gap-2 self-start w-full">
        <Shield className="w-5 h-5 text-cyber-green" />
        BIO_TELEMETRY
      </h3>
      
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[260px]">
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            <filter id="glow-radar" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Concentric Polygons */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => (
            <path
              key={`grid-${scale}`}
              d={generatePolygonPath(center, center, maxRadius * scale, metrics.length, offsetAngle)}
              fill="none"
              stroke={THEME.border.hex}
              strokeWidth="1"
              strokeDasharray={scale === 1.0 ? "" : "2 2"}
              className={scale === 1.0 ? "stroke-cyber-cyan/30" : ""}
            />
          ))}

          {/* Axis Lines */}
          {metrics.map((_, i) => {
            const angle = i * angleStep + offsetAngle;
            const x2 = center + Math.cos(angle) * maxRadius;
            const y2 = center + Math.sin(angle) * maxRadius;
            return (
              <line 
                key={`axis-${i}`} 
                x1={center} y1={center} 
                x2={x2} y2={y2} 
                stroke={THEME.border.hex} 
                strokeWidth="1" 
              />
            );
          })}

          {/* Data Polygon */}
          <polygon
            points={dataPoints}
            fill="rgba(16, 185, 129, 0.2)"
            stroke={THEME.green.hex}
            strokeWidth="3"
            filter="url(#glow-radar)"
            className="transition-all duration-1000 ease-in-out"
          />

          {/* Labels & Nodes */}
          {metrics.map((m, i) => {
            const angle = i * angleStep + offsetAngle;
            const r = maxRadius + 20; // push labels out
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            
            // Node points on the data polygon
            const dataR = Math.max(m.value, 0.1) * maxRadius;
            const nodeX = center + Math.cos(angle) * dataR;
            const nodeY = center + Math.sin(angle) * dataR;

            return (
              <g key={`label-${m.label}`}>
                <circle cx={nodeX} cy={nodeY} r="4" fill={THEME.cyan.hex} filter="url(#glow-radar)" />
                <text
                  x={x}
                  y={y + 4} // slight vertical adjust
                  textAnchor="middle"
                  className="fill-cyber-muted font-mono text-[10px] uppercase tracking-wider"
                >
                  {m.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

/**
 * 6. GOAL PROGRESS BARS
 * Animated progress bars for each goal.
 */
const GoalProgressBars: React.FC<{ goals: Goal[] }> = ({ goals }) => {
  // Use fallback if empty
  const activeGoals = goals.length > 0 ? goals : [
    { id: '1', title: 'Learn Rust', category: 'Skill', target: 100, current: 65, unit: 'hrs', streak: 12, xpValue: 500 },
    { id: '2', title: 'Read Sci-Fi', category: 'Leisure', target: 20, current: 8, unit: 'books', streak: 3, xpValue: 200 },
    { id: '3', title: 'Gym Sessions', category: 'Health', target: 50, current: 40, unit: 'days', streak: 5, xpValue: 800 },
  ] as Goal[];

  return (
    <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-6 h-full flex flex-col">
      <h3 className="text-cyber-cyan font-mono text-lg mb-6 flex items-center gap-2">
        <Award className="w-5 h-5 text-cyber-yellow" />
        OBJECTIVE_TRACKER
      </h3>
      
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
        {activeGoals.map((goal, idx) => {
          const percent = Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
          const color = CHART_COLORS[idx % CHART_COLORS.length];
          
          return (
            <div key={goal.id} className="w-full flex flex-col gap-2">
              <div className="flex justify-between items-end font-mono">
                <div>
                  <div className="text-gray-200 font-bold text-sm truncate max-w-[200px]">{goal.title}</div>
                  <div className="text-cyber-muted text-xs flex items-center gap-2">
                    <span className="text-cyber-orange flex items-center"><Flame className="w-3 h-3 mr-1" /> {goal.streak} streak</span>
                    <span>|</span>
                    <span className="text-cyber-purple">{goal.xpValue} XP</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cyber-cyan text-sm">{goal.current} / {goal.target} {goal.unit}</div>
                  <div className="text-cyber-muted text-xs">{percent.toFixed(1)}%</div>
                </div>
              </div>
              
              {/* Pure SVG Progress Bar */}
              <div className="w-full h-3 relative">
                <svg width="100%" height="100%" preserveAspectRatio="none" className="absolute inset-0 rounded-full overflow-hidden">
                  <defs>
                    <linearGradient id={`grad-goal-${goal.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={color} stopOpacity="1" />
                    </linearGradient>
                    <filter id={`glow-bar-${goal.id}`} x="-10%" y="-50%" width="120%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Background Track */}
                  <rect x="0" y="0" width="100%" height="100%" fill={THEME.border.hex} opacity="0.5" />
                  
                  {/* Fill Track */}
                  <rect 
                    x="0" 
                    y="0" 
                    width={`${percent}%`} 
                    height="100%" 
                    fill={`url(#grad-goal-${goal.id})`}
                    filter={`url(#glow-bar-${goal.id})`}
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  {/* Overlay scanline effect */}
                  <rect x="0" y="0" width="100%" height="100%" fill="url(#scanline)" opacity="0.3" style={{ mixBlendMode: 'overlay' } as React.CSSProperties} />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 7. DAILY RHYTHM WAVE
 * SVG sine wave visualization showing simulated circadian rhythm.
 */
const DailyRhythmWave: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (time: number) => {
      // Speed of the wave
      setPhase(time / 1000);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const width = 800;
  const height = 150;
  const amplitude = 40;
  const frequency = 0.01;

  // Generate sine wave path
  const points = [];
  for (let x = 0; x <= width; x += 5) {
    // combine two sine waves for a more natural bio-rhythm look
    const y1 = Math.sin(x * frequency + phase) * amplitude;
    const y2 = Math.sin(x * frequency * 2.5 - phase * 1.5) * (amplitude * 0.3);
    const y = height / 2 + y1 + y2;
    points.push(`${x},${y}`);
  }
  const pathD = `M ${points.join(' L ')}`;

  return (
    <div className="glass-panel rounded-2xl border border-cyber-border p-6 shadow-glass relative overflow-hidden h-full flex flex-col">
      <h3 className="text-cyber-cyan font-mono text-lg mb-4 flex items-center gap-2 relative z-10">
        <ActivitySquare className="w-5 h-5 text-cyber-blue" />
        CIRCADIAN_FLUX
      </h3>
      
      <div className="flex-1 w-full relative min-h-[120px]">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="absolute inset-0">
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={THEME.purple.hex} stopOpacity="0.8" />
              <stop offset="50%" stopColor={THEME.cyan.hex} stopOpacity="1" />
              <stop offset="100%" stopColor={THEME.pink.hex} stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow-wave" x="-10%" y="-50%" width="120%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Grid lines background */}
          <line x1="0" y1={height/2} x2={width} y2={height/2} stroke={THEME.border.hex} strokeWidth="1" strokeDasharray="5 5" />
          <line x1={width/4} y1="0" x2={width/4} y2={height} stroke={THEME.border.hex} strokeWidth="1" strokeDasharray="2 10" />
          <line x1={width/2} y1="0" x2={width/2} y2={height} stroke={THEME.border.hex} strokeWidth="1" strokeDasharray="2 10" />
          <line x1={width*0.75} y1="0" x2={width*0.75} y2={height} stroke={THEME.border.hex} strokeWidth="1" strokeDasharray="2 10" />

          {/* The glowing wave */}
          <path d={pathD} fill="none" stroke="url(#waveGradient)" strokeWidth="4" filter="url(#glow-wave)" />
          {/* Core sharp line */}
          <path d={pathD} fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
};

/**
 * 8. CATEGORY PERFORMANCE MATRIX
 * Grid of small metric cards showing derived analytics.
 */
const CategoryPerformanceMatrix: React.FC<{
  tasks: Task[];
  expenses: Expense[];
  healthToday: HealthMetric;
  goals: Goal[];
}> = ({ tasks, expenses, healthToday, goals }) => {
  
  // Calculate analytics
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 75; // 75 fallback
  
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const velocity = expenses.length ? Math.round(totalExpenses / Math.max(1, expenses.length)) : 120; // pseudo daily avg
  
  // Health composite (simple avg of normalized metrics)
  const healthComposite = Math.round(
    ((normalize(healthToday?.sleep || 7, 0, 10) + 
      normalize(healthToday?.steps || 6000, 0, 15000) + 
      (1 - normalize(healthToday?.stress || 4, 0, 10))) / 3) * 100
  ) || 85;

  const avgStreak = goals.length ? Math.round(goals.reduce((acc, g) => acc + (g.streak || 0), 0) / goals.length) : 5;

  const metrics = [
    { label: 'EXECUTION_RATE', value: `${completionRate}%`, sub: 'Tasks Completed', icon: Target, color: 'text-cyber-green', bg: 'bg-cyber-green/10', border: 'border-cyber-green/30' },
    { label: 'BURN_VELOCITY', value: `$${velocity}`, sub: 'Avg Spend / Entity', icon: Zap, color: 'text-cyber-pink', bg: 'bg-cyber-pink/10', border: 'border-cyber-pink/30' },
    { label: 'VITALITY_INDEX', value: healthComposite, sub: 'Composite Score', icon: Heart, color: 'text-cyber-cyan', bg: 'bg-cyber-cyan/10', border: 'border-cyber-cyan/30' },
    { label: 'NEURAL_PLASTICITY', value: avgStreak, sub: 'Avg Habit Streak', icon: Brain, color: 'text-cyber-purple', bg: 'bg-cyber-purple/10', border: 'border-cyber-purple/30' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
      {metrics.map((m, i) => (
        <div key={i} className={`glass-panel rounded-xl border ${m.border} ${m.bg} p-4 flex flex-col justify-between relative overflow-hidden group hover:bg-opacity-20 transition-all duration-300`}>
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" style={{ color: 'inherit' }}></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" style={{ color: 'inherit' }}></div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono text-cyber-muted uppercase tracking-widest">{m.label}</span>
            <m.icon className={`w-4 h-4 ${m.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
          </div>
          
          <div>
            <div className={`text-3xl font-bold font-mono ${m.color} drop-shadow-md`}>{m.value}</div>
            <div className="text-xs text-cyber-muted mt-1">{m.sub}</div>
          </div>
          
          {/* Micro sparkline (decorative pure SVG) */}
          <svg className="absolute bottom-2 right-2 w-16 h-6 opacity-30 group-hover:opacity-60 transition-opacity" preserveAspectRatio="none">
            <path d={`M0,${24-i*2} Q5,${10+i*3} 16,${18-i} T32,${10+i*2} T48,${20-i} T64,${10+i}`} fill="none" stroke="currentColor" className={m.color} strokeWidth="1.5" />
          </svg>
        </div>
      ))}
    </div>
  );
};


/**
 * ==========================================
 * MAIN EXPORT COMPONENT
 * ==========================================
 */

export const LifeAnalytics: React.FC<LifeAnalyticsProps> = ({
  onScoreUpdate,
  tasks = [],
  expenses = [],
  healthToday,
  goals = []
}) => {

  // Global SVG defs for shared patterns (scanline)
  const globalDefs = (
    <svg width="0" height="0" className="absolute pointer-events-none">
      <defs>
        <pattern id="scanline" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </pattern>
      </defs>
    </svg>
  );

  // Compute master LifeScore
  const computedScore = useMemo(() => {
    // 1. Task Completion (25%)
    const taskScore = tasks.length 
      ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 
      : 70; // Fallback
      
    // 2. Health (25%)
    let healthScore = 75;
    if (healthToday) {
       const sleepScore = Math.min((healthToday.sleep || 7) / 8 * 100, 100);
       const stepsScore = Math.min((healthToday.steps || 5000) / 10000 * 100, 100);
       healthScore = (sleepScore + stepsScore) / 2;
    }

    // 3. Goals Progress (25%)
    const goalScore = goals.length 
      ? goals.reduce((acc, g) => acc + Math.min((g.current / g.target), 1), 0) / goals.length * 100 
      : 65;

    // 4. Expense Management (25%)
    // (A complex real app would compare against budget, here we pseudo-calculate)
    const expScore = 80;

    return Math.round((taskScore + healthScore + goalScore + expScore) / 4);
  }, [tasks, healthToday, goals]);

  // Report score upstream
  useEffect(() => {
    if (onScoreUpdate) {
      onScoreUpdate(computedScore);
    }
  }, [computedScore, onScoreUpdate]);

  return (
    <div className="w-full min-h-screen bg-cyber-background text-gray-200 p-4 lg:p-8 font-sans overflow-x-hidden relative">
      {globalDefs}
      
      {/* Background ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-purple/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header section */}
      <div className="mb-8 flex items-center justify-between border-b border-cyber-border/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold font-mono text-glow-purple bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan to-cyber-purple flex items-center gap-3">
            <ActivitySquare className="w-8 h-8 text-cyber-cyan" />
            LIFE_ANALYTICS_TERMINAL
          </h1>
          <p className="text-cyber-muted font-mono text-sm mt-1 uppercase tracking-widest">
            System status monitoring active // {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        {/* ROW 1 */}
        <div className="lg:col-span-4 h-[350px]">
          <LifeScoreGauge score={computedScore} />
        </div>
        <div className="lg:col-span-8 h-[350px]">
          <ProductivityHeatmap />
        </div>

        {/* ROW 2 */}
        <div className="lg:col-span-4 h-[380px]">
          <ExpenseDonutChart expenses={expenses} />
        </div>
        <div className="lg:col-span-4 h-[380px]">
          <HealthRadarChart healthToday={healthToday} />
        </div>
        <div className="lg:col-span-4 h-[380px]">
          <TaskFunnel tasks={tasks} />
        </div>

        {/* ROW 3 */}
        <div className="lg:col-span-6 h-[300px]">
          <GoalProgressBars goals={goals} />
        </div>
        <div className="lg:col-span-6 h-[300px]">
          <DailyRhythmWave />
        </div>

        {/* ROW 4 */}
        <div className="lg:col-span-12">
          <CategoryPerformanceMatrix 
            tasks={tasks}
            expenses={expenses}
            healthToday={healthToday}
            goals={goals}
          />
        </div>
      </div>
    </div>
  );
};
