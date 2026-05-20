// MyLife OS: Neon Database Service (serverless driver)
import { neon } from '@neondatabase/serverless';
import { AuthService } from './auth';

const DATABASE_URL = 'postgresql://neondb_owner:npg_u0j9QXxmkoaM@ep-royal-brook-aokk7v7o-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

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

// Helper: run raw parameterized SQL via neon http query
// The neon() function at runtime supports sql(queryString, params) but TypeScript
// only exposes the tagged template overload, so we cast to bypass it.
const sqlQuery = sql as any;

async function rawQuery(queryText: string, params: unknown[] = []): Promise<any[]> {
  return sqlQuery(queryText, params) as Promise<any[]>;
}

// ========================================
// Generic CRUD operations
// ========================================

export class NeonDB {
  /**
   * Get all rows for the current user from a table
   */
  static async getAll<T>(table: TableName, userId?: string): Promise<T[]> {
    const uid = userId || AuthService.getUser()?.id;
    if (!uid) return this.getLocalCache<T>(table);

    try {
      const rows = await rawQuery(
        `SELECT * FROM ${table} WHERE user_id = $1 ORDER BY created_at DESC`,
        [uid]
      );
      this.setLocalCache(table, rows);
      return rows as T[];
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
      return (rows[0] as T) || null;
    } catch (e) {
      console.warn(`NeonDB.getById(${table}, ${id}) failed:`, e);
      return null;
    }
  }

  /**
   * Insert a new row
   */
  static async insert<T extends Record<string, any>>(table: TableName, data: T): Promise<T> {
    const uid = AuthService.getUser()?.id;
    const row: Record<string, any> = { ...data, user_id: uid || 'guest' };

    // Optimistic local cache update
    const cache = this.getLocalCache<T>(table);
    cache.push(row as T);
    this.setLocalCache(table, cache);

    try {
      const cols = Object.keys(row);
      const vals = Object.values(row);
      const colNames = cols.map(c => `"${c}"`).join(', ');
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');

      const result = await rawQuery(
        `INSERT INTO ${table} (${colNames}) VALUES (${placeholders}) RETURNING *`,
        vals
      );
      const inserted = (result[0] || row) as T;
      // Update cache with server response
      const updated = cache.map(c => (c as any).id === (inserted as any).id ? inserted : c);
      this.setLocalCache(table, updated);
      return inserted;
    } catch (e) {
      console.warn(`NeonDB.insert(${table}) failed, local only:`, e);
      return row as T;
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

    try {
      const entries = Object.entries(updates);
      if (entries.length === 0) return;

      const setClause = entries.map(([key], i) => `"${key}" = $${i + 1}`).join(', ');
      const values = [...entries.map(([, val]) => val), id];

      await rawQuery(
        `UPDATE ${table} SET ${setClause} WHERE id = $${entries.length + 1}`,
        values
      );
    } catch (e) {
      console.warn(`NeonDB.update(${table}, ${id}) failed:`, e);
    }
  }

  /**
   * Delete a row by ID
   */
  static async remove(table: TableName, id: string): Promise<void> {
    const cache = this.getLocalCache<any>(table);
    this.setLocalCache(table, cache.filter(item => item.id !== id));

    try {
      await rawQuery(`DELETE FROM ${table} WHERE id = $1`, [id]);
    } catch (e) {
      console.warn(`NeonDB.remove(${table}, ${id}) failed:`, e);
    }
  }

  // ========================================
  // User Profile
  // ========================================

  static async getOrCreateProfile(authUserId: string, name: string, email: string): Promise<any> {
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
    try {
      const entries = Object.entries(updates);
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
