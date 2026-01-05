import { create } from 'zustand';
import { User, Goal, MuscleGroup } from '../types';
import { UserRepository } from '../database/repositories/userRepository';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadUser: () => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  setUserGoals: (goals: Goal[]) => Promise<void>;
  setTargetMuscles: (muscles: MuscleGroup[]) => Promise<void>;
  setSkillLevel: (level: User['skillLevel']) => Promise<void>;
  setWeeklyFrequency: (frequency: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await UserRepository.getCurrentUser();
      set({ user, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load user',
        isLoading: false 
      });
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const user = await UserRepository.createUser(userData);
      set({ user, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create user',
        isLoading: false 
      });
    }
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (!user) {
      set({ error: 'No user to update' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const updatedUser = await UserRepository.updateUser(user.id, updates);
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update user',
        isLoading: false 
      });
    }
  },

  setUserGoals: async (goals) => {
    await get().updateUser({ goals });
  },

  setTargetMuscles: async (targetMuscles) => {
    await get().updateUser({ targetMuscles });
  },

  setSkillLevel: async (skillLevel) => {
    await get().updateUser({ skillLevel });
  },

  setWeeklyFrequency: async (weeklyFrequency) => {
    await get().updateUser({ weeklyFrequency });
  },
}));
