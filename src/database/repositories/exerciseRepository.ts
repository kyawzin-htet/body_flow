import { getDatabase } from '../db';
import { Exercise } from '../../types';

export class ExerciseRepository {
  /**
   * Create or update exercise (cache from API)
   */
  static async upsertExercise(exercise: Omit<Exercise, 'cachedAt'>): Promise<void> {
    const db = await getDatabase();
    
    const cachedAt = new Date().toISOString();
    
    await db.runAsync(
      `INSERT OR REPLACE INTO exercises 
       (id, name, body_part, target, equipment, gif_url, gif_cached_path, instructions, secondary_muscles, difficulty, category, cached_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        exercise.id,
        exercise.name,
        exercise.bodyPart,
        exercise.target,
        exercise.equipment,
        exercise.gifUrl,
        exercise.gifCachedPath || null,
        JSON.stringify(exercise.instructions),
        JSON.stringify(exercise.secondaryMuscles),
        exercise.difficulty,
        exercise.category,
        cachedAt,
      ]
    );
  }

  /**
   * Get exercise by ID
   */
  static async getExerciseById(id: string): Promise<Exercise | null> {
    const db = await getDatabase();
    
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM exercises WHERE id = ?',
      [id]
    );

    if (!row) return null;
    return this.mapRowToExercise(row);
  }

  /**
   * Get exercises by body part (from cache)
   */
  static async getExercisesByBodyPart(bodyPart: string, limit: number = 20): Promise<Exercise[]> {
    const db = await getDatabase();
    
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM exercises WHERE body_part = ? ORDER BY name LIMIT ?',
      [bodyPart, limit]
    );

    return rows.map(row => this.mapRowToExercise(row));
  }

  /**
   * Get exercises by target muscle
   */
  static async getExercisesByTarget(target: string, limit: number = 20): Promise<Exercise[]> {
    const db = await getDatabase();
    
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM exercises WHERE target = ? ORDER BY name LIMIT ?',
      [target, limit]
    );

    return rows.map(row => this.mapRowToExercise(row));
  }

  /**
   * Get exercises by equipment
   */
  static async getExercisesByEquipment(equipment: string, limit: number = 20): Promise<Exercise[]> {
    const db = await getDatabase();
    
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM exercises WHERE equipment = ? ORDER BY name LIMIT ?',
      [equipment, limit]
    );

    return rows.map(row => this.mapRowToExercise(row));
  }

  /**
   * Search exercises by name
   */
  static async searchExercises(searchTerm: string, limit: number = 20): Promise<Exercise[]> {
    const db = await getDatabase();
    
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM exercises WHERE name LIKE ? ORDER BY name LIMIT ?',
      [`%${searchTerm}%`, limit]
    );

    return rows.map(row => this.mapRowToExercise(row));
  }

  /**
   * Check if exercises are cached for a body part
   */
  static async isCached(bodyPart: string): Promise<boolean> {
    const db = await getDatabase();
    
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercises WHERE body_part = ?',
      [bodyPart]
    );

    return (result?.count || 0) > 0;
  }

  /**
   * Get cache age for body part (in hours)
   */
  static async getCacheAge(bodyPart: string): Promise<number | null> {
    const db = await getDatabase();
    
    const result = await db.getFirstAsync<{ cached_at: string }>(
      'SELECT cached_at FROM exercises WHERE body_part = ? ORDER BY cached_at DESC LIMIT 1',
      [bodyPart]
    );

    if (!result) return null;

    const cachedDate = new Date(result.cached_at);
    const now = new Date();
    const ageInHours = (now.getTime() - cachedDate.getTime()) / (1000 * 60 * 60);
    
    return ageInHours;
  }

  /**
   * Clear old cache (older than specified hours)
   */
  static async clearOldCache(maxAgeHours: number = 24): Promise<void> {
    const db = await getDatabase();
    
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - maxAgeHours);
    
    await db.runAsync(
      'DELETE FROM exercises WHERE cached_at < ?',
      [cutoffDate.toISOString()]
    );
  }

  /**
   * Map database row to Exercise object
   */
  private static mapRowToExercise(row: any): Exercise {
    return {
      id: row.id,
      name: row.name,
      bodyPart: row.body_part,
      target: row.target,
      equipment: row.equipment,
      gifUrl: row.gif_url,
      gifCachedPath: row.gif_cached_path,
      instructions: JSON.parse(row.instructions || '[]'),
      secondaryMuscles: JSON.parse(row.secondary_muscles || '[]'),
      difficulty: row.difficulty,
      category: row.category,
      cachedAt: row.cached_at,
    };
  }
}
