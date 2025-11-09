// Browser storage utilities for the extension
export interface StoredRequestStats {
  totalRequests: number;
  remainingRequests: number;
  maxRequests: number;
  lastUpdate: number;
  resetTime?: number;
}

export interface StoredHistoryItem {
  id: string;
  word: string;
  context: string;
  definition: {
    word: string;
    literalMeaning: string;
    contextualMeaning: string;
    partOfSpeech?: string;
    confidence: number;
    timestamp: string;
  };
  timestamp: string;
}

export interface StoredUserSettings {
  userId: string;
  maxHistoryItems: number;
  showConfidence: boolean;
  autoCloseTooltip: boolean;
  tooltipDelay: number;
}

class StorageHelper {
  // Generate or get user ID
  async getUserId(): Promise<string> {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["userId"], (result) => {
          if (result.userId) {
            resolve(result.userId);
          } else {
            const newUserId = this.generateUserId();
            chrome.storage.local.set({ userId: newUserId }, () => {
              resolve(newUserId);
            });
          }
        });
      } else {
        // Fallback for testing/development
        let userId = localStorage.getItem("contextExtensionUserId");
        if (!userId) {
          userId = this.generateUserId();
          localStorage.setItem("contextExtensionUserId", userId);
        }
        resolve(userId);
      }
    });
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Request statistics management
  async getRequestStats(): Promise<StoredRequestStats> {
    return new Promise((resolve) => {
      const defaultStats: StoredRequestStats = {
        totalRequests: 0,
        remainingRequests: 100,
        maxRequests: 100,
        lastUpdate: Date.now(),
      };

      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["requestStats"], (result) => {
          resolve(result.requestStats || defaultStats);
        });
      } else {
        // Fallback for testing
        const stored = localStorage.getItem("contextExtensionStats");
        resolve(stored ? JSON.parse(stored) : defaultStats);
      }
    });
  }

  async updateRequestStats(stats: Partial<StoredRequestStats>): Promise<void> {
    return new Promise((resolve) => {
      const updatedStats = {
        ...stats,
        lastUpdate: Date.now(),
      };

      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ requestStats: updatedStats }, () => {
          resolve();
        });
      } else {
        // Fallback for testing
        localStorage.setItem(
          "contextExtensionStats",
          JSON.stringify(updatedStats)
        );
        resolve();
      }
    });
  }

  // Request history management
  async getRequestHistory(): Promise<StoredHistoryItem[]> {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["requestHistory"], (result) => {
          resolve(result.requestHistory || []);
        });
      } else {
        // Fallback for testing
        const stored = localStorage.getItem("contextExtensionHistory");
        resolve(stored ? JSON.parse(stored) : []);
      }
    });
  }

  async addToHistory(item: StoredHistoryItem): Promise<void> {
    const history = await this.getRequestHistory();

    // Add to beginning of array
    history.unshift(item);

    // Keep only last 50 items
    const trimmedHistory = history.slice(0, 50);

    return this.saveHistory(trimmedHistory);
  }

  private async saveHistory(history: StoredHistoryItem[]): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ requestHistory: history }, () => {
          resolve();
        });
      } else {
        // Fallback for testing
        localStorage.setItem(
          "contextExtensionHistory",
          JSON.stringify(history)
        );
        resolve();
      }
    });
  }

  async clearHistory(): Promise<void> {
    return this.saveHistory([]);
  }

  // User settings management
  async getUserSettings(): Promise<StoredUserSettings> {
    return new Promise(async (resolve) => {
      const userId = await this.getUserId();
      const defaultSettings: StoredUserSettings = {
        userId,
        maxHistoryItems: 50,
        showConfidence: true,
        autoCloseTooltip: false,
        tooltipDelay: 500,
      };

      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.get(["userSettings"], (result) => {
          resolve({ ...defaultSettings, ...result.userSettings });
        });
      } else {
        // Fallback for testing
        const stored = localStorage.getItem("contextExtensionSettings");
        resolve(
          stored
            ? { ...defaultSettings, ...JSON.parse(stored) }
            : defaultSettings
        );
      }
    });
  }

  async updateUserSettings(
    settings: Partial<StoredUserSettings>
  ): Promise<void> {
    return new Promise(async (resolve) => {
      const currentSettings = await this.getUserSettings();
      const updatedSettings = { ...currentSettings, ...settings };

      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.set({ userSettings: updatedSettings }, () => {
          resolve();
        });
      } else {
        // Fallback for testing
        localStorage.setItem(
          "contextExtensionSettings",
          JSON.stringify(updatedSettings)
        );
        resolve();
      }
    });
  }

  // Cache management for definitions
  async getCachedDefinition(
    word: string,
    contextHash: string
  ): Promise<StoredHistoryItem | null> {
    const history = await this.getRequestHistory();
    const cacheKey = `${word.toLowerCase()}_${contextHash}`;

    // Look for recent cached definition (within last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const cachedItem = history.find((item) => {
      const itemKey = `${item.word.toLowerCase()}_${this.hashString(
        item.context
      )}`;
      const itemTime = new Date(item.timestamp).getTime();
      return itemKey === cacheKey && itemTime > oneHourAgo;
    });

    return cachedItem || null;
  }

  // Simple hash function for context caching
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Data export/import for backup
  async exportData(): Promise<string> {
    const [stats, history, settings] = await Promise.all([
      this.getRequestStats(),
      this.getRequestHistory(),
      this.getUserSettings(),
    ]);

    const exportData = {
      stats,
      history,
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      if (data.stats) await this.updateRequestStats(data.stats);
      if (data.history) await this.saveHistory(data.history);
      if (data.settings) await this.updateUserSettings(data.settings);
    } catch (error) {
      throw new Error("Invalid backup data format");
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.clear(() => {
          chrome.storage.sync.clear(() => {
            resolve();
          });
        });
      } else {
        // Clear fallback storage
        localStorage.removeItem("contextExtensionUserId");
        localStorage.removeItem("contextExtensionStats");
        localStorage.removeItem("contextExtensionHistory");
        localStorage.removeItem("contextExtensionSettings");
        resolve();
      }
    });
  }
}

export const storageHelper = new StorageHelper();
