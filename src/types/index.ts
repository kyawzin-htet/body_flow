// User & Profile Types
export interface User {
  id: number;
  name: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  goals: Goal[];
  targetMuscles: MuscleGroup[];
  weeklyFrequency: number;
  createdAt: string;
  updatedAt: string;
}

export type Goal = 'strength' | 'balance' | 'mobility' | 'endurance';
export type MuscleGroup = 'core' | 'arms' | 'legs' | 'shoulders' | 'back' | 'full-body';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

// Exercise Types
export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  gifCachedPath?: string;
  instructions: string[];
  secondaryMuscles: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'gymnastics' | 'calisthenics' | 'mobility' | 'strength';
  cachedAt?: string;
}

export interface ExerciseFilter {
  bodyPart?: string[];
  equipment?: string[];
  difficulty?: string[];
  category?: string[];
  searchTerm?: string;
}

// Skill Types
export interface Skill {
  id: string;
  name: string;
  category: 'handstand' | 'planche' | 'front-lever' | 'back-lever' | 'l-sit' | 'muscle-up';
  difficulty: number; // 1-10
  prerequisites: string[]; // skill IDs
  exercises: string[]; // exercise IDs
  description: string;
  videoUrl?: string;
  videoCachedPath?: string;
  isUnlocked?: boolean;
  progress?: number; // 0-100
}

// Habit Types
export interface Habit {
  id: number;
  userId: number;
  exerciseId?: string;
  name: string;
  type: 'reps' | 'time' | 'distance';
  targetSets: number;
  targetReps?: number;
  targetTime?: number; // seconds
  frequency: 'daily' | 'weekly';
  active: boolean;
  createdAt: string;
  currentStreak?: number;
  bestStreak?: number;
}

export interface HabitLog {
  id: number;
  habitId: number;
  completed: boolean;
  setsCompleted: number;
  repsCompleted?: number;
  timeCompleted?: number;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[];
  todayLog?: HabitLog;
}

// Recovery Types
export interface RecoveryLog {
  id: number;
  userId: number;
  date: string;
  muscleGroup: MuscleGroup;
  sorenessLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: string;
}

// Achievement Types
export interface Achievement {
  id: number;
  userId: number;
  achievementType: 'streak' | 'skill' | 'volume' | 'consistency';
  name: string;
  description: string;
  unlockedAt: string;
  icon?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  isUnlocked: boolean;
}

// Workout Types
export interface Workout {
  id: number;
  userId: number;
  date: string;
  duration: number; // minutes
  exercises: WorkoutExercise[];
  notes?: string;
  createdAt: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  time?: number;
  weight?: number;
}

// Workout Types
export interface Workout {
  id: number;
  userId: number;
  date: string;
  duration: number; // minutes
  exercises: WorkoutExercise[];
  notes?: string;
  createdAt: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  time?: number;
  weight?: number;
}

// Hydration Types
export interface HydrationLog {
  id: number;
  userId: number;
  date: string;
  amountMl: number;
  goalMl: number;
  createdAt: string;
}

export interface HydrationSettings {
  id: number;
  userId: number;
  dailyGoalMl: number;
  notificationEnabled: boolean;
  notificationSoundEnabled: boolean;
  notificationIntervalMinutes: number;
  notificationStartHour: number;
  notificationEndHour: number;
  lastNotificationSent?: string;
  createdAt: string;
  updatedAt: string;
}

// Body Measurement Types
export interface BodyMeasurement {
  id: number;
  userId: number;
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  legs?: number;
  notes?: string;
  createdAt: string;
}

// Analytics Types
export interface MuscleBalanceData {
  muscleGroup: MuscleGroup;
  volume: number; // total sets/reps in period
  percentage: number;
}

export interface TrainingVolumeData {
  date: string;
  sets: number;
  duration: number;
}

export interface ConsistencyData {
  date: string;
  score: number; // 0-100
}

export interface ProgressMetrics {
  totalWorkouts: number;
  totalDuration: number;
  currentStreak: number;
  bestStreak: number;
  consistencyScore: number;
  muscleBalance: MuscleBalanceData[];
  weeklyVolume: TrainingVolumeData[];
}

// API Response Types
export interface ExerciseDBResponse {
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  id: string;
  name: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export interface YouTubeSearchResponse {
  items: YouTubeVideo[];
}

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

// Coach Recommendation Types
export interface CoachRecommendation {
  type: 'rest' | 'progression' | 'deload' | 'motivation' | 'injury-prevention';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
  action?: string;
}

// App Settings Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  trainingReminderTime?: string;
  restDayReminderEnabled: boolean;
  soundEnabled: boolean;
  analyticsEnabled: boolean;
  adFreeMode?: boolean;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'exercise/[id]': { id: string };
  'onboarding': undefined;
};

export type TabParamList = {
  index: undefined;
  muscles: undefined;
  skills: undefined;
  habits: undefined;
  analytics: undefined;
  profile: undefined;
};
