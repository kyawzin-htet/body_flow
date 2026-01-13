import { create } from 'zustand';
import { HydrationLog, HydrationSettings } from '../types';
import { HydrationRepository } from '../database/repositories/hydrationRepository';
import { HydrationSettingsRepository } from '../database/repositories/hydrationSettingsRepository';
import { NotificationService } from '../services/notificationService';

interface HydrationState {
  todayLog: HydrationLog | null;
  settings: HydrationSettings | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTodayLog: (userId: number) => Promise<void>;
  loadSettings: (userId: number) => Promise<void>;
  logWater: (userId: number, amountMl: number) => Promise<void>;
  updateSettings: (userId: number, settings: Partial<HydrationSettings>) => Promise<void>;
  initializeForUser: (userId: number) => Promise<void>;
  
  // Helpers
  getProgress: () => number;
  getRemainingMl: () => number;
  isGoalReached: () => boolean;
}

export const useHydrationStore = create<HydrationState>((set, get) => ({
  todayLog: null,
  settings: null,
  isLoading: false,
  error: null,

  loadTodayLog: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const log = await HydrationRepository.getTodayLog(userId);
      set({ todayLog: log, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load hydration log',
        isLoading: false 
      });
    }
  },

  loadSettings: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const settings = await HydrationSettingsRepository.getOrCreateSettings(userId);
      set({ settings, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load settings',
        isLoading: false 
      });
    }
  },

  logWater: async (userId, amountMl) => {
    set({ isLoading: true, error: null });
    try {
      const currentSettings = get().settings;
      const currentLog = get().todayLog;
      const date = new Date().toISOString().split('T')[0];
      const goalMl = currentSettings?.dailyGoalMl || currentLog?.goalMl || 2000;

      const log = await HydrationRepository.logWater(userId, amountMl, goalMl, date);
      set({ todayLog: log, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to log water',
        isLoading: false 
      });
    }
  },

  updateSettings: async (userId, newSettings) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await HydrationSettingsRepository.updateSettings(userId, newSettings);
      set({ settings: updated, isLoading: false });

      // Update notifications if notification settings changed
      if (
        newSettings.notificationEnabled !== undefined ||
        newSettings.notificationIntervalMinutes !== undefined ||
        newSettings.notificationStartHour !== undefined ||
        newSettings.notificationEndHour !== undefined
      ) {
        if (updated.notificationEnabled) {
          await NotificationService.scheduleHydrationNotifications(
            updated.notificationIntervalMinutes,
            updated.notificationStartHour,
            updated.notificationEndHour
          );
        } else {
          await NotificationService.cancelHydrationNotifications();
        }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update settings',
        isLoading: false 
      });
    }
  },

  initializeForUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const [log, settings] = await Promise.all([
        HydrationRepository.getTodayLog(userId),
        HydrationSettingsRepository.getOrCreateSettings(userId),
      ]);

      set({ todayLog: log, settings, isLoading: false });

      // Schedule notifications if enabled
      if (settings.notificationEnabled) {
        await NotificationService.scheduleHydrationNotifications(
          settings.notificationIntervalMinutes,
          settings.notificationStartHour,
          settings.notificationEndHour
        );
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize',
        isLoading: false 
      });
    }
  },

  // Helper methods
  getProgress: () => {
    const { todayLog, settings } = get();
    if (!todayLog) return 0;
    const goal = settings?.dailyGoalMl || todayLog.goalMl;
    return Math.min((todayLog.amountMl / goal) * 100, 100);
  },

  getRemainingMl: () => {
    const { todayLog, settings } = get();
    if (!todayLog) return settings?.dailyGoalMl || 2000;
    const goal = settings?.dailyGoalMl || todayLog.goalMl;
    return Math.max(goal - todayLog.amountMl, 0);
  },

  isGoalReached: () => {
    return get().getProgress() >= 100;
  },
}));
