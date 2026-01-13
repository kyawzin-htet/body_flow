import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Alert, Share } from 'react-native';
import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useHabitStore } from '../../src/store/habitStore';
import { AnalyticsService } from '../../src/services/analyticsService';
import { useTheme } from '../../src/hooks/useTheme';
import { SKILL_LEVELS, GOALS, MUSCLE_GROUPS } from '../../src/utils/constants';
import { Goal, MuscleGroup, SkillLevel, ProgressMetrics } from '../../src/types';

export default function ProfileScreen() {
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  const user = useUserStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);
  const theme = useSettingsStore((state) => state.theme);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleNotifications = useSettingsStore((state) => state.toggleNotifications);
  const toggleSound = useSettingsStore((state) => state.toggleSound);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const habits = useHabitStore((state) => state.habits);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoals, setEditGoals] = useState<Goal[]>([]);
  const [editMuscles, setEditMuscles] = useState<MuscleGroup[]>([]);
  const [editSkillLevel, setEditSkillLevel] = useState<SkillLevel>('beginner');
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);

  const bgColor = isDark ? '#000000' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  const skillLevelInfo = SKILL_LEVELS.find((s) => s.value === user?.skillLevel);

  useEffect(() => {
    loadMetrics();
  }, [user]);

  const loadMetrics = async () => {
    if (!user) return;
    try {
      const data = await AnalyticsService.getProgressMetrics(user.id);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleEditProfile = () => {
    if (!user) return;
    setEditName(user.name);
    setEditGoals(user.goals);
    setEditMuscles(user.targetMuscles);
    setEditSkillLevel(user.skillLevel);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    await updateUser({
      name: editName,
      goals: editGoals,
      targetMuscles: editMuscles,
      skillLevel: editSkillLevel,
    });
    setShowEditModal(false);
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    await setTheme(newTheme);
    setShowThemeModal(false);
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      const exportData = {
        user: {
          name: user.name,
          skillLevel: user.skillLevel,
          goals: user.goals,
          targetMuscles: user.targetMuscles,
        },
        habits: habits.map(h => ({
          name: h.name,
          type: h.type,
          targetSets: h.targetSets,
          targetReps: h.targetReps,
          targetTime: h.targetTime,
          frequency: h.frequency,
          currentStreak: h.currentStreak,
          bestStreak: h.bestStreak,
        })),
        stats: metrics,
        exportedAt: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      
      await Share.share({
        message: jsonString,
        title: 'BodyFlow Data Export',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export data');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your habits, logs, and progress. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            // Add reset functionality here if needed
            Alert.alert('Info', 'Data reset functionality would go here');
          },
        },
      ]
    );
  };

  const toggleGoal = (goal: Goal) => {
    setEditGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const toggleMuscle = (muscle: MuscleGroup) => {
    setEditMuscles(prev =>
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Profile Header */}
          <View style={{
            backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
            borderRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            padding: 24,
            marginBottom: 20,
            alignItems: 'center',
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
              backgroundColor: '#6366f1',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff' }}>
                {user?.name.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>

            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>
              {user?.name || 'Guest'}
            </Text>

            <View style={{
              marginTop: 8,
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: '#6366f1' + '20',
              borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#6366f1' }}>
                {skillLevelInfo?.label || 'Beginner'}
              </Text>
            </View>

            <Text style={{ fontSize: 10, color: mutedColor, marginTop: 8, textAlign: 'center' }}>
              {user?.goals.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ') || 'No goals set'}
            </Text>
          </View>

          {/* Stats Grid - Real Data */}
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: 12, 
            marginBottom: 24 
          }}>
            <View style={{
              flex: 1,
              minWidth: '47%',
              backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
              padding: 16,
              borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            }}>
              <Ionicons name="barbell" size={24} color="#6366f1" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
                {metrics?.totalWorkouts || 0}
              </Text>
              <Text style={{ fontSize: 10, color: mutedColor }}>Total Workouts</Text>
            </View>

            <View style={{
              flex: 1,
              minWidth: '47%',
              backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
              padding: 16,
              borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            }}>
              <Ionicons name="flame" size={24} color="#f97316" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
                {metrics?.bestStreak || 0}
              </Text>
              <Text style={{ fontSize: 10, color: mutedColor }}>Best Streak</Text>
            </View>

            <View style={{
              flex: 1,
              minWidth: '47%',
              backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
              padding: 16,
              borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            }}>
              <Ionicons name="trending-up" size={24} color="#10b981" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
                {metrics?.consistencyScore || 0}%
              </Text>
              <Text style={{ fontSize: 10, color: mutedColor }}>Consistency</Text>
            </View>

            <View style={{
              flex: 1,
              minWidth: '47%',
              backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
              padding: 16,
              borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            }}>
              <Ionicons name="time" size={24} color="#8b5cf6" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
                {Math.floor((metrics?.totalDuration || 0) / 60)}h
              </Text>
              <Text style={{ fontSize: 10, color: mutedColor }}>Training Time</Text>
            </View>
          </View>

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
                marginBottom: 24,
                gap: 12,
              }}
            >
              <View style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)", 
                backgroundColor: '#ec4899', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <Ionicons name="body" size={24} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                  Body Measurements
                </Text>
                <Text style={{ fontSize: 10, color: mutedColor }}>
                  Track weight and body composition
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </TouchableOpacity>

          </Link>
          <Link href="/habits" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
                gap: 12,
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 12, borderWidth: 1, borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)", backgroundColor: "#10b981", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="checkbox" size={24} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: textColor }}>Training Habits</Text>
                <Text style={{ fontSize: 10, color: mutedColor }}>Track your daily workout routines</Text>
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
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
                gap: 12,
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 12, borderWidth: 1, borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)", backgroundColor: "#6366f1", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="stats-chart" size={24} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: textColor }}>Analytics & Stats</Text>
                <Text style={{ fontSize: 10, color: mutedColor }}>View your progress and insights</Text>
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
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
                gap: 12,
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 12, borderWidth: 1, borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)", backgroundColor: "#f97316", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="trophy" size={24} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: textColor }}>Skill Progressions</Text>
                <Text style={{ fontSize: 10, color: mutedColor }}>Track advanced calisthenics skills</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </TouchableOpacity>
          </Link>
          {/* Settings Section */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
            Settings
          </Text>

          <View style={{ gap: 12, marginBottom: 24 }}>
            {/* Notifications */}
            <View style={{
              backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
              padding: 16,
              borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="notifications" size={24} color="#6366f1" />
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                    Notifications
                  </Text>
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    Training reminders and alerts
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: mutedColor, true: '#6366f1' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {/* Sound */}
            <View style={{
              backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
              padding: 16,
              borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="volume-high" size={24} color="#10b981" />
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                    Sound Effects
                  </Text>
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    Enable audio feedback
                  </Text>
                </View>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: mutedColor, true: '#10b981' }}
                thumbColor={soundEnabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {/* Theme */}
            <TouchableOpacity
              onPress={() => setShowThemeModal(true)}
              style={{
                backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                padding: 16,
                borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={24} color="#f97316" />
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                    Theme
                  </Text>
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    {theme === 'auto' ? 'Auto (System)' : theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </TouchableOpacity>

            {/* Edit Profile */}
            <TouchableOpacity
              onPress={handleEditProfile}
              style={{
                backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                padding: 16,
                borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="person" size={24} color="#8b5cf6" />
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                    Edit Profile
                  </Text>
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    Update goals and preferences
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </TouchableOpacity>
          </View>

          {/* Data & Support */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
            Data & Support
          </Text>

          <View style={{ gap: 12, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={handleExportData}
              style={{
                backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                padding: 16,
                borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="download" size={24} color="#3b82f6" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                  Export Data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResetData}
              style={{
                backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                padding: 16,
                borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="trash" size={24} color="#ef4444" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#ef4444' }}>
                  Reset All Data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
                padding: 16,
                borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="information-circle" size={24} color="#f59e0b" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                  About BodyFlow
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </TouchableOpacity>
          </View>

          {/* Version */}
          <Text style={{ fontSize: 10, color: mutedColor, textAlign: 'center', marginBottom: 20 }}>
            Version 1.0.0 • Made with ❤️
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: '90%',
          }}>
            <ScrollView>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>
                  Edit Profile
                </Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Ionicons name="close" size={28} color={mutedColor} />
                </TouchableOpacity>
              </View>

              {/* Name */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 10, color: mutedColor, marginBottom: 8 }}>Name</Text>
                <TextInput
                  style={{
                    backgroundColor: bgColor,
                    padding: 16,
                    borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                    color: textColor,
                    fontSize: 12,
                  }}
                  placeholder="Your name"
                  placeholderTextColor={mutedColor}
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              {/* Goals */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 10, color: mutedColor, marginBottom: 8 }}>Goals</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GOALS.map(goal => (
                    <TouchableOpacity
                      key={goal.value}
                      onPress={() => toggleGoal(goal.value)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                        backgroundColor: editGoals.includes(goal.value) ? '#6366f1' : bgColor,
                      }}
                    >
                      <Text style={{ color: editGoals.includes(goal.value) ? '#ffffff' : textColor, fontSize: 10 }}>
                        {goal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Target Muscles */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 10, color: mutedColor, marginBottom: 8 }}>Target Muscles</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {MUSCLE_GROUPS.map(muscle => (
                    <TouchableOpacity
                      key={muscle.name}
                      onPress={() => toggleMuscle(muscle.name)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                        backgroundColor: editMuscles.includes(muscle.name) ? muscle.color : bgColor,
                      }}
                    >
                      <Text style={{ color: editMuscles.includes(muscle.name) ? '#ffffff' : textColor, fontSize: 10 }}>
                        {muscle.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Skill Level */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 10, color: mutedColor, marginBottom: 8 }}>Skill Level</Text>
                <View style={{ gap: 8 }}>
                  {SKILL_LEVELS.map(level => (
                    <TouchableOpacity
                      key={level.value}
                      onPress={() => setEditSkillLevel(level.value)}
                      style={{
                        padding: 16,
                        borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                        backgroundColor: editSkillLevel === level.value ? '#6366f1' : bgColor,
                      }}
                    >
                      <Text style={{ color: editSkillLevel === level.value ? '#ffffff' : textColor, fontWeight: '600', marginBottom: 4 }}>
                        {level.label}
                      </Text>
                      <Text style={{ color: editSkillLevel === level.value ? '#ffffff' + 'CC' : mutedColor, fontSize: 10 }}>
                        {level.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveProfile}
                style={{
                  backgroundColor: '#6366f1',
                  padding: 16,
                  borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 12 }}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>
                Choose Theme
              </Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <Ionicons name="close" size={28} color={mutedColor} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {[
                { value: 'light' as const, label: 'Light Mode', icon: 'sunny' },
                { value: 'dark' as const, label: 'Dark Mode', icon: 'moon' },
                { value: 'auto' as const, label: 'Auto (System)', icon: 'phone-portrait' },
              ].map(themeOption => (
                <TouchableOpacity
                  key={themeOption.value}
                  onPress={() => handleThemeChange(themeOption.value)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                    backgroundColor: theme === themeOption.value ? '#6366f1' : bgColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Ionicons 
                    name={themeOption.icon as any} 
                    size={24} 
                    color={theme === themeOption.value ? '#ffffff' : textColor} 
                  />
                  <Text style={{ 
                    color: theme === themeOption.value ? '#ffffff' : textColor, 
                    fontWeight: '600',
                    flex: 1,
                  }}>
                    {themeOption.label}
                  </Text>
                  {theme === themeOption.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
