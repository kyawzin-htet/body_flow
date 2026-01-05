import { HabitRepository } from '../database/repositories/habitRepository';
import { 
  ProgressMetrics, 
  MuscleBalanceData, 
  TrainingVolumeData,
  MuscleGroup 
} from '../types';

export class AnalyticsService {
  /**
   * Get comprehensive progress metrics for a user
   */
  static async getProgressMetrics(userId: number): Promise<ProgressMetrics> {
    const habits = await HabitRepository.getHabitsWithTodayLogs(userId);
    
    // Calculate total workouts (total habit completions)
    let totalWorkouts = 0;
    let totalDuration = 0; // in minutes
    let currentStreak = 0;
    let bestStreak = 0;

    for (const habit of habits) {
      const streak = await HabitRepository.calculateStreak(habit.id);
      currentStreak = Math.max(currentStreak, streak.current);
      bestStreak = Math.max(bestStreak, streak.best);

      // Count all logs as workouts
      const allLogs = await HabitRepository.getLogsByHabitId(habit.id, 365);
      totalWorkouts += allLogs.filter((log) => log.completed).length;

      // Estimate duration (assuming 1 set = 2 minutes)
      totalDuration += allLogs.filter((log) => log.completed).length * habit.targetSets * 2;
    }

    // Calculate muscle balance
    const muscleBalance = await this.calculateMuscleBalance(userId);

    // Calculate weekly volume (last 7 days)
    const weeklyVolume = await this.calculateWeeklyVolume(userId);

    // Calculate consistency score (last 30 days)
    const consistencyScore = await this.calculateConsistencyScore(userId);

    return {
      totalWorkouts,
      totalDuration,
      currentStreak,
      bestStreak,
      consistencyScore,
      muscleBalance,
      weeklyVolume,
    };
  }

  /**
   * Calculate muscle balance from habit data
   */
  static async calculateMuscleBalance(userId: number): Promise<MuscleBalanceData[]> {
    const habits = await HabitRepository.getHabitsWithTodayLogs(userId);
    
    const muscleVolume: Record<MuscleGroup, number> = {
      'core': 0,
      'arms': 0,
      'legs': 0,
      'shoulders': 0,
      'back': 0,
      'full-body': 0,
    };

    // Map exercises to muscle groups (simplified mapping)
    for (const habit of habits) {
      const logs = await HabitRepository.getLogsByHabitId(habit.id, 30);
      const completedLogs = logs.filter((log) => log.completed);
      const volume = completedLogs.length * habit.targetSets;

      // Infer muscle group from habit name (basic heuristic)
      const nameLower = habit.name.toLowerCase();
      
      if (nameLower.includes('push') || nameLower.includes('bench') || nameLower.includes('chest')) {
        muscleVolume['arms'] += volume;
      } else if (nameLower.includes('pull') || nameLower.includes('row')) {
        muscleVolume['back'] += volume;
      } else if (nameLower.includes('squat') || nameLower.includes('leg') || nameLower.includes('lunge')) {
        muscleVolume['legs'] += volume;
      } else if (nameLower.includes('plank') || nameLower.includes('crunch') || nameLower.includes('sit')) {
        muscleVolume['core'] += volume;
      } else if (nameLower.includes('shoulder') || nameLower.includes('press')) {
        muscleVolume['shoulders'] += volume;
      } else {
        muscleVolume['full-body'] += volume;
      }
    }

    const totalVolume = Object.values(muscleVolume).reduce((sum, vol) => sum + vol, 0);

    return Object.entries(muscleVolume).map(([muscleGroup, volume]) => ({
      muscleGroup: muscleGroup as MuscleGroup,
      volume,
      percentage: totalVolume > 0 ? Math.round((volume / totalVolume) * 100) : 0,
    }));
  }

  /**
   * Calculate weekly training volume (last 7 days)
   */
  static async calculateWeeklyVolume(userId: number): Promise<TrainingVolumeData[]> {
    const habits = await HabitRepository.getHabitsWithTodayLogs(userId);
    const today = new Date();
    const weekData: TrainingVolumeData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      let sets = 0;
      let duration = 0;

      for (const habit of habits) {
        const allLogs = await HabitRepository.getLogsByHabitId(habit.id, 7);
        const dayLog = allLogs.find((log) => log.date.startsWith(dateStr));

        if (dayLog && dayLog.completed) {
          sets += dayLog.setsCompleted;
          duration += habit.targetSets * 2; // Estimate 2 min per set
        }
      }

      weekData.push({
        date: dateStr,
        sets,
        duration,
      });
    }

