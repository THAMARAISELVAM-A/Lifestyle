import React from 'react';
import { 
  Heart, Flame, Footprints, Droplets, AlertTriangle, 
  Moon, Smile, Plus, ClipboardList
} from 'lucide-react';
import type { HealthMetric } from '../types';


interface HealthMonitorProps {
  healthToday: HealthMetric;
  logWater: (amount: number) => void;
  updateSteps: (steps: number) => void;
}

export const HealthMonitor: React.FC<HealthMonitorProps> = ({ healthToday, logWater, updateSteps }) => {
  const [mood, setMood] = React.useState<'focused' | 'energetic' | 'tired' | 'stressed'>('focused');
  const [meds, setMeds] = React.useState([
    { name: 'Multivitamins (Zinc + D3)', time: '08:00 AM', taken: true },
    { name: 'Omega 3 Fish Oil', time: '01:00 PM', taken: false },
    { name: 'Magnesium L-Threonate', time: '09:30 PM', taken: false }
  ]);

  const toggleMed = (idx: number) => {
    const updated = [...meds];
    updated[idx].taken = !updated[idx].taken;
    setMeds(updated);
  };

  // Water level percentage
  const waterTarget = 3000;
  const waterPercent = Math.min(100, Math.floor((healthToday.hydration / waterTarget) * 100));

  // Burnout detection helper
  const getBurnoutStatus = () => {
    if (healthToday.stress > 75 && healthToday.sleep < 6) {
      return { level: 'CRITICAL', color: 'text-cyber-red bg-cyber-red/20 border-cyber-red/30', message: 'High Burnout Warning: Sleep is critically low while stress is elevated. Reduce scheduled screen hours immediately.' };
    }
    if (healthToday.stress > 50) {
      return { level: 'MODERATE', color: 'text-cyber-yellow bg-cyber-yellow/20 border-cyber-yellow/30', message: 'Moderate Fatigue Level: AI suggests a 15-minute screen-free focus block to balance neural metrics.' };
    }
    return { level: 'STABLE', color: 'text-cyber-green bg-cyber-green/20 border-cyber-green/30', message: 'Biometrics Balanced: Active heart rate variability and circadian cycles are currently optimized.' };
  };

  const burnout = getBurnoutStatus();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Heart className="text-cyber-pink animate-pulse" />
          Health Monitor AI
        </h2>
        <p className="text-cyber-muted text-xs">Biometric metrics synced from Apple Health & Google Fit.</p>
      </div>

      {/* Burnout Indicator Banner */}
      <div className={`p-4 rounded-2xl border ${burnout.color} flex flex-col md:flex-row items-start md:items-center gap-4 justify-between transition-all`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="shrink-0 animate-pulse" size={24} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase">AI Burnout Alert</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white/10">{burnout.level}</span>
            </div>
            <p className="text-xs mt-1 text-slate-100 font-medium leading-relaxed">{burnout.message}</p>
          </div>
        </div>
        <button 
          onClick={() => updateSteps(healthToday.steps + 1200)}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 text-xs font-bold rounded-xl border border-white/5 hover:border-white/20 transition-all shrink-0 cursor-pointer text-white"
        >
          Simulate Steps (+1.2k)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Metric widgets */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1: Sleep */}
          <div className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border flex flex-col justify-between shadow-glass">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">Circadian Cycle</span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">Sleep Analytics</h3>
              </div>
              <div className="p-2 rounded-xl bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20">
                <Moon size={18} />
              </div>
            </div>
            <div className="my-6">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-white">{healthToday.sleep}</span>
                <span className="text-xs text-cyber-muted font-semibold">hours total</span>
              </div>
              <p className="text-xs text-cyber-green mt-1">Deep sleep: 2.1h • REM sleep: 1.8h (Optimal)</p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div className="bg-cyber-purple h-full shadow-neon-purple" style={{ width: `${(healthToday.sleep / 8) * 100}%` }}></div>
            </div>
          </div>

          {/* Card 2: Steps */}
          <div className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border flex flex-col justify-between shadow-glass">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">Calisthenic Steps</span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">Daily Steps</h3>
              </div>
              <div className="p-2 rounded-xl bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/20">
                <Footprints size={18} />
              </div>
            </div>
            <div className="my-6">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-white">{healthToday.steps.toLocaleString()}</span>
                <span className="text-xs text-cyber-muted font-semibold">/ 10,000 steps</span>
              </div>
              <p className="text-xs text-cyber-pink mt-1">{Math.floor(healthToday.steps * 0.08)} kcal burned • {Math.round(healthToday.steps * 0.00075 * 100) / 100} km</p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div className="bg-cyber-pink h-full shadow-neon-pink" style={{ width: `${Math.min(100, (healthToday.steps / 10000) * 100)}%` }}></div>
            </div>
          </div>

          {/* Card 3: Calories */}
          <div className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border flex flex-col justify-between shadow-glass">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">Metabolism Tracker</span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">Calorie Balance</h3>
              </div>
              <div className="p-2 rounded-xl bg-cyber-orange/10 text-cyber-orange border border-cyber-orange/20">
                <Flame size={18} />
              </div>
            </div>
            <div className="my-6">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-white">{healthToday.calories}</span>
                <span className="text-xs text-cyber-muted font-semibold">kcal active</span>
              </div>
              <p className="text-xs text-cyber-orange mt-1">Goal: 2,400 kcal • Deficit: 320 kcal (Loss mode)</p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div className="bg-cyber-orange h-full" style={{ width: `${(healthToday.calories / 2400) * 100}%` }}></div>
            </div>
          </div>

          {/* Card 4: Heart Rate */}
          <div className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border flex flex-col justify-between shadow-glass">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">Biometrics ECG</span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">Heart Rate</h3>
              </div>
              <div className="p-2 rounded-xl bg-cyber-red/10 text-cyber-red border border-cyber-red/20">
                <Heart size={18} />
              </div>
            </div>
            <div className="my-6 flex items-center gap-4">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-white">{healthToday.heartRate}</span>
                  <span className="text-xs text-cyber-muted font-semibold">bpm current</span>
                </div>
                <p className="text-xs text-cyber-muted mt-1">Resting: 62 bpm • HRV: 78ms</p>
              </div>
              {/* Simulated Heart Pulse Mini SVG */}
              <svg className="w-16 h-8 text-cyber-red shrink-0" viewBox="0 0 100 30" fill="none">
                <path 
                  d="M0,15 H30 L35,5 L40,25 L45,15 H60 L63,10 L66,20 L69,15 H100" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="animate-pulse"
                />
              </svg>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div className="bg-cyber-red h-full shadow-neon-pink" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>

        {/* Water tracker glass visualizer column */}
        <div className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border shadow-glass flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">Hydration Logs</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Water Balance</h3>
            </div>
            <div className="p-2 rounded-xl bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20">
              <Droplets size={18} />
            </div>
          </div>

          {/* SVG Water Glass filled visually */}
          <div className="relative my-6 flex flex-col items-center">
            <div className="relative w-28 h-36 border-2 border-white/20 rounded-b-2xl rounded-t-sm overflow-hidden flex items-end shadow-inner bg-slate-900/50">
              {/* Water fluid animation */}
              <div 
                className="w-full bg-gradient-to-t from-cyber-cyan to-cyber-blue/80 transition-all duration-700 ease-out shadow-neon-blue relative"
                style={{ height: `${waterPercent}%` }}
              >
                {waterPercent > 0 && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-cyan-200/50 blur-[1px]"></div>
                )}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-white tracking-tight">{healthToday.hydration}ml</span>
                <span className="text-[10px] font-mono text-cyan-300 font-semibold mt-0.5">{waterPercent}% OF GOAL</span>
              </div>
            </div>
            <p className="text-[10px] text-cyber-muted mt-3 text-center">Daily Target: 3.0 Liters</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => logWater(250)}
              className="py-2.5 bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/30 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 hover:scale-105"
            >
              <Plus size={14} /> +250ml
            </button>
            <button 
              onClick={() => logWater(500)}
              className="py-2.5 bg-cyber-blue/25 hover:bg-cyber-blue/35 text-white border border-cyber-blue/30 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 hover:scale-105"
            >
              <Plus size={14} /> +500ml
            </button>
          </div>
        </div>

        {/* Mood Log & Medication details */}
        <div className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border shadow-glass md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Smile className="text-cyber-yellow" />
            <h3 className="font-semibold text-lg text-slate-100">Cognitive Mood Tracker</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {(['focused', 'energetic', 'tired', 'stressed'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`p-2.5 rounded-xl border text-xs capitalize font-medium cursor-pointer text-center transition-all ${
                  mood === m 
                    ? 'bg-cyber-yellow/20 border-cyber-yellow/40 text-white' 
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* AI Mood analysis */}
          <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-cyber-muted leading-relaxed">
            {mood === 'focused' && 'AI: Cognition index is high. Excellent block of time to work on highly complex logic modules.'}
            {mood === 'energetic' && 'AI: Energy levels peaking. Suggested: Execute higher intensity fitness or cardio workouts.'}
            {mood === 'tired' && 'AI: Endocrine fatigue detected. Optimize tonight\'s circadian trigger. Avoid blue screen light after 9 PM.'}
            {mood === 'stressed' && 'AI: Cortisol spikes observed. Suggested: Trigger deep breathing block (3 minutes, 4-7-8 method).'}
          </div>
        </div>

        {/* Medication Reminders */}
        <div className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border shadow-glass lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="text-cyber-cyan" />
            <h3 className="font-semibold text-lg text-slate-100">Scheduled Prescriptions & Meds</h3>
          </div>

          <div className="space-y-3">
            {meds.map((med, idx) => (
              <div 
                key={idx}
                onClick={() => toggleMed(idx)}
                className={`flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer ${
                  med.taken 
                    ? 'bg-cyber-cyan/10 border-cyber-cyan/30 opacity-70' 
                    : 'bg-white/5 border-white/5 hover:border-cyber-cyan/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    med.taken ? 'bg-cyber-cyan border-cyber-cyan' : 'border-slate-500'
                  }`}>
                    {med.taken && <span className="text-[10px] text-black font-extrabold">✓</span>}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${med.taken ? 'line-through text-slate-400' : 'text-slate-200'}`}>{med.name}</p>
                    <p className="text-[10px] text-cyber-muted mt-0.5">{med.time}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                  med.taken ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'bg-white/10 text-slate-400'
                }`}>
                  {med.taken ? 'TAKEN' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
