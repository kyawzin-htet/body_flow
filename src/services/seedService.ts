import { HabitRepository } from '../database/repositories/habitRepository';

export interface SampleHabit {
  name: string;
  type: 'reps' | 'time';
  targetSets: number;
  targetReps?: number;
  targetTime?: number;
  frequency: 'daily' | 'weekly';
}

const SAMPLE_HABITS: SampleHabit[] = [
  {
    name: 'Push-ups',
    type: 'reps',
    targetSets: 3,
    targetReps: 15,
    frequency: 'daily',
  },
  {
    name: 'Plank Hold',
    type: 'time',
    targetSets: 3,
    targetTime: 30,
    frequency: 'daily',
  },
  {
    name: 'Pull-ups',
    type: 'reps',
    targetSets: 3,
    targetReps: 8,
    frequency: 'daily',
  },
];

export class SeedService {
  /**
   * Seed sample habits for a new user
   */
  static async seedSampleHabits(userId: number): Promise<void> {
    try {
      for (const habit of SAMPLE_HABITS) {
        await HabitRepository.createHabit({
          userId,
          exerciseId: undefined,
          name: habit.name,
          type: habit.type,
          targetSets: habit.targetSets,
          targetReps: habit.targetReps,
          targetTime: habit.targetTime,
          frequency: habit.frequency,
          active: true,
        });
      }
      console.log('Sample habits seeded successfully');
    } catch (error) {
      console.error('Error seeding sample habits:', error);
    }
  }

  /**
   * Check if user needs sample data
   */
  static async shouldSeedData(userId: number): Promise<boolean> {
    try {
      const habits = await HabitRepository.getHabitsByUserId(userId, false);
      return habits.length === 0;
    } catch (error) {
      console.error('Error checking if should seed data:', error);
      return false;
    }
  }
}
