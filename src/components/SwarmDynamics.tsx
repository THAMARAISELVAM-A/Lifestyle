import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Network, Users, Zap,
  Activity, Globe,
  AlertTriangle, CheckCircle2,
  ArrowUpRight, ArrowDownRight, RefreshCw, BarChart3
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

interface AgentNode {
  id: number;
  sentiment: number; // -1 to 1 (negative to positive)
  bias: 'bullish' | 'bearish' | 'neutral';
  activity: number; // 0 to 1
  connections: number[];
}

interface SwarmState {
  agents: AgentNode[];
  score: number; // -100 to 100
  volatility: number; // 0 to 100
  trend: 'bullish' | 'bearish' | 'sideways';
  confidence: number; // 0 to 100
}

interface NarrativeStressTest {
  id: string;
  headline: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  agentShift: number;
  timestamp: Date;
}

// ==========================================
// CONSTANTS
// ==========================================

const AGENT_COUNT = 60;
const SIMULATION_TICK_MS = 2000;
const NARRATIVES: NarrativeStressTest[] = [
  { id: 'n1', headline: 'Central Bank Signals Rate Pause', impact: 'medium', agentShift: 0.15, timestamp: new Date(Date.now() - 3600000) },
  { id: 'n2', headline: 'Tech Sector Rally Enters Week 3', impact: 'high', agentShift: 0.35, timestamp: new Date(Date.now() - 7200000) },
  { id: 'n3', headline: 'Geopolitical Tension Rises in Region', impact: 'critical', agentShift: -0.5, timestamp: new Date(Date.now() - 10800000) },
  { id: 'n4', headline: 'Supply Chain Disruption Reported', impact: 'high', agentShift: -0.25, timestamp: new Date(Date.now() - 14400000) },
  { id: 'n5', headline: 'Green Energy Investment Surges', impact: 'medium', agentShift: 0.2, timestamp: new Date(Date.now() - 18000000) },
];

// ==========================================
// UTILITIES
// ==========================================

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const generateInitialAgents = (): AgentNode[] => {
  return Array.from({ length: AGENT_COUNT }, (_, i) => ({
    id: i,
    sentiment: (Math.random() - 0.5) * 2,
    bias: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral',
    activity: Math.random(),
    connections: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => Math.floor(Math.random() * AGENT_COUNT)).filter(id => id !== i)
  }));
};

const computeConsensus = (agents: AgentNode[]): { score: number; trend: SwarmState['trend']; volatility: number; confidence: number } => {
  if (!agents.length) return { score: 0, trend: 'sideways', volatility: 50, confidence: 50 };
  const avgSentiment = agents.reduce((sum, a) => sum + a.sentiment, 0) / agents.length;
  const score = Math.round(avgSentiment * 100);
  const variance = agents.reduce((sum, a) => sum + Math.pow(a.sentiment - avgSentiment, 2), 0) / agents.length;
  const volatility = clamp(Math.round(Math.sqrt(variance) * 200), 0, 100);
  const confidence = clamp(100 - volatility + agents.filter(a => Math.abs(a.sentiment) > 0.5).length * 2, 0, 100);
  let trend: SwarmState['trend'] = 'sideways';
  if (score > 20) trend = 'bullish';
  else if (score < -20) trend = 'bearish';
  return { score, trend, volatility, confidence };
};

const mapSentimentToColor = (sentiment: number): string => {
  if (sentiment > 0.3) return '#00ff00';
  if (sentiment > 0) return '#a3e635';
  if (sentiment > -0.3) return '#facc15';
  if (sentiment > -0.6) return '#f97316';
  return '#ef4444';
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const AgentGraph: React.FC<{ agents: AgentNode[]; width: number; height: number }> = ({ agents, width, height }) => {
  const positions = useMemo(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    return agents.map((agent, i) => {
      const angle = (i / agents.length) * Math.PI * 2;
      const r = radius * (0.7 + agent.activity * 0.3);
      return {
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r
      };
    });
  }, [agents, width, height]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <filter id="glow-agent">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Central Hub */}
      <circle cx={width / 2} cy={height / 2} r="30" fill="url(#centerGlow)" />
      <circle cx={width / 2} cy={height / 2} r="8" fill="#8b5cf6" filter="url(#glow-agent)" />
      <circle cx={width / 2} cy={height / 2} r="15" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1" className="animate-[spin_8s_linear_infinite]" strokeDasharray="4 4" />

      {/* Connection Lines */}
      {agents.map((agent, i) => {
        const pos = positions[i];
        if (!agent.activity || agent.activity < 0.2) return null;
        const opacity = agent.activity * 0.4;
        const color = mapSentimentToColor(agent.sentiment);
        return (
          <line
            key={`line-${i}`}
            x1={width / 2}
            y1={height / 2}
            x2={pos.x}
            y2={pos.y}
            stroke={color}
            strokeWidth="0.5"
            opacity={opacity}
          />
        );
      })}

      {/* Agent Nodes */}
      {agents.map((agent, i) => {
        const pos = positions[i];
        const color = mapSentimentToColor(agent.sentiment);
        const size = 2 + agent.activity * 3;
        return (
          <g key={agent.id}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={size}
              fill={color}
              opacity={0.5 + agent.activity * 0.5}
              filter={agent.activity > 0.7 ? "url(#glow-agent)" : undefined}
              className="transition-all duration-500"
            />
            {agent.bias === 'bullish' && (
              <circle cx={pos.x} cy={pos.y} r={size + 3} fill="none" stroke="#00ff00" strokeWidth="0.5" opacity="0.3" />
            )}
          </g>
        );
      })}
    </svg>
  );
};

