import { View, Text, ScrollView, useColorScheme, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../src/store/userStore';
import { AnalyticsService } from '../src/services/analyticsService';
import { useTheme } from '../src/hooks/useTheme';
import { ProgressMetrics, HydrationLog } from '../src/types';
import { MUSCLE_GROUPS } from '../src/utils/constants';
import { HydrationRepository } from '../src/database/repositories/hydrationRepository';

export default function AnalyticsScreen() {
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  const user = useUserStore((state) => state.user);
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [monthSummary, setMonthSummary] = useState('');
  const [insights, setInsights] = useState<string[]>([]);
  const [hydrationHistory, setHydrationHistory] = useState<HydrationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = isDark ? '#000000' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const metricsData = await AnalyticsService.getProgressMetrics(user.id);
      const summary = await AnalyticsService.getMonthSummary(user.id);
      const insightsData = await AnalyticsService.getInsights(user.id);

      // Load hydration history for last 7 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const hydrationData = await HydrationRepository.getHistory(user.id, startDate, endDate);

      setMetrics(metricsData);
      setMonthSummary(summary);
      setInsights(insightsData);
      setHydrationHistory(hydrationData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ fontSize: 10, color: mutedColor, marginTop: 12 }}>
          Calculating analytics...
        </Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="analytics-outline" size={64} color={mutedColor} />
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor, marginTop: 16 }}>
          No Data Yet
        </Text>
        <Text style={{ fontSize: 10, color: mutedColor, marginTop: 8, textAlign: 'center' }}>
          Start tracking habits to see analytics
        </Text>
      </View>
    );
  }

  const musicColors: Record<string, string> = {
    core: '#f97316',
    arms: '#3b82f6',
    legs: '#10b981',
    shoulders: '#8b5cf6',
    back: '#ef4444',
    'full-body': '#f59e0b',
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ padding: 20 }}>
        {/* <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 8 }}>
          Analytics
        </Text> */}
        <Text style={{ fontSize: 12, color: mutedColor, marginBottom: 24 }}>
          Track your progress and insights
        </Text>

        {/* Key Metrics */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
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
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
              {metrics.totalWorkouts}
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
            <Ionicons name="time" size={24} color="#10b981" />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
              {Math.floor(metrics.totalDuration / 60)}h
            </Text>
            <Text style={{ fontSize: 10, color: mutedColor }}>Training Time</Text>
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
            <Ionicons name="trending-up" size={24} color="#f97316" />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
              {metrics.consistencyScore}%
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
            <Ionicons name="flame" size={24} color="#ef4444" />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
              {metrics.currentStreak}
            </Text>
            <Text style={{ fontSize: 10, color: mutedColor }}>Day Streak</Text>
          </View>
        </View>

        {/* Muscle Balance */}
        <View style={{
          backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
          padding: 20,
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
            Muscle Balance
          </Text>

          <View style={{ gap: 12 }}>
            {metrics.muscleBalance
              .filter(item => item.volume > 0)
              .map((item) => (
                <View key={item.muscleGroup}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 10, color: textColor, fontWeight: '600', textTransform: 'capitalize' }}>
                      {item.muscleGroup}
                    </Text>
                    <Text style={{ fontSize: 10, color: mutedColor }}>
                      {item.percentage}%
                    </Text>
                  </View>
                  <View style={{
                    height: 8,
                    backgroundColor: isDark ? '#000000' : '#e5e7eb',
                    borderRadius: 4,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                    overflow: 'hidden',
                  }}>
                    <View
                      style={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        backgroundColor: musicColors[item.muscleGroup] || '#6366f1',
                      }}
                    />
                  </View>
                </View>
              ))}
          </View>
        </View>

        {/* Weekly Volume Bar Chart */}
        <View style={{
          backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
          padding: 20,
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
            Weekly Training Volume
          </Text>

          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between',
            height: 200,
            paddingVertical: 10,
          }}>
            {metrics.weeklyVolume.map((item, index) => {
              const maxSets = Math.max(...metrics.weeklyVolume.map(v => v.sets), 1);
              const height = (item.sets / maxSets) * 160;
              const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

              return (
                <View key={item.date} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 32,
                    height: height || 8,
                    backgroundColor: item.sets > 0 ? '#6366f1' : mutedColor + '40',
                    borderRadius: 8,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                    marginBottom: 8,
                  }} />
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    {dayLabels[index] || ''}
                  </Text>
                  {item.sets > 0 && (
                    <Text style={{ fontSize: 10, color: textColor, marginTop: 4 }}>
                      {item.sets}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Hydration Analytics */}
        <View style={{
          backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
          padding: 20,
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
            Hydration Analytics
          </Text>

          {/* Hydration Stats */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <View style={{
              flex: 1,
              minWidth: '47%',
              backgroundColor: '#4FC3F7' + '20',
              padding: 16,
              borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            }}>
              <Ionicons name="water" size={20} color="#4FC3F7" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
                {hydrationHistory.length > 0
                  ? (hydrationHistory.reduce((sum, log) => sum + log.amountMl, 0) / hydrationHistory.length / 1000).toFixed(2)
                  : '0.00'} L
              </Text>
              <Text style={{ fontSize: 10, color: mutedColor }}>Avg Daily Intake</Text>
            </View>

            <View style={{
              flex: 1,
              minWidth: '47%',
              backgroundColor: '#4FC3F7' + '20',
              padding: 16,
              borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
            }}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
                {hydrationHistory.length > 0
                  ? Math.round((hydrationHistory.filter(log => log.amountMl >= log.goalMl).length / hydrationHistory.length) * 100)
                  : 0}%
              </Text>
              <Text style={{ fontSize: 10, color: mutedColor }}>Goal Completion</Text>
            </View>
          </View>

          {/* Weekly Hydration Chart */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: textColor, marginBottom: 12 }}>
            Last 7 Days
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between',
            height: 180,
            paddingVertical: 10,
          }}>
            {Array.from({ length: 7 }).map((_, index) => {
              const date = new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              const log = hydrationHistory.find(h => h.date === date);
              const amount = log?.amountMl || 0;
              const goal = log?.goalMl || 2000;
              const maxAmount = Math.max(...hydrationHistory.map(h => h.amountMl), goal);
              const height = maxAmount > 0 ? (amount / maxAmount) * 140 : 0;
              const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const dayOfWeek = new Date(date).getDay();
              const goalMet = amount >= goal;

              return (
                <View key={date} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 32,
                    height: height || 8,
                    backgroundColor: goalMet ? '#10b981' : amount > 0 ? '#4FC3F7' : mutedColor + '40',
                    borderRadius: 8,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                    marginBottom: 8,
                  }} />
                  <Text style={{ fontSize: 10, color: mutedColor }}>
                    {dayLabels[dayOfWeek === 0 ? 6 : dayOfWeek - 1]}
                  </Text>
                  {amount > 0 && (
                    <Text style={{ fontSize: 10, color: textColor, marginTop: 4 }}>
                      {(amount / 1000).toFixed(1)}L
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Progress Summary */}
        <View style={{
          backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
          padding: 20,
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
            Month Summary
          </Text>

          <Text style={{ fontSize: 10, color: textColor, lineHeight: 20, marginBottom: 16 }}>
            {monthSummary}
          </Text>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, color: mutedColor }}>Best Streak</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: textColor }}>{metrics.bestStreak} days</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, color: mutedColor }}>Current Streak</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: textColor }}>{metrics.currentStreak} days</Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={{
          backgroundColor: '#6366f1' + '20',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
          padding: 20,
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="sparkles" size={24} color="#6366f1" />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor, marginLeft: 8 }}>
              AI Insights
            </Text>
          </View>
          <View style={{ gap: 8 }}>
            {insights.map((insight, index) => (
              <Text key={index} style={{ fontSize: 10, color: textColor, lineHeight: 20 }}>
                {insight}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
