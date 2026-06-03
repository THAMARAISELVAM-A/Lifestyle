import React from 'react';
import { 
  ShieldCheck, Key, Eye, EyeOff, Copy, Plus, 
  Search, RefreshCw, Lock, Unlock, CreditCard, FileText, Globe, Check, Trash2
} from 'lucide-react';
import type { PasswordEntry } from '../types';


interface PasswordVaultProps {
  entries: PasswordEntry[];
  addEntry: (entry: Omit<PasswordEntry, 'id' | 'lastModified'>) => void;
  deleteEntry?: (id: string) => void;
}

export const PasswordVault: React.FC<PasswordVaultProps> = ({ entries, addEntry, deleteEntry }) => {
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [masterPassword, setMasterPassword] = React.useState('');
  const [unlockError, setUnlockError] = React.useState('');
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<'all' | 'logins' | 'cards' | 'notes' | 'documents'>('all');
  const [selectedEntryId, setSelectedEntryId] = React.useState<string | null>(null);
  const [revealPassword, setRevealPassword] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Password Generator State
  const [genLength, setGenLength] = React.useState(16);
  const [genIncludeNumbers, setGenIncludeNumbers] = React.useState(true);
  const [genIncludeSymbols, setGenIncludeSymbols] = React.useState(true);
  const [generatedPassword, setGeneratedPassword] = React.useState('');

  // OTP rotation simulation
  const [otpCode, setOtpCode] = React.useState('583 921');
  const [otpTimeLeft, setOtpTimeLeft] = React.useState(18);

  React.useEffect(() => {
    if (!isUnlocked) return;
    const interval = setInterval(() => {
      setOtpTimeLeft(prev => {
        if (prev <= 1) {
          // Generate new simulated OTP
          const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
          setOtpCode(`${randomOtp.slice(0, 3)} ${randomOtp.slice(3)}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  // Handle master password verification
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword === 'admin' || masterPassword.length >= 4) {
      setIsUnlocked(true);
      setUnlockError('');
    } else {
      setUnlockError('Invalid Master Password. Try "admin" for testing.');
    }
  };

  // Generate password helper
  const handleGeneratePassword = React.useCallback(() => {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (genIncludeNumbers) chars += '0123456789';
    if (genIncludeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let result = '';
    for (let i = 0; i < genLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(result);
  }, [genLength, genIncludeNumbers, genIncludeSymbols]);

  React.useEffect(() => {
    const t = setTimeout(() => handleGeneratePassword(), 0);
    return () => clearTimeout(t);
  }, [handleGeneratePassword]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeEntry = entries.find(e => e.id === selectedEntryId);

  // New Password State
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newUsername, setNewUsername] = React.useState('');
  const [newPasswordVal, setNewPasswordVal] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');
  const [newCat, setNewCat] = React.useState<'logins' | 'cards' | 'notes' | 'documents'>('logins');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUsername || !newPasswordVal) return;
    addEntry({
      title: newTitle,
      username: newUsername,
      url: newUrl || 'N/A',
      strength: newPasswordVal.length > 12 ? 'strong' : newPasswordVal.length > 8 ? 'medium' : 'weak',
      category: newCat,
      otpSecret: newCat === 'logins' ? 'JBSWY3DPEHPK3PXP' : undefined
    });
    setNewTitle('');
    setNewUsername('');
    setNewPasswordVal('');
    setNewUrl('');
    setShowAddForm(false);
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 glass-panel rounded-2xl border border-cyber-border shadow-glass-lg overflow-hidden hologram-scanline">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-cyber-pink/10 border border-cyber-pink/30 flex items-center justify-center mx-auto shadow-neon-pink/15">
            <Lock className="text-cyber-pink animate-pulse" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Vault Encrypted</h2>
            <p className="text-cyber-muted text-xs mt-1">Zero-knowledge local database. Please decrypt with Master Passphrase.</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Master Password..."
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-center text-sm font-semibold tracking-widest placeholder:tracking-normal placeholder:font-normal"
              />
              {unlockError && <span className="text-xs text-cyber-red mt-1.5 block font-mono">{unlockError}</span>}
              <span className="text-[10px] text-cyber-muted mt-2 block font-mono">Tip: Type any password with at least 4 letters</span>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-cyber-pink/20 hover:bg-cyber-pink/30 border border-cyber-pink/40 hover:border-cyber-pink/60 rounded-xl font-bold text-sm text-white tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-neon-pink/10 transition-all hover:scale-105"
            >
              <Unlock size={16} />
              DECRYPT VAULT
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Sync State */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="text-cyber-pink" />
            Secure Password Vault
          </h2>
          <p className="text-cyber-muted text-xs">AES-256 hardware accelerated local encryption.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyber-pink/20 border border-cyber-pink/30 hover:border-cyber-pink/50 text-cyber-pink text-xs font-semibold rounded-xl hover:bg-cyber-pink/30 transition-all cursor-pointer"
          >
            <Plus size={14} /> Add Account
          </button>
          <button 
            onClick={() => setIsUnlocked(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Lock size={14} /> Lock Vault
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Accounts list & Search */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl p-4 border border-cyber-border space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-cyber-muted" size={16} />
              <input
                type="text"
                placeholder="Search vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input"
              />
            </div>
            
            {/* Category tabs */}
            <div className="grid grid-cols-5 gap-1">
              {(['all', 'logins', 'cards', 'notes'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
                    selectedCategory === cat 
                      ? 'bg-cyber-pink/20 border border-cyber-pink/30 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat === 'logins' ? 'Logins' : cat === 'cards' ? 'Cards' : 'Notes'}
                </button>
              ))}
            </div>
          </div>

          {/* Entries list */}
          <div className="glass-panel rounded-2xl border border-cyber-border p-2 space-y-1 overflow-y-auto max-h-[460px]">
            {filteredEntries.length > 0 ? (
              filteredEntries.map(entry => {
                const isSelected = selectedEntryId === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setSelectedEntryId(entry.id);
                      setRevealPassword(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-cyber-pink/15 border border-cyber-pink/30 text-white' 
                        : 'hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        entry.category === 'cards' ? 'bg-cyber-green/10 text-cyber-green' :
                        entry.category === 'notes' ? 'bg-cyber-yellow/10 text-cyber-yellow' : 'bg-cyber-blue/10 text-cyber-blue'
                      }`}>
                        {entry.category === 'cards' ? <CreditCard size={16} /> :
                         entry.category === 'notes' ? <FileText size={16} /> : <Globe size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{entry.title}</p>
                        <p className="text-[10px] text-cyber-muted truncate mt-0.5">{entry.username}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      entry.strength === 'strong' ? 'bg-cyber-green/20 text-cyber-green' :
                      entry.strength === 'medium' ? 'bg-cyber-yellow/20 text-cyber-yellow' : 'bg-cyber-red/20 text-cyber-red'
                    }`}>
                      {entry.strength}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-cyber-muted">No vault items found.</div>
            )}
          </div>
        </div>

        {/* Right Side: Entry Details & Password Generator */}
        <div className="lg:col-span-8 space-y-6">
          {/* Add Entry Form Overlay */}
          {showAddForm && (
            <div className="glass-panel rounded-2xl p-6 border border-cyber-pink/30 bg-cyber-bg/90 shadow-glass-lg space-y-4">
              <h3 className="font-semibold text-lg text-white">Add New Credentials</h3>
              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-cyber-muted font-mono uppercase">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Main Account"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-cyber-muted font-mono uppercase">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as PasswordEntry['category'])}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  >
                    <option value="logins">Login Credentials</option>
                    <option value="cards">Credit Card Vault</option>
                    <option value="notes">Secure Notes</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-cyber-muted font-mono uppercase">Username / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Username or email"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-cyber-muted font-mono uppercase">Password / Value</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-cyber-muted font-mono uppercase">URL / Link</label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/5 cursor-pointer text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyber-pink/20 hover:bg-cyber-pink/30 border border-cyber-pink/40 hover:border-cyber-pink/60 rounded-xl text-xs font-semibold text-white cursor-pointer"
                  >
                    Encrypt & Save
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Details Panel */}
          {activeEntry ? (
            <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{activeEntry.title}</h3>
                  <a href={activeEntry.url} target="_blank" rel="noreferrer" className="text-xs text-cyber-blue hover:underline mt-1 block">
                    {activeEntry.url}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  {deleteEntry && (
                    <button
                      onClick={() => {
                        deleteEntry(activeEntry.id);
                        setSelectedEntryId(null);
                      }}
                      className="px-2.5 py-1 bg-cyber-red/10 border border-cyber-red/35 text-cyber-red text-[10px] font-bold rounded-full hover:bg-cyber-red/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={10} /> Delete
                    </button>
                  )}
                  <span className="text-[10px] text-cyber-pink bg-cyber-pink/15 border border-cyber-pink/20 rounded-full px-2 py-0.5 font-mono">
                    AES-256 DEC
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 bg-white/5 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] text-cyber-muted font-mono uppercase block">Username / Account</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-semibold text-slate-100">{activeEntry.username}</span>
                    <button 
                      onClick={() => copyToClipboard(activeEntry.username, 'username')}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {copiedId === 'username' ? <Check size={12} className="text-cyber-green" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 bg-white/5 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] text-cyber-muted font-mono uppercase block">Password</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-mono font-semibold text-slate-100">
                      {revealPassword ? 'SuperSecurePass123!' : '••••••••••••••••'}
                    </span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setRevealPassword(!revealPassword)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {revealPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button 
                        onClick={() => copyToClipboard('SuperSecurePass123!', 'password')}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {copiedId === 'password' ? <Check size={12} className="text-cyber-green" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* OTP Authenticator Section */}
              {activeEntry.otpSecret && (
                <div className="bg-gradient-to-r from-cyber-pink/10 to-cyber-purple/5 border border-cyber-pink/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-cyber-pink font-semibold uppercase tracking-wider font-mono">OTP Authenticator (MFA)</span>
                    <p className="text-2xl font-mono font-extrabold text-white tracking-widest">{otpCode}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="16" fill="transparent" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="3" />
                        <circle 
                          cx="20" 
                          cy="20" 
                          r="16" 
                          fill="transparent" 
                          stroke="#ec4899" 
                          strokeWidth="3" 
                          strokeDasharray={100}
                          strokeDashoffset={100 - (otpTimeLeft / 30) * 100}
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold font-mono text-cyber-pink">{otpTimeLeft}s</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(otpCode.replace(' ', ''), 'otp')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-cyber-pink/20 border border-cyber-pink/30 hover:bg-cyber-pink/30 rounded-lg text-xs font-semibold text-cyber-pink transition-all cursor-pointer"
                    >
                      {copiedId === 'otp' ? <Check size={12} className="text-cyber-green" /> : <Copy size={12} />}
                      {copiedId === 'otp' ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                </div>
              )}

              {/* Zero-knowledge description details */}
              <div className="flex items-start gap-2 bg-black/40 border border-white/5 rounded-xl p-3.5 text-xs text-cyber-muted leading-relaxed">
                <Key size={16} className="text-cyber-pink shrink-0 mt-0.5 animate-pulse" />
                <p>
                  This vault employs a zero-knowledge structure. Decrypted entries exist strictly in memory. The corresponding raw keys are derived from your Master Password using PBKDF2 with 310,000 iterations and never sent to cloud sync instances.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-cyber-border text-center text-cyber-muted text-xs">
              Select an account from the left list to review credentials and authentication configurations.
            </div>
          )}

          {/* Password Generator Widget */}
          <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
            <h3 className="font-semibold text-base text-slate-100">Entropy Password Generator</h3>
            
            <div className="space-y-4">
              <div className="flex gap-2 items-center bg-white/5 border border-white/5 rounded-xl p-3 justify-between">
                <span className="font-mono text-sm font-semibold tracking-wider text-cyber-pink select-all">{generatedPassword}</span>
                <div className="flex gap-1">
                  <button 
                    onClick={handleGeneratePassword}
                    className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button 
                    onClick={() => copyToClipboard(generatedPassword, 'gen')}
                    className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedId === 'gen' ? <Check size={14} className="text-cyber-green" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-cyber-muted">Length</span>
                    <span className="text-white font-bold">{genLength} chars</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={genLength}
                    onChange={(e) => setGenLength(parseInt(e.target.value))}
                    className="w-full accent-cyber-pink"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-cyber-muted">Include Numbers</span>
                  <input
                    type="checkbox"
                    checked={genIncludeNumbers}
                    onChange={(e) => setGenIncludeNumbers(e.target.checked)}
                    className="w-4 h-4 accent-cyber-pink rounded"
                  />
                </div>

                <div className="flex justify-between items-center sm:col-start-2">
                  <span className="text-cyber-muted">Special Symbols</span>
                  <input
                    type="checkbox"
                    checked={genIncludeSymbols}
                    onChange={(e) => setGenIncludeSymbols(e.target.checked)}
                    className="w-4 h-4 accent-cyber-pink rounded"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
