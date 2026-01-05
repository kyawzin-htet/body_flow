import { create } from 'zustand';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@bodyflow_settings';

interface SettingsState extends AppSettings {
  isLoading: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setTheme: (theme: AppSettings['theme']) => Promise<void>;
  toggleNotifications: () => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleAdFreeMode: () => Promise<void>;
  setTrainingReminderTime: (time: string) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        set({ ...settings, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false });
    }
  },

  saveSettings: async (newSettings) => {
    const currentSettings = get();
    const updatedSettings = {
      theme: newSettings.theme ?? currentSettings.theme,
      notificationsEnabled: newSettings.notificationsEnabled ?? currentSettings.notificationsEnabled,
      trainingReminderTime: newSettings.trainingReminderTime ?? currentSettings.trainingReminderTime,
      restDayReminderEnabled: newSettings.restDayReminderEnabled ?? currentSettings.restDayReminderEnabled,
      soundEnabled: newSettings.soundEnabled ?? currentSettings.soundEnabled,
      analyticsEnabled: newSettings.analyticsEnabled ?? currentSettings.analyticsEnabled,
      adFreeMode: newSettings.adFreeMode ?? currentSettings.adFreeMode,
    };

    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      set(updatedSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  setTheme: async (theme) => {
    await get().saveSettings({ theme });
  },

  toggleNotifications: async () => {
    const { notificationsEnabled } = get();
    await get().saveSettings({ notificationsEnabled: !notificationsEnabled });
  },

  toggleSound: async () => {
    const { soundEnabled } = get();
    await get().saveSettings({ soundEnabled: !soundEnabled });
  },

  toggleAdFreeMode: async () => {
    const { adFreeMode } = get();
    await get().saveSettings({ adFreeMode: !adFreeMode });
  },

  setTrainingReminderTime: async (time) => {
    await get().saveSettings({ trainingReminderTime: time });
  },

  resetSettings: async () => {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
      set(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  },
}));
