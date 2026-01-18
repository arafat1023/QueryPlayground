/**
 * Storage monitoring service
 * Tracks localStorage and IndexedDB usage
 */

export interface StorageInfo {
  localStorage: {
    used: number;        // bytes
    total: number;       // bytes (estimated)
    percentage: number;  // 0-100
    keys: string[];      // all keys with 'qp_' prefix
  };
  indexedDB: {
    used: number;        // bytes (estimated)
    total: number;       // browser-dependent (usually 50MB+)
    percentage: number;
  };
  combined: {
    used: number;
    total: number;
    percentage: number;
  };
}

class StorageMonitor {
  /**
   * Calculate localStorage usage for QueryPlayground keys
   */
  private getLocalStorageUsage(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('qp_')) {
        total += (key.length + localStorage.getItem(key)!.length) * 2; // UTF-16
      }
    }
    return total;
  }

  /**
   * Estimate IndexedDB usage (PGlite data)
   */
  private async getIndexedDBUsage(): Promise<number> {
    try {
      // Check if we can estimate from localStorage metadata
      const meta = localStorage.getItem('qp_pg_meta');
      if (meta) {
        return JSON.parse(meta).size || 0;
      }
      // Rough estimate based on default data size
      return 50000; // ~50KB base estimate
    } catch {
      return 0;
    }
  }

  /**
   * Get complete storage information
   */
  async getStorageInfo(): Promise<StorageInfo> {
    const localUsed = this.getLocalStorageUsage();
    const indexedDBUsed = await this.getIndexedDBUsage();

    // localStorage typically 5-10MB
    const localTotal = 5 * 1024 * 1024; // 5MB conservative estimate
    // IndexedDB typically 50MB+
    const indexedDBTotal = 50 * 1024 * 1024;

    const combinedUsed = localUsed + indexedDBUsed;
    const combinedTotal = localTotal + indexedDBTotal;

    return {
      localStorage: {
        used: localUsed,
        total: localTotal,
        percentage: (localUsed / localTotal) * 100,
        keys: this.getQueryPlaygroundKeys(),
      },
      indexedDB: {
        used: indexedDBUsed,
        total: indexedDBTotal,
        percentage: (indexedDBUsed / indexedDBTotal) * 100,
      },
      combined: {
        used: combinedUsed,
        total: combinedTotal,
        percentage: (combinedUsed / combinedTotal) * 100,
      },
    };
  }

  /**
   * Get all QueryPlayground localStorage keys
   */
  private getQueryPlaygroundKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('qp_')) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Format bytes to human-readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * Check if near quota limit
   * @param threshold - Percentage threshold (default 80)
   */
  async isNearQuotaLimit(threshold: number = 80): Promise<boolean> {
    const info = await this.getStorageInfo();
    return info.localStorage.percentage >= threshold;
  }

  /**
   * Test if we can write to localStorage
   */
  testWrite(): boolean {
    try {
      const testKey = '__storage_test__';
      const testValue = 'x'.repeat(1024); // 1KB
      localStorage.setItem(testKey, testValue);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

export const storageMonitor = new StorageMonitor();