const ConsensusGauge: React.FC<{ score: number; confidence: number }> = ({ score, confidence }) => {
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.abs(score) / 100) * circumference;
  const strokeColor = score > 20 ? '#00ff00' : score < -20 ? '#ef4444' : '#facc15';

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
          <defs>
            <filter id="glow-gauge">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out', filter: `drop-shadow(0 0 6px ${strokeColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono" style={{ color: strokeColor }}>{score}</span>
          <span className="text-[9px] text-cyber-muted font-mono uppercase tracking-wider">SWARM INDEX</span>
          <span className="text-[9px] text-cyber-muted font-mono mt-1">{confidence}% conf</span>
        </div>
      </div>
    </div>
  );
};

const NarrativePanel: React.FC<{ narratives: NarrativeStressTest[] }> = ({ narratives }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-cyber-cyan" />
        <h4 className="text-[10px] font-mono text-cyber-cyan font-bold uppercase tracking-widest">Narrative Stress-Test Feed</h4>
      </div>
      <div className="flex gap-2 flex-wrap">
        {narratives.map((n, i) => (
          <button
            key={n.id}
            onClick={() => setActiveIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
              i === activeIdx
                ? 'bg-cyber-cyan/20 border-cyber-cyan/50 text-cyber-cyan'
                : 'bg-white/3 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {n.impact.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="bg-black/40 border border-cyber-border/50 rounded-xl p-3">
        <p className="text-xs font-mono text-white leading-relaxed">{narratives[activeIdx]?.headline}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] font-mono font-bold ${narratives[activeIdx]?.agentShift > 0 ? 'text-cyber-green' : 'text-cyber-red'}`}>
            {narratives[activeIdx]?.agentShift > 0 ? '+' : ''}{(narratives[activeIdx]?.agentShift || 0) * 100}% Bias Shift
          </span>
          <span className="text-[10px] text-cyber-muted font-mono">
            {narratives[activeIdx]?.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

const MarketSignalPanel: React.FC<{ swarm: SwarmState }> = ({ swarm }) => {
  const trendConfig = {
    bullish: { label: 'BULLISH', color: 'text-cyber-green', Icon: ArrowUpRight, bg: 'bg-cyber-green/10', border: 'border-cyber-green/30' },
    bearish: { label: 'BEARISH', color: 'text-cyber-red', Icon: ArrowDownRight, bg: 'bg-cyber-red/10', border: 'border-cyber-red/30' },
    sideways: { label: 'SIDEWAYS', color: 'text-cyber-yellow', Icon: Activity, bg: 'bg-cyber-yellow/10', border: 'border-cyber-yellow/30' },
  };
  const cfg = trendConfig[swarm.trend];
  const TrendIcon = cfg.Icon;

  return (
    <div className={`glass-panel rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-5 h-5 ${cfg.color}`} />
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Market Consensus</h4>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${cfg.border} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[9px] text-cyber-muted font-mono uppercase">Volatility</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-cyber-purple rounded-full transition-all duration-700" style={{ width: `${swarm.volatility}%` }} />
            </div>
            <span className="text-xs font-mono text-white font-bold">{swarm.volatility}%</span>
          </div>
        </div>
        <div>
          <span className="text-[9px] text-cyber-muted font-mono uppercase">Confidence</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-cyber-cyan rounded-full transition-all duration-700" style={{ width: `${swarm.confidence}%` }} />
            </div>
            <span className="text-xs font-mono text-white font-bold">{swarm.confidence}%</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-cyber-muted">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{AGENT_COUNT} Agents</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          <span>{swarm.agents.filter(a => a.activity > 0.5).length} Active</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export const SwarmDynamics: React.FC = () => {
  const [swarm, setSwarm] = useState<SwarmState>(() => {
    const agents = generateInitialAgents();
    const consensus = computeConsensus(agents);
    return { agents, ...consensus };
  });
  const [isSimulating, setIsSimulating] = useState(true);
  const [selectedNarrative, setSelectedNarrative] = useState<NarrativeStressTest | null>(null);
  const [lastTick, setLastTick] = useState<Date>(new Date());
  const socketRef = useRef<number | null>(null);

  const tickSimulation = useCallback(() => {
    setSwarm(prev => {
      const updatedAgents = prev.agents.map((agent: AgentNode) => {
        // Random walk with mean reversion
        const sentimentDrift = (Math.random() - 0.5) * 0.2;
        const meanReversion = -agent.sentiment * 0.05;
        const narrativeInfluence = selectedNarrative ? selectedNarrative.agentShift * 0.3 : 0;
        const newSentiment = clamp(agent.sentiment + sentimentDrift + meanReversion + narrativeInfluence, -1, 1);
        const newBias: AgentNode['bias'] = newSentiment > 0.2 ? 'bullish' : newSentiment < -0.2 ? 'bearish' : 'neutral';
        const newActivity = clamp(agent.activity + (Math.random() - 0.5) * 0.3, 0, 1);

        // Occasionally update connections
        const newConnections = Math.random() > 0.95
          ? agent.connections.map(c => Math.random() > 0.5 ? (c + 1) % AGENT_COUNT : c)
          : agent.connections;

        return { ...agent, sentiment: newSentiment, bias: newBias, activity: newActivity, connections: newConnections };
      });

      const consensus = computeConsensus(updatedAgents);
      return { agents: updatedAgents, ...consensus };
    });
    setLastTick(new Date());
  }, [selectedNarrative]);

  // Simulation loop
  useEffect(() => {
    if (isSimulating) {
      socketRef.current = window.setInterval(tickSimulation, SIMULATION_TICK_MS);
    }
    return () => {
      if (socketRef.current) window.clearInterval(socketRef.current);
    };
  }, [isSimulating, tickSimulation]);

  // Apply narrative shock
  const applyNarrativeShock = useCallback((narrative: NarrativeStressTest) => {
    setSelectedNarrative(narrative);
    setSwarm(prev => {
      const updatedAgents = prev.agents.map(agent => {
        const shift = narrative.agentShift * (0.5 + Math.random() * 0.5);
        const newSentiment = clamp(agent.sentiment + shift, -1, 1);
        const newBias: AgentNode['bias'] = newSentiment > 0.2 ? 'bullish' : newSentiment < -0.2 ? 'bearish' : 'neutral';
        return { ...agent, sentiment: newSentiment, bias: newBias, activity: Math.min(1, agent.activity + 0.3) };
      });
      const consensus = computeConsensus(updatedAgents);
      return { agents: updatedAgents, ...consensus };
    });
  }, []);

  const resetSimulation = useCallback(() => {
    const agents = generateInitialAgents();
    const consensus = computeConsensus(agents);
    setSwarm({ agents, ...consensus });
    setSelectedNarrative(null);
  }, []);

  // Stats
  const bullishCount = swarm.agents.filter(a => a.bias === 'bullish').length;
  const bearishCount = swarm.agents.filter(a => a.bias === 'bearish').length;
  const neutralCount = swarm.agents.filter(a => a.bias === 'neutral').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Network className="text-cyber-purple animate-pulse" />
            <span>Swarm Dynamics</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple uppercase tracking-widest">
              MiroShark / MiroFish Engine
            </span>
          </h2>
          <p className="text-cyber-muted text-xs mt-1 font-mono">
            Multi-agent narrative stress-testing & market consensus visualization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono text-cyber-muted">
            LAST TICK: {lastTick.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              isSimulating
                ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green hover:bg-cyber-green/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {isSimulating ? 'PAUSE SIM' : 'RESUME SIM'}
          </button>
          <button
            onClick={resetSimulation}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
        {/* LEFT: Agent Graph */}
        <div className="xl:col-span-5 glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyber-purple" />
              <h3 className="font-mono text-cyber-purple text-sm font-bold tracking-wider">AGENT_MESH.SIMULATION</h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-cyber-green"><div className="w-2 h-2 rounded-full bg-cyber-green" />{bullishCount} Bull</span>
              <span className="flex items-center gap-1 text-cyber-red"><div className="w-2 h-2 rounded-full bg-cyber-red" />{bearishCount} Bear</span>
              <span className="flex items-center gap-1 text-cyber-yellow"><div className="w-2 h-2 rounded-full bg-cyber-yellow" />{neutralCount} Neutral</span>
            </div>
          </div>
          <div className="flex-1 relative min-h-0">
            <AgentGraph agents={swarm.agents} width={500} height={400} />
          </div>
        </div>

        {/* CENTER: Consensus + Market Signal */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 flex flex-col items-center">
            <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-4 self-start">Swarm Consensus</h3>
            <ConsensusGauge score={swarm.score} confidence={swarm.confidence} />
            <div className="mt-4 w-full">
              <MarketSignalPanel swarm={swarm} />
            </div>
          </div>

          {/* Narrative Stress Test */}
          <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 flex-1">
            <NarrativePanel narratives={NARRATIVES} />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {NARRATIVES.map(n => (
                <button
                  key={n.id}
                  onClick={() => applyNarrativeShock(n)}
                  disabled={!isSimulating}
                  className="text-left p-3 rounded-xl bg-black/30 border border-cyber-border/50 hover:border-cyber-purple/50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {n.impact === 'critical' && <AlertTriangle className="w-3 h-3 text-cyber-red" />}
                    {n.impact === 'high' && <AlertTriangle className="w-3 h-3 text-cyber-orange" />}
                    {n.impact === 'medium' && <CheckCircle2 className="w-3 h-3 text-cyber-yellow" />}
                    {n.impact === 'low' && <CheckCircle2 className="w-3 h-3 text-cyber-green" />}
                    <span className="text-[9px] font-mono text-cyber-muted uppercase">{n.impact}</span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-300 group-hover:text-white line-clamp-2 leading-tight">
                    {n.headline}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Live Feed & Metrics */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Consensus History */}
          <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 h-[220px] flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-cyber-cyan" />
              <h4 className="text-[10px] font-mono text-cyber-cyan font-bold uppercase tracking-widest">Consensus History</h4>
            </div>
            <ConsensusSparkline score={swarm.score} />
          </div>

          {/* API Connection Status */}
          <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-5 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-cyber-yellow" />
              <h4 className="text-[10px] font-mono text-cyber-yellow font-bold uppercase tracking-widest">Connection Status</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">MiroShark Engine</span>
                <span className="text-[10px] font-mono text-cyber-green flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" /> SIMULATED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Agent Protocol</span>
                <span className="text-[10px] font-mono text-cyber-cyan">MESO v2.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Tick Rate</span>
                <span className="text-[10px] font-mono text-white">{(1000 / SIMULATION_TICK_MS).toFixed(0)} Hz</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Backend</span>
                <span className="text-[10px] font-mono text-cyber-yellow">AWAITING ENDPOINT</span>
              </div>
              <p className="text-[9px] text-cyber-muted font-mono mt-2 leading-relaxed">
                Connect a MiroShark/MiroFish REST endpoint to replace simulation with live multi-agent data.
                Current mode: locally simulated swarm dynamics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SPARKLINE
// ==========================================

const ConsensusSparkline: React.FC<{ score: number }> = ({ score }) => {
  const historyReducer = useCallback((prev: number[], newScore: number) => {
    const next = [...prev, newScore];
    if (next.length > 40) next.shift();
    return next;
  }, []);
  const [history, pushScore] = React.useReducer(historyReducer, [score]);

  useEffect(() => {
    pushScore(score);
  }, [score]);

  const width = 200;
  const height = 60;

  const points = history.map((val, i) => ({
    x: (i / (history.length - 1 || 1)) * width,
    y: height / 2 - (val / 100) * (height / 2 - 5)
  }));

  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div className="flex-1 relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Zero line */}
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        {pathD && (
          <>
            <path d={pathD + ` L ${points[points.length - 1]!.x} ${height / 2} L ${points[0].x} ${height / 2} Z`} fill="url(#sparkGrad)" />
            <path d={pathD} fill="none" stroke={score > 0 ? '#00ff00' : score < 0 ? '#ef4444' : '#facc15'} strokeWidth="1.5" />
          </>
        )}
      </svg>
    </div>
  );
};

