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
      className={`relative font-mono bg-black/90 border-r-2 border-cyber-cyan shadow-[4px_0_20px_-2px_rgba(0,255,255,0.4)] h-screen sticky top-0 flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40 z-0"></div>
      
      {/* HUD Glitch Highlights - randomly positioned decorative elements */}
      <div className="absolute top-1/4 right-0 w-[2px] h-16 bg-cyber-cyan animate-pulse z-0 shadow-neon-cyan"></div>
      <div className="absolute bottom-1/3 right-0 w-[3px] h-8 bg-cyber-pink animate-pulse z-0 shadow-neon-pink"></div>

      {/* Brand Header */}
      <div className="p-4 border-b border-cyber-cyan/30 flex items-center justify-between relative z-10 bg-black/40 backdrop-blur-sm">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-cyber-cyan/50 flex items-center justify-center shadow-neon-cyan relative overflow-hidden bg-black">
              {/* Spinning target element inside logo box */}
              <div className="absolute inset-0 border border-cyber-cyan opacity-30 animate-[spin_4s_linear_infinite] rounded-full scale-125"></div>
              <span className="text-cyber-cyan font-extrabold text-xl z-10">M</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-widest text-cyber-cyan uppercase shadow-neon-cyan">MyLife OS</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse shadow-neon-green"></span>
                <span className="text-[9px] text-cyber-green uppercase tracking-widest">SYS.ONLINE</span>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 border border-cyber-cyan flex items-center justify-center shadow-neon-cyan mx-auto relative overflow-hidden bg-black">
             <div className="absolute inset-0 border border-cyber-cyan opacity-30 animate-[spin_4s_linear_infinite] rounded-full scale-125"></div>
            <span className="text-cyber-cyan font-extrabold text-sm z-10">M</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 hover:shadow-neon-cyan transition-all cursor-pointer hidden md:block"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-cyber-cyan/30 scrollbar-track-transparent">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {!collapsed && (
              <div className="flex items-center gap-2 px-2 mb-2">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-cyber-cyan/50 to-transparent"></div>
                <h3 className="text-[10px] font-bold text-cyber-cyan/70 uppercase tracking-widest">
                  {group.title}
                </h3>
              </div>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id} className="relative group">
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onItemClick) onItemClick();
                      }}
                      title={collapsed ? item.name : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 cursor-pointer relative overflow-hidden ${
                        isActive 
                          ? 'bg-cyber-cyan/10 border-l-4 border-cyber-cyan text-cyber-cyan shadow-neon-cyan' 
                          : 'text-slate-500 hover:text-cyber-cyan hover:bg-cyber-cyan/5 border-l-4 border-transparent hover:border-cyber-cyan/30'
                      }`}
                    >
                      {/* Active Background Scanline */}
                      {isActive && (
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(0,255,255,0.1),transparent)] animate-[pulse_2s_ease-in-out_infinite]"></div>
                      )}

                      <Icon className={`${item.color} ${isActive ? 'scale-110 drop-shadow-[0_0_5px_currentColor]' : 'opacity-70 group-hover:opacity-100'} shrink-0 relative z-10`} size={20} />
                      
                      {!collapsed && (
                        <div className="flex-1 flex justify-between items-center relative z-10 min-w-0">
                          <span className={`text-xs font-semibold tracking-wider truncate uppercase ${isActive ? 'text-cyber-cyan text-shadow-neon' : ''}`}>
                            {item.name}
                          </span>
                          
                          {/* Tactical blinking details on active */}
                          {isActive && (
                            <div className="flex gap-1">
                              <span className="w-1 h-3 bg-cyber-cyan/70 animate-pulse"></span>
                              <span className="w-1 h-3 bg-cyber-cyan/40 animate-pulse" style={{ animationDelay: '150ms' }}></span>
                            </div>
                          )}
                        </div>
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
      <div className="p-4 border-t border-cyber-cyan/30 bg-black/60 relative z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 border ${isAuthenticated ? 'border-cyber-green shadow-neon-green' : 'border-cyber-yellow shadow-neon-yellow'} flex items-center justify-center bg-black/80`}>
                <span className={`text-sm font-bold ${isAuthenticated ? 'text-cyber-green' : 'text-cyber-yellow'}`}>
                  {isAuthenticated && user?.name ? user.name.charAt(0).toUpperCase() : 'GST'}
                </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${isAuthenticated ? 'bg-cyber-green' : 'bg-cyber-yellow'} border border-black animate-ping`}></div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${isAuthenticated ? 'bg-cyber-green' : 'bg-cyber-yellow'} border border-black`}></div>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <p className={`text-xs font-bold uppercase truncate leading-none ${isAuthenticated ? 'text-cyber-green' : 'text-cyber-yellow'}`}>
                  {isAuthenticated && user?.name ? user.name : 'GUEST_USER'}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] uppercase tracking-widest ${isAuthenticated ? 'text-cyber-green' : 'text-cyber-yellow'}`}>
                  {isAuthenticated ? 'UPLINK: ACTIVE' : 'UPLINK: FAIL'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
