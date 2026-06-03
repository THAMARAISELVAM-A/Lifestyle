import React from 'react';
import { 
  Activity, CheckSquare, Calendar as CalendarIcon, 
  DollarSign, Home as HomeIcon, Zap, Clock, ShieldAlert, Award, ChevronRight
} from 'lucide-react';
import type { Task, Goal, HealthMetric, SmartDevice } from '../types';
import { AnimatedCounter } from './AnimatedCounter';
import { Sparkline } from './Sparkline';



interface DashboardProps {
  setActiveTab: (tab: string) => void;
  tasks: Task[];
  toggleTaskStatus: (id: string) => void;
  goals: Goal[];
  toggleGoalStreak: (id: string) => void;
  healthToday: HealthMetric;
  devices: SmartDevice[];
  toggleDevice: (id: string) => void;
  totalExpenses: number;
  lifeScore: number;
  aiRecommendations: string[];
  runOptimization: () => void;
  isOptimizing: boolean;
  userName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  tasks,
  toggleTaskStatus,
  goals,
  toggleGoalStreak,
  healthToday,
  devices,
  toggleDevice,
  totalExpenses,
  lifeScore,
  aiRecommendations,
  runOptimization,
  isOptimizing,
  userName
}) => {
  const activeTasks = tasks.filter(t => t.status !== 'done').slice(0, 3);
  const activeDevices = devices.slice(0, 3);


  // Formatting current date/time
  const [currentTime, setCurrentTime] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  // LifeScore Color Helper
  const getLifeScoreColor = (score: number) => {
    if (score >= 85) return 'text-cyber-green';
    if (score >= 70) return 'text-cyber-blue';
    if (score >= 50) return 'text-cyber-yellow';
    return 'text-cyber-red';
  };

  const getLifeScoreGlow = (score: number) => {
    if (score >= 85) return 'shadow-neon-green/20 border-cyber-green/30';
    if (score >= 70) return 'shadow-neon-blue/20 border-cyber-blue/30';
    if (score >= 50) return 'shadow-neon-pink/20 border-cyber-yellow/30';
    return 'shadow-neon-red/20 border-cyber-red/30';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Greeting, Time and AI recommendation quick banner */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Welcome back, {userName ?? 'Alex'}
          </h2>
          <p className="text-cyber-muted text-sm mt-1 flex items-center gap-1.5 font-mono">
            <Clock size={14} className="text-cyber-purple" />
            System active — {dateString} @ <span className="text-cyber-purple">{timeString}</span>
          </p>
        </div>

        {/* SOS Alert and Quick Controls */}
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('emergency')}
            className="flex items-center gap-2 px-4 py-2 bg-cyber-red/20 border border-cyber-red/30 rounded-xl text-cyber-red text-sm font-semibold hover:bg-cyber-red/30 hover:scale-105 transition-all shadow-neon-pink/10 cursor-pointer"
          >
            <ShieldAlert size={16} className="animate-pulse" />
            EMERGENCY SOS
          </button>

          <button 
            onClick={runOptimization}
            disabled={isOptimizing}
            className={`flex items-center gap-2 px-4 py-2 bg-cyber-purple/20 border border-cyber-purple/30 hover:border-cyber-purple/50 rounded-xl text-cyber-purple text-sm font-semibold hover:bg-cyber-purple/30 hover:scale-105 transition-all shadow-neon-purple/10 cursor-pointer ${
              isOptimizing ? 'animate-pulse opacity-70' : ''
            }`}
          >
            <Zap size={16} className={isOptimizing ? 'animate-spin' : ''} />
            {isOptimizing ? 'Optimizing OS...' : 'Optimize LifeOS'}
          </button>
        </div>
      </div>

      {/* Main Grid: Columns for details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Core LifeScore widget */}
        <div className={`glass-panel rounded-2xl p-6 flex flex-col justify-between border shadow-glass ${getLifeScoreGlow(lifeScore)}`}>
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-slate-100">Overall LifeScore™</h3>
              <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 font-mono text-cyber-muted">Neural Log</span>
            </div>
            <p className="text-cyber-muted text-xs mt-1">Weighted metric for health, finance, habits & schedule.</p>
          </div>
          
          <div className="my-6 flex items-center justify-center relative">
            {/* Circular Ring Progress Chart */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="url(#lifeScoreGradient)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * lifeScore) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="lifeScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className={`text-4xl font-extrabold tracking-tight ${getLifeScoreColor(lifeScore)}`}>
                <AnimatedCounter value={lifeScore} />
              </span>
              <span className="block text-[10px] text-cyber-muted uppercase tracking-wider font-mono">Index Level</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between text-center">
            <div>
              <span className="block text-[10px] text-cyber-muted uppercase font-mono">Sleep</span>
              <span className="text-sm font-semibold text-cyber-pink">{healthToday.sleep}h</span>
            </div>
            <div className="border-r border-white/10"></div>
            <div>
              <span className="block text-[10px] text-cyber-muted uppercase font-mono">Finance</span>
              <span className="text-sm font-semibold text-cyber-green">${totalExpenses}</span>
            </div>
            <div className="border-r border-white/10"></div>
            <div>
              <span className="block text-[10px] text-cyber-muted uppercase font-mono">Hydration</span>
              <span className="text-sm font-semibold text-cyber-cyan">{healthToday.hydration}ml</span>
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded bg-cyber-purple/20 border border-cyber-purple/30 text-cyber-purple">
                <Zap size={16} />
              </div>
              <h3 className="font-semibold text-lg text-slate-100">AI Personal Recommendations</h3>
            </div>
            <p className="text-cyber-muted text-xs">Real-time scheduling and lifestyle optimization logic.</p>
          </div>

          <div className="my-4 space-y-3 flex-1 overflow-y-auto max-h-[160px] pr-1">
            {aiRecommendations.map((rec, idx) => (
              <div 
                key={idx}
                className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyber-purple/30 hover:bg-cyber-purple/5 transition-all text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-purple mt-1.5 shrink-0"></div>
                <p className="text-slate-200">{rec}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-cyber-border">
            <span className="text-[10px] text-cyber-purple font-mono uppercase tracking-wider">AI Copilot Core</span>
            <button 
              onClick={() => setActiveTab('ai-copilot')} 
              className="text-xs text-cyber-blue hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              Open Assistant Chat <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Health Tracker Widget */}
        <div 
          onClick={() => setActiveTab('health')}
          className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border shadow-glass flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2">
                <Activity className="text-cyber-pink" size={20} />
                Health Metrics
              </h3>
              <span className="text-[10px] text-cyber-pink bg-cyber-pink/15 border border-cyber-pink/20 rounded-full px-2 py-0.5 font-mono">92% Target</span>
            </div>
            <p className="text-cyber-muted text-xs mt-1">Today's biometrics and physical diagnostics.</p>
          </div>

          <div className="space-y-3.5 my-5">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Daily Steps</span>
                <span className="text-cyber-pink font-semibold">{healthToday.steps} / 10k</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-cyber-pink h-full transition-all duration-500 shadow-neon-pink"
                  style={{ width: `${Math.min(100, (healthToday.steps / 10000) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Stress Index</span>
                <span className="text-cyber-yellow font-semibold">{healthToday.stress} / 100</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-cyber-yellow h-full transition-all duration-500 shadow-neon-pink"
                  style={{ width: `${healthToday.stress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                <span className="block text-[9px] text-cyber-muted uppercase font-mono">Heart Rate</span>
                <span className="text-sm font-semibold text-white">{healthToday.heartRate} bpm</span>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                <span className="block text-[9px] text-cyber-muted uppercase font-mono">Calories</span>
                <span className="text-sm font-semibold text-white">{healthToday.calories} kcal</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] text-cyber-muted flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-pink animate-pulse"></span>
              Syncing via Google Fit
            </span>
            <Sparkline data={[72, 75, 68, 80, 74, 71, 72]} color="var(--cyber-pink)" width={80} height={20} />
          </div>
        </div>

        {/* Task & Productivity Widget */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border shadow-glass flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2">
                <CheckSquare className="text-cyber-green" size={20} />
                Focus Tasks
              </h3>
              <span className="text-[10px] text-cyber-green bg-cyber-green/15 border border-cyber-green/20 rounded-full px-2 py-0.5 font-mono">
                {tasks.filter(t => t.status === 'done').length}/{tasks.length} Done
              </span>
            </div>
            <p className="text-cyber-muted text-xs mt-1">High priority tasks scheduled for today.</p>
          </div>

          <div className="my-4 space-y-2.5 flex-1">
            {activeTasks.length > 0 ? (
              activeTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskStatus(task.id);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-cyber-green/30 hover:bg-cyber-green/5 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-4 h-4 rounded border border-cyber-green/40 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-sm bg-transparent hover:bg-cyber-green/30"></div>
                    </div>
                    <span className="text-xs text-slate-200 truncate pr-1">{task.title}</span>
                  </div>
                  <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                    task.priority === 'high' ? 'bg-cyber-red/20 text-cyber-red' :
                    task.priority === 'medium' ? 'bg-cyber-yellow/20 text-cyber-yellow' : 'bg-cyber-blue/20 text-cyber-blue'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center py-6 text-center text-xs text-cyber-muted">
                No active tasks. Good job!
              </div>
            )}
          </div>

          <span className="text-[10px] text-cyber-muted flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-green"></span>
            Syncing via Todoist & Trello
          </span>
        </div>

        {/* Schedule & Calendar Widget */}
        <div 
          onClick={() => setActiveTab('calendar')}
          className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border shadow-glass flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2">
                <CalendarIcon className="text-cyber-yellow" size={20} />
                Daily Schedule
              </h3>
              <span className="text-[10px] text-cyber-yellow bg-cyber-yellow/15 border border-cyber-yellow/20 rounded-full px-2 py-0.5 font-mono">Google Calendar</span>
            </div>
            <p className="text-cyber-muted text-xs mt-1">Calendar schedule events for today.</p>
          </div>

          <div className="my-4 space-y-3">
            <div className="flex gap-3 text-xs">
              <span className="text-cyber-yellow font-semibold font-mono w-12 shrink-0">09:00 AM</span>
              <div className="pl-3 border-l-2 border-cyber-yellow/40">
                <p className="text-slate-200 font-medium">Weekly Design Review</p>
                <p className="text-cyber-muted text-[10px]">Product Team sync</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-cyber-yellow font-semibold font-mono w-12 shrink-0">01:30 PM</span>
              <div className="pl-3 border-l-2 border-cyber-yellow/40">
                <p className="text-slate-200 font-medium">Lunch with Sarah</p>
                <p className="text-cyber-muted text-[10px]">Grand Bistro Cafe</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-cyber-yellow font-semibold font-mono w-12 shrink-0">06:00 PM</span>
              <div className="pl-3 border-l-2 border-cyber-yellow/40">
                <p className="text-slate-200 font-medium">Gym Session (Cardio)</p>
                <p className="text-cyber-muted text-[10px]">Move Workout (Optimized)</p>
              </div>
            </div>
          </div>

          <span className="text-[10px] text-cyber-muted flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-yellow"></span>
            3 events synced successfully
          </span>
        </div>

        {/* Finance Quick Widget */}
        <div 
          onClick={() => setActiveTab('finance')}
          className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border shadow-glass flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2">
                <DollarSign className="text-cyber-green" size={20} />
                Finance Summary
              </h3>
              <span className="text-[10px] text-cyber-green bg-cyber-green/15 border border-cyber-green/20 rounded-full px-2 py-0.5 font-mono">Under Budget</span>
            </div>
            <p className="text-cyber-muted text-xs mt-1">Expenses tracked and investment budget status.</p>
          </div>

          <div className="my-5 flex justify-between items-end">
            <div>
              <span className="text-xs text-cyber-muted font-mono block">Monthly Spent</span>
              <span className="text-3xl font-extrabold text-white">${totalExpenses}</span>
              <span className="text-[10px] text-cyber-green block font-mono mt-0.5">↓ 8% than last month</span>
            </div>
            <div className="w-1/2">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>Budget Limit</span>
                <span>$2,500</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-cyber-green h-full transition-all duration-500 shadow-neon-green"
                  style={{ width: `${(totalExpenses / 2500) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] text-cyber-muted flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green"></span>
              AI: Savings rate is optimized at 28%
            </span>
            <Sparkline data={[320, 180, 250, 420, 150, 280, 385]} color="var(--cyber-green)" width={80} height={20} />
          </div>
        </div>

        {/* Smart Home Quick Control */}
        <div 
          onClick={() => setActiveTab('smarthome')}
          className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border shadow-glass flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2">
                <HomeIcon className="text-cyber-orange" size={20} />
                Smart Home
              </h3>
              <span className="text-[10px] text-cyber-orange bg-cyber-orange/15 border border-cyber-orange/20 rounded-full px-2 py-0.5 font-mono">IoT Online</span>
            </div>
            <p className="text-cyber-muted text-xs mt-1">Quick switches for primary smart home peripherals.</p>
          </div>

          <div className="my-4 space-y-2">
            {activeDevices.map(device => (
              <div 
                key={device.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDevice(device.id);
                }}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:border-cyber-orange/30 transition-all text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full ${device.status ? 'bg-cyber-orange animate-pulse' : 'bg-slate-600'}`}></span>
                  <span className="text-slate-200 truncate">{device.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {device.value && <span className="text-cyber-muted font-mono text-[10px]">{device.value}</span>}
                  <button 
                    className={`px-3 py-1 rounded font-semibold text-[10px] tracking-wide uppercase transition-all ${
                      device.status ? 'bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/30' : 'bg-white/5 text-slate-400 border border-transparent'
                    }`}
                  >
                    {device.status ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <span className="text-[10px] text-cyber-muted flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-orange"></span>
            8 total IoT devices connected
          </span>
        </div>

        {/* Habit Tracker & XP Widget */}
        <div 
          onClick={() => setActiveTab('habits')}
          className="glass-panel glass-panel-glow rounded-2xl p-6 border border-cyber-border shadow-glass flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2">
                <Award className="text-cyber-yellow" size={20} />
                Habits & Growth
              </h3>
              <span className="text-[10px] text-cyber-yellow bg-cyber-yellow/15 border border-cyber-yellow/20 rounded-full px-2 py-0.5 font-mono">Level 4</span>
            </div>
            <p className="text-cyber-muted text-xs mt-1">Growth tasks, XP level, and achievement streaks.</p>
          </div>

          <div className="my-4 space-y-3">
            {/* XP progress bar */}
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>XP Level Progress</span>
                <span className="text-cyber-yellow">340 / 500 XP</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-cyber-purple to-cyber-yellow h-full transition-all duration-500"
                  style={{ width: '68%' }}
                ></div>
              </div>
            </div>

            {/* Habit lists */}
            <div className="space-y-1.5">
              {goals.slice(0, 2).map(goal => (
                <div 
                  key={goal.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGoalStreak(goal.id);
                  }}
                  className="flex justify-between items-center p-2 rounded bg-white/5 text-xs hover:bg-cyber-yellow/5 border border-transparent hover:border-cyber-yellow/20 transition-all"
                >
                  <span className="text-slate-200">{goal.title}</span>
                  <span className="font-mono text-cyber-yellow font-semibold flex items-center gap-1">
                    🔥 {goal.streak} days
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] text-cyber-muted flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-yellow"></span>
              Unlock next level at 500 XP
            </span>
            <Sparkline data={[2, 3, 3, 4, 4, 5, 4]} color="var(--cyber-yellow)" width={80} height={20} />
          </div>
        </div>

      </div>

      {/* Footer System Diagnostics */}
      <div className="glass-panel rounded-2xl p-4 border border-cyber-border bg-black/40 flex flex-wrap justify-between items-center gap-4 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-cyber-muted flex items-center gap-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse"></span>
            Vault: AES-256 E2EE Enabled
          </span>
          <span className="text-cyber-muted flex items-center gap-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyber-blue"></span>
            Cloud: 14.2 GB / 100 GB Free
          </span>
        </div>
        <span className="text-slate-400 font-mono">
          Last Backup: <span className="text-cyber-purple">Just now</span>
        </span>
      </div>
    </div>
  );
};
