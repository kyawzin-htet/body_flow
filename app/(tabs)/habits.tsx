import { View, Text, ScrollView, TouchableOpacity, useColorScheme, TextInput, Modal, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { useHabitStore } from '../../src/store/habitStore';
import { useTheme } from '../../src/hooks/useTheme';
import CreateHabitModal from '../../src/components/CreateHabitModal';

export default function HabitsScreen() {
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  const user = useUserStore((state) => state.user);
  const habits = useHabitStore((state) => state.habits);
  const loadHabits = useHabitStore((state) => state.loadHabits);
  const logHabit = useHabitStore((state) => state.logHabit);
  const createHabit = useHabitStore((state) => state.createHabit);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [logData, setLogData] = useState({ sets: 0, reps: 0, time: 0 });

  useEffect(() => {
    if (user) {
      loadHabits(user.id);
    }
  }, [user, loadHabits]);

  const bgColor = isDark ? '#0a0e27' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1f3a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  const today = new Date().toISOString().split('T')[0];

  const handleCheckIn = (habitId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    if (habit.todayLog?.completed) {
      // Already completed, show details
      setSelectedHabitId(habitId);
      setShowLogModal(true);
    } else {
      // Quick complete
      logHabit(habitId, {
        completed: true,
        setsCompleted: habit.targetSets,
        repsCompleted: habit.targetReps,
        timeCompleted: habit.targetTime,
        date: today,
      });
    }
  };

  const handleDetailedLog = () => {
    if (selectedHabitId) {
      logHabit(selectedHabitId, {
        completed: true,
        setsCompleted: logData.sets,
        repsCompleted: logData.reps || undefined,
        timeCompleted: logData.time || undefined,
        date: today,
      });
      setShowLogModal(false);
      setLogData({ sets: 0, reps: 0, time: 0 });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
    <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          {/* <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginBottom: 8 }}>
            Daily Habits
          </Text> */}
          <Text style={{ fontSize: 16, color: mutedColor, marginBottom: 24 }}>
            Track your training consistency
          </Text>

          {/* Today's Date */}
          <View style={{ 
            backgroundColor: surfaceColor,
            padding: 16,
            borderRadius: 16,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View>
              <Text style={{ fontSize: 14, color: mutedColor }}>Today</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 4 }}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 14, color: mutedColor }}>Completed</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981', marginTop: 4 }}>
                {habits.filter(h => h.todayLog?.completed).length}/{habits.length}
              </Text>
            </View>
          </View>

          {/* Habits List */}
          {habits.length === 0 ? (
            <View style={{
              backgroundColor: surfaceColor,
              padding: 40,
              borderRadius: 20,
              alignItems: 'center',
            }}>
              <Ionicons name="add-circle-outline" size={64} color={mutedColor} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginTop: 16 }}>
                No Habits Yet
              </Text>
              <Text style={{ fontSize: 14, color: mutedColor, marginTop: 8, textAlign: 'center' }}>
                Create your first training habit to get started
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                style={{
                  marginTop: 20,
                  backgroundColor: '#6366f1',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>
                  Create Habit
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {habits.map((habit) => {
                const isCompleted = habit.todayLog?.completed || false;
                const progressPercent = isCompleted ? 100 : 0;

                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => handleCheckIn(habit.id)}
                    style={{
                      backgroundColor: surfaceColor,
                      borderRadius: 16,
                      padding: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>
                          {habit.name}
                        </Text>
                        <Text style={{ fontSize: 14, color: mutedColor, marginTop: 4 }}>
                          {habit.targetSets} sets × {habit.targetReps ? `${habit.targetReps} reps` : `${habit.targetTime}s`}
                        </Text>
                        
                        {/* Streak */}
                        {(habit.currentStreak || 0) > 0 && (
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            marginTop: 8,
                            gap: 4,
                          }}>
                            <Ionicons name="flame" size={16} color="#f97316" />
                            <Text style={{ fontSize: 12, color: '#f97316', fontWeight: '600' }}>
                              {habit.currentStreak} day streak
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Check Button */}
                      <TouchableOpacity
                        onPress={() => handleCheckIn(habit.id)}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor: isCompleted ? '#10b981' : mutedColor + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Ionicons
                          name={isCompleted ? 'checkmark' : 'ellipse-outline'}
                          size={32}
                          color={isCompleted ? '#ffffff' : mutedColor}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Progress Bar */}
                    <View style={{ marginTop: 12 }}>
                      <View style={{
                        height: 6,
                        backgroundColor: isDark ? '#0a0e27' : '#e5e7eb',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}>
                        <View
                          style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            backgroundColor: isCompleted ? '#10b981' : '#6366f1',
                          }}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Weekly Calendar Heatmap Placeholder */}
          {habits.length > 0 && (
            <View style={{ marginTop: 32 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
                Activity Overview
              </Text>
              <View style={{
                backgroundColor: surfaceColor,
                borderRadius: 16,
                padding: 20,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <View key={day} style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: mutedColor, marginBottom: 8 }}>
                        {day}
                      </Text>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: index < 3 ? '#10b981' : mutedColor + '20',
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>

    {/* Log Modal */}
    <Modal
      visible={showLogModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: surfaceColor,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
          }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: textColor, marginBottom: 20 }}>
              Log Workout
            </Text>

            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 14, color: mutedColor, marginBottom: 8 }}>Sets Completed</Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? '#0a0e27' : '#f8f9fa',
                    padding: 16,
                    borderRadius: 12,
                    color: textColor,
                    fontSize: 16,
                  }}
                  keyboardType="number-pad"
                  placeholder="Enter sets"
                  placeholderTextColor={mutedColor}
                  value={logData.sets.toString()}
                  onChangeText={(val) => setLogData({ ...logData, sets: parseInt(val) || 0 })}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowLogModal(false)}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: mutedColor + '20',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDetailedLog}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: '#6366f1',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Habit Modal */}
      <CreateHabitModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (habitData) => {
          if (user) {
            await createHabit({
              ...habitData,
              userId: user.id,
              active: true,
            });
            await loadHabits(user.id);
          }
        }}
      />
    </View>
  );
}
