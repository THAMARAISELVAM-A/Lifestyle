import React from 'react';
import { AuthService } from '../services/auth';
import { ShieldCheck, Mail, Lock, User, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  onSuccess: () => void;
  onClose?: () => void;
  canCancel?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose, canCancel = false }) => {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const res = await AuthService.signUp(email, password, name);
        if (res.success) {
          onSuccess();
        } else {
          setError(res.error || 'Registration failed.');
        }
      } else {
        const res = await AuthService.signIn(email, password);
        if (res.success) {
          onSuccess();
        } else {
          setError(res.error || 'Authentication failed. Check credentials.');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    AuthService.setGuest();
    onSuccess();
  };

  const handleSandboxLogin = async () => {
    setLoading(true);
    setError(null);
    const demoEmail = 'admin@gmail.com';
    const demoPassword = 'admin@123';
    const demoName = 'System Admin';

    try {
      // First try to sign in
      const res = await AuthService.signIn(demoEmail, demoPassword);
      if (res.success) {
        onSuccess();
        return;
      }
      
      // If it fails, attempt to register the demo profile
      const signupRes = await AuthService.signUp(demoEmail, demoPassword, demoName);
      if (signupRes.success) {
        onSuccess();
      } else {
        setError(signupRes.error || 'Failed to auto-provision sandbox account.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during sandbox provision.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      {/* Background Neon Glows */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyber-purple/10 blur-[120px] top-1/4 left-1/4 animate-pulse-slow"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyber-blue/10 blur-[120px] bottom-1/4 right-1/4"></div>

      <div className="glass-panel border border-cyber-border w-full max-w-md p-8 relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Top Scanner Overlay */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-purple to-transparent animate-pulse-slow"></div>

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyber-purple via-cyber-blue to-cyber-green p-0.5 shadow-neon-purple flex items-center justify-center mb-4">
            <div className="w-full h-full rounded-2xl bg-cyber-bg flex items-center justify-center">
              <ShieldCheck className="text-cyber-purple w-8 h-8 animate-pulse-slow" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            MyLife OS <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20">NEURAL LINK</span>
          </h2>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {isSignUp ? 'Initialize a new decentralized cloud profile' : 'Link your local terminal to the Neon secure database'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-cyber-red/10 border border-cyber-red/30 text-cyber-red text-xs font-mono leading-relaxed">
            <span className="font-bold mr-1">ERROR_CODE [AUTH_ERR]:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-cyber-muted uppercase tracking-wider font-mono">Profile Owner Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-cyber-border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple/30 transition-all font-sans"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-cyber-muted uppercase tracking-wider font-mono">Neural Interface Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-cyber-border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple/30 transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-cyber-muted uppercase tracking-wider font-mono">Secure Access Key</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="w-full pl-10 pr-12 py-2.5 bg-black/30 border border-cyber-border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple/30 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-cyber-purple transition-colors cursor-pointer"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyber-purple to-cyber-blue hover:from-cyber-purple/90 hover:to-cyber-blue/90 text-white font-bold text-sm tracking-wider uppercase font-mono shadow-lg shadow-cyber-purple/20 hover:shadow-cyber-purple/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>LINKING CHANNELS...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{isSignUp ? 'INITIALIZE LINK' : 'INITIATE SECURE LINK'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSandboxLogin}
            disabled={loading}
            className="w-full mt-3 py-2.5 px-4 rounded-xl bg-cyber-purple/10 hover:bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/20 hover:border-cyber-purple/40 font-bold text-xs tracking-wider uppercase font-mono transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck size={14} className="text-cyber-purple animate-pulse" />
            <span>Auto-Provision Demo Profile</span>
          </button>
          <p className="text-[9px] text-center text-slate-500 font-mono mt-1.5 leading-normal">
            Logs in or registers a test cloud profile (<code className="text-cyber-purple">admin@gmail.com</code>) in your Neon Database automatically.
          </p>
        </form>

        <div className="mt-4 flex flex-col gap-3 items-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-cyber-blue hover:text-cyber-cyan font-mono transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already linked? Sign in here' : 'Need a new profile? Register here'}
          </button>

          <div className="w-full flex items-center gap-3 my-2">
            <div className="flex-1 h-[1px] bg-cyber-border"></div>
            <span className="text-[10px] text-slate-500 font-mono">OR</span>
            <div className="flex-1 h-[1px] bg-cyber-border"></div>
          </div>

          <button
            type="button"
            onClick={handleGuestMode}
            className="text-xs text-cyber-green hover:underline font-mono transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Launch Offline Terminal (Guest Mode)</span>
          </button>

          {canCancel && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
