import { getDatabase } from '../db';
import { HydrationSettings } from '../../types';

export class HydrationSettingsRepository {
  /**
   * Get hydration settings for a user
   */
  static async getSettings(userId: number): Promise<HydrationSettings | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<any>(
      `SELECT 
        id,
        user_id as userId,
        daily_goal_ml as dailyGoalMl,
        notification_enabled as notificationEnabled,
        notification_interval_minutes as notificationIntervalMinutes,
        notification_start_hour as notificationStartHour,
        notification_end_hour as notificationEndHour,
        last_notification_sent as lastNotificationSent,
        created_at as createdAt,
        updated_at as updatedAt
      FROM hydration_settings 
      WHERE user_id = ?`,
      [userId]
    );

    if (!result) {
      return null;
    }

    return {
      ...result,
      notificationEnabled: Boolean(result.notificationEnabled),
    };
  }

  /**
   * Create default settings for a user
   */
  static async createDefaultSettings(userId: number): Promise<HydrationSettings> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO hydration_settings (user_id) VALUES (?)`,
      [userId]
    );

    const settings = await this.getSettings(userId);
    if (!settings) {
      throw new Error('Failed to create hydration settings');
    }

    return settings;
  }

  /**
   * Update hydration settings
   */
  static async updateSettings(
    userId: number,
    settings: Partial<Omit<HydrationSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<HydrationSettings> {
    const db = await getDatabase();
    
    const updates: string[] = [];
    const values: any[] = [];

    if (settings.dailyGoalMl !== undefined) {
      updates.push('daily_goal_ml = ?');
      values.push(settings.dailyGoalMl);
    }
    if (settings.notificationEnabled !== undefined) {
      updates.push('notification_enabled = ?');
      values.push(settings.notificationEnabled ? 1 : 0);
    }
    if (settings.notificationIntervalMinutes !== undefined) {
      updates.push('notification_interval_minutes = ?');
      values.push(settings.notificationIntervalMinutes);
    }
    if (settings.notificationStartHour !== undefined) {
      updates.push('notification_start_hour = ?');
      values.push(settings.notificationStartHour);
    }
    if (settings.notificationEndHour !== undefined) {
      updates.push('notification_end_hour = ?');
      values.push(settings.notificationEndHour);
    }
    if (settings.lastNotificationSent !== undefined) {
      updates.push('last_notification_sent = ?');
      values.push(settings.lastNotificationSent);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    await db.runAsync(
      `UPDATE hydration_settings SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    const updated = await this.getSettings(userId);
    if (!updated) {
      throw new Error('Failed to update hydration settings');
    }

    return updated;
  }

  /**
   * Get or create settings for a user
   */
  static async getOrCreateSettings(userId: number): Promise<HydrationSettings> {
    let settings = await this.getSettings(userId);
    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }
    return settings;
  }

  /**
   * Update last notification sent timestamp
   */
  static async updateLastNotificationSent(userId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE hydration_settings SET last_notification_sent = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [userId]
    );
  }
}
