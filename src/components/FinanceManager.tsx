import React from 'react';
import { 
  DollarSign, Plus, PiggyBank, RefreshCw, AlertCircle, 
  Trash2, TrendingUp, TrendingDown
} from 'lucide-react';

import type { Expense } from '../types';

interface FinanceManagerProps {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  deleteExpense: (id: string) => void;
}

export const FinanceManager: React.FC<FinanceManagerProps> = ({
  expenses,
  addExpense,
  deleteExpense
}) => {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [category, setCategory] = React.useState('Food');
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [recurring, setRecurring] = React.useState(false);

  // Savings Goal State
  const [savingsTotal, setSavingsTotal] = React.useState(6800);
  const savingsTarget = 10000;

  // Investment Portfolio State with real-time price fluctuation simulator
  const [portfolio, setPortfolio] = React.useState([
    { symbol: 'NVDA', name: 'NVIDIA Corp', shares: 8, price: 924.50, change: 3.42, lastDirection: 'up' as 'up' | 'down' | 'flat' },
    { symbol: 'BTC', name: 'Bitcoin', shares: 0.12, price: 68420.00, change: -1.25, lastDirection: 'down' as 'up' | 'down' | 'flat' },
    { symbol: 'AAPL', name: 'Apple Inc', shares: 15, price: 189.20, change: 0.85, lastDirection: 'up' as 'up' | 'down' | 'flat' },
    { symbol: 'SOL', name: 'Solana', shares: 14.5, price: 172.40, change: 8.92, lastDirection: 'up' as 'up' | 'down' | 'flat' }
  ]);

  // Fetch real-time cryptocurrency rates from CoinGecko API
  React.useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,solana&vs_currencies=usd&include_24hr_change=true');
        if (!res.ok) throw new Error('API limits or offline');
        const data = await res.json();
        
        setPortfolio(prev => prev.map(asset => {
          if (asset.symbol === 'BTC' && data.bitcoin) {
            const lastPrice = asset.price;
            const newPrice = data.bitcoin.usd;
            return {
              ...asset,
              price: newPrice,
              change: Math.round(data.bitcoin.usd_24h_change * 100) / 100,
              lastDirection: newPrice > lastPrice ? 'up' : newPrice < lastPrice ? 'down' : asset.lastDirection
            };
          }
          if (asset.symbol === 'SOL' && data.solana) {
            const lastPrice = asset.price;
            const newPrice = data.solana.usd;
            return {
              ...asset,
              price: newPrice,
              change: Math.round(data.solana.usd_24h_change * 100) / 100,
              lastDirection: newPrice > lastPrice ? 'up' : newPrice < lastPrice ? 'down' : asset.lastDirection
            };
          }
          return asset;
        }));
      } catch (err) {
        console.warn('CoinGecko fetch failed, falling back to simulated ticks:', err);
      }
    };

    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 30000); // Poll every 30s to keep it real-time and safe from API rate limits
    return () => clearInterval(interval);
  }, []);

  // Fluctuates stock assets (NVDA, AAPL) on a local simulation cycle
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPortfolio(prev => prev.map(asset => {
        if (asset.symbol === 'BTC' || asset.symbol === 'SOL') return asset;
        const factor = Math.random() > 0.45 ? 1 : -1;
        const percent = (Math.random() * 0.8 * factor) / 100;
        const newPrice = Math.max(10, asset.price * (1 + percent));
        const newChange = Math.round((asset.change + percent * 100) * 100) / 100;
        return {
          ...asset,
          price: Math.round(newPrice * 100) / 100,
          change: newChange,
          lastDirection: factor > 0 ? 'up' : 'down'
        };
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);


  // Recurring Subscriptions
  const subscriptions = [
    { name: 'OpenAI Pro Copilot', cost: 20.00, billing: 'Monthly', nextBill: 'May 24' },
    { name: 'Netflix Premium', cost: 22.99, billing: 'Monthly', nextBill: 'May 28' },
    { name: 'Spotify Duo', cost: 14.99, billing: 'Monthly', nextBill: 'June 02' },
    { name: 'AWS Cloud Hosting', cost: 42.50, billing: 'Usage', nextBill: 'June 01' }
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;
    addExpense({
      category,
      amount: parseFloat(amount),
      description: description || 'N/A',
      recurring
    });
    setAmount('');
    setDescription('');
    setRecurring(false);
    setShowAddForm(false);
  };

  const handleAddSavings = (val: number) => {
    setSavingsTotal(prev => Math.min(savingsTarget, prev + val));
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="text-cyber-green" />
            Personal Finance AI
          </h2>
          <p className="text-cyber-muted text-xs">AI-driven expense intelligence, subscription limits, and tax records.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyber-green/20 border border-cyber-green/30 text-cyber-green text-xs font-semibold rounded-xl hover:bg-cyber-green/30 transition-all cursor-pointer"
        >
          <Plus size={14} /> Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Ledger List & Add form */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Add form */}
          {showAddForm && (
            <div className="glass-panel rounded-2xl p-6 border border-cyber-green/30 bg-cyber-bg/95 shadow-glass-lg space-y-4">
              <h3 className="font-semibold text-lg text-white">Record Transaction</h3>
              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-cyber-muted font-mono uppercase">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-cyber-muted font-mono uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  >
                    <option value="Food">Food & Groceries</option>
                    <option value="Rent">Rent & Housing</option>
                    <option value="Utilities">Utilities & Bills</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Servers">Servers & Cloud</option>
                    <option value="Travel">Travel & Cab</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-cyber-muted font-mono uppercase">Memo / Description</label>
                  <input
                    type="text"
                    placeholder="Merchant or details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
                <div className="flex items-center justify-between md:col-span-2">
                  <span className="text-xs text-slate-300">Recurring Subscription Expense</span>
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="w-4 h-4 accent-cyber-green rounded"
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
                    className="px-4 py-2 bg-cyber-green/20 hover:bg-cyber-green/30 border border-cyber-green/40 hover:border-cyber-green/60 rounded-xl text-xs font-semibold text-white cursor-pointer"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Ledger Table */}
          <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass overflow-hidden">
            <div className="p-4 border-b border-cyber-border flex justify-between items-center">
              <span className="font-semibold text-sm text-slate-100">Monthly Expense Ledger</span>
              <span className="text-xs text-cyber-green font-mono font-bold">Total spent: ${totalSpent}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-mono text-cyber-muted uppercase bg-white/2">
                    <th className="p-4">Description</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-slate-200">{exp.description}</p>
                          {exp.recurring && (
                            <span className="text-[8px] bg-cyber-purple/20 text-cyber-purple font-mono uppercase px-1.5 py-0.5 rounded mt-1 inline-block">
                              RECURRING
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-slate-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{exp.date}</td>
                      <td className="p-4 font-mono font-bold text-white">${exp.amount}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1 rounded text-slate-400 hover:text-cyber-red hover:bg-cyber-red/10 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simulated Investment portfolio details */}
          <div className="glass-panel rounded-2xl border border-cyber-border shadow-glass p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-base text-slate-100 flex items-center gap-2">
                <TrendingUp className="text-cyber-green" size={18} />
                Asset Investment Portfolio
              </h3>
              <span className="text-[10px] text-cyber-muted font-mono">Live Demo Prices</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {portfolio.map((asset) => {
                const isPositive = asset.change > 0;
                const pulseClass = asset.lastDirection === 'up'
                  ? 'border-cyber-green/40 shadow-neon-green/5'
                  : 'border-cyber-red/40 shadow-neon-red/5';
                return (
                  <div key={asset.symbol} className={`bg-white/5 border rounded-xl p-3.5 space-y-2 transition-all duration-700 ${pulseClass}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-sm font-bold text-white">{asset.symbol}</span>
                        <span className="block text-[9px] text-cyber-muted truncate max-w-[80px]">{asset.name}</span>
                      </div>
                      <span className={`text-[9px] font-mono font-bold flex items-center ${
                        isPositive ? 'text-cyber-green' : 'text-cyber-red'
                      }`}>
                        {isPositive ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                        {isPositive ? '+' : ''}{asset.change}%
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-cyber-muted font-mono">{asset.shares} holdings</span>
                      <span className="text-sm font-bold text-slate-100 font-mono">
                        ${(asset.shares * asset.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Savings goal, recurring bills, budget analysis */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Savings Goal Card */}
          <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                <PiggyBank className="text-cyber-green" />
                Tesla Model 3 Savings
              </h3>
              <span className="text-[10px] text-cyber-green font-mono font-bold">
                {Math.round((savingsTotal / savingsTarget) * 100)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyber-muted">Saved</span>
                <span className="text-white font-bold">${savingsTotal} / ${savingsTarget}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-cyber-green h-full shadow-neon-green transition-all duration-500" 
                  style={{ width: `${(savingsTotal / savingsTarget) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => handleAddSavings(50)}
                className="py-1.5 bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 text-cyber-green text-xs font-semibold rounded-xl cursor-pointer"
              >
                Add $50
              </button>
              <button 
                onClick={() => handleAddSavings(200)}
                className="py-1.5 bg-cyber-green/20 hover:bg-cyber-green/35 border border-cyber-green/40 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Add $200
              </button>
            </div>
          </div>

          {/* Subscriptions Renewals */}
          <div className="glass-panel rounded-2xl p-6 border border-cyber-border shadow-glass space-y-4">
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
              <RefreshCw className="text-cyber-purple" size={16} />
              Active Subscriptions
            </h3>

            <div className="space-y-2.5">
              {subscriptions.map((sub, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="font-semibold text-slate-200">{sub.name}</p>
                    <p className="text-[9px] text-cyber-muted mt-0.5">Renews {sub.nextBill}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">${sub.cost}</span>
                    <span className="text-[9px] font-mono text-cyber-purple font-semibold uppercase">{sub.billing}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Spending Analytics */}
          <div className="glass-panel rounded-2xl p-5 border border-cyber-border bg-black/40 text-xs space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-cyber-yellow" size={16} />
              <span className="font-bold text-slate-200">AI Budget Recommendations</span>
            </div>
            <p className="text-cyber-muted leading-relaxed">
              Your server hosting costs ($42.50) are optimized. However, Food expenses represent 34% of your total ledger this month, which is 6% above average. Cooking dinner 2 more times a week could save an estimated $120/month.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
