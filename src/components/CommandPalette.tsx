import React, { useEffect, useRef, useState } from 'react';
import { Search, Compass, Shield, Heart, CheckSquare, DollarSign, Cpu, Home, BarChart2, Zap, Globe, Network } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (tabId: string) => void;
}

interface CommandItem {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onAction }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    { id: 'dashboard', name: 'Go to Dashboard', category: 'Navigation', icon: <Compass className="w-4 h-4" /> },
    { id: 'tasks', name: 'Go to Tasks Manager', category: 'Navigation', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'calendar', name: 'Go to Calendar Sync', category: 'Navigation', icon: <Compass className="w-4 h-4" /> },
    { id: 'health', name: 'Go to Health & Biometrics', category: 'Navigation', icon: <Heart className="w-4 h-4" /> },
    { id: 'finance', name: 'Go to Finance & Ledger', category: 'Navigation', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'passwords', name: 'Go to Passwords Vault', category: 'Navigation', icon: <Shield className="w-4 h-4" /> },
    { id: 'smarthome', name: 'Go to Smart Home IoT', category: 'Navigation', icon: <Home className="w-4 h-4" /> },
    { id: 'ai-copilot', name: 'Go to AI Copilot', category: 'Navigation', icon: <Cpu className="w-4 h-4" /> },
    { id: 'analytics', name: 'Go to Analytics Insights', category: 'Navigation', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'habits', name: 'Go to Habits & Streak Tracker', category: 'Navigation', icon: <Zap className="w-4 h-4" /> },
    { id: 'world-monitor', name: 'Go to World Monitor', category: 'Navigation', icon: <Globe className="w-4 h-4" /> },
    { id: 'swarm-dynamics', name: 'Go to Swarm Dynamics', category: 'Navigation', icon: <Network className="w-4 h-4" /> }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Track state change during rendering to avoid synchronous setState inside useEffect
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    setSearch('');
    setSelectedIndex(0);
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onAction(filteredCommands[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose, onAction]);

  useEffect(() => {
    // Scroll selected item into view inside scrollable container
    const container = listRef.current;
    if (!container) return;

    const selectedElement = container.children[selectedIndex] as HTMLElement;
    if (!selectedElement) return;

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const elemTop = selectedElement.offsetTop;
    const elemBottom = elemTop + selectedElement.clientHeight;

    if (elemTop < containerTop) {
      container.scrollTop = elemTop;
    } else if (elemBottom > containerBottom) {
      container.scrollTop = elemBottom - container.clientHeight;
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Palette Container */}
      <div className="glass-panel border border-cyber-border-focus/30 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[350px] hologram-scanline animate-pulse-slow">
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-cyber-border bg-black/25">
          <Search className="w-5 h-5 text-cyber-purple mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or nav destination..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none text-sm font-mono"
          />
          <span className="text-[10px] font-mono text-slate-500 border border-cyber-border px-1.5 py-0.5 rounded uppercase">ESC</span>
        </div>

        {/* Command list */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 bg-black/40">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, i) => (
              <div
                key={cmd.id}
                onClick={() => {
                  onAction(cmd.id);
                  onClose();
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                  i === selectedIndex
                    ? 'bg-cyber-purple/20 text-white border-l-2 border-cyber-purple pl-2.5'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${i === selectedIndex ? 'text-cyber-purple animate-pulse' : 'text-slate-500'}`}>
                    {cmd.icon}
                  </span>
                  <span>{cmd.name}</span>
                </div>
                <span className="text-[10px] text-slate-600 uppercase tracking-wider">{cmd.category}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 font-mono">
              NO COMPATIBLE NEURAL CHANNELS FOUND
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-cyber-border/40 bg-black/50 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>v1.0.8 Neural OS</span>
        </div>
      </div>
    </div>
  );
};
