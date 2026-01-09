import { getDatabase } from '../db';
import { BodyMeasurement } from '../../types';

export class MeasurementRepository {
  /**
   * Add a new measurement
   */
  static async addMeasurement(data: Omit<BodyMeasurement, 'id' | 'createdAt'>): Promise<BodyMeasurement> {
    const db = await getDatabase();
    
    const result = await db.runAsync(
      `INSERT INTO body_measurements (user_id, date, weight, body_fat, chest, waist, arms, legs, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId,
        data.date,
        data.weight || null,
        data.bodyFat || null,
        data.chest || null,
        data.waist || null,
        data.arms || null,
        data.legs || null,
        data.notes || null,
      ]
    );

    const measurement = await this.getMeasurementById(result.lastInsertRowId);
    if (!measurement) throw new Error('Failed to create measurement');
    return measurement;
  }

  /**
   * Get measurement by ID
   */
  static async getMeasurementById(id: number): Promise<BodyMeasurement | null> {
    const db = await getDatabase();
    
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM body_measurements WHERE id = ?',
      [id]
    );

    if (!row) return null;
    return this.mapRowToMeasurement(row);
  }

  /**
   * Get measurement history for a user
   */
  static async getHistory(userId: number, limit: number = 20): Promise<BodyMeasurement[]> {
    const db = await getDatabase();
    
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM body_measurements WHERE user_id = ? ORDER BY date DESC LIMIT ?',
      [userId, limit]
    );

    return rows.map(row => this.mapRowToMeasurement(row));
  }
  
  /**
   * Get latest measurement
   */
  static async getLatest(userId: number): Promise<BodyMeasurement | null> {
    const db = await getDatabase();
    
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM body_measurements WHERE user_id = ? ORDER BY date DESC LIMIT 1',
      [userId]
    );

    if (!row) return null;
    return this.mapRowToMeasurement(row);
  }

  /**
   * Map database row to BodyMeasurement object
   */
  private static mapRowToMeasurement(row: any): BodyMeasurement {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      weight: row.weight,
      bodyFat: row.body_fat,
      chest: row.chest,
      waist: row.waist,
      arms: row.arms,
      legs: row.legs,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }
}
