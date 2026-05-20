export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  project: string;
}

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  url: string;
  strength: 'weak' | 'medium' | 'strong';
  otpSecret?: string;
  category: 'logins' | 'cards' | 'notes' | 'documents';
  lastModified: string;
}

export interface HealthMetric {
  date: string;
  heartRate: number;
  sleep: number; // hours
  calories: number;
  steps: number;
  hydration: number; // ml
  stress: number; // 0-100
  weight: number; // kg
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  recurring: boolean;
}

export interface SmartDevice {
  id: string;
  name: string;
  type: 'light' | 'ac' | 'lock' | 'camera';
  status: boolean;
  value?: string | number; // e.g. 24°C, 80% brightness
  room: string;
}

export interface Message {
  id: string;
  sender: string;
  avatar: string;
  platform: 'email' | 'whatsapp' | 'telegram' | 'discord' | 'sms';
  content: string;
  timestamp: string;
  priority: 'high' | 'normal' | 'low';
  summary?: string;
  suggestedReplies?: string[];
  read: boolean;
}

export interface CloudFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'archive' | 'folder';
  lastModified: string;
  encrypted: boolean;
  parentId?: string; // for folder nesting
  ocrText?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  lastTriggered?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  streak: number;
  xpValue: number;
}
