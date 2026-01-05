import { MuscleGroup, Goal, SkillLevel } from '../types';

// App Information
export const APP_NAME = 'BodyFlow';
export const APP_VERSION = '1.0.0';

// Muscle Groups
export const MUSCLE_GROUPS: { name: MuscleGroup; label: string; icon: string; color: string }[] = [
  { name: 'core', label: 'Core', icon: 'body', color: '#f97316' },
  { name: 'arms', label: 'Arms', icon: 'fitness', color: '#3b82f6' },
  { name: 'legs', label: 'Legs', icon: 'walk', color: '#10b981' },
  { name: 'shoulders', label: 'Shoulders', icon: 'triangle', color: '#8b5cf6' },
  { name: 'back', label: 'Back', icon: 'arrow-back-circle', color: '#ef4444' },
  { name: 'full-body', label: 'Full Body', icon: 'person', color: '#f59e0b' },
];

// Goals
export const GOALS: { value: Goal; label: string; icon: string }[] = [
  { value: 'strength', label: 'Strength', icon: 'barbell' },
  { value: 'balance', label: 'Balance', icon: 'git-compare' },
  { value: 'mobility', label: 'Mobility', icon: 'move' },
  { value: 'endurance', label: 'Endurance', icon: 'speedometer' },
];

// Skill Levels
export const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  { 
    value: 'beginner', 
    label: 'Beginner', 
    description: 'Just starting out with bodyweight training'
  },
  { 
    value: 'intermediate', 
    label: 'Intermediate', 
    description: 'Can do basic exercises consistently'
  },
  { 
    value: 'advanced', 
    label: 'Advanced', 
    description: 'Working on advanced skills and variations'
  },
  { 
    value: 'elite', 
    label: 'Elite', 
    description: 'Mastering complex gymnastics movements'
  },
];

// Weekly Training Frequencies
export const TRAINING_FREQUENCIES = [
  { value: 1, label: '1 day/week' },
  { value: 2, label: '2 days/week' },
  { value: 3, label: '3 days/week' },
  { value: 4, label: '4 days/week' },
  { value: 5, label: '5 days/week' },
  { value: 6, label: '6 days/week' },
  { value: 7, label: '7 days/week' },
];

// Exercise Categories
export const EXERCISE_CATEGORIES = [
  'gymnastics',
  'calisthenics',
  'mobility',
  'strength',
] as const;

// Equipment Types
export const EQUIPMENT_TYPES = [
  'body weight',
  'resistance band',
  'pull-up bar',
  'parallettes',
  'rings',
  'none',
] as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
] as const;

// Gymnastics Skills
export const GYMNASTICS_SKILLS = {
  handstand: {
    name: 'Handstand',
    progressions: [
      { id: 'wall-handstand', name: 'Wall Handstand', difficulty: 1 },
      { id: 'chest-wall-handstand', name: 'Chest to Wall Handstand', difficulty: 2 },
      { id: 'freestanding-handstand', name: 'Freestanding Handstand', difficulty: 4 },
      { id: 'handstand-push-up', name: 'Handstand Push-Up', difficulty: 6 },
      { id: 'one-arm-handstand', name: 'One Arm Handstand', difficulty: 10 },
    ],
  },
  planche: {
    name: 'Planche',
    progressions: [
      { id: 'frog-stand', name: 'Frog Stand', difficulty: 1 },
      { id: 'tuck-planche', name: 'Tuck Planche', difficulty: 3 },
      { id: 'advanced-tuck-planche', name: 'Advanced Tuck Planche', difficulty: 5 },
      { id: 'straddle-planche', name: 'Straddle Planche', difficulty: 7 },
      { id: 'full-planche', name: 'Full Planche', difficulty: 9 },
    ],
  },
  'front-lever': {
    name: 'Front Lever',
    progressions: [
      { id: 'tuck-front-lever', name: 'Tuck Front Lever', difficulty: 2 },
      { id: 'advanced-tuck-front-lever', name: 'Advanced Tuck Front Lever', difficulty: 4 },
      { id: 'one-leg-front-lever', name: 'One Leg Front Lever', difficulty: 6 },
      { id: 'straddle-front-lever', name: 'Straddle Front Lever', difficulty: 7 },
      { id: 'full-front-lever', name: 'Full Front Lever', difficulty: 9 },
    ],
  },
  'l-sit': {
    name: 'L-Sit',
    progressions: [
      { id: 'knee-tucks', name: 'Knee Tucks', difficulty: 1 },
      { id: 'one-leg-lsit', name: 'One Leg L-Sit', difficulty: 2 },
      { id: 'floor-lsit', name: 'Floor L-Sit', difficulty: 4 },
      { id: 'elevated-lsit', name: 'Elevated L-Sit', difficulty: 5 },
      { id: 'v-sit', name: 'V-Sit', difficulty: 8 },
    ],
  },
  'muscle-up': {
    name: 'Muscle-Up',
    progressions: [
      { id: 'pull-ups', name: 'Pull-Ups', difficulty: 2 },
      { id: 'chest-to-bar-pullup', name: 'Chest to Bar Pull-Up', difficulty: 3 },
      { id: 'explosive-pullup', name: 'Explosive Pull-Up', difficulty: 4 },
      { id: 'bar-muscle-up', name: 'Bar Muscle-Up', difficulty: 6 },
      { id: 'ring-muscle-up', name: 'Ring Muscle-Up', difficulty: 7 },
    ],
  },
};

