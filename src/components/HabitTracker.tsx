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
} from 'lucide-react';
import type { Goal } from '../types';
import { useAuth } from '../context/AuthContext';
import { NeonDB } from '../services/db';

// Map each category → lucide icon component
const categoryIconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Mindfulness: BookOpen,
  Diet: Heart,
  Sleep: Target,
  Learning: BookOpen,
  Fitness: Dumbbell,
  Emotional: Smile,
  Productivity: Target,
};

// Map each category → color key (string may contain spaces)
const CATEGORY_COLOR: Record<string, string> = {
  Mindfulness: 'text-cyber-purple',
  Diet: 'text-cyber-green',
  Sleep: 'text-cyber-blue',
  Learning: 'text-cyber-cyan',
  Fitness: 'text-cyber-orange',
  Emotional: 'text-cyber-pink',
  Productivity: 'text-cyber-yellow',
};

const CATEGORY_BG: Record<string, string> = {
  Mindfulness: 'bg-cyber-purple/20',
  Diet: 'bg-cyber-green/20',
  Sleep: 'bg-cyber-blue/20',
  Learning: 'bg-cyber-cyan/20',
  Fitness: 'bg-cyber-orange/20',
  Emotional: 'bg-cyber-pink/20',
  Productivity: 'bg-cyber-yellow/20',
};

const CATEGORY_BORDER: Record<string, string> = {
  Mindfulness: 'border-cyber-purple/30',
  Diet: 'border-cyber-green/30',
  Sleep: 'border-cyber-blue/30',
  Learning: 'border-cyber-cyan/30',
  Fitness: 'border-cyber-orange/30',
  Emotional: 'border-cyber-pink/30',
  Productivity: 'border-cyber-yellow/30',
};

