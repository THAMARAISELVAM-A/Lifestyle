/* eslint-disable react-hooks/purity */
import React, { Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HealthMonitor } from './components/HealthMonitor';
import { TaskManager } from './components/TaskManager';
import { FinanceManager } from './components/FinanceManager';
import { AICopilot } from './components/AICopilot';
import { SmartHome } from './components/SmartHome';
import { LifeAnalytics } from './components/LifeAnalytics';
import { AuthModal } from './components/AuthModal';
import { CanvasBackground } from './components/CanvasBackground';
import { NeuralTerminal } from './components/NeuralTerminal';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useToast } from './hooks/useToast';
import { Toast } from './components/Toast';
import { CommandPalette } from './components/CommandPalette';
import { NeonDB } from './services/db';
import { AutonomousEngine } from './services/maintenance';
import type { Task, PasswordEntry, HealthMetric, Expense, SmartDevice, Message, CloudFile, AutomationRule, Goal } from './types';
import { 
  Bell, Wifi, WifiOff, Search, Cpu, LogOut, 
  Menu, Palette, CheckSquare, DollarSign, ShieldCheck, Home as HomeIcon
} from 'lucide-react';

// Import seed/mock data
import {
  initialTasks,
  initialPasswords,
  initialHealthMetric,
  initialExpenses,
  initialDevices,
  initialMessages,
  initialFiles,
  initialAutomations,
  initialGoals,
  initialNotifications
} from './data/seed';

// Lazy-load heavier components
const PasswordVault = React.lazy(() => import('./components/PasswordVault').then(m => ({ default: m.PasswordVault })));
const CalendarSync = React.lazy(() => import('./components/CalendarSync').then(m => ({ default: m.CalendarSync })));
const HabitTracker = React.lazy(() => import('./components/HabitTracker').then(m => ({ default: m.HabitTracker })));
const WorldMonitor = React.lazy(() => import('./components/WorldMonitor').then(m => ({ default: m.WorldMonitor })));
const SwarmDynamics = React.lazy(() => import('./components/SwarmDynamics').then(m => ({ default: m.SwarmDynamics })));
const OtherModules = React.lazy(() => import('./components/OtherModules').then(m => ({ default: m.OtherModules })));

// Loading spinner fallback for lazy loaded components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="glass-panel border border-cyber-border/40 p-8 rounded-2xl flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md shadow-glass">
      <div className="w-10 h-10 border-4 border-cyber-purple border-t-transparent rounded-full animate-spin"></div>
      <div className="text-xs font-mono text-cyber-purple tracking-widest animate-pulse">CONNECTING NEURAL PROTOCOL...</div>
    </div>
  </div>
);

