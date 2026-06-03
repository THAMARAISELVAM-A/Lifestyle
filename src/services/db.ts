// MyLife OS: Neon Database Service (serverless driver)
/* eslint-disable @typescript-eslint/no-explicit-any */
import { neon } from '@neondatabase/serverless';
import { AuthService } from './auth';

const DATABASE_URL = 'postgresql://neondb_owner:npg_u0j9QXxmkoaM@ep-royal-brook-aokk7v7o-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

export type TableName =
  | 'tasks'
  | 'passwords'
  | 'health_metrics'
  | 'expenses'
  | 'devices'
  | 'messages'
  | 'files'
  | 'automations'
  | 'goals'
  | 'notifications'
  | 'calendar_events'
  | 'ai_chat_history'
  | 'knowledge_notes'
  | 'user_profiles';



async function rawQuery(queryText: string, params: unknown[] = []): Promise<any[]> {
  try {
    const fn = (sql as any).query;
    if (typeof fn === 'function') {
      return await fn(queryText, params);
    }
    // Fallback for older neon versions that might not have .query
    return await (sql as any)(queryText, params);
  } catch (e: any) {
    if (e.message?.includes('sql.query')) {
      return await (sql as any).query(queryText, params);
    }
    throw e;
  }
}

export class NeonDB {
  // Translates application-space keys (camelCase) to database-space keys (snake_case)
  private static toDbRow(table: TableName, data: any): any {
    if (!data || typeof data !== 'object') return data;
    const dbData = { ...data };
    
    // Camel to snake conversion helper
    const camelToSnake = (s: string) => s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    const result: any = {};
    for (const key of Object.keys(dbData)) {
      let dbKey = camelToSnake(key);
      // Special custom mappings
      if (table === 'automations' && key === 'trigger') {
        dbKey = 'trigger_condition';
      }
      result[dbKey] = dbData[key];
    }
    return result;
  }

  // Translates database-space keys to application-space keys
  private static toAppRow(table: TableName, dbRow: any): any {
    if (!dbRow || typeof dbRow !== 'object') return dbRow;
    
    // Snake to camel conversion helper
    const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    const result: any = {};
    for (const key of Object.keys(dbRow)) {
      let appKey = snakeToCamel(key);
      // Special custom mappings
      if (table === 'automations' && key === 'trigger_condition') {
        appKey = 'trigger';
      }
      result[appKey] = dbRow[key];
    }
    return result;
  }

  /**
   * Get all rows for the current user from a table
   */
  static async getAll<T>(table: TableName, userId?: string): Promise<T[]> {
    const uid = userId ?? this._authenticatedUserId();
    if (!uid || uid === 'guest') return this.getLocalCache<T>(table);

    try {
      const rows = await rawQuery(
        `SELECT * FROM ${table} WHERE user_id = $1 ORDER BY created_at DESC`,
        [uid]
      );
      const appRows = rows.map(r => this.toAppRow(table, r));
      this.setLocalCache(table, appRows);
      return appRows as T[];
    } catch (e) {
      console.warn(`NeonDB.getAll(${table}) failed, using local cache:`, e);
      return this.getLocalCache<T>(table);
    }
  }

  /**
   * Get a single row by ID
   */
  static async getById<T>(table: TableName, id: string): Promise<T | null> {
    try {
      const rows = await rawQuery(
        `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`,
        [id]
      );
      return rows[0] ? (this.toAppRow(table, rows[0]) as T) : null;
    } catch (e) {
      console.warn(`NeonDB.getById(${table}, ${id}) failed:`, e);
      return null;
    }
  }

