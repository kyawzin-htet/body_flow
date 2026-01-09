import { getDatabase } from '../db';
import { HydrationLog } from '../../types';

export class HydrationRepository {
  /**
   * Log water intake
   */
  static async logWater(userId: number, amountMl: number, goalMl: number, date: string): Promise<HydrationLog> {
    const db = await getDatabase();

    // Check if log exists for this date
    const existing = await db.getFirstAsync<any>(
      'SELECT * FROM hydration_logs WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (existing) {
      // Update existing log
      await db.runAsync(
        'UPDATE hydration_logs SET amount_ml = ?, goal_ml = ? WHERE id = ?',
        [existing.amount_ml + amountMl, goalMl, existing.id]
      );
      return this.getLogById(existing.id) as Promise<HydrationLog>;
    }

    // Create new log
    const result = await db.runAsync(
      `INSERT INTO hydration_logs (user_id, date, amount_ml, goal_ml)
       VALUES (?, ?, ?, ?)`,
      [userId, date, amountMl, goalMl]
    );

    const log = await this.getLogById(result.lastInsertRowId);
    if (!log) throw new Error('Failed to create hydration log');
    return log;
  }

  /**
   * Get log by ID
   */
  static async getLogById(id: number): Promise<HydrationLog | null> {
    const db = await getDatabase();
    
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM hydration_logs WHERE id = ?',
      [id]
    );

    if (!row) return null;
    return this.mapRowToLog(row);
  }

  /**
   * Get today's log
   */
  static async getTodayLog(userId: number): Promise<HydrationLog | null> {
    const today = new Date().toISOString().split('T')[0];
    const db = await getDatabase();

    const row = await db.getFirstAsync<any>(
      'SELECT * FROM hydration_logs WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (!row) return null;
    return this.mapRowToLog(row);
  }

  /**
   * Map database row to HydrationLog object
   */
  private static mapRowToLog(row: any): HydrationLog {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      amountMl: row.amount_ml,
      goalMl: row.goal_ml,
      createdAt: row.created_at,
    };
  }
}