export default function App() {
  const { isAuthenticated, user, loading, signOut, refresh } = useAuth();
  const { cycleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [dbConnected, setDbConnected] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>('dashboard');
  const [isGlitching, setIsGlitching] = React.useState(false);

  React.useEffect(() => {
    setIsGlitching(true);
    const timer = setTimeout(() => setIsGlitching(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Interactive UI overlay states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = React.useState(false);

  // Dynamic real-time OS load states
  const [systemCpu, setSystemCpu] = React.useState(24);
  const [systemLatency, setSystemLatency] = React.useState(42);

  // Start Autonomous Optimization Loop
  React.useEffect(() => {
    AutonomousEngine.start();
    return () => AutonomousEngine.stop();
  }, []);

  // 1. Seed Tasks State
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);

  const addTask = (newTask: Omit<Task, 'id'>) => {
    const task = { ...newTask, id: `t_${Date.now()}` };
    setTasks(prev => [...prev, task]);
    NeonDB.insert('tasks', task);
    addNotification('Task Added', `Successfully scheduled focus task: ${task.title}`);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus: Task['status'] = t.status === 'todo' ? 'progress' : t.status === 'progress' ? 'done' : 'todo';
        NeonDB.update('tasks', id, { status: nextStatus });
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    NeonDB.update('tasks', id, { status });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    NeonDB.remove('tasks', id);
  };

  // 2. Seed Password Entries State
  const [passwords, setPasswords] = React.useState<PasswordEntry[]>(initialPasswords);

  const addPasswordEntry = (newEntry: Omit<PasswordEntry, 'id' | 'lastModified'>) => {
    const entry = { ...newEntry, id: `p_${Date.now()}`, lastModified: 'Just now' };
    setPasswords(prev => [...prev, entry]);
    NeonDB.insert('passwords', entry);
    addNotification('Vault Updated', `Encrypted credentials stored for ${entry.title}`);
  };

  const deletePasswordEntry = (id: string) => {
    setPasswords(prev => prev.filter(p => p.id !== id));
    NeonDB.remove('passwords', id);
    addNotification('Vault Updated', 'Credential entry permanently purged from secure cloud database.');
  };

  // 3. Seed Health Biometrics State
  const [healthToday, setHealthToday] = React.useState<HealthMetric>(initialHealthMetric);

  // Background real-time biometrics and OS metrics simulator
  React.useEffect(() => {
    const timer = setInterval(() => {
      setHealthToday(prev => {
        const hrvChange = Math.random() > 0.5 ? 1 : -1;
        const newHeartRate = Math.max(60, Math.min(110, prev.heartRate + hrvChange));
        const stepIncrement = Math.random() > 0.85 ? Math.floor(Math.random() * 4) + 1 : 0;
        const calorieBurn = stepIncrement * 0.08;
        return {
          ...prev,
          heartRate: newHeartRate,
          steps: prev.steps + stepIncrement,
          calories: Math.round(prev.calories + calorieBurn)
        };
      });

      // Fluctuate CPU and Network latency metrics
      setSystemCpu(prev => Math.max(8, Math.min(99, prev + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) - 2 : Math.floor(Math.random() * -5) + 2))));
      setSystemLatency(prev => Math.max(15, Math.min(120, prev + (Math.random() > 0.5 ? Math.floor(Math.random() * 8) - 3 : Math.floor(Math.random() * -8) + 3))));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const logWater = (amount: number) => {
    setHealthToday(prev => ({ ...prev, hydration: prev.hydration + amount }));
    addNotification('Hydration Logged', `Recorded +${amount}ml water intake.`);
  };

  const updateSteps = (steps: number) => {
    setHealthToday(prev => ({ ...prev, steps }));
  };

  // 4. Seed Finance Ledger State
  const [expenses, setExpenses] = React.useState<Expense[]>(initialExpenses);

  const addExpense = (newExp: Omit<Expense, 'id' | 'date'>) => {
    const expense = { ...newExp, id: `f_${Date.now()}`, date: 'Just now' };
    setExpenses(prev => [...prev, expense]);
    NeonDB.insert('expenses', expense);
    addNotification('Ledger Updated', `Recorded transaction: $${expense.amount} at ${expense.description}`);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    NeonDB.remove('expenses', id);
  };

  // 5. Seed Smart Home IoT Switches State
  const [devices, setDevices] = React.useState<SmartDevice[]>(initialDevices);

  const toggleDevice = (id: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const nextStatus = !d.status;
        NeonDB.update('devices', id, { status: nextStatus });
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  const updateDeviceValue = (id: string, value: string | number) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const nextVal = String(value);
        NeonDB.update('devices', id, { value: nextVal });
        return { ...d, value: nextVal };
      }
      return d;
    }));
  };

  // 6. Seed Social Unified Notifications State
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);

  const markMessageRead = (id: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === id) {
        NeonDB.update('messages', id, { read: true });
        return { ...m, read: true };
      }
      return m;
    }));
  };

  // 7. Seed Encrypted Files State
  const [files, setFiles] = React.useState<CloudFile[]>(initialFiles);

  const toggleFileEncryption = (id: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        const nextEncrypted = !f.encrypted;
        NeonDB.update('files', id, { encrypted: nextEncrypted });
        return { ...f, encrypted: nextEncrypted };
      }
      return f;
    }));
  };

  // 8. Seed Automations State
  const [automations, setAutomations] = React.useState<AutomationRule[]>(initialAutomations);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        const nextActive = !a.active;
        NeonDB.update('automations', id, { active: nextActive });
        return { ...a, active: nextActive };
      }
      return a;
    }));
  };

  const runAutomationRule = (id: string) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        const timeStr = 'Just now';
        NeonDB.update('automations', id, { last_triggered: timeStr });
        return { ...a, lastTriggered: timeStr };
      }
      return a;
    }));
  };

  // 9. Habits State
  const [goals, setGoals] = React.useState<Goal[]>(initialGoals);

  const toggleGoalStreak = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextStreak = g.streak + 1;
        NeonDB.update('goals', id, { streak: nextStreak });
        return { ...g, streak: nextStreak };
      }
      return g;
    }));
    addNotification('Habit Updated', 'Growth streak extended! +25 XP credited.');
  };

  // 10. System notifications list
  const [notifications, setNotifications] = React.useState(initialNotifications);

  const addNotification = (title: string, desc: string) => {
    setNotifications(prev => [
      { id: `n_${Date.now()}`, title, desc, time: 'Just now' },
      ...prev
    ]);
    addToast(title, desc, 'info');
  };

  const loadAllData = React.useCallback(async () => {
    try {
      const [dbTasks, dbPasswords, dbExpenses, dbDevices, dbMessages, dbFiles, dbAutomations, dbGoals] = await Promise.all([
        NeonDB.getAll<Task>('tasks'),
        NeonDB.getAll<PasswordEntry>('passwords'),
        NeonDB.getAll<Expense>('expenses'),
        NeonDB.getAll<SmartDevice>('devices'),
        NeonDB.getAll<Message>('messages'),
        NeonDB.getAll<CloudFile>('files'),
        NeonDB.getAll<AutomationRule>('automations'),
        NeonDB.getAll<Goal>('goals'),
      ]);
      
      if (dbTasks.length) {
        setTasks(dbTasks);
      } else {
        initialTasks.forEach(item => NeonDB.insert('tasks', item));
      }

      if (dbPasswords.length) {
        setPasswords(dbPasswords);
      } else {
        const userEmail = user?.email || 'admin@gmail.com';
        const seededPasswords = initialPasswords.map(p => 
          p.id === 'p1' ? { ...p, username: userEmail } : p
        );
        setPasswords(seededPasswords);
        seededPasswords.forEach(item => NeonDB.insert('passwords', item));
      }

      if (dbExpenses.length) {
        setExpenses(dbExpenses);
      } else {
        initialExpenses.forEach(item => NeonDB.insert('expenses', item));
      }

      if (dbDevices.length) {
        setDevices(dbDevices);
      } else {
        initialDevices.forEach(item => NeonDB.insert('devices', item));
      }

      if (dbMessages.length) {
        setMessages(dbMessages);
      } else {
        initialMessages.forEach(item => NeonDB.insert('messages', item));
      }

      if (dbFiles.length) {
        setFiles(dbFiles);
      } else {
        initialFiles.forEach(item => NeonDB.insert('files', item));
      }

      if (dbAutomations.length) {
        setAutomations(dbAutomations);
      } else {
        initialAutomations.forEach(item => NeonDB.insert('automations', item));
      }

      if (dbGoals.length) {
        setGoals(dbGoals);
      } else {
        initialGoals.forEach(item => NeonDB.insert('goals', item));
      }

      setDbConnected(true);
      addToast('Sync Complete', 'Loaded your secure cloud database profiles.', 'success');
    } catch (e) {
      console.warn('DB load failed, using seed data:', e);
      setDbConnected(false);
    }
  }, [addToast, setTasks, setPasswords, setExpenses, setDevices, setMessages, setFiles, setAutomations, setGoals, setDbConnected, user]);

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      setTimeout(() => setShowAuthModal(true), 0);
    }
  }, [loading, isAuthenticated]);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      setTimeout(() => {
        setShowAuthModal(false);
        loadAllData();
      }, 0);
    }
  }, [isAuthenticated, user, loadAllData]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    refresh();
  };

  const handleSignOut = async () => {
    await signOut();
    NeonDB.clearAllCaches();
    setShowAuthModal(true);
  };

  const [lifeScore, setLifeScore] = React.useState(82);

  // 12. AI Recommendations Banner
  const [aiRecommendations, setAiRecommendations] = React.useState<string[]>([
    "Move your cardio workout split to 6:00 PM today; local routes indicate lower congestion indexes.",
    "Electricity utility bills of $142.50 are pending settlement. Suggested payment schedule: May 22.",
    "Stress index has reached 48%. Triggering a 10-minute focus meditation will optimize current LifeScore."
  ]);

  const [isOptimizing, setIsOptimizing] = React.useState(false);

  const runOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setAiRecommendations(prev => [
        "Biometrics optimized! Cardio gym routine confirmed for 6:00 PM.",
        "Electricity bill scheduled for automatic payout. Security vault logs locked.",
        ...prev.slice(2)
      ]);
      setLifeScore(prev => Math.min(100, prev + 3));
      setIsOptimizing(false);
      addNotification('AI Reorganization Done', 'LifeOS schedules reorganized successfully.');
    }, 2000);
  };

  // 13. Copilot Interaction handler
  const handleCopilotAction = (actionType: string) => {
    if (actionType === 'schedule-gym') {
      setTasks(prev => [
        ...prev,
        { id: `t_${Date.now()}`, title: 'Gym Workout Session', description: 'Optimized cardio workout scheduled by AI Copilot.', status: 'todo', priority: 'high', dueDate: '2026-05-20', project: 'Health' }
      ]);
      setDevices(prev => prev.map(d => d.type === 'ac' ? { ...d, status: true, value: '21°C' } : d));
      setAutomations(prev => prev.map(a => a.id === 'a3' ? { ...a, active: true } : a));
      addNotification('AI Executed Actions', 'Scheduled workout, modified AC climate, and queued utilities bills.');
    } else if (actionType === 'audit-burnout') {
      setLifeScore(88);
      setHealthToday(prev => ({ ...prev, stress: 30 }));
    } else if (actionType === 'audit-passwords') {
      setPasswords(prev => [
        ...prev,
        { id: `p_${Date.now()}`, title: 'New Vault Entry', username: 'alex.mercer@cyber.io', url: 'https://cyber.io', strength: 'strong', category: 'logins', lastModified: 'Just now' }
      ]);
    } else if (actionType === 'optimize-iot') {
      setDevices(prev => prev.map(d => d.type === 'light' ? { ...d, status: false } : d));
    } else if (actionType === 'evolve-tom') {
      loadAllData();
      addNotification('Neural Calibration Sync', 'TOM autonomous weights synchronized with live cloud instance.');
    }
  };

  // Setup Keyboard Shortcuts (Ctrl+K Command Palette)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="flex min-h-screen bg-cyber-bg overflow-x-hidden text-slate-100 relative">
      {/* Animated dot grid background */}
      <div className="dot-grid" />
      
      {/* Interactive canvas background */}
      <CanvasBackground />

      <NeuralTerminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />

      {/* Screen-wide Toast notification portal */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Command Palette navigation modal */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onAction={(tabId) => {
          setActiveTab(tabId);
          addToast('Terminal Navigated', `Switched network node to ${tabId.toUpperCase()}`, 'success');
        }} 
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
          canCancel={true}
        />
      )}
      
      {/* Sidebar navigation (with mobile toggling backdrop overlay) */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onItemClick={() => setIsMobileSidebarOpen(false)} 
        />
      </div>

      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-35 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header navbar */}
        <header className="glass-panel border-b border-cyber-border sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-glass">
          <div className="flex items-center">
            {/* Hamburger Menu on Mobile */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer md:hidden mr-3 btn-press"
            >
              <Menu size={16} />
            </button>

            {/* Search container */}
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-2.5 text-cyber-muted" size={16} />
              <input
                type="text"
                placeholder="Search LifeOS indexes... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl glass-input font-mono"
              />

              {/* Live Search dropdown overlay */}
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-panel border border-cyber-border rounded-xl shadow-glass-lg p-2 z-50 max-h-60 overflow-y-auto space-y-2 bg-black/90">
                  {(() => {
                    const q = searchQuery.toLowerCase();
                    const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
                    const filteredPasswords = passwords.filter(p => p.title.toLowerCase().includes(q) || p.username.toLowerCase().includes(q));
                    const filteredDevices = devices.filter(d => d.name.toLowerCase().includes(q) || d.room.toLowerCase().includes(q));
                    const filteredExpenses = expenses.filter(e => e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));

                    const isWorldMonitorMatch = 'world monitor'.includes(q) || 'world'.includes(q) || 'monitor'.includes(q);
                    const total = filteredTasks.length + filteredPasswords.length + filteredDevices.length + filteredExpenses.length + (isWorldMonitorMatch ? 1 : 0);

                    if (total === 0) {
                      return <div className="text-[10px] text-center text-slate-500 font-mono py-2">NO NEURAL MATCHES FOUND</div>;
                    }

                    return (
                      <>
                        {filteredTasks.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[9px] font-mono text-cyber-green uppercase tracking-wider px-1">Tasks</div>
                            {filteredTasks.map(t => (
                              <div 
                                key={t.id} 
                                onClick={() => { setActiveTab('tasks'); setSearchQuery(''); }}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer text-[11px] font-mono text-slate-300 hover:text-white"
                              >
                                <CheckSquare size={12} className="text-cyber-green shrink-0" />
                                <span className="truncate">{t.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {filteredPasswords.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-white/5">
                            <div className="text-[9px] font-mono text-cyber-pink uppercase tracking-wider px-1">Vault Credentials</div>
                            {filteredPasswords.map(p => (
                              <div 
                                key={p.id} 
                                onClick={() => { setActiveTab('passwords'); setSearchQuery(''); }}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer text-[11px] font-mono text-slate-300 hover:text-white"
                              >
                                <ShieldCheck size={12} className="text-cyber-pink shrink-0" />
                                <span className="truncate">{p.title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {filteredDevices.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-white/5">
                            <div className="text-[9px] font-mono text-cyber-orange uppercase tracking-wider px-1">Smart Home IoT</div>
                            {filteredDevices.map(d => (
                              <div 
                                key={d.id} 
                                onClick={() => { setActiveTab('smarthome'); setSearchQuery(''); }}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer text-[11px] font-mono text-slate-300 hover:text-white"
                              >
                                <HomeIcon size={12} className="text-cyber-orange shrink-0" />
                                <span className="truncate">{d.name} ({d.room})</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {filteredExpenses.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-white/5">
                            <div className="text-[9px] font-mono text-cyber-green uppercase tracking-wider px-1">Finance</div>
                            {filteredExpenses.map(e => (
                              <div 
                                key={e.id} 
                                onClick={() => { setActiveTab('finance'); setSearchQuery(''); }}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer text-[11px] font-mono text-slate-300 hover:text-white"
                              >
                                <DollarSign size={12} className="text-cyber-green shrink-0" />
                                <span className="truncate">{e.description} (${e.amount})</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {isWorldMonitorMatch && (
                          <div className="space-y-1 pt-1 border-t border-white/5">
                            <div className="text-[9px] font-mono text-cyber-cyan uppercase tracking-wider px-1">Global Intelligence</div>
                            <div 
                              onClick={() => { setActiveTab('world-monitor'); setSearchQuery(''); }}
                              className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer text-[11px] font-mono text-slate-300 hover:text-white"
                            >
                              <Search size={12} className="text-cyber-cyan shrink-0" />
                              <span className="truncate">World Monitor</span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Center Info Banner */}
          <div className="flex items-center gap-2.5 text-[10px] font-mono font-bold text-cyber-purple tracking-wide">
            <Cpu size={13} className="animate-spin [animation-duration:10s]" />
            <span>SYSTEM ENGINE: ACTIVE</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">CPU: <span className="text-white">{systemCpu}%</span></span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">LATENCY: <span className="text-white">{systemLatency}ms</span></span>
          </div>

          {/* Right quick controls */}
          <div className="flex items-center gap-3">
            {/* Dynamic Theme Cycler Button */}
            <button 
              onClick={cycleTheme}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer hover:bg-white/10 transition-colors btn-press"
              title="Cycle Theme Style"
            >
              <Palette size={15} className="icon-hover" />
            </button>

            {/* Sync online badge */}
            {isAuthenticated ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-cyber-green font-bold bg-cyber-green/10 border border-cyber-green/20 px-2.5 py-1 rounded-full">
                <Wifi size={10} />
                {dbConnected ? 'NEON ACTIVE' : 'LOCAL'}
              </span>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-1 text-[10px] font-mono text-cyber-yellow font-bold bg-cyber-yellow/10 border border-cyber-yellow/20 px-2.5 py-1 rounded-full cursor-pointer hover:bg-cyber-yellow/20 transition-colors">
                <WifiOff size={10} />
                SIGN IN
              </button>
            )}

            {isAuthenticated && (
              <button onClick={handleSignOut} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-cyber-red hover:bg-cyber-red/10 cursor-pointer transition-colors" title="Sign Out">
                <LogOut size={14} />
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer hover:bg-white/10 transition-colors"
              >
                <Bell size={15} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-cyber-pink rounded-full border border-cyber-bg"></span>
                )}
              </button>

              {/* Notifications dropdown panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-cyber-border rounded-2xl shadow-glass-lg p-4 z-50 space-y-3">
                  <h4 className="font-semibold text-xs text-white border-b border-white/5 pb-2">Diagnostic Alerts</h4>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {notifications.map(notif => (
                      <div key={notif.id} className="text-xs p-2 rounded-lg bg-white/3 border border-transparent hover:border-white/5">
                        <div className="flex justify-between font-bold text-slate-200">
                          <span>{notif.title}</span>
                          <span className="font-mono text-[9px] text-cyber-muted">{notif.time}</span>
                        </div>
                        <p className="text-[10px] text-cyber-muted mt-0.5">{notif.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard LifeScore floating indicator */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyber-purple to-cyber-blue flex items-center justify-center text-xs font-bold text-white shadow-neon-blue">
                {lifeScore}
              </div>
              <span className="text-[10px] font-mono text-cyber-muted hidden md:block">LIFESCORE</span>
            </div>
          </div>
        </header>

        {/* Main Content scrollable panel (with animation keys) */}
        <main key={activeTab} className={`flex-1 overflow-y-auto p-6 page-transition ${isGlitching ? 'animate-glitch' : ''}`}>
          <Suspense fallback={<LoadingFallback />}>
            {activeTab === 'dashboard' && (
              <Dashboard 
                setActiveTab={setActiveTab}
                tasks={tasks}
                toggleTaskStatus={toggleTaskStatus}
                goals={goals}
                toggleGoalStreak={toggleGoalStreak}
                healthToday={healthToday}
                devices={devices}
                toggleDevice={toggleDevice}
                totalExpenses={totalExpenses}
                lifeScore={lifeScore}
                aiRecommendations={aiRecommendations}
                runOptimization={runOptimization}
                isOptimizing={isOptimizing}
                userName={user?.name}
              />
            )}

            {activeTab === 'passwords' && (
              <PasswordVault 
                entries={passwords}
                addEntry={addPasswordEntry}
                deleteEntry={deletePasswordEntry}
              />
            )}

            {activeTab === 'health' && (
              <HealthMonitor 
                healthToday={healthToday}
                logWater={logWater}
                updateSteps={updateSteps}
              />
            )}

            {activeTab === 'tasks' && (
              <TaskManager 
                tasks={tasks}
                addTask={addTask}
                updateTaskStatus={updateTaskStatus}
                deleteTask={deleteTask}
                reorganizeSchedule={runOptimization}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceManager 
                expenses={expenses}
                addExpense={addExpense}
                deleteExpense={deleteExpense}
              />
            )}

            {activeTab === 'ai-copilot' && (
              <AICopilot 
                onTriggerAction={handleCopilotAction}
                tasks={tasks}
                expenses={expenses}
                healthToday={healthToday}
                devices={devices}
                goals={goals}
                onRuleAdded={loadAllData}
              />
            )}

            {activeTab === 'smarthome' && (
              <SmartHome 
                devices={devices}
                toggleDevice={toggleDevice}
                updateDeviceValue={updateDeviceValue}
              />
            )}

            {activeTab === 'analytics' && (
              <LifeAnalytics 
                onScoreUpdate={setLifeScore}
                tasks={tasks}
                expenses={expenses}
                healthToday={healthToday}
                goals={goals}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarSync />
            )}

            {activeTab === 'habits' && (
              <HabitTracker />
            )}

            {activeTab === 'swarm-dynamics' && (
              <SwarmDynamics />
            )}

            {activeTab === 'world-monitor' && (
              <WorldMonitor />
            )}

            {/* Render remaining modular tabs using OtherModules */}
            {['knowledge', 'docs', 'social', 'automation', 'emergency', 'fitness', 'identity', 'cloud'].includes(activeTab) && (
              <OtherModules 
                activeTab={activeTab}
                messages={messages}
                markMessageRead={markMessageRead}
                files={files}
                toggleFileEncryption={toggleFileEncryption}
                automations={automations}
                toggleAutomation={toggleAutomation}
                runAutomation={runAutomationRule}
              />
            )}
          </Suspense>
        </main>
      </div>

    </div>
  );
}
