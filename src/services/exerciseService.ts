import { exerciseDbClient } from '../api/config';
import { ExerciseDBResponse, Exercise } from '../types';
import { ExerciseRepository } from '../database/repositories/exerciseRepository';

const CACHE_DURATION_HOURS = 24;

export class ExerciseService {
  /**
   * Get exercises by body part with caching
   */
  static async getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    try {
      // Check if we have cached data
      const cacheAge = await ExerciseRepository.getCacheAge(bodyPart);
      const isCached = await ExerciseRepository.isCached(bodyPart);

      // Use cache if recent
      if (isCached && cacheAge !== null && cacheAge < CACHE_DURATION_HOURS) {
        return await ExerciseRepository.getExercisesByBodyPart(bodyPart);
      }

      // Fetch from API
      const response = await exerciseDbClient.get<ExerciseDBResponse[]>(`/exercises/bodyPart/${bodyPart}`);
      const apiExercises = response.data;

      // Map and cache exercises
      const exercises: Exercise[] = apiExercises.slice(0, 20).map(this.mapAPIToExercise);
      
      // Cache each exercise
      for (const exercise of exercises) {
        await ExerciseRepository.upsertExercise(exercise);
      }

      return exercises;
    } catch (error) {
      console.error('Error fetching exercises by body part:', error);
      
      // Fallback to cache even if old
      const cachedExercises = await ExerciseRepository.getExercisesByBodyPart(bodyPart);
      if (cachedExercises.length > 0) {
        return cachedExercises;
      }
      
      throw error;
    }
  }

  /**
   * Get exercise by ID with caching
   */
  static async getExerciseById(id: string): Promise<Exercise | null> {
    try {
      // Try cache first
      const cached = await ExerciseRepository.getExerciseById(id);
      if (cached) return cached;

      // Fetch from API
      const response = await exerciseDbClient.get<ExerciseDBResponse>(`/exercises/exercise/${id}`);
      const exercise = this.mapAPIToExercise(response.data);

      // Cache it
      await ExerciseRepository.upsertExercise(exercise);

      return exercise;
    } catch (error) {
      console.error('Error fetching exercise by ID:', error);
      return null;
    }
  }

  /**
   * Search exercises
   */
  static async searchExercises(searchTerm: string): Promise<Exercise[]> {
    try {
      // Try cache first
      const cachedResults = await ExerciseRepository.searchExercises(searchTerm);
      if (cachedResults.length > 0) {
        return cachedResults;
      }

      // Fetch from API
      const response = await exerciseDbClient.get<ExerciseDBResponse[]>(`/exercises/name/${searchTerm}`);
      const exercises = response.data.slice(0, 20).map(this.mapAPIToExercise);

      // Cache results
      for (const exercise of exercises) {
        await ExerciseRepository.upsertExercise(exercise);
      }

      return exercises;
    } catch (error) {
      console.error('Error searching exercises:', error);
      return [];
    }
  }

  /**
   * Map API response to Exercise type
   */
  private static mapAPIToExercise(apiExercise: ExerciseDBResponse): Exercise {
    return {
      id: apiExercise.id,
      name: apiExercise.name,
      bodyPart: apiExercise.bodyPart,
      target: apiExercise.target,
      equipment: apiExercise.equipment,
      gifUrl: apiExercise.gifUrl,
      instructions: apiExercise.instructions,
      secondaryMuscles: apiExercise.secondaryMuscles || [],
      difficulty: this.inferDifficulty(apiExercise.equipment),
      category: this.inferCategory(apiExercise.equipment, apiExercise.name),
    };
  }

  /**
   * Infer difficulty from equipment
   */
  private static inferDifficulty(equipment: string): Exercise['difficulty'] {
    const bodyweightEquipment = ['body weight', 'assisted', 'leverage machine'];
    const intermediateEquipment = ['dumbbell', 'barbell', 'kettlebell', 'resistance band'];
    const advancedEquipment = ['olympic barbell', 'trap bar', 'upper body ergometer'];

    const lower = equipment.toLowerCase();
    
    if (bodyweightEquipment.some(e => lower.includes(e))) return 'beginner';
    if (advancedEquipment.some(e => lower.includes(e))) return 'advanced';
    if (intermediateEquipment.some(e => lower.includes(e))) return 'intermediate';
    
    return 'beginner';
  }

  /**
   * Infer category from equipment and name
   */
  private static inferCategory(equipment: string, name: string): Exercise['category'] {
    const lower = equipment.toLowerCase() + ' ' + name.toLowerCase();
    
    if (lower.includes('stretch') || lower.includes('flex')) return 'mobility';
    if (lower.includes('body weight') || lower.includes('pull up') || lower.includes('push up')) return 'calisthenics';
    if (lower.includes('handstand') || lower.includes('l-sit') || lower.includes('planche')) return 'gymnastics';
    
    return 'strength';
  }
}
