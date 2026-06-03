import type { Task, PasswordEntry, HealthMetric, Expense, SmartDevice, Message, CloudFile, AutomationRule, Goal } from '../types';

export const initialTasks: Task[] = [
  { id: 't1', title: 'Review Smart Home peripheral security', description: 'Audit local API endpoints and update the zero-knowledge firewall configurations.', status: 'todo', priority: 'high', dueDate: '2026-05-21', project: 'Security' },
  { id: 't2', title: 'Complete monthly finance report', description: 'Compare ledger expenses against the $2,500 target budget limits.', status: 'progress', priority: 'medium', dueDate: '2026-05-22', project: 'Finance' },
  { id: 't3', title: 'Log 45 min cardio run workout', description: 'Integrate active heart rate metrics and calorie burnout counts.', status: 'done', priority: 'low', dueDate: '2026-05-19', project: 'Health' }
];

export const initialPasswords: PasswordEntry[] = [
  { id: 'p1', title: 'Main Google Account', username: 'user@mylife.local', url: 'https://accounts.google.com', strength: 'strong', otpSecret: 'JBSWY3DPEHPK3PXP', category: 'logins', lastModified: 'May 18' },
  { id: 'p2', title: 'Visa Platinum Credit Card', username: '•••• •••• •••• 4821', url: 'N/A', strength: 'strong', category: 'cards', lastModified: 'May 10' },
  { id: 'p3', title: 'Personal Vault Backup Key', username: 'mylife_secure_key', url: 'N/A', strength: 'strong', category: 'notes', lastModified: 'May 02' }
];

export const initialHealthMetric: HealthMetric = {
  date: '2026-05-20',
  heartRate: 72,
  sleep: 7.2,
  calories: 1840,
  steps: 6420,
  hydration: 1250,
  stress: 48,
  weight: 78
};

export const initialExpenses: Expense[] = [
  { id: 'f1', category: 'Food', amount: 142.50, date: 'May 19', description: 'Whole Foods Market Inc', recurring: false },
  { id: 'f2', category: 'Rent', amount: 1800.00, date: 'May 01', description: 'Apartment Residential Lease', recurring: true },
  { id: 'f3', category: 'Servers', amount: 42.50, date: 'May 15', description: 'AWS Hosting Cloud Services', recurring: true }
];

export const initialDevices: SmartDevice[] = [
  { id: 's1', name: 'Living Room Lights', type: 'light', status: true, value: '80%', room: 'Living Room' },
  { id: 's2', name: 'Smart Thermostat AC', type: 'ac', status: true, value: '23°C', room: 'Hallway' },
  { id: 's3', name: 'Main Entry Deadbolt', type: 'lock', status: true, room: 'Front Door' },
  { id: 's4', name: 'Driveway Camera Feed', type: 'camera', status: false, room: 'Exterior' }
];

export const initialMessages: Message[] = [
  { id: 'm1', sender: 'Sarah (Home)', avatar: '', platform: 'whatsapp', content: 'Hey, did you remember to schedule gym time and check the electric bill?', timestamp: '09:15 AM', priority: 'high', summary: 'Sarah is asking about calendar gym scheduling and monthly utilities payment status.', suggestedReplies: ['Yes, gym is scheduled at 6 PM.', 'Working on paying the bills now.'], read: false },
  { id: 'm2', sender: 'Supervisor', avatar: '', platform: 'email', content: 'Let\'s finalize the LifeOS neural code architecture sync today at 2 PM.', timestamp: '08:45 AM', priority: 'high', summary: 'Supervisor requests project sync meeting at 2:00 PM today.', suggestedReplies: ['Confirmed. See you at 2 PM.', 'Can we reschedule to 3 PM?'], read: false },
  { id: 'm3', sender: 'Home Automation Bot', avatar: '', platform: 'discord', content: 'Driveway sensor triggered. Security cameras are active.', timestamp: 'Yesterday', priority: 'normal', read: true }
];

export const initialFiles: CloudFile[] = [
  { id: 'fi1', name: 'Tax_Return_2025.pdf', size: '2.4 MB', type: 'pdf', lastModified: 'May 12', encrypted: true },
  { id: 'fi2', name: 'Workspace_Project_Brief.md', size: '12 KB', type: 'doc', lastModified: 'May 18', encrypted: false },
  { id: 'fi3', name: 'Vacation_Photo.png', size: '4.8 MB', type: 'image', lastModified: 'May 14', encrypted: false }
];

export const initialAutomations: AutomationRule[] = [
  { id: 'a1', name: 'Auto Backup Vault Documents', trigger: 'Every 12 Hours', action: 'Sync E2EE keys to Encrypted Cloud path', active: true, lastTriggered: '3 hours ago' },
  { id: 'a2', name: 'Eco Climate Sleep Optimizer', trigger: 'Sleep Mode Enabled', action: 'Set Thermostat to 22°C & shut lights', active: true, lastTriggered: 'Yesterday' },
  { id: 'a3', name: 'Bill Auto Payment Scheduler', trigger: 'Recurrent bill alert', action: 'Queue Visa card settlement logs', active: false }
];

export const initialGoals: Goal[] = [
  { id: 'g1', title: 'Daily Deep Meditation (15m)', category: 'Mindfulness', target: 15, current: 0, unit: 'm', streak: 4, xpValue: 20 },
  { id: 'g2', title: 'Calorie Control & Diet Logs', category: 'Diet', target: 2400, current: 1840, unit: 'kcal', streak: 12, xpValue: 30 },
  { id: 'g3', title: 'Circadian Bedtime (11 PM)', category: 'Sleep', target: 1, current: 0, unit: 'cycles', streak: 3, xpValue: 25 }
];

export const initialNotifications = [
  { id: 'n1', title: 'OS Synced', desc: 'Secure cloud backups finalized with zero failures.', time: 'Just now' },
  { id: 'n2', title: 'Biometrics Sync', desc: 'Step tracker count updated via Fitbit integration.', time: '1 hour ago' }
];
