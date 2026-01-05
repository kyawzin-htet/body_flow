import { exerciseDbClient } from '../api/config';
import { ExerciseDBResponse, Exercise } from '../types';
import { ExerciseRepository } from '../database/repositories/exerciseRepository';

const CACHE_DURATION_HOURS = 24;

export class ExerciseService {
  /**
   * Get exercises by body part with caching
   */

  /**
   * Get exercises by body part with caching
   */
  static async getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    try {
      // Check if we have cached data (skip for now to test API)
      const cacheAge = await ExerciseRepository.getCacheAge(bodyPart);
      const isCached = await ExerciseRepository.isCached(bodyPart);

      // Use cache if recent
      if (isCached && cacheAge !== null && cacheAge < CACHE_DURATION_HOURS) {
        return await ExerciseRepository.getExercisesByBodyPart(bodyPart);
      }

      // Fetch from API
      // The new API endpoint expects query params and returns { success: true, data: [...] }
      const response = await exerciseDbClient.get<any>(`/exercises`, {
        params: {
          name: bodyPart,
        },
      });
      
      const apiExercises = response.data.data || [];

      // Map and cache exercises
      const mappedExercises: Exercise[] = apiExercises.map((ex: any) => this.mapAPIToExercise(ex));
      
      // Cache each exercise
      for (const exercise of mappedExercises) {
        await ExerciseRepository.upsertExercise(exercise);
      }

      return mappedExercises;
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
      // Adjusting endpoint if necessary, assuming single exercise fetch might also change structure
      // For now keeping usage of mapAPIToExercise which handles fallback fields
      const response = await exerciseDbClient.get<any>(`/exercises/exercise/${id}`);
      // Check if response has data property wrapper or direct
      const exerciseData = response.data.data ? response.data.data : response.data;
      
      const exercise = this.mapAPIToExercise(exerciseData);

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
      // Assuming search endpoint might also follow new structure or similar pattern
      const response = await exerciseDbClient.get<any>(`/exercises/name/${searchTerm}`);
      const apiExercises = response.data.data || response.data; // Handle both structures just in case
      
      const exercises = Array.isArray(apiExercises) 
        ? apiExercises.slice(0, 20).map((ex: any) => this.mapAPIToExercise(ex))
        : [];

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
  private static mapAPIToExercise(apiExercise: any): Exercise {
    // Handle both old and new API response formats
    // New format: exerciseId, imageUrl, bodyParts[], targetMuscles[], equipments[]
    // Old format: id, gifUrl, bodyPart, target, equipment
    
    // Safely access arrays
    const bodyPart = Array.isArray(apiExercise.bodyParts) && apiExercise.bodyParts.length > 0 
      ? apiExercise.bodyParts[0] 
      : (apiExercise.bodyPart || 'unknown');
      
    const target = Array.isArray(apiExercise.targetMuscles) && apiExercise.targetMuscles.length > 0
      ? apiExercise.targetMuscles[0]
      : (apiExercise.target || 'unknown');
      
    const equipment = Array.isArray(apiExercise.equipments) && apiExercise.equipments.length > 0
      ? apiExercise.equipments[0]
      : (apiExercise.equipment || 'body weight');

    return {
      id: apiExercise.exerciseId || apiExercise.id,
      name: apiExercise.name,
      bodyPart,
      target,
      equipment,
      gifUrl: apiExercise.imageUrl || apiExercise.gifUrl,
      instructions: apiExercise.instructions || [],
      secondaryMuscles: apiExercise.secondaryMuscles || [],
      difficulty: this.inferDifficulty(equipment), // Recalculate based on normalized equipment
      category: this.inferCategory(equipment, apiExercise.name),
    };
  }

  /**
   * Infer difficulty from equipment
   */
  private static inferDifficulty(equipment: string): Exercise['difficulty'] {
    const bodyweightEquipment = ['body weight', 'assisted', 'leverage machine'];
    const intermediateEquipment = ['dumbbell', 'barbell', 'kettlebell', 'resistance band'];
    const advancedEquipment = ['olympic barbell', 'trap bar', 'upper body ergometer'];

    const lower = equipment ? equipment.toLowerCase() : '';
    
    if (bodyweightEquipment.some(e => lower.includes(e))) return 'beginner';
    if (advancedEquipment.some(e => lower.includes(e))) return 'advanced';
    if (intermediateEquipment.some(e => lower.includes(e))) return 'intermediate';
    
    return 'beginner';
  }

  /**
   * Infer category from equipment and name
   */
  private static inferCategory(equipment: string, name: string): Exercise['category'] {
    const lower = (equipment ? equipment.toLowerCase() : '') + ' ' + (name ? name.toLowerCase() : '');
    
    if (lower.includes('stretch') || lower.includes('flex')) return 'mobility';
    if (lower.includes('body weight') || lower.includes('pull up') || lower.includes('push up')) return 'calisthenics';
    if (lower.includes('handstand') || lower.includes('l-sit') || lower.includes('planche')) return 'gymnastics';
    
    return 'strength';
  }
}
