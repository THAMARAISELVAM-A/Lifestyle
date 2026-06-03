import React from 'react';
import type { ToastItem } from '../hooks/useToast';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let typeStyles: string;
        let Icon: typeof Info;

        switch (toast.type) {
          case 'success':
            typeStyles = 'border-cyber-green/45 shadow-neon-green bg-cyber-green/10 text-white';
            Icon = CheckCircle;
            break;
          case 'warning':
            typeStyles = 'border-cyber-yellow/45 shadow-[0_0_15px_rgba(234,179,8,0.2)] bg-cyber-yellow/10 text-white';
            Icon = AlertCircle;
            break;
          case 'error':
            typeStyles = 'border-cyber-red/45 shadow-[0_0_15px_rgba(239,68,68,0.25)] bg-cyber-red/10 text-white';
            Icon = XCircle;
            break;
          case 'info':
          default:
            typeStyles = 'border-cyber-purple/45 shadow-neon-purple bg-cyber-purple/10 text-white';
            Icon = Info;
        }

        return (
          <div
            key={toast.id}
            className={`glass-panel border p-4 rounded-xl flex items-start gap-3 shadow-lg pointer-events-auto transition-all duration-300 transform translate-x-0 animate-slide-in relative overflow-hidden ${typeStyles}`}
            style={{
              animation: 'toast-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* Ambient scanner glow bar */}
            <div className={`absolute top-0 left-0 bottom-0 w-[3px] ${
              toast.type === 'success' ? 'bg-cyber-green' :
              toast.type === 'warning' ? 'bg-cyber-yellow' :
              toast.type === 'error' ? 'bg-cyber-red' : 'bg-cyber-purple'
            }`} />

            <span className={`mt-0.5 ${
              toast.type === 'success' ? 'text-cyber-green' :
              toast.type === 'warning' ? 'text-cyber-yellow' :
              toast.type === 'error' ? 'text-cyber-red' : 'text-cyber-purple'
            }`}>
              <Icon size={18} />
            </span>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold font-mono tracking-wide uppercase">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => onRemove(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
