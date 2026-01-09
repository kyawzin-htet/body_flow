import { create } from 'zustand';
import { HydrationLog } from '../types';
import { HydrationRepository } from '../database/repositories/hydrationRepository';

interface HydrationState {
  todayLog: HydrationLog | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTodayLog: (userId: number) => Promise<void>;
  logWater: (userId: number, amountMl: number, goalMl?: number) => Promise<void>;
}

export const useHydrationStore = create<HydrationState>((set, get) => ({
  todayLog: null,
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

  logWater: async (userId, amountMl, goalMl) => {
    set({ isLoading: true, error: null });
    try {
      const currentLog = get().todayLog;
      const date = new Date().toISOString().split('T')[0];
      const targetGoal = goalMl || currentLog?.goalMl || 2000;

      const log = await HydrationRepository.logWater(userId, amountMl, targetGoal, date);
      set({ todayLog: log, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to log water',
        isLoading: false 
      });
    }
  },
}));
