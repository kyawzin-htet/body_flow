import { View, Text, ScrollView, TouchableOpacity, AppState, AppStateStatus, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { useHabitStore } from '../../src/store/habitStore';
import { useHydrationStore } from '../../src/store/hydrationStore';
import { CoachService } from '../../src/services/coachService';
import { useTheme } from '../../src/hooks/useTheme';
import { MOTIVATIONAL_QUOTES } from '../../src/utils/constants';
import { CoachRecommendation } from '../../src/types';
import { CongratulationsModal } from '../../src/components/CongratulationsModal';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function HomeScreen() {
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  const user = useUserStore((state) => state.user);
  const habits = useHabitStore((state) => state.habits);
  const loadHabits = useHabitStore((state) => state.loadHabits);
  const logHabit = useHabitStore((state) => state.logHabit);
  const [quote, setQuote] = useState('');
  const [coachTip, setCoachTip] = useState('');
  const [recommendations, setRecommendations] = useState<CoachRecommendation[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const hasShownCongratsToday = useRef(false);
  const previousAmount = useRef(0);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Timer to hide welcome message
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 30000);

    // AppState listener to reset timer on return
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        setShowWelcome(true);
        setTimeout(() => {
          setShowWelcome(false);
        }, 30000);
      }

      appState.current = nextAppState;
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadHabits(user.id);
      loadCoachData();
    }
    
    // Random motivational quote
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, [user, loadHabits]);

