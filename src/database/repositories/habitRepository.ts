import { getDatabase } from '../db';
import { Habit, HabitLog, HabitWithLogs } from '../../types';

export class HabitRepository {
  /**
   * Create a new habit
   */
  static async createHabit(habitData: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    const db = await getDatabase();
    
    const result = await db.runAsync(
      `INSERT INTO habits (user_id, exercise_id, name, type, target_sets, target_reps, target_time, frequency, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        habitData.userId,
        habitData.exerciseId || null,
        habitData.name,
        habitData.type,
        habitData.targetSets,
        habitData.targetReps || null,
        habitData.targetTime || null,
        habitData.frequency,
        habitData.active ? 1 : 0,
      ]
    );

    const habitId = result.lastInsertRowId;
    const habit = await this.getHabitById(habitId);
    
    if (!habit) throw new Error('Failed to create habit');
    return habit;
  }

  /**
   * Get habit by ID
   */
  static async getHabitById(id: number): Promise<Habit | null> {
    const db = await getDatabase();
    
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM habits WHERE id = ?',
      [id]
    );

    if (!row) return null;
    return this.mapRowToHabit(row);
  }

  /**
   * Get all habits for a user
   */
  static async getHabitsByUserId(userId: number, activeOnly: boolean = true): Promise<Habit[]> {
    const db = await getDatabase();
    
    let query = 'SELECT * FROM habits WHERE user_id = ?';
    const params: any[] = [userId];

    if (activeOnly) {
      query += ' AND active = 1';
    }

    query += ' ORDER BY created_at DESC';

    const rows = await db.getAllAsync<any>(query, params);
    return rows.map(row => this.mapRowToHabit(row));
  }

  /**
   * Get habits with today's logs
   */
  static async getHabitsWithTodayLogs(userId: number): Promise<HabitWithLogs[]> {
    const habits = await this.getHabitsByUserId(userId, true);
    const today = new Date().toISOString().split('T')[0];

    const habitsWithLogs: HabitWithLogs[] = [];

    for (const habit of habits) {
      const todayLog = await this.getTodayLog(habit.id, today);
      const streak = await this.calculateStreak(habit.id);
      
      habitsWithLogs.push({
        ...habit,
        logs: todayLog ? [todayLog] : [],
        todayLog: todayLog ?? undefined,
        currentStreak: streak.current,
        bestStreak: streak.best,
      });
    }

    return habitsWithLogs;
  }

  /**
   * Log habit completion
   */
  static async logHabit(logData: Omit<HabitLog, 'id' | 'createdAt'>): Promise<HabitLog> {
    const db = await getDatabase();

    // Check if log already exists for this date
    const existing = await db.getFirstAsync<any>(
      'SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?',
      [logData.habitId, logData.date]
    );

    if (existing) {
      // Update existing log
      await db.runAsync(
        `UPDATE habit_logs 
         SET completed = ?, sets_completed = ?, reps_completed = ?, time_completed = ?, notes = ?
         WHERE id = ?`,
        [
          logData.completed ? 1 : 0,
          logData.setsCompleted,
          logData.repsCompleted || null,
          logData.timeCompleted || null,
          logData.notes || null,
          existing.id,
        ]
      );

      const log = await this.getLogById(existing.id);
      if (!log) throw new Error('Failed to update log');
      return log;
    }

    // Create new log
    const result = await db.runAsync(
      `INSERT INTO habit_logs (habit_id, completed, sets_completed, reps_completed, time_completed, notes, date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        logData.habitId,
        logData.completed ? 1 : 0,
        logData.setsCompleted,
        logData.repsCompleted || null,
        logData.timeCompleted || null,
        logData.notes || null,
        logData.date,
      ]
    );

    const logId = result.lastInsertRowId;
    const log = await this.getLogById(logId);
    if (!log) throw new Error('Failed to create log');
    return log;
  }

  /**
   * Get today's log for a habit
   */
  static async getTodayLog(habitId: number, date: string): Promise<HabitLog | null> {
    const db = await getDatabase();
    
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?',
      [habitId, date]
    );

