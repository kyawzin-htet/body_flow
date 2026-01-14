import { create } from 'zustand';
import { BodyMeasurement } from '../types';
import { MeasurementRepository } from '../database/repositories/measurementRepository';

interface MeasurementState {
  history: BodyMeasurement[];
  latest: BodyMeasurement | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadHistory: (userId: number) => Promise<void>;
  addMeasurement: (measurementData: Omit<BodyMeasurement, 'id' | 'createdAt'>) => Promise<void>;
  resetAllData: () => void;
}

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  history: [],
  latest: null,
  isLoading: false,
  error: null,

  loadHistory: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const history = await MeasurementRepository.getHistory(userId);
      const latest = history.length > 0 ? history[0] : null;
      set({ history, latest, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load measurement history',
        isLoading: false 
      });
    }
  },

  addMeasurement: async (measurementData) => {
    set({ isLoading: true, error: null });
    try {
      await MeasurementRepository.addMeasurement(measurementData);
      // Reload history to get updated list
      await get().loadHistory(measurementData.userId);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add measurement',
        isLoading: false 
      });
    }
  },

  resetAllData: () => {
    // Immediately clear state for instant UI update
    set({ history: [], latest: null, isLoading: false, error: null });
  },
}));
