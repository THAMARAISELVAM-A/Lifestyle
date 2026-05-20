import React from 'react';
import { 
  Home, Power, Thermometer, Camera, 
  Lightbulb, Lock, Unlock, Play, ShieldCheck
} from 'lucide-react';
import type { SmartDevice } from '../types';


interface SmartHomeProps {
  devices: SmartDevice[];
  toggleDevice: (id: string) => void;
  updateDeviceValue: (id: string, value: string | number) => void;
}

export const SmartHome: React.FC<SmartHomeProps> = ({
  devices,
  toggleDevice,
  updateDeviceValue
}) => {
  const [logs, setLogs] = React.useState([
    { time: '09:12 PM', text: 'Living Room AC adjusted to 23°C by Auto-Thermostat scheduler' },
    { time: '08:45 PM', text: 'Main Gate Lock set to SECURED' },
    { time: '07:30 PM', text: 'Kitchen Lights turned ON by motion detector trigger' }
  ]);

  const [automationActive, setAutomationActive] = React.useState(true);

  const handleToggle = (id: string, name: string, status: boolean) => {
    toggleDevice(id);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      { time: timeStr, text: `${name} turned ${!status ? 'ON' : 'OFF'} by user` },
      ...prev
    ]);
  };

  const handleAcTemp = (id: string, currentVal: string | number, dir: 'up' | 'down') => {
    const tempNum = typeof currentVal === 'string' ? parseInt(currentVal) : Number(currentVal);
    const newVal = dir === 'up' ? tempNum + 1 : tempNum - 1;
    updateDeviceValue(id, `${newVal}°C`);
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      { time: timeStr, text: `AC Temperature adjusted to ${newVal}°C` },
      ...prev
    ]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Home className="text-cyber-orange" />
            Smart Home Control
          </h2>
          <p className="text-cyber-muted text-xs">Unified IoT dashboard managing home appliances, locking security and climate controls.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-cyber-muted">
          <ShieldCheck size={14} className="text-cyber-green" />
          IoT Firewall Secure
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Device Switches Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devices.map(dev => {
              return (
                <div 
                  key={dev.id}
                  className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col justify-between h-[150px] shadow-glass ${
                    dev.status 
                      ? 'border-cyber-orange/30 bg-cyber-orange/5 shadow-neon-blue/5' 
                      : 'border-cyber-border'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${
                        dev.status 
                          ? 'bg-cyber-orange/15 border-cyber-orange/30 text-cyber-orange' 
                          : 'bg-white/5 border-white/5 text-slate-400'
                      }`}>
                        {dev.type === 'light' ? <Lightbulb size={18} /> :
                         dev.type === 'ac' ? <Thermometer size={18} /> :
                         dev.type === 'lock' ? <Lock size={18} /> : <Camera size={18} />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{dev.name}</h4>
                        <span className="text-[10px] text-cyber-muted font-mono uppercase">{dev.room}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggle(dev.id, dev.name, dev.status)}
                      className={`p-2 rounded-full border transition-all cursor-pointer ${
                        dev.status 
                          ? 'bg-cyber-orange text-white border-cyber-orange shadow-neon-pink/20' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Power size={14} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                    <span className="text-[10px] font-mono font-bold text-cyber-muted">
                      {dev.status ? 'ACTIVE' : 'STANDBY'}
                    </span>
                    
                    {/* Extra adjustment for AC or Locks */}
                    {dev.type === 'ac' && dev.status && (
                      <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg p-1 font-mono text-xs">
                        <button 
                          onClick={() => handleAcTemp(dev.id, dev.value || 23, 'down')}
                          className="px-1.5 py-0.5 hover:bg-white/10 rounded cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-white font-bold">{dev.value || '23°C'}</span>
                        <button 
                          onClick={() => handleAcTemp(dev.id, dev.value || 23, 'up')}
                          className="px-1.5 py-0.5 hover:bg-white/10 rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {dev.type === 'lock' && (
                      <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                        dev.status ? 'text-cyber-green' : 'text-cyber-red'
                      }`}>
                        {dev.status ? <Lock size={10} /> : <Unlock size={10} />}
                        {dev.status ? 'Locked' : 'Unlocked'}
                      </span>
                    )}

                    {dev.type === 'light' && dev.status && (
                      <span className="text-[10px] text-cyber-orange font-mono">100% Brightness</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity Log ledger */}
          <div className="glass-panel rounded-2xl border border-cyber-border p-6 shadow-glass space-y-4">
            <h3 className="font-semibold text-sm text-slate-100">Smart Home Event Log</h3>
            <div className="space-y-3 font-mono text-xs">
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-4 p-2.5 rounded-lg bg-white/3 border border-transparent">
                  <span className="text-cyber-orange font-bold shrink-0">{log.time}</span>
                  <span className="text-slate-300 leading-normal">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Camera Live Feed & Automation toggles */}
        <div className="space-y-6">
          
          {/* Camera Feed Widget */}
          <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass overflow-hidden">
            <div className="p-4 border-b border-cyber-border flex justify-between items-center">
              <span className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                <Camera size={14} className="text-cyber-orange animate-pulse" />
                Driveway Live Stream
              </span>
              <span className="text-[8px] bg-cyber-red/20 text-cyber-red font-mono px-2 py-0.5 rounded font-bold animate-pulse">
                REC
              </span>
            </div>
            
            {/* Camera Video Simulator with Hologram Scanning Overlay */}
            <div className="relative aspect-video bg-black flex items-center justify-center hologram-scanline">
              {/* Grid scanning lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40"></div>
              
              <div className="text-center space-y-2.5 z-10">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center mx-auto bg-white/5 animate-pulse cursor-pointer">
                  <Play size={14} className="text-white fill-white ml-0.5" />
                </div>
                <span className="block text-[10px] text-cyber-muted font-mono uppercase tracking-widest">Connect Feed Camera #1</span>
              </div>
              
              <div className="absolute bottom-2 left-2 text-[9px] font-mono text-cyber-orange bg-black/60 px-1.5 py-0.5 rounded">
                CAM_1_DRIVEWAY_ONLINE
              </div>
            </div>
          </div>

          {/* Connected Automations */}
          <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
            <h3 className="font-semibold text-sm text-slate-100">IoT Automation Link</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-slate-200">Sleep Mode Shut Down</p>
                  <p className="text-[10px] text-cyber-muted mt-0.5">Turn off lights when sleep begins.</p>
                </div>
                <input
                  type="checkbox"
                  checked={automationActive}
                  onChange={(e) => setAutomationActive(e.target.checked)}
                  className="w-4.5 h-4.5 accent-cyber-orange rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4">
                <div>
                  <p className="font-semibold text-slate-200">Security Panic Lock</p>
                  <p className="text-[10px] text-cyber-muted mt-0.5">Secure locks on alarm activation.</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="w-4.5 h-4.5 accent-cyber-orange rounded opacity-50"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