    if (!row) return null;
    return this.mapRowToLog(row);
  }

  /**
   * Get log by ID
   */
  static async getLogById(id: number): Promise<HabitLog | null> {
    const db = await getDatabase();
    
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM habit_logs WHERE id = ?',
      [id]
    );

    if (!row) return null;
    return this.mapRowToLog(row);
  }

  /**
   * Get all logs for a habit (for calendar heatmap)
   */
  static async getLogsByHabitId(habitId: number, limit: number = 365): Promise<HabitLog[]> {
    const db = await getDatabase();
    
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY date DESC LIMIT ?`,
      [habitId, limit]
    );

    return rows.map(row => this.mapRowToLog(row));
  }

  /**
   * Calculate current and best streak for a habit
   */
  static async calculateStreak(habitId: number): Promise<{ current: number; best: number }> {
    const db = await getDatabase();
    
    const logs = await db.getAllAsync<any>(
      `SELECT date, completed FROM habit_logs 
       WHERE habit_id = ? AND completed = 1 
       ORDER BY date DESC 
       LIMIT 365`,
      [habitId]
    );

    if (logs.length === 0) {
      return { current: 0, best: 0 };
    }

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let expectedDate = new Date();

    for (const log of logs) {
      const logDate = new Date(log.date);
      const diffDays = Math.floor((expectedDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        tempStreak++;
        if (currentStreak === 0 || diffDays === 0 || diffDays === 1) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 1;
      }

      bestStreak = Math.max(bestStreak, tempStreak);
      expectedDate = new Date(logDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
    }

    // Check if current streak is still valid (not more than 1 day ago)
    const lastLogDate = new Date(logs[0].date);
    const today = new Date();
    const daysSinceLastLog = Math.floor((today.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastLog > 1) {
      currentStreak = 0;
    }

    return { current: currentStreak, best: bestStreak };
  }

  /**
   * Update habit
   */
  static async updateHabit(id: number, updates: Partial<Habit>): Promise<Habit> {
    const db = await getDatabase();
    
    const setClause: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      setClause.push('name = ?');
      values.push(updates.name);
    }
    if (updates.targetSets !== undefined) {
      setClause.push('target_sets = ?');
      values.push(updates.targetSets);
    }
    if (updates.targetReps !== undefined) {
      setClause.push('target_reps = ?');
      values.push(updates.targetReps);
    }
    if (updates.targetTime !== undefined) {
      setClause.push('target_time = ?');
      values.push(updates.targetTime);
    }
    if (updates.frequency !== undefined) {
      setClause.push('frequency = ?');
      values.push(updates.frequency);
    }
    if (updates.active !== undefined) {
      setClause.push('active = ?');
      values.push(updates.active ? 1 : 0);
    }

    values.push(id);

    await db.runAsync(
      `UPDATE habits SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );

    const habit = await this.getHabitById(id);
    if (!habit) throw new Error('Failed to update habit');
    return habit;
  }

  /**
   * Delete habit
   */
  static async deleteHabit(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
  }

  /**
   * Map database row to Habit object
   */
  private static mapRowToHabit(row: any): Habit {
    return {
      id: row.id,
      userId: row.user_id,
      exerciseId: row.exercise_id,
      name: row.name,
      type: row.type,
      targetSets: row.target_sets,
      targetReps: row.target_reps,
      targetTime: row.target_time,
      frequency: row.frequency,
      active: row.active === 1,
      createdAt: row.created_at,
    };
  }

  /**
   * Map database row to HabitLog object
   */
  private static mapRowToLog(row: any): HabitLog {
    return {
      id: row.id,
      habitId: row.habit_id,
      completed: row.completed === 1,
      setsCompleted: row.sets_completed,
      repsCompleted: row.reps_completed,
      timeCompleted: row.time_completed,
      notes: row.notes,
      date: row.date,
      createdAt: row.created_at,
    };
  }
}
