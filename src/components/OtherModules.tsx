import React from 'react';
import { 
  BookOpen, Plus, Search, Link as LinkIcon, FileText, Scan, 
  MessageSquare, User, Zap, AlertTriangle, Play, ShieldAlert,
  PhoneCall, Dumbbell, Apple, Fingerprint, Key,
  HardDrive, Folder, Lock, Unlock, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NeonDB } from '../services/db';
import type { Message, CloudFile, AutomationRule } from '../types';

interface OtherModulesProps {
  activeTab: string;
  messages: Message[];
  markMessageRead: (id: string) => void;
  files: CloudFile[];
  toggleFileEncryption: (id: string) => void;
  automations: AutomationRule[];
  toggleAutomation: (id: string) => void;
  runAutomation: (id: string) => void;
}

export const OtherModules: React.FC<OtherModulesProps> = ({
  activeTab,
  messages,
  markMessageRead,
  files,
  toggleFileEncryption,
  automations,
  toggleAutomation,
  runAutomation
}) => {
  const { isAuthenticated, user } = useAuth();   // ← auth context
  const [toast, setToast] = React.useState<string | null>(null);
  const [notesLoaded, setNotesLoaded] = React.useState(false);  // ← guard against double-load

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- SECOND BRAIN KNOWLEDGE MODULE STATE ---
  const [notes, setNotes] = React.useState([
    { id: '1', title: 'LifeOS System Roadmap', content: 'Integrating ollama local services and setting up the postgres docker databases. Remember to keep keys under the secure local credentials vault.', lastModified: 'May 20' },
    { id: '2', title: 'Weekly Gym split notes', content: 'Push, Pull, Legs routine. High intensity focus. Combine with calorie tracking target of 2,400 kcal per day for hypertrophy goals.', lastModified: 'May 19' },
    { id: '3', title: 'Tax deduction list', content: 'Scan all receipts for cloud servers, travel, and internet configurations to use during tax computations next year.', lastModified: 'May 15' }
  ]);
  const [selectedNoteId, setSelectedNoteId] = React.useState<string>('1');
  const [noteSearch, setNoteSearch] = React.useState('');
  const activeNote = notes.find(n => n.id === selectedNoteId);

  // Load persisted notes from Neon DB once on mount (authenticated users only)
  React.useEffect(() => {
    let cancelled = false;
    async function loadNotes() {
      if (!isAuthenticated || !user?.id || notesLoaded) return;
      try {
        // @ts-expect-error NeonDB.getAll for dynamic table name — DB service types don't include knowledge_notes yet
        const rows = await NeonDB.getAll<NoteRecord>('knowledge_notes', user.id);
        if (cancelled) return;
        if (rows.length > 0) {
          setNotes(rows.map((r: NoteRecord, idx: number) => ({
            id: r.id ?? `n_${idx}`,
            title: r.title ?? 'Untitled',
            content: r.content ?? '',
            lastModified: r.updated_at ? new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now',
          })));
        }
        setNotesLoaded(true);
      } catch {
        // Keep seed state silently
      }
    }
    loadNotes();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Persist edited note to Neon (debounced 2 s)
  React.useEffect(() => {
    if (!isAuthenticated || !user?.id || !notesLoaded) return;
    const active = notes.find(n => n.id === selectedNoteId);
    if (!active) return;
    const timer = setTimeout(() => {
      // Upsert: insert or update the note in Neon
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        NeonDB.insert('knowledge_notes', {
          user_id: user!.id,
          id: active.id,
          title: active.title,
          content: active.content,
          category: 'general',
          tags: [],
          pinned: false,
        } as any) // NeonDB insert does not fully include knowledge_notes in its TSL cleanup
        .catch(() => {});
      } catch { /* best-effort */ }
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, selectedNoteId, isAuthenticated, user?.id, notesLoaded]);

  // Minimal interpersonal note record for DB round-trips
  interface NoteRecord { id: string; title: string; content: string; category?: string; tags: string[]; pinned: boolean; updated_at?: string; created_at?: string; }

  const handleEditNote = (val: string) => {
    setNotes(prev => prev.map(n => n.id === selectedNoteId ? { ...n, content: val, lastModified: 'Just now' } : n));
  };

  const handleAddNote = () => {
    const id = Date.now().toString();
    const newNote = {
      id,
      title: 'New Second Brain Entry',
      content: 'Start writing...',
      lastModified: 'Just now'
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(id);
  };

  // --- DOCUMENT VAULT STATE ---
  const [documents, setDocuments] = React.useState([
    { id: 'd1', name: 'Driver_License_2026.pdf', type: 'License', date: 'May 10', summary: 'Class C Driver License for Alex Mercer. Expires 2030.', text: 'ALEX MERCER • LIC NO: 92834-CA • CLASS: C • DOB: 1996-04-12 • EYE: BLU • HAIR: BRN', scanned: false },
    { id: 'd2', name: 'Apartment_Lease_Contract.pdf', type: 'Contract', date: 'May 02', summary: 'Residential lease agreement for Apt 4B. Rent is $1,800/mo due on 1st.', text: 'LEASE AGREEMENT • LANDLORD: METRO RENTALS • TENANT: ALEX MERCER • DEPOSIT: $1,800', scanned: false },
    { id: 'd3', name: 'Health_Insurance_Card.pdf', type: 'Medical', date: 'Apr 24', summary: 'Blue Shield PPO health benefits plan details and copays.', text: 'BLUE SHIELD OF CA • PLAN: PPO PREFERRED • MEMBER ID: BSC928310 • RX GROUP: 92834', scanned: false }
  ]);
  const [selectedDocId, setSelectedDocId] = React.useState('d1');
  const [scanningId, setScanningId] = React.useState<string | null>(null);
  const activeDoc = documents.find(d => d.id === selectedDocId);

  const runOCR = (id: string) => {
    setScanningId(id);
    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, scanned: true } : d));
      setScanningId(null);
      triggerToast('OCR Scan Completed! Text indexed successfully.');
    }, 2000);
  };

  // --- SOCIAL MESSAGING STATE ---
  const [selectedMsgId, setSelectedMsgId] = React.useState<string | null>(messages[0]?.id || null);
  const activeMsg = messages.find(m => m.id === selectedMsgId);

  const sendQuickReply = (reply: string) => {
    if (activeMsg) {
      markMessageRead(activeMsg.id);
      triggerToast(`Replied to ${activeMsg.sender}: "${reply}"`);
    }
  };

  // --- EMERGENCY SYSTEM STATE ---
  const [sosCountdown, setSosCountdown] = React.useState<number | null>(null);

  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (sosCountdown !== null && sosCountdown > 0) {
      timer = setInterval(() => {
        setSosCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (sosCountdown === 0) {
      triggerToast('SOS Broadcast Transmitted to Emergency Contacts!');
      setSosCountdown(null);
    }
    return () => clearInterval(timer);
  }, [sosCountdown]);

  // --- FITNESS COACH STATE ---
  const [goal, setGoal] = React.useState<'hypertrophy' | 'shred' | 'maintenance'>('hypertrophy');
  const [weight, setWeight] = React.useState(78); // kg

  const fitnessPlans = {
    hypertrophy: {
      workout: 'Push (Chest/Triceps) • Pull (Back/Biceps) • Legs (Quads/Calves) • Rest • Repeat',
      meal: 'Bulking Mode: 2,900 kcal • 170g Protein • 340g Carbs • 80g Fat',
      supps: '5g Creatine Monohydrate daily, Whey protein post-workout'
    },
    shred: {
      workout: 'Upper/Lower Split + 20-min cardio focus blocks twice a week',
      meal: 'Shred Mode: 1,950 kcal • 165g Protein • 180g Carbs • 60g Fat',
      supps: 'Caffeine pre-workout, L-Carnitine, Multivitamins'
    },
    maintenance: {
      workout: 'Full Body workout split (3x per week) + light active recoveries',
      meal: 'Balanced Mode: 2,350 kcal • 150g Protein • 260g Carbs • 70g Fat',
      supps: 'Omega-3 Fish Oils, Vitamin D3 + K2'
    }
  };

  const currentPlan = fitnessPlans[goal];

  // --- DIGITAL IDENTITY STATE ---
  const [apiKeys, setApiKeys] = React.useState([
    { name: 'Ollama Local Integration', key: 'sk_ollama_••••••••••48c2', active: true },
    { name: 'Smart Home Hub Sync', key: 'sk_shhome_••••••••••92a1', active: true }
  ]);
  const sessions = [
    { device: 'iPhone 15 Pro (Client)', ip: '192.168.1.48', location: 'Home Network', active: 'Active now' },
    { device: 'Macbook Pro 16 (Workspace)', ip: '192.168.1.102', location: 'Home Network', active: '2 hours ago' }
  ];

  const handleGenerateApiKey = () => {
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = {
      name: 'Custom LifeOS API Key',
      key: `sk_custom_••••••••••${randomHex.slice(-4)}`,
      active: true
    };
    setApiKeys([...apiKeys, newKey]);
    triggerToast('New API Integration Token Created.');
  };

  // --- RENDER SELECTION HANDLER ---
  return (
    <div className="relative">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel border-glow-purple px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-glass-lg animate-bounce">
          <ShieldCheck className="text-cyber-purple" size={18} />
          <span className="text-xs font-semibold text-white">{toast}</span>
        </div>
      )}

      {/* 1. KNOWLEDGE SECOND BRAIN */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <BookOpen className="text-cyber-purple" />
                Second Brain Knowledge
              </h2>
              <p className="text-cyber-muted text-xs">Wiki index, automatic note connections, and local search storage.</p>
            </div>
            <button 
              onClick={handleAddNote}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyber-purple/20 border border-cyber-purple/30 text-cyber-purple text-xs font-semibold rounded-xl hover:bg-cyber-purple/30 transition-all cursor-pointer"
            >
              <Plus size={14} /> New Note
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Note search and lists */}
            <div className="lg:col-span-4 glass-panel rounded-2xl p-4 border border-cyber-border space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-cyber-muted" size={16} />
                <input
                  type="text"
                  placeholder="Search second brain..."
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input"
                />
              </div>

              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                {notes.filter(n => n.title.toLowerCase().includes(noteSearch.toLowerCase())).map(note => (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`w-full flex justify-between items-center p-3 rounded-xl text-left transition-all cursor-pointer ${
                      selectedNoteId === note.id 
                        ? 'bg-cyber-purple/15 border border-cyber-purple/30 text-white' 
                        : 'hover:bg-white/5 text-slate-400 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{note.title}</p>
                      <p className="text-[9px] text-cyber-muted truncate mt-0.5">{note.content}</p>
                    </div>
                    <span className="text-[9px] font-mono text-cyber-muted shrink-0 ml-2">{note.lastModified}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note Editor */}
            <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
              {activeNote ? (
                <>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setNotes(prev => prev.map(n => n.id === selectedNoteId ? { ...n, title: newTitle } : n));
                      }}
                      className="bg-transparent border-none text-lg font-bold text-white focus:outline-none w-full"
                    />
                    <span className="text-[9px] font-mono text-cyber-purple bg-cyber-purple/10 border border-cyber-purple/20 px-2 py-0.5 rounded shrink-0">
                      Sync Local Wiki
                    </span>
                  </div>
                  
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleEditNote(e.target.value)}
                    className="w-full min-h-[250px] bg-transparent border-none focus:outline-none text-xs text-slate-300 resize-none leading-relaxed"
                  />

                  {/* AI Note Connections */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <span className="text-[10px] text-cyber-purple font-semibold font-mono uppercase tracking-wider block">
                      AI Automatic Note Backlinks
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-slate-300">
                        <LinkIcon size={10} className="text-cyber-purple" />
                        Links to: Gym split notes
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-slate-300">
                        <LinkIcon size={10} className="text-cyber-purple" />
                        Related: Secure credentials vault
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-cyber-muted">Select a note or create a new one.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DOCUMENT VAULT */}
      {activeTab === 'docs' && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileText className="text-cyber-cyan" />
              Secure Document Vault
            </h2>
            <p className="text-cyber-muted text-xs">Repository for contracts, licenses, health papers with AI summarizing.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Document List */}
            <div className="lg:col-span-4 glass-panel rounded-2xl p-4 border border-cyber-border space-y-2 max-h-[460px] overflow-y-auto">
              {documents.map(doc => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-cyber-cyan/15 border border-cyber-cyan/30 text-white' 
                        : 'hover:bg-white/5 text-slate-400 border border-transparent'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{doc.name}</p>
                      <p className="text-[9px] text-cyber-muted truncate mt-0.5">{doc.type} • {doc.date}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Document Scan View */}
            <div className="lg:col-span-8 space-y-6">
              {activeDoc ? (
                <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-5">
                  <div className="flex justify-between items-start border-b border-white/5 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{activeDoc.name}</h3>
                      <p className="text-[10px] text-cyber-cyan font-mono uppercase mt-0.5">Namespace: {activeDoc.type}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => runOCR(activeDoc.id)}
                        disabled={scanningId !== null || activeDoc.scanned}
                        className={`flex items-center gap-1 px-3 py-1.5 bg-cyber-cyan/20 border border-cyber-cyan/30 hover:border-cyber-cyan/50 text-cyber-cyan text-xs font-semibold rounded-lg hover:bg-cyber-cyan/30 transition-all cursor-pointer ${
                          scanningId === activeDoc.id ? 'animate-pulse' : ''
                        }`}
                      >
                        <Scan size={12} />
                        {scanningId === activeDoc.id ? 'OCR Scanning...' : activeDoc.scanned ? 'OCR Indexed' : 'OCR Scan Document'}
                      </button>
                    </div>
                  </div>

                  {/* AI Summary Card */}
                  <div className="bg-gradient-to-r from-cyber-cyan/10 to-cyber-blue/5 border border-cyber-cyan/20 rounded-xl p-4 space-y-2">
                    <span className="text-[9px] text-cyber-cyan font-bold uppercase tracking-wider font-mono">AI Contract Summary</span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{activeDoc.summary}</p>
                  </div>

                  {/* Raw OCR Text output */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-cyber-muted font-mono uppercase tracking-wider">Raw OCR Decoded Text Output</span>
                    <div className="bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-slate-300 leading-normal min-h-[100px] flex items-center justify-center">
                      {scanningId === activeDoc.id ? (
                        <div className="text-center space-y-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-ping inline-block"></span>
                          <span className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-widest">Running OCR Engine...</span>
                        </div>
                      ) : activeDoc.scanned ? (
                        <span className="select-all block w-full">{activeDoc.text}</span>
                      ) : (
                        <div className="text-center">
                          <p className="text-cyber-muted">No OCR telemetry indexed.</p>
                          <button 
                            onClick={() => runOCR(activeDoc.id)} 
                            className="mt-2 text-[10px] text-cyber-cyan underline hover:text-white cursor-pointer"
                          >
                            Click here to perform hardware-accelerated scan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-8 border border-cyber-border text-center text-cyber-muted text-xs">
                  Select a document from the left folder directory.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SOCIAL HUB */}
      {activeTab === 'social' && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <MessageSquare className="text-cyber-blue" />
              Unified Social Messaging
            </h2>
            <p className="text-cyber-muted text-xs">Aggregated messaging stream for Email, WhatsApp, Discord, and SMS notifications.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Message thread */}
            <div className="lg:col-span-5 glass-panel rounded-2xl p-4 border border-cyber-border space-y-2 max-h-[460px] overflow-y-auto">
              {messages.map(msg => {
                const isSelected = selectedMsgId === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={() => {
                      setSelectedMsgId(msg.id);
                      markMessageRead(msg.id);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-cyber-blue/15 border border-cyber-blue/30 text-white' 
                        : 'hover:bg-white/5 text-slate-400 border border-transparent'
                    } ${!msg.read ? 'border-l-2 border-l-cyber-blue' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-300">{msg.sender.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline">
                        <p className="text-xs font-semibold text-white truncate">{msg.sender}</p>
                        <span className="text-[8px] font-mono text-cyber-muted">{msg.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-cyber-muted truncate mt-0.5">{msg.content}</p>
                      <span className="text-[8px] font-mono uppercase tracking-widest text-cyber-blue mt-1 inline-block">
                        {msg.platform}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Message Details & AI Reply */}
            <div className="lg:col-span-7">
              {activeMsg ? (
                <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center text-cyber-blue">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{activeMsg.sender}</h3>
                        <span className="text-[9px] text-cyber-muted font-mono uppercase tracking-widest">{activeMsg.platform} channel</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      activeMsg.priority === 'high' ? 'bg-cyber-red/20 text-cyber-red' : 'bg-white/5 text-slate-400'
                    }`}>
                      {activeMsg.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>

                  {/* Message body */}
                  <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-medium">
                    {activeMsg.content}
                  </div>

                  {/* AI Summary */}
                  {activeMsg.summary && (
                    <div className="bg-cyber-blue/5 border border-cyber-blue/20 rounded-xl p-3.5 space-y-1.5">
                      <span className="text-[9px] text-cyber-blue font-bold uppercase tracking-wider font-mono">AI Message Digest</span>
                      <p className="text-xs text-slate-300 leading-normal">{activeMsg.summary}</p>
                    </div>
                  )}

                  {/* Quick replies */}
                  {activeMsg.suggestedReplies && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[9px] text-cyber-muted font-mono uppercase tracking-wider">AI Suggested Quick Replies</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeMsg.suggestedReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendQuickReply(reply)}
                            className="text-left text-xs p-2.5 rounded-xl bg-white/5 hover:bg-cyber-blue/10 border border-white/5 hover:border-cyber-blue/30 text-slate-300 hover:text-white transition-all cursor-pointer truncate"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-8 border border-cyber-border text-center text-cyber-muted text-xs">
                  Select a message from the thread.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. WORKFLOW AUTOMATION ENGINE */}
      {activeTab === 'automation' && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Zap className="text-cyber-green animate-pulse" />
              AI Automation Engine
            </h2>
            <p className="text-cyber-muted text-xs">Zapier-like automated trigger workflows linked to your digital life apps.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Automations list */}
            <div className="lg:col-span-2 space-y-4">
              {automations.map(rule => (
                <div 
                  key={rule.id}
                  className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    rule.active ? 'border-cyber-green/30 bg-cyber-green/3' : 'border-cyber-border'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{rule.name}</h4>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        rule.active ? 'bg-cyber-green/20 text-cyber-green' : 'bg-white/10 text-slate-400'
                      }`}>
                        {rule.active ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-cyber-muted">
                      <span className="text-cyan-300">Trigger:</span> {rule.trigger}
                      <span className="text-slate-500">→</span>
                      <span className="text-cyber-purple">Action:</span> {rule.action}
                    </div>
                    {rule.lastTriggered && (
                      <p className="text-[9px] text-cyber-muted font-mono">Last Triggered: {rule.lastTriggered}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button 
                      onClick={() => {
                        runAutomation(rule.id);
                        triggerToast(`Running workflow: ${rule.name}`);
                      }}
                      disabled={!rule.active}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-50 cursor-pointer"
                      title="Run workflow manual override"
                    >
                      <Play size={14} />
                    </button>
                    <button
                      onClick={() => toggleAutomation(rule.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer transition-all ${
                        rule.active 
                          ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30' 
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rule.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Automation Info widget */}
            <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1">
                <AlertTriangle className="text-cyber-yellow" size={16} />
                Telemetry Stats
              </h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-cyber-muted">Total Active Triggers</span>
                  <span className="font-mono font-bold text-white">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-muted">Successful Runs (24h)</span>
                  <span className="font-mono font-bold text-cyber-green">18 runs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-muted">API Connection Status</span>
                  <span className="font-mono font-bold text-cyber-green">ONLINE</span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-cyber-muted leading-relaxed text-[11px] mt-2">
                  Workflow engines run locally inside Node.js scripts via LangChain triggers. Cloud data backups sync automatically to encrypted vault paths every 12 hours.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. EMERGENCY & SAFETY */}
      {activeTab === 'emergency' && (
        <div className="space-y-6 max-w-4xl mx-auto text-center">
          <div className="glass-panel border-glow-purple rounded-2xl p-8 space-y-6 hologram-scanline">
            <div className="w-20 h-20 rounded-full bg-cyber-red/15 border border-cyber-red/30 flex items-center justify-center mx-auto shadow-neon-pink/15">
              <ShieldAlert className="text-cyber-red animate-pulse" size={40} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Emergency Safety Center</h2>
              <p className="text-cyber-muted text-xs mt-1">Activate Panic SOS mode or broadcast encrypted medical profiles to emergency nets.</p>
            </div>

            {/* Pulsing SOS Panic Mode Button */}
            <div className="py-4">
              {sosCountdown !== null ? (
                <div className="space-y-3">
                  <span className="block text-[10px] text-cyber-red font-mono uppercase tracking-widest animate-pulse font-bold">
                    TRANSMITTING SOS SIGNAL IN
                  </span>
                  <p className="text-6xl font-extrabold text-cyber-red font-mono">{sosCountdown}</p>
                  <button 
                    onClick={() => {
                      setSosCountdown(null);
                      triggerToast('SOS Broadcast cancelled.');
                    }}
                    className="px-6 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    CANCEL SOS
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSosCountdown(5)}
                  className="px-8 py-4 bg-cyber-red/20 hover:bg-cyber-red/35 border-2 border-cyber-red/50 hover:border-cyber-red/80 rounded-2xl font-extrabold text-base text-white tracking-widest cursor-pointer shadow-neon-pink transition-all hover:scale-105"
                >
                  TRIGGER PANIC SOS
                </button>
              )}
            </div>

            {/* GPS and Medical profiles grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-6 border-t border-white/5">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider font-bold">Live GPS Telemetry</span>
                <p className="text-xs font-mono font-semibold text-white">LATITUDE: 37.7749° N</p>
                <p className="text-xs font-mono font-semibold text-white">LONGITUDE: 122.4194° W</p>
                <p className="text-[10px] text-cyber-green font-mono">GPS Signal Accuracy: 3 meters (Mobile Sync)</p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider font-bold">Medical Emergency Profile</span>
                <p className="text-xs font-semibold text-slate-200">Name: Alex Mercer • Blood: O-Positive</p>
                <p className="text-xs text-slate-200">Conditions: None • Allergies: Penicillin</p>
                <p className="text-[10px] text-cyber-muted font-mono">Stored Encrypted. Shared only with EMS nets.</p>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="text-left space-y-3">
              <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider font-bold block">
                Primary Contacts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="font-semibold text-slate-200">Sarah Mercer (Spouse)</p>
                    <p className="text-cyber-muted text-[10px] mt-0.5">+1 (555) 382-9012</p>
                  </div>
                  <a href="tel:+15553829012" className="p-2 bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 rounded-xl cursor-pointer">
                    <PhoneCall size={14} />
                  </a>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="font-semibold text-slate-200">Dr. Jonathan Vance (MD)</p>
                    <p className="text-cyber-muted text-[10px] mt-0.5">+1 (555) 903-8274</p>
                  </div>
                  <a href="tel:+15559038274" className="p-2 bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 rounded-xl cursor-pointer">
                    <PhoneCall size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. FITNESS & DIET SYSTEM */}
      {activeTab === 'fitness' && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Dumbbell className="text-cyber-orange" />
                AI Fitness Coach
              </h2>
              <p className="text-cyber-muted text-xs">AI-generated workouts, macro targets, and nutrition planners.</p>
            </div>

            {/* Select Goal */}
            <div className="flex gap-2">
              {(['hypertrophy', 'shred', 'maintenance'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    goal === g 
                      ? 'bg-cyber-orange/20 border border-cyber-orange/30 text-cyber-orange' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workout Routine Card */}
            <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="text-cyber-orange" size={20} />
                <h3 className="font-semibold text-lg text-white">AI Workout Split Routine</h3>
              </div>
              <p className="text-xs text-cyber-muted font-mono leading-normal">
                Targeting muscle architecture and lean growth.
              </p>
              
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-semibold">
                {currentPlan.workout}
              </div>
            </div>

            {/* Meal Plan & Macros */}
            <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
              <div className="flex items-center gap-2">
                <Apple className="text-cyber-orange" size={20} />
                <h3 className="font-semibold text-lg text-white">Macros & Nutrition Plan</h3>
              </div>
              
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-xs text-slate-200 leading-relaxed space-y-3 font-semibold">
                <p>{currentPlan.meal}</p>
                <p className="text-[10px] text-cyber-muted font-normal mt-1">Supplements: {currentPlan.supps}</p>
              </div>

              {/* Weight track calculator slider */}
              <div className="pt-2">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-cyber-muted">Weight tracking</span>
                  <span className="text-white font-bold">{weight} kg</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="120"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-cyber-orange"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DIGITAL IDENTITY */}
      {activeTab === 'identity' && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Fingerprint className="text-cyber-purple" />
              Digital Identity Center
            </h2>
            <p className="text-cyber-muted text-xs">Manage active sessions, security encryption keys, and developer APIs.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Active Sessions */}
            <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
              <h3 className="font-semibold text-base text-slate-100 flex items-center gap-1.5">
                <Fingerprint className="text-cyber-purple" size={18} />
                Active Device Sessions
              </h3>
              
              <div className="space-y-3">
                {sessions.map((sess, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="font-semibold text-slate-200">{sess.device}</p>
                      <p className="text-[10px] text-cyber-muted mt-0.5">{sess.ip} • {sess.location}</p>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      sess.active.includes('now') ? 'bg-cyber-green/20 text-cyber-green animate-pulse' : 'bg-white/10 text-slate-400'
                    }`}>
                      {sess.active.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* API Keys */}
            <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-base text-slate-100 flex items-center gap-1.5">
                  <Key className="text-cyber-purple" size={18} />
                  Developer API Tokens
                </h3>
                <button 
                  onClick={handleGenerateApiKey}
                  className="px-2.5 py-1 bg-cyber-purple/20 border border-cyber-purple/30 text-cyber-purple text-[10px] font-bold rounded-lg hover:bg-cyber-purple/30 cursor-pointer"
                >
                  Create Token
                </button>
              </div>

              <div className="space-y-3">
                {apiKeys.map((key, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="font-semibold text-slate-200">{key.name}</p>
                      <p className="text-[10px] text-cyber-muted font-mono mt-0.5">{key.key}</p>
                    </div>
                    <span className="text-[9px] text-cyber-green font-mono font-bold uppercase">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 8. CLOUD FILE STORAGE */}
      {activeTab === 'cloud' && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <HardDrive className="text-cyber-blue" />
              Personal Cloud Storage
            </h2>
            <p className="text-cyber-muted text-xs">Zero-knowledge local folder syncer and file encryption ledger.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* File explorer list */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-cyber-border shadow-glass space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                  <Folder className="text-cyber-blue" size={16} />
                  Home Directory / Root
                </span>
                <span className="text-[10px] text-cyber-muted font-mono">3 Files Indexed</span>
              </div>

              <div className="space-y-2">
                {files.map(file => {
                  return (
                    <div 
                      key={file.id} 
                      className={`flex justify-between items-center p-3 rounded-xl border text-xs transition-all ${
                        file.encrypted 
                          ? 'border-cyber-purple/20 bg-cyber-purple/3' 
                          : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          file.encrypted ? 'bg-cyber-purple/15 text-cyber-purple' : 'bg-cyber-blue/15 text-cyber-blue'
                        }`}>
                          {file.encrypted ? <Lock size={14} /> : <Unlock size={14} />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{file.name}</p>
                          <p className="text-[10px] text-cyber-muted mt-0.5">{file.size} • {file.lastModified}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          toggleFileEncryption(file.id);
                          triggerToast(file.encrypted ? `Decrypted ${file.name}` : `Encrypted ${file.name} with AES-256`);
                        }}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                          file.encrypted 
                            ? 'bg-cyber-purple/20 text-cyber-purple border-cyber-purple/30 hover:bg-cyber-purple/30' 
                            : 'bg-white/5 text-slate-400 hover:text-white border-transparent'
                        }`}
                      >
                        {file.encrypted ? 'Decrypt' : 'Encrypt'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cloud stats */}
            <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
              <h3 className="font-semibold text-sm text-slate-100">Disk Quota Diagnostics</h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-cyber-muted">Encrypted Usage</span>
                  <span className="text-white font-bold">14.2 GB / 100 GB</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                  <div className="bg-cyber-blue h-full shadow-neon-blue" style={{ width: '14.2%' }}></div>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-cyber-muted leading-relaxed text-[11px] mt-2">
                  Backups synchronize with decentralized IPFS and local zero-knowledge nodes. Revoking active API credentials locks cloud nodes instantly.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