  private static _authenticatedUserId(): string | undefined {
    try {
      const u = AuthService.getUser();
      return u?.id ?? undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Insert a new row.
   */
  static async insert<T extends Record<string, any>>(table: TableName, data: T): Promise<T> {
    const uid = (data as any).userId ?? (data as any).user_id ?? this._authenticatedUserId();
    const dbRow = this.toDbRow(table, data);
    dbRow.user_id = uid || 'guest';

    // Optimistic local cache update
    const appRow = this.toAppRow(table, dbRow);
    const cache = this.getLocalCache<T>(table);
    cache.push(appRow as T);
    this.setLocalCache(table, cache);

    if (!uid || uid === 'guest') {
      return appRow as T;
    }

    try {
      const cols = Object.keys(dbRow).map(c => `"${c}"`);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const vals = Object.values(dbRow);

      const result = await rawQuery(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        vals
      );
      const insertedDb = result[0] || dbRow;
      const insertedApp = this.toAppRow(table, insertedDb);
      
      const updated = cache.map(c => (c as any).id === (insertedApp as any).id ? insertedApp : c);
      this.setLocalCache(table, updated);
      return insertedApp;
    } catch (e) {
      console.warn(`NeonDB.insert(${table}) failed, local only:`, e);
      this.addToSyncQueue({ action: 'insert', table, id: appRow.id || `p_${Date.now()}`, data: appRow });
      return appRow as T;
    }
  }

  /**
   * Update a row by ID
   */
  static async update<T extends Record<string, any>>(
    table: TableName,
    id: string,
    updates: Partial<T>
  ): Promise<void> {
    // Optimistic local update
    const cache = this.getLocalCache<T>(table);
    const updatedCache = cache.map(item =>
      (item as any).id === id ? { ...item, ...updates } : item
    );
    this.setLocalCache(table, updatedCache);

    const uid = this._authenticatedUserId();
    if (!uid || uid === 'guest') return;

    try {
      const dbUpdates = this.toDbRow(table, updates);
      const entries = Object.entries(dbUpdates);
      if (entries.length === 0) return;

      const setClause = entries.map(([key], i) => `"${key}" = $${i + 1}`).join(', ');
      const values = [...entries.map(([, val]) => val), id];

      await rawQuery(
        `UPDATE ${table} SET ${setClause} WHERE id = $${entries.length + 1}`,
        values
      );
    } catch (e) {
      console.warn(`NeonDB.update(${table}, ${id}) failed:`, e);
      this.addToSyncQueue({ action: 'update', table, id, data: updates });
    }
  }

  /**
   * Delete a row by ID
   */
  static async remove(table: TableName, id: string): Promise<void> {
    const cache = this.getLocalCache<any>(table);
    this.setLocalCache(table, cache.filter(item => item.id !== id));

    const uid = this._authenticatedUserId();
    if (!uid || uid === 'guest') return;

    try {
      await rawQuery(`DELETE FROM ${table} WHERE id = $1`, [id]);
    } catch (e) {
      console.warn(`NeonDB.remove(${table}, ${id}) failed:`, e);
      this.addToSyncQueue({ action: 'remove', table, id });
    }
  }

  // ========================================
  // User Profile
  // ========================================

  static async getOrCreateProfile(authUserId: string, name: string, email: string): Promise<any> {
    if (authUserId === 'guest') {
      return { id: 'guest', display_name: name, email, life_score: 75, xp_total: 0 };
    }
    try {
      const existing = await rawQuery(
        `SELECT * FROM user_profiles WHERE auth_user_id = $1 LIMIT 1`,
        [authUserId]
      );

      if (existing.length > 0) return existing[0];

      const id = `profile_${Date.now()}`;
      const result = await rawQuery(
        `INSERT INTO user_profiles (id, auth_user_id, display_name, email) VALUES ($1, $2, $3, $4) RETURNING *`,
        [id, authUserId, name, email]
      );
      return result[0];
    } catch (e) {
      console.warn('NeonDB.getOrCreateProfile failed:', e);
      return { id: authUserId, display_name: name, email, life_score: 75, xp_total: 0 };
    }
  }

  static async updateProfile(authUserId: string, updates: Record<string, any>): Promise<void> {
    if (authUserId === 'guest') return;
    try {
      const dbUpdates = this.toDbRow('user_profiles', updates);
      const entries = Object.entries(dbUpdates);
      if (entries.length === 0) return;

      const setClause = entries.map(([key], i) => `"${key}" = $${i + 1}`).join(', ');
      const values = [...entries.map(([, val]) => val), authUserId];

      await rawQuery(
        `UPDATE user_profiles SET ${setClause}, updated_at = NOW() WHERE auth_user_id = $${entries.length + 1}`,
        values
      );
    } catch (e) {
      console.warn('NeonDB.updateProfile failed:', e);
    }
  }

  // ========================================
  // Sync Queue Logic (Offline Fallback & Healing)
  // ========================================

  private static addToSyncQueue(item: { action: 'insert' | 'update' | 'remove'; table: TableName; id: string; data?: any }): void {
    try {
      const queueRaw = localStorage.getItem('mylife_sync_queue');
      const queue = queueRaw ? JSON.parse(queueRaw) : [];
      const filtered = queue.filter((q: any) => !(q.id === item.id && q.action === item.action));
      filtered.push(item);
      localStorage.setItem('mylife_sync_queue', JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to add to sync queue:', e);
    }
  }

  static async processSyncQueue(): Promise<void> {
    const uid = this._authenticatedUserId();
    if (!uid || uid === 'guest') return;

    try {
      const queueRaw = localStorage.getItem('mylife_sync_queue');
      if (!queueRaw) return;
      const queue = JSON.parse(queueRaw);
      if (queue.length === 0) return;

      console.log(`[Autonomous Sync] Processing ${queue.length} pending offline transactions...`);
      const failedItems: any[] = [];

      for (const item of queue) {
        try {
          if (item.action === 'insert') {
            const dbRow = this.toDbRow(item.table, item.data);
            const cols = Object.keys(dbRow).map(c => `"${c}"`);
            const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
            const vals = Object.values(dbRow);
            
            // Upsert insert operations
            await rawQuery(
              `INSERT INTO ${item.table} (${cols.join(', ')}) 
               VALUES (${placeholders}) 
               ON CONFLICT (id) DO UPDATE SET 
               ${Object.keys(dbRow).map(c => `"${c}" = EXCLUDED."${c}"`).join(', ')}`,
              vals
            );
          } else if (item.action === 'update') {
            const dbUpdates = this.toDbRow(item.table, item.data);
            const entries = Object.entries(dbUpdates);
            if (entries.length > 0) {
              const setClause = entries.map(([key], i) => `"${key}" = $${i + 1}`).join(', ');
              const values = [...entries.map(([, val]) => val), item.id];
              await rawQuery(
                `UPDATE ${item.table} SET ${setClause} WHERE id = $${entries.length + 1}`,
                values
              );
            }
          } else if (item.action === 'remove') {
            await rawQuery(`DELETE FROM ${item.table} WHERE id = $1`, [item.id]);
          }
        } catch (e) {
          console.warn(`[Autonomous Sync] Retry item failed:`, item, e);
          failedItems.push(item);
        }
      }

      if (failedItems.length > 0) {
        localStorage.setItem('mylife_sync_queue', JSON.stringify(failedItems));
      } else {
        localStorage.removeItem('mylife_sync_queue');
        console.log('[Autonomous Sync] All offline items synchronized successfully.');
      }
    } catch (e) {
      console.warn('[Autonomous Sync] Sync queue processing error:', e);
    }
  }

  // ========================================
  // Local Cache (offline fallback)
  // ========================================

  private static getLocalCache<T>(table: TableName): T[] {
    try {
      const raw = localStorage.getItem(`mylife_${table}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static setLocalCache<T>(table: TableName, data: T[]): void {
    try {
      localStorage.setItem(`mylife_${table}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`Cache write failed for ${table}:`, e);
    }
  }

  static clearAllCaches(): void {
    const tables: TableName[] = [
      'tasks', 'passwords', 'health_metrics', 'expenses', 'devices',
      'messages', 'files', 'automations', 'goals', 'notifications',
      'calendar_events', 'ai_chat_history', 'knowledge_notes', 'user_profiles'
    ];
    tables.forEach(t => localStorage.removeItem(`mylife_${t}`));
  }
}