const PROGRESS_COLOR: Record<string, string> = {
  Mindfulness: 'bg-cyber-purple shadow-neon-purple',
  Diet: 'bg-cyber-green shadow-neon-green',
  Sleep: 'bg-cyber-blue shadow-neon-blue',
  Learning: 'bg-cyber-cyan',
  Fitness: 'bg-cyber-orange',
  Emotional: 'bg-cyber-pink shadow-neon-pink',
  Productivity: 'bg-cyber-yellow',
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

  type StreakBadge = { icon: React.FC<{ size?: number; className?: string }>; label: string; color: string };

  const STREAK_COLOR: Record<number, string> = {
    3:  'text-cyber-red bg-cyber-red/20 border border-cyber-red/30',
    7:  'text-cyber-pink bg-cyber-pink/20 border border-cyber-pink/30',
    14: 'text-cyber-orange bg-cyber-orange/20 border border-cyber-orange/30',
    30: 'text-cyber-yellow bg-cyber-yellow/20 border border-cyber-yellow/30',
  };

  const getStreakBadge = (streak: number): StreakBadge | null => {
    if (streak >= 30) return { icon: Trophy, label: 'LEGEND', color: STREAK_COLOR[30] ?? STREAK_COLOR[7]! };
    if (streak >= 14) return { icon: Crown,  label: 'Champion', color: STREAK_COLOR[14]! };
    if (streak >= 7)  return { icon: Star,    label: 'Rising',   color: STREAK_COLOR[7]! };
    if (streak >= 3)  return { icon: Flame,   label: 'Streak',   color: STREAK_COLOR[3]! };
    return null;
  };

  const getCategoryIcon = useCallback((category: string) => {
    return categoryIconMap[category] ?? BookOpen;
  }, []);

  const totalHabits    = goals.length;
  const avgStreak      = totalHabits > 0 ? Math.round(goals.reduce((s, g) => s + g.streak, 0) / totalHabits) : 0;
  const todayProgress  = goals.filter(g => g.current > 0).length;
  const longestStreak  = Math.max(...goals.map(g => g.streak), 0);
  const dailyXpEarned  = goals.reduce((s, g) => s + (g.streak > 0 ? g.xpValue : 0), 0);

  // ── Persistence ─────────────────────────────────────────────────────────────
  // Load goals from Neon on mount (authenticated session only)
  useEffect(() => {
    let cancelled = false;
    async function loadGoals() {
      if (!isAuthenticated || !user?.id) return;
      try {
        // @ts-expect-error DB service — goals table not yet in full type surface
        const rows: any[] = await NeonDB.getAll('goals', user.id);
        if (cancelled) return;
        if (rows.length > 0) {
          setGoals(rows as Goal[]);
        }
      } catch { /* keep seed state on failure */ }
    }
    loadGoals();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Debounced persist → Neon DB (2 s after last mutation)
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
        } as any) // Nelenwrap: goals table not yet in strict DB type enum
        .catch(() => {});
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [goals, isAuthenticated, user?.id]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Award className="text-cyber-yellow" />
            Habit Engine &amp; Personal Growth
          </h2>
          <p className="text-cyber-muted text-xs mt-1">Gamified habit tracking, XP progression, and achievement streaks.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyber-yellow/20 border border-cyber-yellow/30 hover:bg-cyber-yellow/30 text-cyber-yellow text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          <Plus size={14} /> Add Habit
        </button>
      </div>

      {/* ── XP PROGRESSION BANNER ── */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="text-center sm:text-left">
            <p className="text-3xl font-bold text-cyber-yellow">LEVEL {level}</p>
            <p className="text-[10px] font-mono text-cyber-muted mt-0.5">{xpLevel} / {xpTarget} XP</p>
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between text-[10px] font-mono text-cyber-muted mb-1">
              <span>Progress to next level</span>
              <span className="text-cyber-yellow">{xpPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-cyber-purple to-cyber-yellow h-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-cyber-muted">
            <Crown size={18} className="text-cyber-yellow" />
            <span className="text-xs">Next milestone at Level {level + 1}</span>
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER PILLS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all whitespace-nowrap ${
              activeFilter === cat
                ? 'bg-cyber-yellow/20 border border-cyber-yellow/30 text-cyber-yellow'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* ── STATS BAR ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-cyber-border shadow-glass">
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">Total Habits</p>
          <p className="text-2xl font-extrabold text-white mt-1">{totalHabits}</p>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-cyber-border shadow-glass">
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">Average Streak</p>
          <p className="text-2xl font-extrabold text-cyber-orange mt-1">{avgStreak} days</p>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-cyber-border shadow-glass">
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">Active Today</p>
          <p className="text-2xl font-extrabold text-cyber-green mt-1">{todayProgress} done</p>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-cyber-border shadow-glass">
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">Longest Streak</p>
          <p className="text-2xl font-extrabold text-cyber-pink mt-1">{longestStreak} days</p>
        </div>
      </div>

      {/* ── HABIT CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGoals.map(goal => {
          const IconComp = getCategoryIcon(goal.category);
          const badge  = getStreakBadge(goal.streak);
          const Color  = CATEGORY_COLOR[goal.category]   ?? 'text-slate-300';
          const Bg     = CATEGORY_BG[goal.category]      ?? 'bg-white/5';
          const Border = CATEGORY_BORDER[goal.category]  ?? 'border-white/5';
          const Progr  = PROGRESS_COLOR[goal.category]   ?? 'bg-cyber-green';
          const pct    = goal.target > 0
            ? Math.min(100, Math.round((goal.current / goal.target) * 100))
            : 0;

          return (
            <div
              key={goal.id}
              className="glass-panel rounded-2xl p-5 border border-cyber-border shadow-glass flex flex-col justify-between gap-4"
            >
              {/* ── top row ── */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${Bg} ${Color} border ${Border} shrink-0`}>
                    <IconComp size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{goal.title}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-cyber-muted bg-white/5 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {goal.category}
                    </span>
                  </div>
                </div>

                {/* Streak badge or delete menu */}
                <div className="shrink-0">
                  {badge && (
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        badge.color
                      }`}
                    >
                      <badge.icon size={12} />
                      {badge.label}
                    </div>
                  )}
                  {!badge && (
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 rounded-lg bg-white/5 hover:bg-cyber-red/10 text-slate-400 hover:text-cyber-red transition-colors cursor-pointer shrink-0"
                      title="Delete habit"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* ── progress ── */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300">{goal.current} / {goal.target} {goal.unit}</span>
                  <span className="text-cyber-muted">{pct}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className={`${Progr} h-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* ── bottom action row ── */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    // Determine step (10% of target, minimum 1)
                    const stepVal = Math.max(1, Math.round(goal.target * 0.1));
                    handleAddProgress(goal.id, stepVal);
                  }}
                  className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-cyber-green/10 text-cyber-green border border-cyber-green/25 hover:bg-cyber-green/20 cursor-pointer transition"
                >
                  + Log Progress
                </button>
                <button
                  onClick={() => handleToggleStreak(goal.id)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition ${
                    goal.streak > 0
                      ? 'bg-cyber-yellow/15 text-cyber-yellow border border-cyber-yellow/25 hover:bg-cyber-yellow/25'
                      : 'bg-white/5 text-slate-400 border border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {goal.streak > 0 ? (
                    <span className="flex items-center justify-center gap-1"><Flame size={12} /> 🔥 {goal.streak}d</span>
                  ) : (
                    'Check-in Streak'
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-cyber-muted">
            No habits match this filter. Select a different category or create a new habit.
          </div>
        )}
      </div>

      {/* ── ADD GOAL MODAL ── */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl p-6 border border-cyber-yellow/40 bg-cyber-bg/95 shadow-glass-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Define New Growth Goal</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider font-mono block mb-1.5">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Run 5 km every morning"
                  value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider font-mono block mb-1.5">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider font-mono block mb-1.5">XP Value</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={newGoal.xpValue}
                    onChange={e => setNewGoal({ ...newGoal, xpValue: Number(e.target.value) || 20 })}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider font-mono block mb-1.5">Target</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newGoal.target}
                    onChange={e => setNewGoal({ ...newGoal, target: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider font-mono block mb-1.5">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. m, kcal, pages"
                    value={newGoal.unit}
                    onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/5 cursor-pointer text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyber-yellow/20 hover:bg-cyber-yellow/30 border border-cyber-yellow/50 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BOTTOM SYSTEM DIAGNOSTICS ── */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-cyber-muted font-mono items-center border border-cyber-border">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-cyber-yellow" />
          <span>LifeOS Intelligence Engine: Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame size={12} className="text-cyber-orange" />
          <span>Streak Recovery: 1-day freezes enabled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BarChart3 size={12} className="text-cyber-cyan" />
          <span>{dailyXpEarned} / {xpTarget} XP</span>
        </div>
      </div>
    </div>
  );
};
