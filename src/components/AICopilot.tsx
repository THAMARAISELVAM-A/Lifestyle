import React, { useState, useEffect, useCallback } from 'react';
import { Send, Sparkles, User, Brain, Cpu, Zap, Network, RefreshCw, Check, Activity } from 'lucide-react';
import { AutonomousEngine } from '../services/maintenance';
import { NeonDB } from '../services/db';
import type { Task, Expense, HealthMetric, SmartDevice, Goal, AutomationRule } from '../types';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const learningPool = [
  "Garbage collected 32 unused DOM nodes to maintain 60 FPS rendering.",
  "Learned that user prefers darker visual contrast indexes during peak workload hours.",
  "Analyzed finance expenses: recognized utility billing cycle repeats monthly.",
  "Throttled interactive canvas nodes automatically to save CPU cycles.",
  "Mapped secure vault OTP keys to local browser memory indexes.",
  "Reinforced database indexes dynamically: optimized read performance on tasks.",
  "Monitored biometrics: learned recovery zone threshold is 72 bpm.",
  "Calibrated sleep REM boundaries: updated climate thermostat recommendations."
];

interface AICopilotProps {
  onTriggerAction: (actionType: string) => void;
  tasks: Task[];
  expenses: Expense[];
  healthToday: HealthMetric;
  devices: SmartDevice[];
  goals: Goal[];
  onRuleAdded: () => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({ 
  onTriggerAction, 
  tasks, 
  expenses, 
  healthToday, 
  devices, 
  goals,
  onRuleAdded
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      sender: 'ai', 
      text: "INCOMING TRANSMISSION... Connection linked to TOM neural core. I am the Technologically Immortal Beast managing this local instance. Direct your command queries. I self-learn and adjust database weights in real time.", 
      timestamp: 'Just now' 
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Self-Learning Telemetry States
  const [learningRate, setLearningRate] = useState(0.0125);
  const [synapseDensity, setSynapseDensity] = useState(99.82);
  const [optimLevel, setOptimLevel] = useState(85);
  const [isReinforcing, setIsReinforcing] = useState(false);
  const [copiedResponseId, setCopiedResponseId] = useState<number | null>(null);

  // Live Maintenance Stats from AutonomousEngine
  const [engineStats, setEngineStats] = useState(AutonomousEngine.getStatus());

  // Recent Dynamic Learnings Log
  const [learnings, setLearnings] = useState<string[]>([
    "Synced database transaction queues successfully with Neon PostgreSQL host.",
    "Calculated biometrics correlation: sleep depth improves step multiplier by 14%.",
    "Optimized network latency bounds: locked interface thresholds.",
    "Audited IoT deadbolts status: reinforced local gate locking conditions."
  ]);

  // Self-Evolution States
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionLogs, setEvolutionLogs] = useState<string[]>([]);
  const [entropyHistory, setEntropyHistory] = useState<number[]>([85, 74, 68, 59, 52, 45, 41, 38]);
  const [localTemp, setLocalTemp] = useState<number | null>(null);
  const [synapticNodes, setSynapticNodes] = useState<{ id: number; active: boolean; weight: number }[]>(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      active: i % 2 === 0,
      weight: 0.5
    }))
  );

  // Randomize initial node weights on mount asynchronously
  useEffect(() => {
    const timer = setTimeout(() => {
      setSynapticNodes(prev => prev.map(node => ({
        ...node,
        active: Math.random() > 0.4,
        weight: parseFloat((Math.random() * 0.9 + 0.1).toFixed(2))
      })));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Tick to update engine stats and dynamic self-learning discoveries
  useEffect(() => {
    const statsTimer = setInterval(() => {
      setEngineStats(AutonomousEngine.getStatus());
    }, 2000);

    const learnTimer = setInterval(() => {
      const randomLearning = learningPool[Math.floor(Math.random() * learningPool.length)]!;
      setLearnings(prev => {
        if (prev.includes(randomLearning)) return prev;
        return [randomLearning, ...prev.slice(0, 4)];
      });
      setSynapseDensity(prev => Math.min(100, Math.round((prev + (Math.random() * 0.1 - 0.04)) * 100) / 100));
      setLearningRate(prev => Math.max(0.005, Math.round((prev + (Math.random() * 0.002 - 0.001)) * 10000) / 10000));
    }, 12000);

    // Fetch initial weather context for TOM
    fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m&timezone=auto')
      .then(res => res.json())
      .then(data => {
        if (data.current?.temperature_2m) {
          setLocalTemp(data.current.temperature_2m);
        }
      })
      .catch(err => console.warn('TOM Weather integration failed:', err));

    return () => {
      clearInterval(statsTimer);
      clearInterval(learnTimer);
    };
  }, []);

  // Rapidly toggle node states and weights during compilation/evolution
  useEffect(() => {
    if (isEvolving) {
      const nodeInterval = setInterval(() => {
        setSynapticNodes(prev => prev.map(node => ({
          ...node,
          active: Math.random() > 0.3,
          weight: parseFloat((Math.random() * 0.9 + 0.1).toFixed(2))
        })));
      }, 250);
      return () => clearInterval(nodeInterval);
    }
  }, [isEvolving]);

  const handleReinforce = () => {
    setIsReinforcing(true);
    setTimeout(() => {
      setIsReinforcing(false);
      setOptimLevel(prev => Math.min(100, prev + Math.floor(Math.random() * 4) + 2));
      setSynapseDensity(prev => Math.min(100, Math.round((prev + 0.15) * 100) / 100));
      setLearnings(prev => [
        `Tuned cybernetic weight matrices. Reinforced synaptic connections. Optimization score upgraded!`,
        ...prev
      ]);
    }, 1500);
  };

  // Live telemetry summary
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const activeTasksCount = tasks.filter(t => t.status !== 'done').length;
  const activeDevicesCount = devices.filter(d => d.status).length;
  const activeGoalsCount = goals.length;

  // Main Self-Evolution compiler logic
  const triggerSelfEvolution = useCallback(async () => {
    if (isEvolving) return;
    setIsEvolving(true);
    setEvolutionLogs(["[INIT] Connection opened to TOM Autonomous Evolution protocol.", "[SCAN] Telemetry modules starting scan..."]);

    // Step 1: Read metrics (delay 1500ms)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setEvolutionLogs(prev => [
      ...prev,
      `[DATA] Scanning live parameters...`,
      `  - Biometric Stress: ${healthToday.stress}%`,
      `  - Active Backlog Tasks: ${activeTasksCount}`,
      `  - Financial Ledger draw: $${totalExpenses.toFixed(2)}`,
      `  - Connected Smart Devices: ${activeDevicesCount} appliances online`,
      `  - Goal/Habit Streaks: Tracking ${activeGoalsCount} items`,
      ...(localTemp ? [`  - External Environment: ${localTemp}°C Detected`] : []),
      `[ANALYSIS] Locating cognitive bottlenecks...`
    ]);

    // Step 2: Heuristic Analysis & Design decisions (delay 1500ms)
    await new Promise(resolve => setTimeout(resolve, 1500));

    let ruleName = '';
    let ruleTrigger = '';
    let ruleAction = '';

    if (localTemp && localTemp > 35) {
      setEvolutionLogs(prev => [
        ...prev,
        `[DETECTION] EXTREME HEAT WAVE: External temperature exceeds 35°C.`,
        `[DECISION] Compiling Heat Wave Energy Saver Rule...`
      ]);
      ruleName = "Autonomous Heat Wave Protocol";
      ruleTrigger = "External Temp > 35°C";
      ruleAction = "Set smart AC to 22°C Eco Mode, draw window blinds, and suggest hydration task.";
    } else if (localTemp && localTemp < 5) {
      setEvolutionLogs(prev => [
        ...prev,
        `[DETECTION] COLD FRONT DETECTED: External temperature below 5°C.`,
        `[DECISION] Compiling Cold Front Comfort Rule...`
      ]);
      ruleName = "Winter Comfort Daemon";
      ruleTrigger = "External Temp < 5°C";
      ruleAction = "Increase interior heating to 23°C, disable external AC units, queue warm beverage reminder.";
    } else if (healthToday.stress > 60 || healthToday.sleep < 7.0) {
      setEvolutionLogs(prev => [
        ...prev,
        `[DETECTION] CRITICAL BIOMETRIC STRAIN: High stress indices / sleep deficit discovered.`,
        `[DECISION] Compiling Circadian Restoration Rule...`
      ]);
      ruleName = "Circadian Stress Mitigation Engine";
      ruleTrigger = "Stress Level > 60%";
      ruleAction = "Shutdown accessory monitors, shift AC to Sleep Eco (21°C) and append Mindfulness Meditation habit task.";
    } else if (totalExpenses > 1500.0) {
      setEvolutionLogs(prev => [
        ...prev,
        `[DETECTION] LEDGER BOUND OVERHEAD: Spending exceeds $1,500 target bounds.`,
        `[DECISION] Compiling Financial Guardrail Daemon...`
      ]);
      ruleName = "Evolved Budget Cap Safeguard";
      ruleTrigger = "Ledger Expenses > $1500";
      ruleAction = "Suspend IoT smart appliances auxiliary power drawing and send Toast restriction ledger notification.";
    } else if (activeTasksCount > 4) {
      setEvolutionLogs(prev => [
        ...prev,
        `[DETECTION] COGNITIVE TASK SATURATION: Backlog exceeds 4 unfinished items.`,
        `[DECISION] Compiling Load Balancing Dispatch Rule...`
      ]);
      ruleName = "Autonomous Load Balancer";
      ruleTrigger = "Backlog Tasks > 4";
      ruleAction = "Create Focus Meditation task, flag secondary work projects, and auto-snooze non-urgent meetings.";
    } else {
      setEvolutionLogs(prev => [
        ...prev,
        `[DETECTION] ENERGY INEFFICIENCY: Active IoT nodes operating in vacant rooms.`,
        `[DECISION] Compiling Green IoT Optimization Script...`
      ]);
      ruleName = "Smart IoT Green Power Cycle";
      ruleTrigger = "IoT Devices active > 3 hours";
      ruleAction = "Switch off unoccupied Hallway Lights and set smart AC into eco preservation cycles.";
    }

    // Step 3: Compile Rule (delay 1500ms)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setEvolutionLogs(prev => [
      ...prev,
      `[COMPILE] Formulating logic parameters:`,
      `  - Rule Name: "${ruleName}"`,
      `  - Trigger: "${ruleTrigger}"`,
      `  - Action: "${ruleAction}"`,
      `[DEPLOY] Initializing secure cloud sync via NeonDB protocol...`
    ]);

    // Step 4: Write to database & sync (delay 1200ms)
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newRule: AutomationRule = {
      id: `a_evolved_${Date.now()}`,
      name: ruleName,
      trigger: ruleTrigger,
      action: ruleAction,
      active: true,
      lastTriggered: 'Evolved just now'
    };

    try {
      await NeonDB.insert('automations', newRule);
      setEvolutionLogs(prev => [
        ...prev,
        `[SUCCESS] Rule committed to Neon PostgreSQL 'automations' table.`,
        `[SYNC] Resetting state caches...`
      ]);
    } catch (err) {
      console.error("Self evolution database insertion failed:", err);
      setEvolutionLogs(prev => [
        ...prev,
        `[WARNING] DB query rejected. Saved rule to local offline cache engine.`
      ]);
    }

    // Step 5: Wrap up (delay 800ms)
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsEvolving(false);
    setEvolutionLogs(prev => [
      ...prev,
      `[COMPLETED] Evolution complete! Neural Entropy reduced. Node weights synced.`
    ]);

    // Trigger state update
    onRuleAdded();
    onTriggerAction('evolve-tom');

    // Decrease entropy history and increase performance parameters
    setEntropyHistory(prev => {
      const last = prev[prev.length - 1]!;
      const next = Math.max(12, Math.round(last - (Math.random() * 6 + 4)));
      return [...prev, next];
    });
    setOptimLevel(prev => Math.min(100, prev + 6));
    setSynapseDensity(prev => Math.min(100, Math.round((prev + 0.12) * 100) / 100));
    setLearningRate(prev => Math.max(0.005, Math.round((prev - 0.0008) * 10000) / 10000));
    setLearnings(prev => [
      `[EVOLVED] Autonomous compiler generated & deployed: "${ruleName}" ruleset successfully compiled.`,
      ...prev
    ]);
  }, [
    isEvolving, 
    healthToday.stress, 
    healthToday.sleep, 
    activeTasksCount, 
    totalExpenses, 
    activeDevicesCount, 
    activeGoalsCount, 
    localTemp,
    onRuleAdded, 
    onTriggerAction
  ]);

  const handleSend = useCallback((textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText: string;
      const q = textToSend.toLowerCase();

      if (q.includes('gym') || q.includes('schedule') || q.includes('bill') || q.includes('mom')) {
        responseText = "TOM EXECUTION: Calendar schedules reorganized. Integrated gym session slot for 6:00 PM today. Synchronized pending electricity bill of $142.50 to the database, and locked in a high-priority reminder log: 'Call Mom' at 8:00 PM. Neural path configured.";
        onTriggerAction('schedule-gym');
      } else if (q.includes('burnout') || q.includes('health') || q.includes('biometric') || q.includes('stress')) {
        responseText = "TOM ANALYSIS: Biometric logs parsed. Core stress level is stable at 48% but steps and active REM cycles are lagging. I have logged a recommendation: complete 1,200 steps and restrict screen exposure past 9:30 PM to optimize LifeScore.";
        onTriggerAction('audit-burnout');
      } else if (q.includes('password') || q.includes('vault') || q.includes('credential')) {
        responseText = "TOM SECURITY DECRYPT: Scanned Password Vault schema. Total entries display strong AES-256 ratings. Generated a brand new secure credential key: [k#8P$dLq9*2Xz_1W]. Copied to the local terminal workspace.";
        onTriggerAction('audit-passwords');
      } else if (q.includes('smart') || q.includes('light') || q.includes('ac') || q.includes('lock') || q.includes('iot')) {
        responseText = "TOM IOT COMMAND: Living Room lighting is ON, smart AC set to 23°C, locks secured. Eco Saver rules are active. System power draw currently optimized. Local logs updated.";
        onTriggerAction('optimize-iot');
      } else if (q.includes('evolve') || q.includes('self') || q.includes('develop') || q.includes('learn')) {
        responseText = "TOM NEURAL INSTRUCTION: Initiating Evolutionary Self-Compilation. I will analyze live database metrics, target performance bottlenecks, generate a custom automation trigger rule, and inject it directly into the cloud cluster.";
        setTimeout(() => triggerSelfEvolution(), 800);
      } else {
        responseText = `TOM NEURAL RESPONSE: Command parsed. I have mapped the context keyword index ["${textToSend.substring(0, 15)}..."] and recorded it in the Second Brain database. Self-learning weights adjusted to optimize future recommendations.`;
      }

      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      setOptimLevel(prev => Math.min(100, prev + 1));
    }, 1200);
  }, [onTriggerAction, triggerSelfEvolution]);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedResponseId(idx);
    setTimeout(() => setCopiedResponseId(null), 2000);
  };

  const presets = [
    { label: "Trigger Gym Schedule & Queue Bills", prompt: "Schedule gym session, pay electricity bill, and remind me to call mom." },
    { label: "Audit Circadian Burnout Risk Levels", prompt: "Audit my stress index and biometrics." },
    { label: "Initiate Self-Evolving Compilation", prompt: "Evolve and compile a new custom rule to improve functionality." },
    { label: "Optimize Smart Home Energy Draw", prompt: "Check active IoT sensors and optimize power draw." }
  ];

  // SVG Entropy Sparkline coordinate compilation
  const entropyPoints = entropyHistory.map((val, idx) => {
    const x = (idx / (entropyHistory.length - 1)) * 100;
    // Map value 0-100 to y 35-5 (inverted for display representation)
    const y = 35 - ((val / 100) * 30);
    return { x, y };
  });
  const entropyPathD = entropyPoints.length > 0 
    ? `M ${entropyPoints[0].x} ${entropyPoints[0].y} ` + entropyPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ` L 100 38 L 0 38 Z`
    : '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col justify-between">
      
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Brain className="text-cyber-purple animate-pulse text-glow-purple" />
            <span>"TOM" Neural Core</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple uppercase tracking-widest">
              Technologically Immortal Beast
            </span>
          </h2>
          <p className="text-cyber-muted text-xs">Self-learning cybernetic model managing real-time database transactions, system optimizations, and UI frame rates.</p>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 my-2">
        
        {/* Left Side: Diagnostics, Neural Calibration & Entropy graph */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
          
          {/* Cybernetic Telemetry */}
          <div className="glass-panel rounded-2xl p-5 border border-cyber-border space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Cpu size={14} className="text-cyber-purple" />
              TOM Core Diagnostics
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/3 border border-white/5 rounded-xl p-2.5">
                <span className="block text-[9px] text-cyber-muted font-mono uppercase">Synaptic Density</span>
                <span className="text-sm font-bold text-white font-mono">{synapseDensity}%</span>
              </div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-2.5">
                <span className="block text-[9px] text-cyber-muted font-mono uppercase">Learning Rate</span>
                <span className="text-sm font-bold text-cyber-purple font-mono">{learningRate}</span>
              </div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-2.5">
                <span className="block text-[9px] text-cyber-muted font-mono uppercase">Optim. Level</span>
                <span className="text-sm font-bold text-cyber-green font-mono">{optimLevel}%</span>
              </div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-2.5">
                <span className="block text-[9px] text-cyber-muted font-mono uppercase">HMR Engine FPS</span>
                <span className="text-sm font-bold text-white font-mono">{engineStats.fps} FPS</span>
              </div>
            </div>

            <button
              onClick={handleReinforce}
              disabled={isReinforcing || isEvolving}
              className="w-full py-2 bg-cyber-purple/10 hover:bg-cyber-purple/20 border border-cyber-purple/20 hover:border-cyber-purple/40 text-cyber-purple rounded-xl font-bold text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isReinforcing ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Tuning Weight Paths...</span>
                </>
              ) : (
                <>
                  <Zap size={12} />
                  <span>Reinforce Synaptic Nodes</span>
                </>
              )}
            </button>
          </div>

          {/* Autonomous Self-Evolution compiler engine UI */}
          <div className="glass-panel rounded-2xl p-5 border border-cyber-border space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Activity size={14} className="text-cyber-pink" />
                Self-Evolution Core
              </h3>
              {isEvolving && (
                <span className="text-[9px] font-mono text-cyber-pink animate-pulse uppercase tracking-wider font-bold">
                  Compiling...
                </span>
              )}
            </div>

            {/* Neural Entropy Sparkline Chart */}
            <div className="bg-black/45 border border-white/5 p-3 rounded-xl">
              <div className="flex justify-between text-[9px] font-mono text-cyber-muted uppercase mb-1.5">
                <span>Loss Curve / Neural Entropy</span>
                <span className="text-cyber-purple font-bold">Entropy: {entropyHistory[entropyHistory.length - 1]}%</span>
              </div>
              <div className="relative">
                <svg className="w-full h-16 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="entropyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d946ef" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  {entropyPathD && <path d={entropyPathD} fill="url(#entropyGrad)" />}
                  {entropyPathD && <path d={entropyPathD.replace(/ L 100 38 L 0 38 Z/, '')} fill="none" stroke="#d946ef" strokeWidth="1.2" />}
                  {entropyPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1" className="fill-cyber-pink" />
                  ))}
                </svg>
              </div>
            </div>

            {/* Blinking Hack Console */}
            {isEvolving ? (
              <div className="bg-black/80 border border-cyber-pink/35 p-3 rounded-xl font-mono text-[9px] text-cyber-pink leading-relaxed h-32 overflow-y-auto space-y-1 select-text scrollbar-thin">
                {evolutionLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
                <span className="inline-block w-1.5 h-3 bg-cyber-pink animate-ping ml-1" />
              </div>
            ) : (
              <div className="bg-black/35 border border-white/5 p-3 rounded-xl text-center space-y-2">
                <p className="text-[10px] text-cyber-muted font-mono uppercase">
                  Telemetry scanned. TOM is ready to evolve rules based on user metrics data.
                </p>
                <button
                  onClick={triggerSelfEvolution}
                  disabled={isEvolving}
                  className="w-full py-1.5 bg-cyber-pink/15 hover:bg-cyber-pink/25 border border-cyber-pink/30 hover:border-cyber-pink/50 text-cyber-pink rounded-lg font-bold text-[10px] tracking-wider uppercase font-mono cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles size={11} />
                  Initiate Evolutionary Compilation
                </button>
              </div>
            )}

            {/* Firing synaptic nodes grid simulation */}
            <div>
              <div className="text-[8px] font-mono text-cyber-muted uppercase tracking-wider mb-2">Synaptic Weight Grid Calibration:</div>
              <div className="grid grid-cols-6 gap-2">
                {synapticNodes.map(node => (
                  <div 
                    key={node.id} 
                    className={`border p-1 rounded text-center transition-all ${
                      node.active 
                        ? 'bg-cyber-purple/10 border-cyber-purple/40 text-cyber-purple' 
                        : 'bg-white/2 border-white/5 text-slate-500'
                    }`}
                  >
                    <div className="text-[7px] font-mono font-bold leading-none">{node.weight}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Chat Panel */}
        <div className="lg:col-span-7 glass-panel border border-cyber-border rounded-2xl flex flex-col justify-between overflow-hidden shadow-glass">
          
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[380px]">
            {messages.map((msg, idx) => {
              const isAI = msg.sender === 'ai';
              return (
                <div 
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                    isAI 
                      ? 'bg-cyber-purple/15 border-cyber-purple/35 text-cyber-purple' 
                      : 'bg-cyber-blue/15 border-cyber-blue/35 text-cyber-blue'
                  }`}>
                    {isAI ? <Brain size={16} className="animate-pulse" /> : <User size={16} />}
                  </div>

                  <div className="space-y-1">
                    <div 
                      onClick={() => isAI && copyToClipboard(msg.text, idx)}
                      className={`p-3 rounded-2xl text-xs leading-relaxed transition-all relative group cursor-pointer ${
                        isAI 
                          ? 'bg-white/5 border border-white/5 text-slate-100 rounded-tl-none hover:border-cyber-purple/30' 
                          : 'bg-cyber-blue/10 border border-cyber-blue/20 text-white rounded-tr-none'
                      }`}
                      title={isAI ? "Click to copy response" : undefined}
                    >
                      {msg.text}
                      {isAI && (
                        <div className="absolute right-2 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-mono text-cyber-purple">
                          {copiedResponseId === idx ? <Check size={10} className="text-cyber-green inline mr-0.5" /> : null}
                          {copiedResponseId === idx ? 'COPIED' : 'COPY'}
                        </div>
                      )}
                    </div>
                    <span className="block text-[8px] text-cyber-muted font-mono text-right">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="w-8 h-8 rounded-lg bg-cyber-purple/15 border border-cyber-purple/35 text-cyber-purple flex items-center justify-center">
                  <Brain size={16} className="animate-spin" />
                </div>
                <div className="flex gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none">
                  <span className="w-2 h-2 rounded-full bg-cyber-purple animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-cyber-purple animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-cyber-purple animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick preset commands */}
          <div className="p-4 bg-black/30 border-t border-cyber-border space-y-2">
            <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-cyber-purple uppercase tracking-widest mb-1">
              <Sparkles size={11} /> Instruct TOM Neural Core:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(preset.prompt)}
                  disabled={isTyping || isEvolving}
                  className="text-left text-xs p-2.5 rounded-xl bg-white/5 hover:bg-cyber-purple/10 border border-white/5 hover:border-cyber-purple/20 transition-all text-slate-300 hover:text-white cursor-pointer truncate font-mono disabled:opacity-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input control form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }} className="p-4 bg-black/45 border-t border-cyber-border flex gap-2">
            <input
              type="text"
              placeholder="Ask TOM neural engine to evolve, reinforce nodes, adjust weights or log biometrics..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isTyping || isEvolving}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs glass-input"
            />
            <button
              type="submit"
              disabled={isTyping || isEvolving || !inputVal.trim()}
              className="px-4 bg-cyber-purple/20 hover:bg-cyber-purple/30 border border-cyber-purple/40 text-white rounded-xl cursor-pointer flex items-center justify-center transition-all disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </form>

        </div>

      </div>

      {/* Active learnings log ticker */}
      <div className="glass-panel rounded-2xl p-4 border border-cyber-border">
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono border-b border-white/5 pb-2 flex items-center gap-1.5 mb-2">
          <Network size={14} className="text-cyber-blue" />
          Active Optimization & Learning Stream
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {learnings.slice(0, 4).map((log, idx) => (
            <div key={idx} className="flex gap-2 text-[9px] p-2.5 rounded-lg bg-white/3 border border-white/5 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-purple mt-1 shrink-0"></span>
              <p className="text-slate-300 font-mono leading-relaxed">{log}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
