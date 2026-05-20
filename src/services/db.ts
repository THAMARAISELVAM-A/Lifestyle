// MyLife OS: Neon DB Service with Resilient Local-First Fallback
import { AuthService } from './auth';

const DB_BASE_URL = 'https://ep-royal-brook-aokk7v7o.apirest.c-2.ap-southeast-1.aws.neon.tech/neondb/rest/v1';

// Table names mapped to their schema
export type TableName = 
  | 'tasks'
  | 'passwords'
  | 'health_metrics'
  | 'expenses'
  | 'devices'
  | 'messages'
  | 'files'
  | 'automations'
  | 'goals';

export interface TableStatus {
  name: TableName;
  status: 'online' | 'offline' | 'missing' | 'checking';
  errorMsg?: string;
}

export const SQL_SCHEMA = `-- Schema for MyLife OS
-- Run this in your Neon SQL Editor to enable cloud synchronization!

CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  project TEXT,
  due_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.passwords (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  username TEXT NOT NULL,
  url TEXT,
  strength TEXT,
  otp_secret TEXT,
  category TEXT,
  last_modified TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.health_metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  heart_rate INTEGER,
  sleep NUMERIC,
  calories INTEGER,
  steps INTEGER,
  hydration INTEGER,
  stress INTEGER,
  weight NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status BOOLEAN DEFAULT FALSE,
  value TEXT,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  avatar TEXT,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  summary TEXT,
  suggested_replies JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL,
  last_modified TEXT,
  encrypted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  action TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  last_triggered TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target INTEGER NOT NULL,
  current INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  xp_value INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Allow users to read/write only their own rows based on Neon Auth sub (JWT)
-- The auth.user_id() or current_setting('request.jwt.claims', true)::jsonb->>'sub' is used to check JWT claims
CREATE POLICY "Tasks RLS Policy" ON public.tasks 
  USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'))
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "Passwords RLS Policy" ON public.passwords 
  USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'))
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "Health Metrics RLS Policy" ON public.health_metrics 
  USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'))
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "Expenses RLS Policy" ON public.expenses 
  USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'))
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "Devices RLS Policy" ON public.devices 
  USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'))
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "Messages RLS Policy" ON public.messages 
  USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'))
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "Files RLS Policy" ON public.files 
  USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'))
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "Automations RLS Policy" ON public.automations 
  USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'))
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "Goals RLS Policy" ON public.goals 
  USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'))
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));
`;

export class DbService {
  private static tableStatus: Record<TableName, TableStatus['status']> = {
    tasks: 'checking',
    passwords: 'checking',
    health_metrics: 'checking',
    expenses: 'checking',
    devices: 'checking',
    messages: 'checking',
    files: 'checking',
    automations: 'checking',
    goals: 'checking'
  };

  static getTableStatuses(): TableStatus[] {
    return Object.keys(this.tableStatus).map((name) => ({
      name: name as TableName,
      status: this.tableStatus[name as TableName]
    }));
  }

  static isTableOnline(table: TableName): boolean {
    return this.tableStatus[table] === 'online';
  }

  /**
   * Helper to perform authenticated REST call to Neon Data API
   */
  private static async apiFetch(
    table: TableName,
    path: string,
    options: RequestInit = {}
  ): Promise<{ ok: boolean; data: any; status: number }> {
    const jwt = AuthService.getJwt();
    if (!jwt) {
      return { ok: false, data: 'No authentication token available', status: 401 };
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      ...(options.headers as any)
    };

    try {
      const res = await fetch(`${DB_BASE_URL}/${table}${path}`, {
        ...options,
        headers
      });

      if (res.status === 404) {
        // Table does not exist in schema cache
        this.tableStatus[table] = 'missing';
        return { ok: false, data: 'Table does not exist', status: 404 };
      }

      this.tableStatus[table] = 'online';
      
      if (res.status === 204) {
        return { ok: true, data: null, status: 204 };
      }

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      return { ok: res.ok, data, status: res.status };
    } catch (e: any) {
      console.warn(`Neon DB fetch error for ${table}:`, e);
      this.tableStatus[table] = 'offline';
      return { ok: false, data: e.message || 'Network error', status: 0 };
    }
  }

  /**
   * Fetch all rows for the current user
   */
  static async selectAll<T>(table: TableName, defaultValue: T[]): Promise<T[]> {
    const user = AuthService.getUser();
    // If not authenticated, return local cache or default value
    if (!user) {
      return this.getLocalCache(table, defaultValue);
    }

    const { ok, data, status } = await this.apiFetch(table, `?user_id=eq.${user.id}`);
    
    if (ok && Array.isArray(data)) {
      this.setLocalCache(table, data);
      return data as T[];
    }

    console.warn(`Failed to select all from ${table} (status ${status}). Using local storage fallback.`);
    return this.getLocalCache(table, defaultValue);
  }

  /**
   * Insert a row
   */
  static async insert<T extends { id: string }>(table: TableName, row: T): Promise<T> {
    const user = AuthService.getUser();
    const localData = this.getLocalCache<T>(table, []);
    
    // Always update local cache first
    const updatedLocal = [...localData.filter(r => r.id !== row.id), row];
    this.setLocalCache(table, updatedLocal);

    if (!user) {
      return row;
    }

    const payload = { ...row, user_id: user.id };
    const { ok, data } = await this.apiFetch(table, '', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (ok && data) {
      // In case DB returns updated fields (triggers, default values, etc.)
      const insertedRow = Array.isArray(data) ? data[0] : data;
      const finalLocal = [...localData.filter(r => r.id !== row.id), insertedRow];
      this.setLocalCache(table, finalLocal);
      return insertedRow;
    }

    return row;
  }

  /**
   * Update a row
   */
  static async update<T extends { id: string }>(table: TableName, id: string, updates: Partial<T>): Promise<void> {
    const user = AuthService.getUser();
    const localData = this.getLocalCache<T>(table, []);
    
    // Update local cache
    const updatedLocal = localData.map((row) => {
      if (row.id === id) {
        return { ...row, ...updates };
      }
      return row;
    });
    this.setLocalCache(table, updatedLocal);

    if (!user) {
      return;
    }

    await this.apiFetch(table, `?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete a row
   */
  static async delete(table: TableName, id: string): Promise<void> {
    const user = AuthService.getUser();
    const localData = this.getLocalCache<{ id: string }>(table, []);
    
    // Update local cache
    const updatedLocal = localData.filter((row) => row.id !== id);
    this.setLocalCache(table, updatedLocal);

    if (!user) {
      return;
    }

    await this.apiFetch(table, `?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Clear all local caches on sign-out
   */
  static clearCaches(): void {
    const tables: TableName[] = ['tasks', 'passwords', 'health_metrics', 'expenses', 'devices', 'messages', 'files', 'automations', 'goals'];
    tables.forEach((t) => {
      localStorage.removeItem(`mylife_cache_${t}`);
      this.tableStatus[t] = 'checking';
    });
  }

  // --- Local Cache Helpers ---
  private static getLocalCache<T>(table: TableName, defaultValue: T[]): T[] {
    try {
      const cache = localStorage.getItem(`mylife_cache_${table}`);
      return cache ? JSON.parse(cache) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setLocalCache<T>(table: TableName, data: T[]): void {
    try {
      localStorage.setItem(`mylife_cache_${table}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to set local cache for ${table}:`, e);
    }
  }
}
