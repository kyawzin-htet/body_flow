import { create } from 'zustand';
import { Habit, HabitLog, HabitWithLogs } from '../types';
import { HabitRepository } from '../database/repositories/habitRepository';

interface HabitState {
  habits: HabitWithLogs[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadHabits: (userId: number) => Promise<void>;
  createHabit: (habitData: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  logHabit: (habitId: number, logData: Omit<HabitLog, 'id' | 'habitId' | 'createdAt'>) => Promise<void>;
  updateHabit: (habitId: number, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: number) => Promise<void>;
  toggleHabitActive: (habitId: number) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  loadHabits: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const habits = await HabitRepository.getHabitsWithTodayLogs(userId);
      set({ habits, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load habits',
        isLoading: false 
      });
    }
  },

  createHabit: async (habitData) => {
    set({ isLoading: true, error: null });
    try {
      await HabitRepository.createHabit(habitData);
      // Reload habits to get the updated list
      await get().loadHabits(habitData.userId);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create habit',
        isLoading: false 
      });
    }
  },

  logHabit: async (habitId, logData) => {
    set({ error: null });
    try {
      await HabitRepository.logHabit({
        habitId,
        ...logData,
      });
      
      // Update the specific habit in state
      const { habits } = get();
      const updatedHabits = await Promise.all(
        habits.map(async (habit) => {
          if (habit.id === habitId) {
            const todayLog = await HabitRepository.getTodayLog(habitId, logData.date);
            const streak = await HabitRepository.calculateStreak(habitId);
            return {
              ...habit,
              todayLog,
              currentStreak: streak.current,
              bestStreak: streak.best,
            };
          }
          return habit;
        })
      );
      
      set({ habits: updatedHabits });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to log habit'
      });
    }
  },

  updateHabit: async (habitId, updates) => {
    set({ error: null });
    try {
      await HabitRepository.updateHabit(habitId, updates);
      
      // Update the specific habit in state
      const { habits } = get();
      const updatedHabits = habits.map((habit) =>
        habit.id === habitId ? { ...habit, ...updates } : habit
      );
      
      set({ habits: updatedHabits });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update habit'
      });
    }
  },

  deleteHabit: async (habitId) => {
    set({ error: null });
    try {
      await HabitRepository.deleteHabit(habitId);
      
      // Remove from state
      const { habits } = get();
      const updatedHabits = habits.filter((habit) => habit.id !== habitId);
      set({ habits: updatedHabits });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete habit'
      });
    }
  },

  toggleHabitActive: async (habitId) => {
    const { habits } = get();
    const habit = habits.find((h) => h.id === habitId);
    
    if (habit) {
      await get().updateHabit(habitId, { active: !habit.active });
    }
  },
}));
