import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, ChevronRight } from 'lucide-react';

interface NeuralTerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NeuralTerminal({ isOpen, onClose }: NeuralTerminalProps) {
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING NEURAL TERMINAL...",
    "ESTABLISHING SECURE CONNECTION...",
    "CONNECTION ESTABLISHED. WELCOME, OPERATOR.",
    "TYPE '/help' FOR A LIST OF COMMANDS."
  ]);
  const [input, setInput] = useState('');
  const endOfLogsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (endOfLogsRef.current) {
      endOfLogsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    
    setLogs(prev => [...prev, `> ${trimmed}`]);
    
    const command = trimmed.toLowerCase();
    
    setTimeout(() => {
      switch (command) {
        case '/help':
          setLogs(prev => [...prev, 
            "AVAILABLE COMMANDS:",
            "  /help        - SHOW THIS MESSAGE",
            "  /sys-status  - DISPLAY SYSTEM DIAGNOSTICS",
            "  /clear       - CLEAR TERMINAL OUTPUT",
            "  /scan-world  - INITIATE GLOBAL NETWORK SCAN",
            "  /exit        - CLOSE NEURAL TERMINAL"
          ]);
          break;
        case '/sys-status':
          setLogs(prev => [...prev, 
            "SYSTEM STATUS: ONLINE",
            "CPU USAGE: 24%",
            "MEMORY: 12GB / 64GB",
            "NETWORK LATENCY: 12ms",
            "NEURAL LINK: STABLE"
          ]);
          break;
        case '/clear':
          setLogs([]);
          break;
        case '/scan-world':
          setLogs(prev => [...prev, 
            "SCANNING GLOBAL NETWORKS...",
            "[WARN] ANOMALY DETECTED IN SECTOR 7G",
            "[INFO] ALL OTHER SECTORS OPTIMAL.",
            "SCAN COMPLETE."
          ]);
          break;
        case '/exit':
          onClose();
          break;
        default:
          setLogs(prev => [...prev, `[ERROR] UNKNOWN COMMAND: ${trimmed}`]);
      }
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="relative w-full max-w-4xl h-[70vh] flex flex-col bg-black/90 border border-cyber-purple/50 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.3)] font-mono"
        style={{
          backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-cyber-purple/10 border-b border-cyber-purple/30">
          <div className="flex items-center gap-2 text-cyber-purple">
            <Terminal size={16} />
            <span className="text-xs tracking-widest font-bold">NEURAL_CLI v2.4.1</span>
          </div>
          <button 
            onClick={onClose}
            className="text-cyber-muted hover:text-cyber-pink transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm text-cyber-green scrollbar-thin scrollbar-thumb-cyber-purple/20 scrollbar-track-transparent">
          {logs.map((log, i) => (
            <div key={i} className="break-all whitespace-pre-wrap">
              {log}
            </div>
          ))}
          <div ref={endOfLogsRef} />
        </div>

        {/* Terminal Input */}
        <div className="flex items-center px-4 py-3 bg-black/50 border-t border-cyber-purple/30">
          <ChevronRight size={16} className="text-cyber-purple mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-cyber-cyan font-mono text-sm placeholder-cyber-muted/50 focus:ring-0"
            placeholder="AWAITING COMMAND..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
