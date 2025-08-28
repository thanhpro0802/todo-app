import { create } from 'zustand';
import { AppSettings, Theme } from '../types';

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setTheme: (theme: Theme) => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
  resetToDefaults: () => void;
}

const defaultSettings: AppSettings = {
  theme: {
    theme: 'auto',
    primaryColor: '#3B82F6',
    accentColor: '#10B981'
  },
  notifications: {
    enabled: true,
    dueDateReminders: true,
    dailyReminders: false
  },
  productivity: {
    enableTimeTracking: false,
    enableAnalytics: true,
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  },
  display: {
    showSubtasks: true,
    showCategories: true,
    showPriorities: true,
    compactMode: false
  }
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates }
    }));
    get().saveToLocalStorage();
  },

  setTheme: (theme) => {
    set((state) => ({
      settings: {
        ...state.settings,
        theme: { ...state.settings.theme, theme }
      }
    }));
    get().saveToLocalStorage();
  },

  loadFromLocalStorage: () => {
    try {
      const settingsData = localStorage.getItem('todo-settings');
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        set({ settings: { ...defaultSettings, ...settings } });
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
  },

  saveToLocalStorage: () => {
    try {
      const { settings } = get();
      localStorage.setItem('todo-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  },

  resetToDefaults: () => {
    set({ settings: defaultSettings });
    get().saveToLocalStorage();
  }
}));