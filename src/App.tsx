import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PasswordVault } from './components/PasswordVault';
import { HealthMonitor } from './components/HealthMonitor';
import { TaskManager } from './components/TaskManager';
import { FinanceManager } from './components/FinanceManager';
import { AICopilot } from './components/AICopilot';
import { SmartHome } from './components/SmartHome';
import { LifeAnalytics } from './components/LifeAnalytics';
import { OtherModules } from './components/OtherModules';
import { CalendarSync } from './components/CalendarSync';
import { HabitTracker } from './components/HabitTracker';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { NeonDB } from './services/db';
import type { Task, PasswordEntry, HealthMetric, Expense, SmartDevice, Message, CloudFile, AutomationRule, Goal } from './types';
import { Bell, Wifi, WifiOff, Search, Cpu, LogOut } from 'lucide-react';


export default function App() {
  const { isAuthenticated, user, loading, signOut, refresh } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [dbConnected, setDbConnected] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>('dashboard');
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // 1. Seed Tasks State
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: 't1', title: 'Review Smart Home peripheral security', description: 'Audit local API endpoints and update the zero-knowledge firewall configurations.', status: 'todo', priority: 'high', dueDate: '2026-05-21', project: 'Security' },
    { id: 't2', title: 'Complete monthly finance report', description: 'Compare ledger expenses against the $2,500 target budget limits.', status: 'progress', priority: 'medium', dueDate: '2026-05-22', project: 'Finance' },
    { id: 't3', title: 'Log 45 min cardio run workout', description: 'Integrate active heart rate metrics and calorie burnout counts.', status: 'done', priority: 'low', dueDate: '2026-05-19', project: 'Health' }
  ]);

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
  const [passwords, setPasswords] = React.useState<PasswordEntry[]>([
    { id: 'p1', title: 'Main Google Account', username: 'alex.mercer@gmail.com', url: 'https://accounts.google.com', strength: 'strong', otpSecret: 'JBSWY3DPEHPK3PXP', category: 'logins', lastModified: 'May 18' },
    { id: 'p2', title: 'Visa Platinum Credit Card', username: '•••• •••• •••• 4821', url: 'N/A', strength: 'strong', category: 'cards', lastModified: 'May 10' },
    { id: 'p3', title: 'Personal Vault Backup Key', username: 'alex_mercer_key', url: 'N/A', strength: 'strong', category: 'notes', lastModified: 'May 02' }
  ]);

  const addPasswordEntry = (newEntry: Omit<PasswordEntry, 'id' | 'lastModified'>) => {
    const entry = { ...newEntry, id: `p_${Date.now()}`, lastModified: 'Just now' };
    setPasswords(prev => [...prev, entry]);
    NeonDB.insert('passwords', entry);
    addNotification('Vault Updated', `Encrypted credentials stored for ${entry.title}`);
  };

  // 3. Seed Health Biometrics State
  const [healthToday, setHealthToday] = React.useState<HealthMetric>({
    date: '2026-05-20',
    heartRate: 72,
    sleep: 7.2,
    calories: 1840,
    steps: 6420,
    hydration: 1250,
    stress: 48,
    weight: 78
  });

  const logWater = (amount: number) => {
    setHealthToday(prev => ({ ...prev, hydration: prev.hydration + amount }));
    addNotification('Hydration Logged', `Recorded +${amount}ml water intake.`);
  };

  const updateSteps = (steps: number) => {
    setHealthToday(prev => ({ ...prev, steps }));
  };

  // 4. Seed Finance Ledger State
  const [expenses, setExpenses] = React.useState<Expense[]>([
    { id: 'f1', category: 'Food', amount: 142.50, date: 'May 19', description: 'Whole Foods Market Inc', recurring: false },
    { id: 'f2', category: 'Rent', amount: 1800.00, date: 'May 01', description: 'Apartment Residential Lease', recurring: true },
    { id: 'f3', category: 'Servers', amount: 42.50, date: 'May 15', description: 'AWS Hosting Cloud Services', recurring: true }
  ]);

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
  const [devices, setDevices] = React.useState<SmartDevice[]>([
    { id: 's1', name: 'Living Room Lights', type: 'light', status: true, value: '80%', room: 'Living Room' },
    { id: 's2', name: 'Smart Thermostat AC', type: 'ac', status: true, value: '23°C', room: 'Hallway' },
    { id: 's3', name: 'Main Entry Deadbolt', type: 'lock', status: true, room: 'Front Door' },
    { id: 's4', name: 'Driveway Camera Feed', type: 'camera', status: false, room: 'Exterior' }
  ]);

  const toggleDevice = (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, status: !d.status } : d));
  };

  const updateDeviceValue = (id: string, value: string | number) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, value } : d));
  };

  // 6. Seed Social Unified Notifications State
  const [messages, setMessages] = React.useState<Message[]>([
    { id: 'm1', sender: 'Sarah Mercer', avatar: '', platform: 'whatsapp', content: 'Hey, did you remember to schedule gym time and check the electric bill?', timestamp: '09:15 AM', priority: 'high', summary: 'Sarah is asking about calendar gym scheduling and monthly utilities payment status.', suggestedReplies: ['Yes, gym is scheduled at 6 PM.', 'Working on paying the bills now.'], read: false },
    { id: 'm2', sender: 'Devin Vance (Supervisor)', avatar: '', platform: 'email', content: 'Let\'s finalize the LifeOS neural code architecture sync today at 2 PM.', timestamp: '08:45 AM', priority: 'high', summary: 'Devin requests project sync meeting at 2:00 PM today.', suggestedReplies: ['Confirmed. See you at 2 PM.', 'Can we reschedule to 3 PM?'], read: false },
    { id: 'm3', sender: 'Home Automation Bot', avatar: '', platform: 'discord', content: 'Driveway sensor triggered. Security cameras are active.', timestamp: 'Yesterday', priority: 'normal', read: true }
  ]);

  const markMessageRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  // 7. Seed Encrypted Files State
  const [files, setFiles] = React.useState<CloudFile[]>([
    { id: 'fi1', name: 'Federal_Tax_Return_2025.pdf', size: '2.4 MB', type: 'pdf', lastModified: 'May 12', encrypted: true },
    { id: 'fi2', name: 'Workspace_Project_Brief.md', size: '12 KB', type: 'doc', lastModified: 'May 18', encrypted: false },
    { id: 'fi3', name: 'Vacation_Photo_Driveway.png', size: '4.8 MB', type: 'image', lastModified: 'May 14', encrypted: false }
  ]);

  const toggleFileEncryption = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, encrypted: !f.encrypted } : f));
  };

  // 8. Seed Automations State
  const [automations, setAutomations] = React.useState<AutomationRule[]>([
    { id: 'a1', name: 'Auto Backup Vault Documents', trigger: 'Every 12 Hours', action: 'Sync E2EE keys to Encrypted Cloud path', active: true, lastTriggered: '3 hours ago' },
    { id: 'a2', name: 'Eco Climate Sleep Optimizer', trigger: 'Sleep Mode Enabled', action: 'Set Thermostat to 22°C & shut lights', active: true, lastTriggered: 'Yesterday' },
    { id: 'a3', name: 'Bill Auto Payment Scheduler', trigger: 'Recurrent bill alert', action: 'Queue Visa card settlement logs', active: false }
  ]);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const runAutomationRule = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, lastTriggered: 'Just now' } : a));
  };

  // 9. Habits State
  const [goals, setGoals] = React.useState<Goal[]>([
    { id: 'g1', title: 'Daily Deep Meditation (15m)', category: 'Mindfulness', target: 15, current: 0, unit: 'm', streak: 4, xpValue: 20 },
    { id: 'g2', title: 'Calorie Control & Diet Logs', category: 'Diet', target: 2400, current: 1840, unit: 'kcal', streak: 12, xpValue: 30 },
    { id: 'g3', title: 'Circadian Bedtime (11 PM)', category: 'Sleep', target: 1, current: 0, unit: 'cycles', streak: 3, xpValue: 25 }
  ]);

  const toggleGoalStreak = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, streak: g.streak + 1 } : g));
    addNotification('Habit Updated', 'Growth streak extended! +25 XP credited.');
  };

  // 10. System notifications list
  const [notifications, setNotifications] = React.useState([
    { id: 'n1', title: 'OS Synced', desc: 'Secure cloud backups finalized with zero failures.', time: 'Just now' },
    { id: 'n2', title: 'Biometrics Sync', desc: 'Step tracker count updated via Fitbit integration.', time: '1 hour ago' }
  ]);

  const addNotification = (title: string, desc: string) => {
    setNotifications(prev => [
      { id: `n_${Date.now()}`, title, desc, time: 'Just now' },
      ...prev
    ]);
  };

  // === NEON DB: Load data on auth ===
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [loading, isAuthenticated]);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      setShowAuthModal(false);
      loadAllData();
    }
  }, [isAuthenticated, user]);

  const loadAllData = async () => {
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
      if (dbTasks.length) setTasks(dbTasks);
      if (dbPasswords.length) setPasswords(dbPasswords);
      if (dbExpenses.length) setExpenses(dbExpenses);
      if (dbDevices.length) setDevices(dbDevices);
      if (dbMessages.length) setMessages(dbMessages);
      if (dbFiles.length) setFiles(dbFiles);
      if (dbAutomations.length) setAutomations(dbAutomations);
      if (dbGoals.length) setGoals(dbGoals);
      setDbConnected(true);
      addNotification('Neon DB Synced', 'All data loaded from cloud database.');
    } catch (e) {
      console.warn('DB load failed, using seed data:', e);
      setDbConnected(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    refresh();
  };

  const handleSignOut = async () => {
    await signOut();
    NeonDB.clearAllCaches();
    setShowAuthModal(true);
  };

  const userName = user?.name ?? 'Alex';
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
      // Simulate calendar reorganization
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
      // Add Gym session task
      setTasks(prev => [
        ...prev,
        { id: `t_${Date.now()}`, title: 'Gym Workout Session', description: 'Optimized cardio workout scheduled by AI Copilot.', status: 'todo', priority: 'high', dueDate: '2026-05-20', project: 'Health' }
      ]);
      // Activate AC
      setDevices(prev => prev.map(d => d.type === 'ac' ? { ...d, status: true, value: '21°C' } : d));
      // Queue billing automation
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
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="flex min-h-screen bg-cyber-bg overflow-x-hidden text-slate-100">

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
          canCancel={true}
        />
      )}
      
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header navbar */}
        <header className="glass-panel border-b border-cyber-border sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-glass">
          {/* Search container */}
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-2.5 text-cyber-muted" size={16} />
            <input
              type="text"
              placeholder="Search LifeOS indexes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl glass-input"
            />
          </div>

          {/* Center Info Banner */}
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyber-purple tracking-wide">
            <Cpu size={14} className="animate-spin [animation-duration:10s]" />
            SYSTEM ENGINE: ACTIVE
          </div>

          {/* Right quick controls */}
          <div className="flex items-center gap-4">
            
            {/* Sync online badge */}
            {isAuthenticated ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-cyber-green font-bold bg-cyber-green/10 border border-cyber-green/20 px-2 py-0.5 rounded-full">
                <Wifi size={10} />
                {dbConnected ? 'NEON SYNCED' : 'LOCAL'}
              </span>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-1 text-[10px] font-mono text-cyber-yellow font-bold bg-cyber-yellow/10 border border-cyber-yellow/20 px-2 py-0.5 rounded-full cursor-pointer hover:bg-cyber-yellow/20 transition-colors">
                <WifiOff size={10} />
                SIGN IN
              </button>
            )}

            {isAuthenticated && (
              <button onClick={handleSignOut} className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-cyber-red hover:bg-cyber-red/10 cursor-pointer transition-colors" title="Sign Out">
                <LogOut size={14} />
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer hover:bg-white/10 transition-colors"
              >
                <Bell size={16} />
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
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyber-purple to-cyber-blue flex items-center justify-center text-xs font-bold text-white shadow-neon-blue">
                {lifeScore}
              </div>
              <span className="text-[10px] font-mono text-cyber-muted hidden md:block">LIFESCORE</span>
            </div>
          </div>
        </header>

        {/* Main Content scrollable panel */}
        <main className="flex-1 overflow-y-auto p-6">
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
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarSync />
          )}

          {activeTab === 'habits' && (
            <HabitTracker />
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
        </main>
      </div>

    </div>
  );
}
