// MyLife OS: Autonomous Self-Healing & Performance Maintenance Engine
import { NeonDB } from './db';

export class AutonomousEngine {
  private static fpsTimer: ReturnType<typeof requestAnimationFrame> | null = null;
  private static lastFrameTime = performance.now();
  private static frameCount = 0;
  private static avgFps = 60;
  private static isOptimizedMode = false;
  private static maintenanceInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize all autonomous optimization schedules
   */
  static start(): void {
    if (this.maintenanceInterval) return;

    console.log('🤖 [Autonomous Engine] Booting System Maintenance Loop...');

    // 1. Setup online/offline automatic sync triggers
    window.addEventListener('online', () => {
      console.log('🌐 [Autonomous Engine] Network Link Restored. Triggering sync queue upload...');
      this.triggerBackgroundSync();
    });

    window.addEventListener('offline', () => {
      console.warn('🔌 [Autonomous Engine] Network Link Offline. Storing transactions locally.');
    });

    // 2. Run continuous frame-rate performance monitor
    this.monitorFps();

    // 3. Periodic system maintenance checks (every 20 seconds)
    this.maintenanceInterval = setInterval(() => {
      this.runMaintenanceCycle();
    }, 20000);

    // Initial run
    setTimeout(() => this.runMaintenanceCycle(), 2000);
  }

  /**
   * Stop the background optimizer processes
   */
  static stop(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
    }
    if (this.fpsTimer) {
      cancelAnimationFrame(this.fpsTimer);
      this.fpsTimer = null;
    }
  }

  /**
   * Background Sync trigger
   */
  private static async triggerBackgroundSync() {
    if (navigator.onLine) {
      await NeonDB.processSyncQueue();
    }
  }

  /**
   * Monitor UI FPS rendering to prevent memory leaks and lag
   */
  private static monitorFps(): void {
    const tick = () => {
      const now = performance.now();
      this.frameCount++;

      if (now >= this.lastFrameTime + 1000) {
        this.avgFps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
        this.frameCount = 0;
        this.lastFrameTime = now;

        // If FPS drops below threshold, trigger automatic canvas rendering optimization
        if (this.avgFps < 42 && !this.isOptimizedMode) {
          console.debug(`⚠️ [Autonomous Engine] Low frame rate detected (${this.avgFps} FPS). Triggering rendering optimization...`);
          this.isOptimizedMode = true;
          window.dispatchEvent(new CustomEvent('mylife_optimize_rendering', { detail: { optimize: true } }));
        } else if (this.avgFps >= 55 && this.isOptimizedMode) {
          console.debug(`⚙️ [Autonomous Engine] Frame rate recovered (${this.avgFps} FPS). Restoring high quality visuals.`);
          this.isOptimizedMode = false;
          window.dispatchEvent(new CustomEvent('mylife_optimize_rendering', { detail: { optimize: false } }));
        }
      }

      this.fpsTimer = requestAnimationFrame(tick);
    };

    this.fpsTimer = requestAnimationFrame(tick);
  }

  /**
   * Full Maintenance tasks cycle
   */
  private static async runMaintenanceCycle(): Promise<void> {
    try {
      console.debug('🤖 [Autonomous Engine] Commencing system health audit...');

      // A. Synchronize any pending offline transactions
      await this.triggerBackgroundSync();

      // B. Audit local storage and clear expired system cache if size exceeds limits
      this.auditStorageLimits();

      // C. Safeguard memory leak checks
      this.garbageCollectElements();

    } catch (err) {
      console.error('[Autonomous Engine] Maintenance cycle error:', err);
    }
  }

  /**
   * Compacts and sanitizes local storage cache if reaching quotas
   */
  private static auditStorageLimits(): void {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalSize += (localStorage.getItem(key) || '').length * 2; // approximation in bytes
        }
      }

      // Compact caches if local storage usage exceeds 3.5MB (standard limit is 5MB)
      if (totalSize > 3.5 * 1024 * 1024) {
        console.warn('💾 [Autonomous Engine] High local cache footprint. Purging non-essential transaction logs...');
        
        // Retain auth state but clean old system charts and chat history caches
        localStorage.removeItem('mylife_ai_chat_history');
        localStorage.removeItem('mylife_notifications');
      }
    } catch (e) {
      console.warn('Storage audit failed:', e);
    }
  }

  /**
   * Simulates cleanup of stale elements, listeners and caps memory growth
   */
  private static garbageCollectElements(): void {
    // Trim excessively long audit logs to keep DOM rendering fast
    try {
      const logsRaw = localStorage.getItem('mylife_audit_logs');
      if (logsRaw) {
        const logs = JSON.parse(logsRaw);
        if (logs.length > 50) {
          console.log('🧹 [Autonomous Engine] Trimming cryptographic audit logs to maintain smooth scroll rendering.');
          localStorage.setItem('mylife_audit_logs', JSON.stringify(logs.slice(0, 30)));
          window.dispatchEvent(new Event('mylife_audit_logs_trimmed'));
        }
      }
    } catch {
      // ignore
    }
  }

  static getStatus() {
    return {
      fps: this.avgFps,
      isOptimized: this.isOptimizedMode,
      syncQueueCount: (() => {
        try {
          const queue = localStorage.getItem('mylife_sync_queue');
          return queue ? JSON.parse(queue).length : 0;
        } catch {
          return 0;
        }
      })(),
      onlineStatus: navigator.onLine ? 'ONLINE' : 'OFFLINE'
    };
  }
}
