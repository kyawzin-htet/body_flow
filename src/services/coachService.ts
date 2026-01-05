import { HabitRepository } from '../database/repositories/habitRepository';
import { useUserStore } from '../store/userStore';
import { CoachRecommendation } from '../types';

export class CoachService {
  /**
   * Get personalized coach recommendations for a user
   */
  static async getRecommendations(userId: number): Promise<CoachRecommendation[]> {
    const recommendations: CoachRecommendation[] = [];

    // Check for rest needs
    const restRec = await this.checkRestNeeds(userId);
    if (restRec) recommendations.push(restRec);

    // Check for progression opportunities
    const progressionRec = await this.checkProgression(userId);
    if (progressionRec) recommendations.push(progressionRec);

    // Check for consistency issues
    const consistencyRec = await this.checkConsistency(userId);
    if (consistencyRec) recommendations.push(consistencyRec);

    // Motivational messages
    const motivationRec = await this.getMotivation(userId);
    if (motivationRec) recommendations.push(motivationRec);

    return recommendations;
  }

  /**
   * Check if user needs rest based on training volume
   */
  private static async checkRestNeeds(userId: number): Promise<CoachRecommendation | null> {
    const habits = await HabitRepository.getHabitsWithTodayLogs(userId);
    const today = new Date().toISOString().split('T')[0];
    
    // Check last 7 days of volume
    let totalSets = 0;
    let consecutiveDays = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      let dayHasWorkout = false;
      for (const habit of habits) {
        const logs = await HabitRepository.getLogsByHabitId(habit.id, 7);
        const dayLog = logs.find(log => log.date.startsWith(dateStr));
        
        if (dayLog && dayLog.completed) {
          totalSets += dayLog.setsCompleted;
          dayHasWorkout = true;
        }
      }

      if (dayHasWorkout) {
        if (i === consecutiveDays) consecutiveDays++;
      } else {
        break;
      }
    }

    // High volume detection
    if (totalSets > 100) {
      return {
        type: 'rest',
        message: 'You\'ve trained hard this week with over 100 sets! Consider taking a recovery day tomorrow.',
        priority: 'high',
        actionable: true,
        action: 'Schedule a rest day',
      };
    }

    // Consecutive days without rest
    if (consecutiveDays >= 7) {
      return {
        type: 'rest',
        message: `You've trained ${consecutiveDays} days straight! Your muscles need recovery to grow stronger.`,
        priority: 'high',
        actionable: true,
        action: 'Take a rest day',
      };
    }

    return null;
  }

  /**
   * Check for progression opportunities
   */
  private static async checkProgression(userId: number): Promise<CoachRecommendation | null> {
    const habits = await HabitRepository.getHabitsWithTodayLogs(userId);

    for (const habit of habits) {
      const logs = await HabitRepository.getLogsByHabitId(habit.id, 30);
      const recentLogs = logs.filter(log => log.completed).slice(0, 10);

      if (recentLogs.length >= 8) {
        // Check if user is consistently hitting targets
        const hittingTargets = recentLogs.filter(log => 
          log.setsCompleted >= habit.targetSets &&
          (log.repsCompleted || 0) >= (habit.targetReps || 0)
        );

        if (hittingTargets.length >= 7) {
          return {
            type: 'progression',
            message: `Great consistency with ${habit.name}! Consider increasing to ${habit.targetSets + 1} sets or ${(habit.targetReps || 0) + 2} reps.`,
            priority: 'medium',
            actionable: true,
            action: 'Increase difficulty',
          };
        }
      }
    }

    return null;
  }

  /**
   * Check consistency patterns
   */
  private static async checkConsistency(userId: number): Promise<CoachRecommendation | null> {
    const habits = await HabitRepository.getHabitsWithTodayLogs(userId);
    
    if (habits.length === 0) {
      return {
        type: 'motivation',
        message: 'Start your fitness journey by creating your first habit!',
        priority: 'high',
        actionable: true,
        action: 'Create a habit',
      };
    }

    // Check for habits with low completion rate
    for (const habit of habits) {
      const logs = await HabitRepository.getLogsByHabitId(habit.id, 14);
      const completedLogs = logs.filter(log => log.completed);

      if (logs.length >= 7 && completedLogs.length < 3) {
        return {
          type: 'motivation',
          message: `${habit.name} needs attention. You've completed it ${completedLogs.length} times in 2 weeks. Try setting a daily reminder!`,
          priority: 'medium',
          actionable: true,
          action: 'Set reminder',
        };
      }
    }

    return null;
  }

  /**
   * Get motivational messages based on streaks
   */
  private static async getMotivation(userId: number): Promise<CoachRecommendation | null> {
    const habits = await HabitRepository.getHabitsWithTodayLogs(userId);
    
    let maxStreak = 0;
    for (const habit of habits) {
      const streak = await HabitRepository.calculateStreak(habit.id);
      maxStreak = Math.max(maxStreak, streak.current);
    }

    if (maxStreak >= 30) {
      return {
        type: 'motivation',
        message: `🏆 Legendary! ${maxStreak}-day streak. You're in the top 1% of users!`,
        priority: 'low',
        actionable: false,
      };
    } else if (maxStreak >= 14) {
      return {
        type: 'motivation',
        message: `💪 ${maxStreak} days strong! You're building incredible discipline.`,
        priority: 'low',
        actionable: false,
      };
    } else if (maxStreak >= 7) {
      return {
        type: 'motivation',
        message: `🔥 One week streak! Keep the momentum going!`,
        priority: 'low',
        actionable: false,
      };
    } else if (maxStreak > 0) {
      return {
        type: 'motivation',
        message: `Good start! Reach 7 days for your first milestone.`,
        priority: 'low',
        actionable: false,
      };
    }

    return {
      type: 'motivation',
      message: 'Every expert was once a beginner. Start your streak today!',
      priority: 'low',
      actionable: false,
    };
  }

  /**
   * Get a quick tip for the home screen
   */
  static async getQuickTip(userId: number): Promise<string> {
    const recommendations = await this.getRecommendations(userId);
    const highPriority = recommendations.find(r => r.priority === 'high');
    
    if (highPriority) {
      return highPriority.message;
    }

    const tips = [
      'Consistency beats intensity. Show up every day!',
      'Progressive overload: gradually increase difficulty over time.',
      'Recovery is when muscles grow. Don\'t skip rest days!',
      'Track your progress to stay motivated.',
      'Form over speed - quality reps build strength safely.',
    ];

    return tips[Math.floor(Math.random() * tips.length)];
  }
}