    return weekData;
  }

  /**
   * Calculate consistency score (0-100) based on last 30 days
   */
  static async calculateConsistencyScore(userId: number): Promise<number> {
    const habits = await HabitRepository.getHabitsWithTodayLogs(userId);
    if (habits.length === 0) return 0;

    const today = new Date();
    let totalExpectedDays = 0;
    let totalCompletedDays = 0;

    for (const habit of habits) {
      const logs = await HabitRepository.getLogsByHabitId(habit.id, 30);
      
      if (habit.frequency === 'daily') {
        totalExpectedDays += 30;
      } else {
        // Weekly habits: expect ~4 completions per month
        totalExpectedDays += 4;
      }

      totalCompletedDays += logs.filter((log) => log.completed).length;
    }

    if (totalExpectedDays === 0) return 0;

    const score = Math.min(100, Math.round((totalCompletedDays / totalExpectedDays) * 100));
    return score;
  }

  /**
   * Get month summary text
   */
  static async getMonthSummary(userId: number): Promise<string> {
    const metrics = await this.getProgressMetrics(userId);
    const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

    if (metrics.totalWorkouts === 0) {
      return `No workouts logged in ${monthName} yet. Start building your streak!`;
    }

    const avgWorkoutsPerWeek = Math.round(metrics.totalWorkouts / 4);
    return `In ${monthName}, you completed ${metrics.totalWorkouts} workouts (${avgWorkoutsPerWeek}/week avg) with ${metrics.consistencyScore}% consistency.`;
  }

  /**
   * Get AI-like insights based on user data
   */
  static async getInsights(userId: number): Promise<string[]> {
    const metrics = await this.getProgressMetrics(userId);
    const insights: string[] = [];

    // Streak insights
    if (metrics.currentStreak >= 7) {
      insights.push(`🔥 Amazing! You're on a ${metrics.currentStreak}-day streak. Keep it going!`);
    } else if (metrics.currentStreak > 0) {
      insights.push(`Building momentum with a ${metrics.currentStreak}-day streak!`);
    } else {
      insights.push(`Start a new streak today! Consistency is key to progress.`);
    }

    // Consistency insights
    if (metrics.consistencyScore >= 80) {
      insights.push(`💪 Excellent consistency at ${metrics.consistencyScore}%!`);
    } else if (metrics.consistencyScore >= 50) {
      insights.push(`Good effort! Try to improve your ${metrics.consistencyScore}% consistency.`);
    } else if (metrics.totalWorkouts > 0) {
      insights.push(`Low consistency (${metrics.consistencyScore}%). Set a daily reminder!`);
    }

    // Muscle balance insights
    const unbalancedMuscles = metrics.muscleBalance.filter(m => m.percentage > 40 || (m.percentage < 10 && m.volume > 0));
    if (unbalancedMuscles.length > 0) {
      const overWorked = unbalancedMuscles.find(m => m.percentage > 40);
      if (overWorked) {
        insights.push(`⚖️ Consider balancing your ${overWorked.muscleGroup} training with other muscle groups.`);
      }
    }

    // Volume insights
    const totalWeeklySets = metrics.weeklyVolume.reduce((sum, day) => sum + day.sets, 0);
    if (totalWeeklySets > 50) {
      insights.push(`High volume week with ${totalWeeklySets} sets! Consider a recovery day.`);
    } else if (totalWeeklySets > 0 && totalWeeklySets < 20) {
      insights.push(`Light week with ${totalWeeklySets} sets. Try to gradually increase volume.`);
    }

    // Achievement insights
    if (metrics.totalWorkouts >= 100) {
      insights.push(`🏆 Century Club! You've completed ${metrics.totalWorkouts} workouts!`);
    } else if (metrics.totalWorkouts >= 50) {
      insights.push(`Half-century milestone! ${metrics.totalWorkouts} workouts completed.`);
    }

    return insights.length > 0 ? insights : ['Keep training to see personalized insights!'];
  }
}
