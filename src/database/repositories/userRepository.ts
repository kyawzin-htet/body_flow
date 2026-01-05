import { getDatabase } from '../db';
import { User, Goal, MuscleGroup } from '../../types';

export class UserRepository {
  /**
   * Create a new user
   */
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = await getDatabase();
    
    const result = await db.runAsync(
      `INSERT INTO users (name, skill_level, goals, target_muscles, weekly_frequency)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userData.name,
        userData.skillLevel,
        JSON.stringify(userData.goals),
        JSON.stringify(userData.targetMuscles),
        userData.weeklyFrequency,
      ]
    );

    const userId = result.lastInsertRowId;
    const user = await this.getUserById(userId);
    
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number): Promise<User | null> {
    const db = await getDatabase();
    
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!row) return null;

    return this.mapRowToUser(row);
  }

  /**
   * Get the current user (assumes single user for MVP)
   */
  static async getCurrentUser(): Promise<User | null> {
    const db = await getDatabase();
    
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM users ORDER BY id DESC LIMIT 1'
    );

    if (!row) return null;

    return this.mapRowToUser(row);
  }

  /**
   * Update user profile
   */
  static async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const db = await getDatabase();
    
    const setClause: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      setClause.push('name = ?');
      values.push(updates.name);
    }
    if (updates.skillLevel !== undefined) {
      setClause.push('skill_level = ?');
      values.push(updates.skillLevel);
    }
    if (updates.goals !== undefined) {
      setClause.push('goals = ?');
      values.push(JSON.stringify(updates.goals));
    }
    if (updates.targetMuscles !== undefined) {
      setClause.push('target_muscles = ?');
      values.push(JSON.stringify(updates.targetMuscles));
    }
    if (updates.weeklyFrequency !== undefined) {
      setClause.push('weekly_frequency = ?');
      values.push(updates.weeklyFrequency);
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.runAsync(
      `UPDATE users SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );

    const user = await this.getUserById(id);
    if (!user) throw new Error('Failed to update user');
    return user;
  }

  /**
   * Delete user
   */
  static async deleteUser(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
  }

  /**
   * Map database row to User object
   */
  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      skillLevel: row.skill_level,
      goals: JSON.parse(row.goals || '[]') as Goal[],
      targetMuscles: JSON.parse(row.target_muscles || '[]') as MuscleGroup[],
      weeklyFrequency: row.weekly_frequency,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
