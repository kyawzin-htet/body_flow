import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '../utils/constants';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize and open the database connection
 */
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await createTables();
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

/**
 * Get the database instance
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    return await initDatabase();
  }
  return db;
};

/**
 * Create all database tables
 */
const createTables = async () => {
  if (!db) throw new Error('Database not initialized');

  // Users table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      skill_level TEXT NOT NULL,
      goals TEXT,
      target_muscles TEXT,
      weekly_frequency INTEGER DEFAULT 3,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Exercises table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      body_part TEXT,
      target TEXT,
      equipment TEXT,
      gif_url TEXT,
      gif_cached_path TEXT,
      instructions TEXT,
      secondary_muscles TEXT,
      difficulty TEXT,
      category TEXT,
      cached_at DATETIME
    );
  `);

  // Skills table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      difficulty INTEGER,
      prerequisites TEXT,
      exercises TEXT,
      description TEXT,
      video_url TEXT,
      video_cached_path TEXT,
      is_unlocked INTEGER DEFAULT 0,
      progress REAL DEFAULT 0
    );
  `);

  // Habits table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      exercise_id TEXT,
      name TEXT NOT NULL,
      type TEXT,
      target_sets INTEGER,
      target_reps INTEGER,
      target_time INTEGER,
      frequency TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );
  `);

  // Habit logs table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER,
      completed INTEGER DEFAULT 0,
      sets_completed INTEGER,
      reps_completed INTEGER,
      time_completed INTEGER,
      notes TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits(id)
    );
  `);

  // Recovery logs table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recovery_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date DATE NOT NULL,
      muscle_group TEXT,
      soreness_level INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Achievements table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      achievement_type TEXT,
      name TEXT,
      description TEXT,
      unlocked_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Workouts table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date DATE NOT NULL,
      duration INTEGER,
      exercises TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Hydration logs table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS hydration_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date DATE NOT NULL,
      amount_ml INTEGER,
      goal_ml INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Hydration settings table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS hydration_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      daily_goal_ml INTEGER DEFAULT 2000,
      notification_enabled INTEGER DEFAULT 1,
      notification_interval_minutes INTEGER DEFAULT 60,
      notification_start_hour INTEGER DEFAULT 8,
      notification_end_hour INTEGER DEFAULT 22,
      last_notification_sent DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Body measurements table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS body_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date DATE NOT NULL,
      weight REAL,
      body_fat REAL,
      chest REAL,
      waist REAL,
      arms REAL,
      legs REAL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create indexes for better query performance
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
    CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
    CREATE INDEX IF NOT EXISTS idx_recovery_logs_user_date ON recovery_logs(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
    CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_date ON hydration_logs(user_id, date);
  `);

  // Run migrations to ensure all tables exist
  await runMigrations();

  console.log('✅ All tables created successfully');
};

/**
 * Run database migrations
 */
const runMigrations = async () => {
  if (!db) throw new Error('Database not initialized');

  // Check if hydration_settings table exists
  const tableCheck = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='hydration_settings'`
  );

  if (!tableCheck) {
    console.log('🔄 Running migration: Creating hydration_settings table');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS hydration_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        daily_goal_ml INTEGER DEFAULT 2000,
        notification_enabled INTEGER DEFAULT 1,
        notification_interval_minutes INTEGER DEFAULT 60,
        notification_start_hour INTEGER DEFAULT 8,
        notification_end_hour INTEGER DEFAULT 22,
        last_notification_sent DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('✅ Migration completed: hydration_settings table created');
  }
};

/**
 * Close the database connection
 */
export const closeDatabase = async () => {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('Database connection closed');
  }
};

/**
 * Clear all user data from the database (preserves structure)
 */
export const clearAllUserData = async () => {
  if (!db) throw new Error('Database not initialized');

  const tables = [
    'habit_logs',
    'habits',
    'recovery_logs',
    'achievements',
    'workouts',
    'hydration_logs',
    'hydration_settings',
    'body_measurements',
  ];

  for (const table of tables) {
    await db.execAsync(`DELETE FROM ${table};`);
  }

  console.log('✅ All user data cleared successfully');
};

/**
 * Reset the database (for development/testing)
 */
export const resetDatabase = async () => {
  if (!db) throw new Error('Database not initialized');

  const tables = [
    'users',
    'exercises',
    'skills',
    'habits',
    'habit_logs',
    'recovery_logs',
    'achievements',
    'workouts',
    'hydration_logs',
    'hydration_settings',
    'body_measurements',
  ];

  for (const table of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS ${table};`);
  }

  await createTables();
  console.log('✅ Database reset successfully');
};
