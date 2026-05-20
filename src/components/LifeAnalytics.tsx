import React from 'react';
import { BarChart3, Info, Sparkles, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';


interface LifeAnalyticsProps {
  onScoreUpdate: (score: number) => void;
}

export const LifeAnalytics: React.FC<LifeAnalyticsProps> = ({ onScoreUpdate }) => {
  // Sliders for formula variables
  const [health, setHealth] = React.useState(85);
  const [productivity, setProductivity] = React.useState(75);
  const [finance, setFinance] = React.useState(80);
  const [sleep, setSleep] = React.useState(70);
  const [habits, setHabits] = React.useState(90);
  const [stress, setStress] = React.useState(45); // Negative impact

  // Formula calculation
  // LifeScore = (Health * 0.2) + (Productivity * 0.2) + (Finance * 0.15) + (Sleep * 0.15) + (Habits * 0.2) + ((100 - Stress) * 0.1)
  const calculateLifeScore = () => {
    const rawScore = 
      (health * 0.2) + 
      (productivity * 0.2) + 
      (finance * 0.15) + 
      (sleep * 0.15) + 
      (habits * 0.2) + 
      ((100 - stress) * 0.1);
    return Math.round(rawScore);
  };

  const calculatedScore = calculateLifeScore();

  // Update parent state
  React.useEffect(() => {
    onScoreUpdate(calculatedScore);
  }, [calculatedScore, onScoreUpdate]);

  const getScoreRating = (score: number) => {
    if (score >= 85) return { text: 'EXCELLENT', color: 'text-cyber-green border-cyber-green/30 bg-cyber-green/5' };
    if (score >= 70) return { text: 'STABLE', color: 'text-cyber-blue border-cyber-blue/30 bg-cyber-blue/5' };
    if (score >= 50) return { text: 'MODERATE', color: 'text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/5' };
    return { text: 'CRITICAL WARNING', color: 'text-cyber-red border-cyber-red/30 bg-cyber-red/5' };
  };

  const rating = getScoreRating(calculatedScore);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="text-cyber-cyan" />
          Life Intelligence Analytics
        </h2>
        <p className="text-cyber-muted text-xs">Biometric variables and productivity telemetry computed in real time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders Input Panel */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-6">
          <div>
            <h3 className="font-semibold text-base text-slate-100 flex items-center gap-2">
              <Sparkles size={16} className="text-cyber-cyan" />
              Interactive LifeScore™ Coefficients
            </h3>
            <p className="text-cyber-muted text-xs mt-1">Adjust coefficients to see LifeOS calculations update in real time.</p>
          </div>

          <div className="space-y-4">
            {/* Health */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Physical Health Index</span>
                <span className="text-cyber-pink font-bold">{health} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={health}
                onChange={(e) => setHealth(Number(e.target.value))}
                className="w-full accent-cyber-pink"
              />
            </div>

            {/* Productivity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Focus & Productivity Index</span>
                <span className="text-cyber-purple font-bold">{productivity} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={productivity}
                onChange={(e) => setProductivity(Number(e.target.value))}
                className="w-full accent-cyber-purple"
              />
            </div>

            {/* Finance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Finance Stability Index</span>
                <span className="text-cyber-green font-bold">{finance} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={finance}
                onChange={(e) => setFinance(Number(e.target.value))}
                className="w-full accent-cyber-green"
              />
            </div>

            {/* Sleep */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Circadian Sleep Index</span>
                <span className="text-cyber-cyan font-bold">{sleep} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sleep}
                onChange={(e) => setSleep(Number(e.target.value))}
                className="w-full accent-cyber-cyan"
              />
            </div>

            {/* Habits */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Habit Consistency Index</span>
                <span className="text-cyber-yellow font-bold">{habits} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={habits}
                onChange={(e) => setHabits(Number(e.target.value))}
                className="w-full accent-cyber-yellow"
              />
            </div>

            {/* Stress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Endocrine Stress Index (Negative Weight)</span>
                <span className="text-cyber-red font-bold">{stress} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full accent-cyber-red"
              />
            </div>
          </div>
        </div>

        {/* Score Calculations Result Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Result Card */}
          <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass text-center space-y-5">
            <h3 className="font-semibold text-sm text-slate-100 uppercase tracking-widest font-mono">Computed LifeScore™</h3>
            
            <div className="w-36 h-36 rounded-full bg-slate-950/60 border border-white/5 mx-auto flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-0.5 rounded-full border border-dashed border-cyber-cyan/30 animate-pulse-slow"></div>
              <div>
                <span className="text-5xl font-extrabold text-white tracking-tight">{calculatedScore}</span>
                <span className="block text-[9px] text-cyber-muted font-mono uppercase mt-1">Total Points</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs font-mono font-bold ${rating.color}`}>
              STATUS: {rating.text}
            </div>

            {/* Formula readout */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-left space-y-1 font-mono text-[9px] text-cyber-muted">
              <div className="flex items-center gap-1 font-bold text-slate-300 mb-1">
                <Info size={10} />
                Formula Matrix
              </div>
              <p>LifeScore = (Health × 0.2)</p>
              <p>+ (Productivity × 0.2)</p>
              <p>+ (Finance × 0.15)</p>
              <p>+ (Sleep × 0.15)</p>
              <p>+ (Habits × 0.2)</p>
              <p>+ ((100 - Stress) × 0.1)</p>
            </div>
          </div>

          {/* Diagnostics Analytics reports */}
          <div className="glass-panel rounded-2xl p-5 border border-cyber-border bg-black/30 text-xs space-y-3.5">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Activity size={14} className="text-cyber-cyan" />
              Burnout Risk & Habit Report
            </h4>
            
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-cyber-yellow shrink-0 mt-0.5" />
                <p className="text-cyber-muted">
                  {stress > 65 ? 'High Cortisol: Stress is above threshold limits. Plan an immediate 20-min digital detox block.' : 'Stress parameters remain within standard physiological thresholds.'}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <ShieldCheck size={14} className="text-cyber-green shrink-0 mt-0.5" />
                <p className="text-cyber-muted">
                  {habits > 75 ? 'Habit consistency is excellent! Streaks are actively boosting daily productivity metrics.' : 'Habit streaks are lagging. Consider lowering goals for meditation.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
