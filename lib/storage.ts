// Local Storage utilities for lottery app
export interface LotteryResult {
  id: string;
  numbers: number[];
  timestamp: number;
  date: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  autoSpin: boolean;
  autoSpinInterval: number; // in seconds
  favoriteNumbers: number[][];
  maxRange: number;
  customSoundUrl?: string;
}

const STORAGE_KEYS = {
  LOTTERY_HISTORY: 'lottery_history',
  APP_SETTINGS: 'app_settings',
  FAVORITE_NUMBERS: 'favorite_numbers'
};

// Lottery History Management
export const lotteryStorage = {
  // Get all lottery results
  getHistory(): LotteryResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOTTERY_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Error reading lottery history:', error);
      return [];
    }
  },

  // Add new result to history
  addResult(numbers: number[]): void {
    try {
      const history = this.getHistory();
      const newResult: LotteryResult = {
        id: Date.now().toString(),
        numbers: [...numbers],
        timestamp: Date.now(),
        date: new Date().toLocaleString('vi-VN')
      };

      // Keep only last 50 results
      history.unshift(newResult);
      if (history.length > 50) {
        history.splice(50);
      }

      localStorage.setItem(STORAGE_KEYS.LOTTERY_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.warn('Error saving lottery result:', error);
    }
  },

  // Clear all history
  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOTTERY_HISTORY);
    } catch (error) {
      console.warn('Error clearing history:', error);
    }
  },

  // Get statistics
  getStats() {
    const history = this.getHistory();
    const totalGames = history.length;

    if (totalGames === 0) {
      return {
        totalGames: 0,
        averageSum: 0,
        mostFrequentNumbers: [],
        recentNumbers: []
      };
    }

    // Calculate average sum
    const sums = history.map(result => result.numbers.reduce((a, b) => a + b, 0));
    const averageSum = Math.round(sums.reduce((a, b) => a + b, 0) / sums.length);

    // Find most frequent numbers
    const numberFrequency: { [key: number]: number } = {};
    history.forEach(result => {
      result.numbers.forEach(num => {
        numberFrequency[num] = (numberFrequency[num] || 0) + 1;
      });
    });

    const mostFrequentNumbers = Object.entries(numberFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([num]) => parseInt(num));

    return {
      totalGames,
      averageSum,
      mostFrequentNumbers,
      recentNumbers: history.slice(0, 5).map(r => r.numbers)
    };
  }
};

// App Settings Management
export const settingsStorage = {
  // Get current settings with defaults
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      const defaultSettings: AppSettings = {
        soundEnabled: true,
        theme: 'light',
        autoSpin: false,
        autoSpinInterval: 30,
        favoriteNumbers: [],
        maxRange: 99999
      };

      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch (error) {
      console.warn('Error reading settings:', error);
      return {
        soundEnabled: true,
        theme: 'light',
        autoSpin: false,
        autoSpinInterval: 30,
        favoriteNumbers: [],
        maxRange: 99999
      };
    }
  },

  // Update settings
  updateSettings(newSettings: Partial<AppSettings>): void {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn('Error saving settings:', error);
    }
  },

  // Reset to defaults
  resetSettings(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.APP_SETTINGS);
    } catch (error) {
      console.warn('Error resetting settings:', error);
    }
  }
};

// Favorite Numbers Management
export const favoritesStorage = {
  // Get favorite number sets
  getFavorites(): number[][] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITE_NUMBERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Error reading favorites:', error);
      return [];
    }
  },

  // Add favorite number set
  addFavorite(numbers: number[]): void {
    try {
      const favorites = this.getFavorites();
      const numberStr = numbers.join('');

      // Check if already exists
      const exists = favorites.some(fav => fav.join('') === numberStr);
      if (!exists) {
        favorites.push([...numbers]);
        localStorage.setItem(STORAGE_KEYS.FAVORITE_NUMBERS, JSON.stringify(favorites));
      }
    } catch (error) {
      console.warn('Error saving favorite:', error);
    }
  },

  // Remove favorite number set
  removeFavorite(index: number): void {
    try {
      const favorites = this.getFavorites();
      favorites.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.FAVORITE_NUMBERS, JSON.stringify(favorites));
    } catch (error) {
      console.warn('Error removing favorite:', error);
    }
  }
};
