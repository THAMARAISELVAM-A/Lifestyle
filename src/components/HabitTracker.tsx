import React, { useState, useCallback, useEffect } from 'react';
import {
  Award,
  Flame,
  Target,
  Zap,
  Star,
  Crown,
  Trophy,
  Plus,
  X,
  BarChart3,
  Heart,
  BookOpen,
  Dumbbell,
  Smile,
  Trash2,
  Terminal
} from 'lucide-react';
import type { Goal } from '../types';
import { useAuth } from '../context/AuthContext';
import { NeonDB } from '../services/db';

const categoryIconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Mindfulness: BookOpen,
  Diet: Heart,
  Sleep: Target,
  Learning: BookOpen,
  Fitness: Dumbbell,
  Emotional: Smile,
  Productivity: Target,
};

export const HabitTracker: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([
    { id: 'g1', title: 'Daily Deep Meditation (15m)', category: 'Mindfulness', target: 15, current: 0, unit: 'm', streak: 4, xpValue: 20 },
    { id: 'g2', title: 'Calorie Control & Diet Logs', category: 'Diet', target: 2400, current: 1840, unit: 'kcal', streak: 12, xpValue: 30 },
    { id: 'g3', title: 'Circadian Bedtime (11 PM)', category: 'Sleep', target: 1, current: 0, unit: 'sleep', streak: 3, xpValue: 25 },
    { id: 'g4', title: 'Read 30 Pages Daily', category: 'Learning', target: 30, current: 12, unit: 'pages', streak: 7, xpValue: 15 },
    { id: 'g5', title: 'Push-ups Daily (50)', category: 'Fitness', target: 50, current: 0, unit: 'reps', streak: 0, xpValue: 20 },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'Mindfulness', target: 10, unit: 'm', xpValue: 20 });
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [xpLevel, setXpLevel] = useState(340);
  const xpTarget = 500;

  const xpPercent = Math.min(100, (xpLevel / xpTarget) * 100);
  const level = Math.floor(xpLevel / xpTarget) + 1;

  const categories = ['all', 'Mindfulness', 'Diet', 'Sleep', 'Learning', 'Fitness', 'Emotional', 'Productivity'] as const;

  const filteredGoals = activeFilter === 'all' ? goals : goals.filter(g => g.category === activeFilter);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleToggleStreak = useCallback((id: string) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id !== id) return g;
        const newStreak = g.streak + 1;
        setXpLevel(xp => xp + g.xpValue);
        return {
          ...g,
          streak: newStreak,
          current: g.unit === 'sleep' ? 1 : g.current + 1,
        };
      })
    );
  }, []);

  const handleDeleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const handleAddProgress = useCallback((id: string, amount: number) => {
    setGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, current: Math.min(g.target, g.current + amount) } : g))
    );
  }, []);

  const handleAddGoal = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.target) return;
    const id = `h_${Date.now()}`;
    setGoals(prev => [
      ...prev,
      {
        id,
        title: newGoal.title.trim(),
        category: newGoal.category,
        target: newGoal.target,
        current: 0,
        unit: newGoal.unit,
        streak: 0,
        xpValue: newGoal.xpValue,
      },
    ]);
    setNewGoal({ title: '', category: newGoal.category, target: 10, unit: newGoal.unit, xpValue: 20 });
    setShowAddForm(false);
  }, [newGoal]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getCategoryIcon = useCallback((category: string) => {
    return categoryIconMap[category] ?? BookOpen;
  }, []);

  const totalHabits    = goals.length;
  const avgStreak      = totalHabits > 0 ? Math.round(goals.reduce((s, g) => s + g.streak, 0) / totalHabits) : 0;
  const todayProgress  = goals.filter(g => g.current > 0).length;
  const longestStreak  = Math.max(...goals.map(g => g.streak), 0);
  const dailyXpEarned  = goals.reduce((s, g) => s + (g.streak > 0 ? g.xpValue : 0), 0);

  // ── Persistence ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadGoals() {
      if (!isAuthenticated || !user?.id) return;
      try {
        const rows = await NeonDB.getAll<Goal & { user_id: string }>('goals', user.id);
        if (cancelled) return;
        if (rows.length > 0) {
          setGoals(rows as Goal[]);
        }
      } catch { /* keep seed state on failure */ }
    }
    loadGoals();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const timer = setTimeout(() => {
      goals.forEach(g => {
        NeonDB.insert('goals', {
          user_id: user.id,
          id: g.id,
          title: g.title,
          category: g.category,
          target: g.target,
          current: g.current,
          unit: g.unit,
          streak: g.streak,
          xp_value: g.xpValue,
        } as unknown as Record<string, unknown>)
        .catch(() => {});
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [goals, isAuthenticated, user?.id]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-cyber-green bg-black/60 min-h-screen p-6 relative border border-cyber-green/30">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        zIndex: 0
      }} />

      <div className="relative z-10">
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyber-green/30 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-widest text-cyber-green flex items-center gap-2 uppercase shadow-cyber-green/50 drop-shadow-[0_0_8px_rgba(0,255,0,0.8)]">
              <Terminal className="text-cyber-green" />
              Habit_Engine_v2.0
            </h2>
            <p className="text-cyber-green/60 text-xs mt-1 uppercase tracking-widest">&gt; SYNCING CORTICAL DATA_</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-black/60 border border-cyber-green/50 hover:bg-cyber-green/20 text-cyber-green text-xs font-bold uppercase tracking-widest rounded-none shadow-[0_0_10px_rgba(0,255,0,0.3)] transition-all cursor-pointer"
          >
            <Plus size={14} /> Initialize_Node
          </button>
        </div>

        {/* ── XP PROGRESSION BANNER ── */}
        <div className="bg-black/60 rounded-none p-6 border border-cyber-green/30 shadow-[0_0_15px_rgba(0,255,0,0.2)] mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-green" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-green" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyber-green" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-green" />

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="text-center sm:text-left">
              <p className="text-3xl font-bold text-cyber-green drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]">LVL_{level}</p>
              <p className="text-[10px] text-cyber-green/70 mt-0.5 tracking-widest">{xpLevel} / {xpTarget} XP</p>
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between text-[10px] text-cyber-green/70 mb-1 uppercase tracking-widest">
                <span>Network_Uplink</span>
                <span className="text-cyber-green drop-shadow-[0_0_2px_rgba(0,255,0,0.8)]">{xpPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-black border border-cyber-green/30 h-3 overflow-hidden flex p-0.5 gap-0.5">
                {Array.from({ length: 20 }).map((_, i) => {
                  const isActive = (i / 20) * 100 < xpPercent;
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 h-full ${isActive ? 'bg-cyber-green shadow-[0_0_8px_rgba(0,255,0,0.8)]' : 'bg-cyber-green/10'}`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-cyber-green/70 uppercase text-xs tracking-widest">
              <Zap size={18} className="text-cyber-green" />
              <span>Next_Node: LVL_{level + 1}</span>
            </div>
          </div>
        </div>

        {/* ── CATEGORY FILTER PILLS ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin border-b border-cyber-green/20 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all whitespace-nowrap border-b-2 ${
                activeFilter === cat
                  ? 'border-cyber-green text-cyber-green bg-cyber-green/10 shadow-[0_4px_10px_-2px_rgba(0,255,0,0.5)]'
                  : 'border-transparent text-cyber-green/50 hover:text-cyber-green hover:bg-cyber-green/5'
              }`}
            >
              {cat === 'all' ? 'SYS.ALL' : `SYS.${cat.toUpperCase()}`}
            </button>
          ))}
        </div>

        {/* ── STATS BAR ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total_Nodes', value: totalHabits },
            { label: 'Avg_Uptime', value: `${avgStreak} cycle` },
            { label: 'Active_Nodes', value: todayProgress },
            { label: 'Max_Uptime', value: `${longestStreak} cycle` },
          ].map((stat, i) => (
            <div key={i} className="bg-black/60 p-4 border border-cyber-green/30 shadow-[0_0_10px_rgba(0,255,0,0.15)] relative">
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyber-green" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyber-green" />
              <p className="text-[9px] text-cyber-green/60 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-extrabold text-cyber-green drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── HABIT CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map(goal => {
            const IconComp = getCategoryIcon(goal.category);
            const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
            
            // Generate segmented streak visual
            const streakSegments = Array.from({ length: Math.min(goal.streak, 10) });

            return (
              <div
                key={goal.id}
                className="bg-black/80 p-5 border border-cyber-green/40 shadow-[0_0_15px_rgba(0,255,0,0.2)] flex flex-col justify-between gap-4 relative group hover:border-cyber-green hover:shadow-[0_0_25px_rgba(0,255,0,0.4)] transition-all"
              >
                {/* HUD Corners */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-green opacity-70 group-hover:opacity-100" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-green opacity-70 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-green opacity-70 group-hover:opacity-100" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-green opacity-70 group-hover:opacity-100" />

                {/* ── top row ── */}
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-cyber-green/10 border border-cyber-green/50 text-cyber-green shrink-0 shadow-[0_0_8px_rgba(0,255,0,0.3)]">
                      <IconComp size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-cyber-green truncate uppercase tracking-widest drop-shadow-[0_0_4px_rgba(0,255,0,0.6)]">{goal.title}</h3>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-cyber-green/60 inline-block mt-0.5">
                        [CAT: {goal.category}]
                      </span>
                    </div>
                  </div>

                  {/* Delete menu */}
                  <div className="shrink-0">
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 border border-transparent hover:border-cyber-green/50 bg-black hover:bg-cyber-green/10 text-cyber-green/50 hover:text-cyber-green transition-all cursor-pointer shrink-0"
                      title="Terminate Node"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* ── progress ── */}
                <div className="relative z-10">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1.5">
                    <span className="text-cyber-green/70">DATA: {goal.current} / {goal.target} {goal.unit}</span>
                    <span className="text-cyber-green drop-shadow-[0_0_2px_rgba(0,255,0,0.8)]">{pct}%</span>
                  </div>
                  <div className="w-full bg-black border border-cyber-green/30 h-2 overflow-hidden flex p-0.5 gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const isActive = (i / 10) * 100 < pct;
                      return (
                        <div 
                          key={i} 
                          className={`flex-1 h-full ${isActive ? 'bg-cyber-green shadow-[0_0_5px_rgba(0,255,0,0.8)]' : 'bg-cyber-green/10'}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* ── bottom action row ── */}
                <div className="flex flex-col gap-2 pt-2 relative z-10">
                  <div className="flex items-center gap-2 h-4 mb-2">
                    <span className="text-[9px] uppercase tracking-widest text-cyber-green/60">UPTIME:</span>
                    <div className="flex gap-1 flex-1">
                      {streakSegments.map((_, i) => (
                        <div key={i} className="w-1.5 h-full bg-cyber-green shadow-[0_0_5px_rgba(0,255,0,0.8)] skew-x-[-15deg]" />
                      ))}
                      {goal.streak > 10 && <span className="text-[10px] text-cyber-green ml-1 drop-shadow-[0_0_2px_rgba(0,255,0,0.8)]">+{goal.streak - 10}</span>}
                      {goal.streak === 0 && <span className="text-[9px] text-cyber-green/30">DISCONNECTED</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const stepVal = Math.max(1, Math.round(goal.target * 0.1));
                        handleAddProgress(goal.id, stepVal);
                      }}
                      className="flex-1 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-cyber-green/10 text-cyber-green border border-cyber-green/40 hover:bg-cyber-green/30 hover:shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all cursor-pointer"
                    >
                      &gt; INJECT_DATA
                    </button>
                    <button
                      onClick={() => handleToggleStreak(goal.id)}
                      className={`flex-1 py-1.5 text-[10px] uppercase tracking-widest font-bold border transition-all cursor-pointer ${
                        goal.streak > 0
                          ? 'bg-cyber-green text-black border-cyber-green hover:bg-cyber-green/80 shadow-[0_0_10px_rgba(0,255,0,0.6)]'
                          : 'bg-black text-cyber-green/70 border-cyber-green/40 hover:text-cyber-green hover:border-cyber-green hover:bg-cyber-green/10'
                      }`}
                    >
                      {goal.streak > 0 ? (
                        <span className="flex items-center justify-center gap-1"><Flame size={10} /> LINK_ACTIVE</span>
                      ) : (
                        'ESTABLISH_LINK'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredGoals.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-cyber-green/50 uppercase tracking-widest border border-dashed border-cyber-green/30 bg-cyber-green/5">
              [NO_NODES_FOUND] <br/> Initialize a new node to expand the matrix.
            </div>
          )}
        </div>

        {/* ── ADD GOAL MODAL ── */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 p-6 border-2 border-cyber-green shadow-[0_0_30px_rgba(0,255,0,0.3)] w-full max-w-md relative font-mono text-cyber-green">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyber-green" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyber-green" />

              <div className="flex items-center justify-between mb-5 border-b border-cyber-green/30 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]">Initialize_New_Node</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 hover:bg-cyber-green/20 text-cyber-green/70 hover:text-cyber-green transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-cyber-green/70 uppercase tracking-widest block mb-1">Node_ID / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EXEC_RUN_5KM"
                    value={newGoal.title}
                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-cyber-green/50 text-cyber-green text-xs focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,0,0.5)] placeholder:text-cyber-green/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-cyber-green/70 uppercase tracking-widest block mb-1">Subsystem (Category)</label>
                    <select
                      value={newGoal.category}
                      onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-cyber-green/50 text-cyber-green text-xs focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,0,0.5)] appearance-none"
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat} value={cat}>SYS.{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-cyber-green/70 uppercase tracking-widest block mb-1">XP_Yield</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={newGoal.xpValue}
                      onChange={e => setNewGoal({ ...newGoal, xpValue: Number(e.target.value) || 20 })}
                      className="w-full px-3 py-2 bg-black border border-cyber-green/50 text-cyber-green text-xs focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-cyber-green/70 uppercase tracking-widest block mb-1">Target_Value</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newGoal.target}
                      onChange={e => setNewGoal({ ...newGoal, target: Number(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-black border border-cyber-green/50 text-cyber-green text-xs focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-cyber-green/70 uppercase tracking-widest block mb-1">Data_Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MB, cycles"
                      value={newGoal.unit}
                      onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-cyber-green/50 text-cyber-green text-xs focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,0,0.5)] placeholder:text-cyber-green/30"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-cyber-green/30">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-cyber-green/40 bg-black text-cyber-green/70 hover:text-cyber-green hover:bg-cyber-green/10 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyber-green/20 hover:bg-cyber-green/40 border border-cyber-green text-cyber-green shadow-[0_0_10px_rgba(0,255,0,0.3)] hover:shadow-[0_0_15px_rgba(0,255,0,0.6)] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Execute
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── BOTTOM SYSTEM DIAGNOSTICS ── */}
        <div className="bg-black/60 p-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-cyber-green/70 uppercase tracking-widest border border-cyber-green/30 shadow-[0_0_10px_rgba(0,255,0,0.1)] mt-6">
          <div className="flex items-center gap-1.5">
            <Terminal size={12} className="text-cyber-green animate-pulse" />
            <span>SYS_CORE: ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-cyber-green" />
            <span>UPLINK_STABILITY: OPTIMAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 size={12} className="text-cyber-green" />
            <span>NET_YIELD: {dailyXpEarned} / {xpTarget} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