const loadCoachData = async () => {
    if (!user) return;

    try {
      const tip = await CoachService.getQuickTip(user.id);
      const recs = await CoachService.getRecommendations(user.id);
      setCoachTip(tip);
      setRecommendations(recs.filter(r => r.priority === 'high' || r.priority === 'medium').slice(0, 2));
    } catch (error) {
      console.error('Error loading coach data:', error);
    }
  };

  // Hydration state
  const hydrationLog = useHydrationStore((state) => state.todayLog);
  const loadHydration = useHydrationStore((state) => state.loadTodayLog);
  const logWater = useHydrationStore((state) => state.logWater);

  useEffect(() => {
    if (user) {
      loadHydration(user.id);
    }
  }, [user, loadHydration]);

  // Check if hydration goal is reached and show congratulations
  useEffect(() => {
    if (!hydrationLog) return;
    
    const goalReached = hydrationLog.amountMl >= hydrationLog.goalMl;
    const wasNotReached = previousAmount.current < hydrationLog.goalMl;
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Show congratulations only when goal is FIRST reached (transitioning from not-reached to reached)
    if (goalReached && wasNotReached && hydrationLog.date === currentDate && !hasShownCongratsToday.current) {
      hasShownCongratsToday.current = true;
      setShowCongratulations(true);
    }
    
    // Update previous amount
    previousAmount.current = hydrationLog.amountMl;
    
    // Reset the flag when the date changes
    if (hydrationLog.date !== currentDate) {
      hasShownCongratsToday.current = false;
      previousAmount.current = 0;
    }
  }, [hydrationLog?.amountMl, hydrationLog?.goalMl, hydrationLog?.date]);

  const bgColor = isDark ? '#000000' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  const todayHabits = habits.filter(h => h.active);
  const completedToday = todayHabits.filter(h => h.todayLog?.completed).length;
  const totalHabits = todayHabits.length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ padding: 20, paddingBottom: 80 }}>
        {/* Welcome Section */}
        {showWelcome && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: textColor }}>
              Welcome back{user ? `, ${user.name}` : ''}! 👋
            </Text>
            <Text style={{ fontSize: 12, color: mutedColor, marginTop: 4 }}>
              {quote}
            </Text>
          </View>
        )}

        {/* Quick Stats */}
        <View style={{ 
          flexDirection: 'row', 
          gap: 12, 
          marginBottom: 24 
        }}>
          <View style={{ 
            flex: 1, 
            backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)", 
            padding: 16, 
            borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Ionicons name="flame" size={24} color="#f97316" />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
              {habits[0]?.currentStreak || 0}
            </Text>
            <Text style={{ fontSize: 10, color: mutedColor }}>Day Streak</Text>
          </View>

          <View style={{ 
            flex: 1, 
            backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)", 
            padding: 16, 
            borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Ionicons name="checkbox" size={24} color="#6366f1" />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
              {completedToday}/{totalHabits}
            </Text>
            <Text style={{ fontSize: 10, color: mutedColor }}>Today's Habits</Text>
          </View>
        </View>

        {/* Hydration Tracker */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ 
            backgroundColor: '#6366f1' + '20',
            padding: 20, 
            borderRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            overflow: 'hidden',
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Ionicons name="water" size={24} color="#3b82f6" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor }}>
                Hydration
              </Text>
            </View>

            {/* Progress Percentage */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 44, fontWeight: 'bold', color: '#6366f1' }}>
                {Math.round(((hydrationLog?.amountMl || 0) / (hydrationLog?.goalMl || 2000)) * 100)}%
              </Text>
              <Text style={{ fontSize: 10, color: mutedColor }}>
                of daily goal
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={{
              height: 12,
              backgroundColor: isDark ? '#000000' : '#e5e7eb',
              borderRadius: 6,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
              overflow: 'hidden',
              marginBottom: 16,
            }}>
              <View style={{
                width: `${Math.min(((hydrationLog?.amountMl || 0) / (hydrationLog?.goalMl || 2000)) * 100, 100)}%`,
                height: '100%',
                backgroundColor: '#6366f1',
              }} />
            </View>

            {/* Detailed Stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: mutedColor }}>Drank</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor, marginTop: 4 }}>
                  {((hydrationLog?.amountMl || 0) / 1000).toFixed(2)} L
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: mutedColor + '30' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: mutedColor }}>Goal</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor, marginTop: 4 }}>
                  {((hydrationLog?.goalMl || 2000) / 1000).toFixed(2)} L
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: mutedColor + '30' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: mutedColor }}>Remaining</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor, marginTop: 4 }}>
                  {(Math.max((hydrationLog?.goalMl || 2000) - (hydrationLog?.amountMl || 0), 0) / 1000).toFixed(2)} L
                </Text>
              </View>
            </View>

            {/* Quick Add Buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => user && logWater(user.id, 250)}
                style={{
                  flex: 1,
                  backgroundColor: '#6366f1',
                  paddingVertical: 12,
                  borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>+0.25L</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => user && logWater(user.id, 500)}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#6366f1',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: textColor, fontWeight: 'bold' }}>+0.50L</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Smart Coach Recommendations */}
        {recommendations.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="bulb" size={20} color="#f59e0b" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginLeft: 8 }}>
                Smart Coach
              </Text>
            </View>
            
            <View style={{ gap: 12 }}>
              {recommendations.map((rec, index) => {
                const priorityColors = {
                  high: '#ef4444',
                  medium: '#f59e0b',
                  low: '#10b981',
                };
                const priorityBgColors = {
                  high: '#ef4444' + '20',
                  medium: '#f59e0b' + '20',
                  low: '#10b981' + '20',
                };

                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: priorityBgColors[rec.priority],
                      padding: 16,
                      borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                      borderLeftWidth: 4,
                      borderLeftColor: priorityColors[rec.priority],
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <Ionicons
                        name={
                          rec.type === 'rest' ? 'bed' :
                          rec.type === 'progression' ? 'trending-up' :
                          rec.type === 'motivation' ? 'heart' :
                          'information-circle'
                        }
                        size={20}
                        color={priorityColors[rec.priority]}
                      />
                      <Text style={{ flex: 1, fontSize: 10, color: textColor, lineHeight: 20 }}>
                        {rec.message}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Today's Habits */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor }}>
              Today's Training
            </Text>
            {totalHabits > 0 && (
              <Link href="/habits" asChild>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: '#6366f1' + '20',
                    borderWidth: 1,
                    borderColor: '#6366f1',
                  }}
                >
                  <Ionicons name="add" size={16} color="#6366f1" />
                  <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '600' }}>
                    Add
                  </Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>
          
          {totalHabits === 0 ? (
            <View style={{ 
              backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)", 
              padding: 20, 
              borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
              alignItems: 'center',
            }}>
              <Ionicons name="add-circle-outline" size={48} color={mutedColor} />
              <Text style={{ fontSize: 12, color: mutedColor, marginTop: 12, textAlign: 'center' }}>
                No habits yet. Create your first training habit!
              </Text>
              <Link href="/habits" asChild>
                <TouchableOpacity
                  style={{
                    marginTop: 16,
                    backgroundColor: '#6366f1',
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                    Create Habit
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            todayHabits.map((habit) => {
              const isCompleted = habit.todayLog?.completed;
              
              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    const today = new Date().toISOString().split('T')[0];
                    logHabit(habit.id, {
                      date: today,
                      completed: !isCompleted,
                      setsCompleted: !isCompleted ? habit.targetSets : 0,
                    });
                  }}
                  style={{
                    backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                    padding: 16,
                    borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                      {habit.name}
                    </Text>
                    <Text style={{ fontSize: 10, color: mutedColor, marginTop: 4 }}>
                      {habit.targetSets} sets × {habit.targetReps || habit.targetTime + 's'}
                    </Text>
                  </View>
                  <Ionicons
                    name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                    size={28}
                    color={isCompleted ? '#6366f1' : mutedColor}
                  />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
            Quick Actions
          </Text>
          
          <View style={{ gap: 12 }}>
            <Link href="/timer" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                  padding: 16,
                  borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)", 
                  backgroundColor: '#ef4444', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Ionicons name="timer" size={24} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                    Interval Timer
                  </Text>
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    Tabata & HIIT workouts
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={mutedColor} />
              </TouchableOpacity>
            </Link>

            <Link href="/muscles" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                  padding: 16,
                  borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)", 
                  backgroundColor: '#6366f1', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Ionicons name="body" size={24} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                    Browse Exercises
                  </Text>
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    Find exercises by muscle group
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={mutedColor} />
              </TouchableOpacity>
            </Link>

            <Link href="/skills" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                  padding: 16,
                  borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)", 
                  backgroundColor: '#f97316', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Ionicons name="trophy" size={24} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                    Skill Progressions
                  </Text>
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    Work towards advanced skills
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={mutedColor} />
              </TouchableOpacity>
            </Link>

            <Link href="/analytics" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                  padding: 16,
                  borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)", 
                  backgroundColor: '#10b981', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Ionicons name="stats-chart" size={24} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                    View Analytics
                  </Text>
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    Track your progress
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={mutedColor} />
              </TouchableOpacity>
            </Link>

            <Link href="/measurements" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                  padding: 16,
                  borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)", 
                  backgroundColor: '#8b5cf6', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Ionicons name="scale" size={24} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                    Body Measurements
                  </Text>
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    Track weight and body metrics
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={mutedColor} />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>

      {/* Congratulations Modal */}
      <CongratulationsModal
        visible={showCongratulations}
        onClose={() => { setShowCongratulations(false); }}
        amountDrank={hydrationLog?.amountMl || 0}
        goal={hydrationLog?.goalMl || 2000}
        isDark={isDark}
      />
    </ScrollView>
  );
}