// Soreness Levels
export const SORENESS_LEVELS = [
  { value: 1, label: 'No Pain', emoji: '😊', color: '#10b981' },
  { value: 2, label: 'Mild', emoji: '🙂', color: '#84cc16' },
  { value: 3, label: 'Moderate', emoji: '😐', color: '#f59e0b' },
  { value: 4, label: 'Sore', emoji: '😣', color: '#f97316' },
  { value: 5, label: 'Very Sore', emoji: '😫', color: '#ef4444' },
];

// Achievement Badges
export const ACHIEVEMENT_BADGES = [
  {
    id: 'first-workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: 'trophy',
    requirement: '1 workout',
  },
  {
    id: '7-day-streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day training streak',
    icon: 'flame',
    requirement: '7-day streak',
  },
  {
    id: '30-day-streak',
    name: 'Monthly Master',
    description: 'Maintain a 30-day training streak',
    icon: 'medal',
    requirement: '30-day streak',
  },
  {
    id: 'first-skill',
    name: 'Skill Unlocked',
    description: 'Unlock your first gymnastics skill',
    icon: 'star',
    requirement: 'Unlock 1 skill',
  },
  {
    id: '100-workouts',
    name: 'Century Club',
    description: 'Complete 100 workouts',
    icon: 'ribbon',
    requirement: '100 workouts',
  },
];

// Motivational Quotes
export const MOTIVATIONAL_QUOTES = [
  "Every rep counts. Keep pushing!",
  "Consistency beats intensity.",
  "Your body can do it, it's your mind you need to convince.",
  "Progress, not perfection.",
  "The only bad workout is the one you didn't do.",
  "Strength doesn't come from what you can do, it comes from overcoming what you thought you couldn't.",
  "Champions train, losers complain.",
  "Your future self will thank you.",
  "Pain is temporary, pride is forever.",
  "Master the basics, master the art.",
];

// Database Configuration
export const DB_NAME = 'bodyflow.db';
export const DB_VERSION = 1;

// API Configuration
export const API_TIMEOUT = 10000; // 10 seconds
export const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Notification Categories
export const NOTIFICATION_CATEGORIES = {
  TRAINING_REMINDER: 'training-reminder',
  REST_DAY: 'rest-day',
  STREAK_ALERT: 'streak-alert',
  ACHIEVEMENT: 'achievement',
};

// Chart Colors (for Victory Native)
export const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#f97316',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  neutral: '#6b7280',
};

// Analytics Time Ranges
export const TIME_RANGES = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

// Default User Settings
export const DEFAULT_SETTINGS = {
  theme: 'auto' as const,
  notificationsEnabled: true,
  restDayReminderEnabled: true,
  soundEnabled: true,
  analyticsEnabled: true,
  adFreeMode: false,
};
