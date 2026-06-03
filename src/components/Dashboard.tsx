import React, { useEffect, useRef, useState } from 'react';
import { Clock, ShieldAlert, Zap } from 'lucide-react';
import type { Task, Goal, HealthMetric, SmartDevice } from '../types';

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
  runOptimization,
  isOptimizing,
  userName,
  tasks,
  lifeScore
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Time logic
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  // Canvas Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    
    // Initial size
    resize();
    window.addEventListener('resize', resize);

    // Node definitions
    interface Node {
      x: number; y: number; vx: number; vy: number; radius: number;
      label: string; color: string; pulse: number; pulseDir: number;
    }
    const numNodes = 20;
    const nodes: Node[] = [];

    // Central Node (TOM Core)
    nodes.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      radius: 40,
      label: 'TOM SYSTEM CORE',
      color: '#8b5cf6', // cyber-purple
      pulse: 0,
      pulseDir: 0.02
    });

    const categories = [
      { name: 'Task Node', color: '#10b981' }, // green
      { name: 'IoT Device', color: '#f97316' }, // orange
      { name: 'Health API', color: '#ec4899' }, // pink
      { name: 'Finance DB', color: '#10b981' }, // green
      { name: 'Neural Net', color: '#3b82f6' }, // blue
      { name: 'Proxy Relay', color: '#eab308' }, // yellow
      { name: 'Data Lake', color: '#06b6d4' }   // cyan
    ];

    for (let i = 1; i < numNodes; i++) {
      const cat = categories[i % categories.length];
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 12 + 8,
        label: `${cat.name} [${i.toString().padStart(2, '0')}]`,
        color: cat.color,
        pulse: Math.random(),
        pulseDir: 0.01 + Math.random() * 0.02
      });
    }

    interface Packet {
      from: number; to: number; progress: number; speed: number;
    }
    const packets: Packet[] = [];

    // Particle background
    const particles = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speedY: -Math.random() * 0.5 - 0.1
    }));

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear with dark transparent background for trail effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; // slate-950 with opacity
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      const offsetX = (Date.now() / 50) % gridSize;
      const offsetY = (Date.now() / 50) % gridSize;
      
      ctx.beginPath();
      for (let x = -gridSize; x <= width + gridSize; x += gridSize) {
        ctx.moveTo(x + offsetX, 0); ctx.lineTo(x + offsetX, height);
      }
      for (let y = -gridSize; y <= height + gridSize; y += gridSize) {
        ctx.moveTo(0, y + offsetY); ctx.lineTo(width, y + offsetY);
      }
      ctx.stroke();

      // Draw background particles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      particles.forEach(p => {
        p.y += p.speedY;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Keep Core centered
      nodes[0].x = width / 2;
      nodes[0].y = height / 2;

      // Update positions
      nodes.forEach((node, idx) => {
        if (idx !== 0) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x <= node.radius || node.x >= width - node.radius) node.vx *= -1;
          if (node.y <= node.radius || node.y >= height - node.radius) node.vy *= -1;
        }
        
        node.pulse += node.pulseDir;
        if (node.pulse > 1 || node.pulse < 0) node.pulseDir *= -1;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = (i === 0 || j === 0) ? 400 : 200; 
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const opacity = 1 - (dist / maxDist);
            ctx.strokeStyle = (i === 0 || j === 0) 
              ? `rgba(139, 92, 246, ${opacity * 0.4})` // core connections purple
              : `rgba(255, 255, 255, ${opacity * 0.1})`; // inter-node connections white
            ctx.lineWidth = (i === 0 || j === 0) ? 1.5 : 0.5;
            ctx.stroke();
          }
        }
      }

      // Generate Data Packets
      if (Math.random() < 0.15) {
        const from = Math.floor(Math.random() * nodes.length);
        let to = Math.floor(Math.random() * nodes.length);
        if (Math.random() > 0.4) to = 0; // high probability to core
        
        const dx = nodes[from].x - nodes[to].x;
        const dy = nodes[from].y - nodes[to].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = (from === 0 || to === 0) ? 400 : 200;

        if (from !== to && dist < maxDist) {
          packets.push({ from, to, progress: 0, speed: 0.005 + Math.random() * 0.015 });
        }
      }

      // Draw Data Packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          packets.splice(i, 1);
        } else {
          const n1 = nodes[p.from];
          const n2 = nodes[p.to];
          const x = n1.x + (n2.x - n1.x) * p.progress;
          const y = n1.y + (n2.y - n1.y) * p.progress;
          
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.shadowColor = n2.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw nodes
      nodes.forEach((node, idx) => {
        // Glow
        const pulseRadius = node.radius + (node.pulse * (idx === 0 ? 25 : 10));
        const gradient = ctx.createRadialGradient(node.x, node.y, node.radius * 0.3, node.x, node.y, pulseRadius);
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#020617'; // slate-950
        ctx.fill();
        ctx.lineWidth = idx === 0 ? 3 : 2;
        ctx.strokeStyle = node.color;
        
        // Add dashed effect to core node
        if (idx === 0) {
          ctx.setLineDash([10, 5]);
          ctx.lineDashOffset = -Date.now() / 50;
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Inner core detail
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.5 + node.pulse * 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Label
        ctx.font = idx === 0 ? "bold 14px monospace" : "10px monospace";
        ctx.fillStyle = idx === 0 ? "#fff" : "rgba(255,255,255,0.8)";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + node.radius + (idx === 0 ? 20 : 15));
        
        if (idx !== 0) {
            // Little decorative subtext
            ctx.font = "8px monospace";
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            const status = node.pulse > 0.5 ? 'SYNCING...' : 'IDLE';
            ctx.fillText(status, node.x, node.y + node.radius + 25);
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-100px)] min-h-[600px] rounded-2xl overflow-hidden bg-slate-950 border border-cyber-border shadow-glass-glow flex">
      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />
      
      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between">
        
        {/* Top Banner */}
        <div className="p-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-gradient-to-b from-slate-950/90 to-transparent">
          <div className="pointer-events-auto">
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-md">
                Welcome back, {userName ?? 'Alex'}
            </h2>
            <p className="text-cyber-muted text-sm mt-1 flex items-center gap-1.5 font-mono drop-shadow">
              <Clock size={14} className="text-cyber-purple" />
              System active — {dateString} @ <span className="text-cyber-purple font-bold">{timeString}</span>
            </p>
          </div>

          <div className="flex gap-3 pointer-events-auto">
            <button 
              onClick={() => setActiveTab('emergency')}
              className="flex items-center gap-2 px-4 py-2 bg-cyber-red/20 border border-cyber-red/30 rounded-xl text-cyber-red text-sm font-semibold hover:bg-cyber-red/30 hover:scale-105 transition-all shadow-neon-pink/20 cursor-pointer backdrop-blur-md"
            >
              <ShieldAlert size={16} className="animate-pulse" />
              EMERGENCY SOS
            </button>

            <button 
              onClick={runOptimization}
              disabled={isOptimizing}
              className={`flex items-center gap-2 px-4 py-2 bg-cyber-purple/20 border border-cyber-purple/30 hover:border-cyber-purple/50 rounded-xl text-cyber-purple text-sm font-semibold hover:bg-cyber-purple/30 hover:scale-105 transition-all shadow-neon-purple/20 cursor-pointer backdrop-blur-md ${
                isOptimizing ? 'animate-pulse opacity-70' : ''
              }`}
            >
              <Zap size={16} className={isOptimizing ? 'animate-spin' : ''} />
              {isOptimizing ? 'Optimizing OS...' : 'Optimize LifeOS'}
            </button>
          </div>
        </div>

        {/* Bottom Metrics Overlay */}
        <div className="p-6 bg-gradient-to-t from-slate-950/90 to-transparent flex justify-between items-end">
            <div className="pointer-events-auto font-mono text-[10px] text-cyber-muted flex flex-col gap-1">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse"></span>
                    CORE SYSTEMS NORMAL
                </span>
                <span>Active Tasks: {tasks.filter(t => t.status !== 'done').length}</span>
                <span>LifeScore: {lifeScore}/100</span>
            </div>
            <div className="pointer-events-auto font-mono text-[10px] text-cyber-muted text-right">
                <p className="text-cyber-purple">TOPOLOGY MAP V2.0</p>
                <p>Uplink: ESTABLISHED</p>
            </div>
        </div>

      </div>
    </div>
  );
};
