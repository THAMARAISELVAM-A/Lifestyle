import React from 'react';
import { 
  LayoutDashboard, ShieldCheck, Activity, CheckSquare, Calendar, 
  DollarSign, FileText, Award, BookOpen, 
  Home, MessageCircle, HardDrive, Zap, ShieldAlert, 
  Dumbbell, Fingerprint, BarChart3, ChevronLeft, ChevronRight,
  Brain, Globe, Network
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onItemClick }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { user, isAuthenticated } = useAuth();

  const menuGroups = [
    {
      title: "Core",
      items: [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'text-cyber-purple' },
        { id: 'ai-copilot', name: '"TOM" Neural Core', icon: Brain, color: 'text-cyber-purple' },
        { id: 'analytics', name: 'Life Analytics', icon: BarChart3, color: 'text-cyber-cyan' },
      ]
    },
    {
      title: "Productivity",
      items: [
        { id: 'tasks', name: 'Tasks & Boards', icon: CheckSquare, color: 'text-cyber-green' },
        { id: 'calendar', name: 'Calendar Sync', icon: Calendar, color: 'text-cyber-yellow' },
        { id: 'knowledge', name: 'Second Brain', icon: BookOpen, color: 'text-cyber-purple' },
        { id: 'cloud', name: 'Personal Cloud', icon: HardDrive, color: 'text-cyber-blue' },
      ]
    },
    {
      title: "Wellness & Finance",
      items: [
        { id: 'health', name: 'Health Monitor', icon: Activity, color: 'text-cyber-pink' },
        { id: 'fitness', name: 'Fitness Coach', icon: Dumbbell, color: 'text-cyber-orange' },
        { id: 'finance', name: 'Finance AI', icon: DollarSign, color: 'text-cyber-green' },
        { id: 'habits', name: 'Habit Engine', icon: Award, color: 'text-cyber-yellow' },
      ]
    },
    {
      title: "Secure Vaults",
      items: [
        { id: 'passwords', name: 'Password Vault', icon: ShieldCheck, color: 'text-cyber-pink' },
        { id: 'docs', name: 'Document Vault', icon: FileText, color: 'text-cyber-cyan' },
        { id: 'identity', name: 'Digital Identity', icon: Fingerprint, color: 'text-cyber-purple' },
      ]
    },
    {
      title: "Connected Life",
      items: [
        { id: 'swarm-dynamics', name: 'Swarm Dynamics', icon: Network, color: 'text-cyber-purple' },
        { id: 'world-monitor', name: 'World Monitor', icon: Globe, color: 'text-cyber-cyan' },
        { id: 'smarthome', name: 'Smart Home IoT', icon: Home, color: 'text-cyber-orange' },
        { id: 'social', name: 'Social Hub', icon: MessageCircle, color: 'text-cyber-blue' },
        { id: 'automation', name: 'Automation Engine', icon: Zap, color: 'text-cyber-green' },
      ]
    },
    {
      title: "Safety",
      items: [
        { id: 'emergency', name: 'Emergency SOS', icon: ShieldAlert, color: 'text-cyber-red' },
      ]
    }
  ];

  return (
    <aside 
      className={`glass-panel border-r border-cyber-border h-screen sticky top-0 flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-cyber-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyber-purple to-cyber-pink flex items-center justify-center shadow-neon-purple animate-pulse-slow">
              <span className="text-white font-extrabold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">MyLife OS</h1>
              <span className="text-[10px] text-cyber-purple font-mono uppercase tracking-widest">v1.0.0-neural</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyber-purple to-cyber-pink flex items-center justify-center shadow-neon-purple mx-auto">
            <span className="text-white font-extrabold text-sm">M</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer hidden md:block"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold text-cyber-muted uppercase tracking-widest mb-1.5">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id} className="relative">
                    {/* Active glowing indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-cyber-purple rounded-r shadow-neon-purple animate-pulse z-10" />
                    )}
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onItemClick) onItemClick();
                      }}
                      title={collapsed ? item.name : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer btn-press ${
                        isActive 
                          ? 'bg-gradient-to-r from-cyber-purple/20 to-cyber-blue/10 border border-cyber-purple/25 text-white shadow-neon-purple/5' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className={`${item.color} ${isActive ? 'scale-110' : ''} shrink-0 icon-hover`} size={20} />
                      {!collapsed && (
                        <span className="text-sm font-medium tracking-wide truncate">{item.name}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-cyber-border bg-black/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyber-purple via-cyber-blue to-cyber-green p-0.5 shadow-neon-blue">
              <div className="w-full h-full rounded-full bg-cyber-bg overflow-hidden flex items-center justify-center">
                <span className="text-xs font-bold text-white">{isAuthenticated && user?.name ? user.name.charAt(0).toUpperCase() : 'G'}</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyber-green rounded-full border border-cyber-bg animate-pulse"></div>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-none text-white">{isAuthenticated && user?.name ? user.name : 'Guest Mode'}</p>
              <span className={`text-[10px] font-mono ${isAuthenticated ? 'text-cyber-green' : 'text-cyber-yellow'}`}>{isAuthenticated ? 'Sync: NEON CLOUD' : 'Sync: OFFLINE'}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
