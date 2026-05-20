import React from 'react';
import { Send, Bot, Sparkles, User } from 'lucide-react';


interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AICopilotProps {
  onTriggerAction: (actionType: string) => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({ onTriggerAction }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { 
      sender: 'ai', 
      text: "Hello! I am your LifeOS neural assistant. How can I help optimize your daily workflow, biometrics, or smart locks today?", 
      timestamp: '09:00 AM' 
    }
  ]);
  const [inputVal, setInputVal] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  const presets = [
    { label: "Organize my schedule, queue bills & call mom", prompt: "Schedule gym, pay electricity bill, and remind me to call mom." },
    { label: "Analyze my burnout risk metrics", prompt: "Perform biometric audit and show burnout risk." },
    { label: "Audit password vault hygiene", prompt: "Audit my passwords and generate a secure 16-character credential." },
    { label: "Check my smart home status", prompt: "List active IoT sensors and turn off lights if safe." }
  ];

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate AI response stream
    setTimeout(() => {
      let aiResponseText = "Analyzing parameters... ";
      const normalizedPrompt = textToSend.toLowerCase();

      if (normalizedPrompt.includes('gym') || normalizedPrompt.includes('electricity') || normalizedPrompt.includes('call mom')) {
        aiResponseText = "Calendar optimization executed: Added gym workout slot to your calendar at 6:00 PM (route congestion minimized). Electricity bill of $142.50 has been scheduled for payment. Configured notification reminder: 'Call Mom' at 8:00 PM.";
        onTriggerAction('schedule-gym');
      } else if (normalizedPrompt.includes('burnout') || normalizedPrompt.includes('biometric')) {
        aiResponseText = "Biometrics audit completed. Your stress index is 48% (stable) but sleep average is 6.8h. Recommend enabling screen locks by 9:30 PM to optimize REM cycles. Keep hydration above 2.5L to lower cortisol.";
        onTriggerAction('audit-burnout');
      } else if (normalizedPrompt.includes('password') || normalizedPrompt.includes('credential')) {
        aiResponseText = "Vault health audited. Out of 4 entries, all are flagged with 'Strong' hardware-encrypted ratings. New credential generated and copied to clipboard: k#8P$dLq9*2Xz_1W.";
        onTriggerAction('audit-passwords');
      } else if (normalizedPrompt.includes('smart') || normalizedPrompt.includes('iot') || normalizedPrompt.includes('light')) {
        aiResponseText = "Smart Home IoT status: Living Room light is currently ON. AC temperature set at 23°C. Triggering 'Eco Saver' automation: Living room lights will shut down automatically when Sleep Mode is active at 11 PM.";
        onTriggerAction('optimize-iot');
      } else {
        aiResponseText = "Understood. Query parsed and logged into Second Brain knowledge index. Let me know if you would like me to link this to your calendar or schedule workflow triggers.";
      }

      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputVal);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col justify-between">
      
      {/* Top Details */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Bot className="text-cyber-blue" />
          Life AI Copilot
        </h2>
        <p className="text-cyber-muted text-xs">Continuous context memory engine trained on your local profile data.</p>
      </div>

      {/* Main chat window */}
      <div className="flex-1 glass-panel border border-cyber-border rounded-2xl flex flex-col justify-between overflow-hidden my-4 shadow-glass">
        
        {/* Chat message logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={idx}
                className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                  isAI 
                    ? 'bg-cyber-blue/15 border-cyber-blue/30 text-cyber-blue' 
                    : 'bg-cyber-purple/15 border-cyber-purple/30 text-cyber-purple'
                }`}>
                  {isAI ? <Bot size={16} /> : <User size={16} />}
                </div>

                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isAI 
                      ? 'bg-white/5 border border-white/5 text-slate-100 rounded-tl-none' 
                      : 'bg-cyber-purple/20 border border-cyber-purple/30 text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="block text-[8px] text-cyber-muted font-mono text-right">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-lg bg-cyber-blue/15 border border-cyber-blue/30 text-cyber-blue flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="flex gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none">
                <span className="w-2 h-2 rounded-full bg-cyber-blue animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-cyber-blue animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-cyber-blue animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Preset commands */}
        <div className="p-4 bg-black/30 border-t border-cyber-border space-y-2">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyber-blue uppercase tracking-widest mb-1">
            <Sparkles size={12} /> Click preset to instruct Copilot:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset.prompt)}
                disabled={isTyping}
                className="text-left text-xs p-2 rounded-xl bg-white/5 hover:bg-cyber-blue/10 border border-white/5 hover:border-cyber-blue/20 transition-all text-slate-300 hover:text-white cursor-pointer truncate"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <form onSubmit={handleFormSubmit} className="p-4 bg-black/45 border-t border-cyber-border flex gap-2">
          <input
            type="text"
            placeholder="Ask AI Copilot to run actions (e.g. schedule gym, audit biometrics)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs glass-input"
          />
          <button
            type="submit"
            disabled={isTyping || !inputVal.trim()}
            className="px-4 bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/40 text-white rounded-xl cursor-pointer flex items-center justify-center transition-all disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </form>

      </div>
    </div>
  );
};
