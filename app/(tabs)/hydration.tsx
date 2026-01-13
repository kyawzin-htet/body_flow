import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from 'expo-router';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { useHydrationStore } from '../../src/store/hydrationStore';
import { useTheme } from '../../src/hooks/useTheme';
import { WaterDropAnimation } from '../../src/components/WaterDropAnimation';
import { NotificationService } from '../../src/services/notificationService';
import { CongratulationsModal } from '../../src/components/CongratulationsModal';

export default function HydrationScreen() {
  const navigation = useNavigation();
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  const user = useUserStore((state) => state.user);
  
  const {
    todayLog,
    settings,
    isLoading,
    loadTodayLog,
    loadSettings,
    logWater,
    updateSettings,
    initializeForUser,
    getProgress,
    getRemainingMl,
    isGoalReached,
  } = useHydrationStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [showCongratulations, setShowCongratulations] = useState(false);
  const hasShownCongratsToday = useRef(false);
  const previousAmount = useRef(0);
  
  // Settings form state
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(22);

  useEffect(() => {
    if (user) {
      initializeForUser(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      setDailyGoal(settings.dailyGoalMl);
      setNotificationsEnabled(settings.notificationEnabled);
      setIntervalMinutes(settings.notificationIntervalMinutes);
      setStartHour(settings.notificationStartHour);
      setEndHour(settings.notificationEndHour);
    }
  }, [settings]);

  // Check if goal is reached and show congratulations
  useEffect(() => {
    if (!todayLog) return;
    
    const goalReached = isGoalReached();
    const wasNotReached = previousAmount.current < todayLog.goalMl;
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Show congratulations only when goal is FIRST reached
    if (goalReached && wasNotReached && todayLog.date === currentDate && !hasShownCongratsToday.current) {
      hasShownCongratsToday.current = true;
      setShowCongratulations(true);
    }
    
    // Update previous amount
    previousAmount.current = todayLog.amountMl;
    
    // Reset the flag when the date changes
    if (todayLog.date !== currentDate) {
      hasShownCongratsToday.current = false;
      previousAmount.current = 0;
    }
  }, [todayLog?.amountMl, todayLog?.goalMl, todayLog?.date, isGoalReached]);

  const handleAddWater = async (amount: number) => {
    if (!user) return;
    await logWater(user.id, amount);
  };

  const handleCustomAmount = async () => {
    const amountInLiters = parseFloat(customAmount);
    if (isNaN(amountInLiters) || amountInLiters <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number');
      return;
    }
    // Convert liters to ml for storage
    const amountInMl = Math.round(amountInLiters * 1000);
    await handleAddWater(amountInMl);
    setCustomAmount('');
    setShowCustomAmount(false);
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    await updateSettings(user.id, {
      dailyGoalMl: dailyGoal,
      notificationEnabled: notificationsEnabled,
      notificationIntervalMinutes: intervalMinutes,
      notificationStartHour: startHour,
      notificationEndHour: endHour,
    });
    setShowSettings(false);
  };

  const handleTestNotification = async () => {
    await NotificationService.sendImmediateNotification();
    Alert.alert('Test Notification', 'Check your notifications!');
  };

  const bgColor = isDark ? '#000000' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const accentColor = '#4FC3F7';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={24} color={textColor} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, textColor]);

  const progress = getProgress();
  const remaining = getRemainingMl();
  const goalReached = isGoalReached();

  const quickAmounts = [250, 500, 750];

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20, alignItems: 'center' }}>
          {/* Water Drop Animation */}
          <WaterDropAnimation progress={progress} size={160} />

          {/* Progress Info */}
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: accentColor }}>
              {Math.round(progress)}%
            </Text>
            <Text style={{ fontSize: 14, color: textColor, marginTop: 8 }}>
              {((todayLog?.amountMl || 0) / 1000).toFixed(2)} L / {((settings?.dailyGoalMl || 2000) / 1000).toFixed(2)} L
            </Text>
            {!goalReached && (
              <Text style={{ fontSize: 10, color: mutedColor, marginTop: 4 }}>
                {(remaining / 1000).toFixed(2)} L remaining
              </Text>
            )}
            {goalReached && (
              <Text style={{ fontSize: 12, color: accentColor, marginTop: 8, fontWeight: '600' }}>
                🎉 Daily goal reached! Great job! 🎉
              </Text>
            )}
          </View>

          {/* Quick Add Buttons */}
          <View style={{ marginTop: 20, width: '100%' }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
              Quick Add
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => handleAddWater(amount)}
                  style={{
                    flex: 1,
                    minWidth: 80,
                    backgroundColor: 'rgba(79, 195, 247, 0.2)',
                    padding: 8,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(79, 195, 247, 0.3)',

                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="water" size={24} color={accentColor} />
                  <Text style={{ color: accentColor, fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                    {(amount / 1000).toFixed(2)} L
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setShowCustomAmount(true)}
                style={{
                  flex: 1,
                  minWidth: 80,
                  backgroundColor: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  padding: 8,
                  borderRadius: 16,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={accentColor} />
                <Text style={{ color: accentColor, fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's History */}
          {todayLog && todayLog.amountMl > 0 && (
            <View style={{ marginTop: 20, width: '100%' }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                Today's Progress
              </Text>
              <View style={{ 
                backgroundColor: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                padding: 12, 
                borderRadius: 16 
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: mutedColor }}>Total Intake</Text>
                  <Text style={{ color: textColor, fontWeight: '600' }}>{(todayLog.amountMl / 1000).toFixed(2)} L</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: mutedColor }}>Daily Goal</Text>
                  <Text style={{ color: textColor, fontWeight: '600' }}>{(todayLog.goalMl / 1000).toFixed(2)} L</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: mutedColor }}>Progress</Text>
                  <Text style={{ color: accentColor, fontWeight: 'bold' }}>{Math.round(progress)}%</Text>
                </View>
              </View>
            </View>
          )}
          </View>
      </ScrollView>

      {/* Custom Amount Modal */}
      <Modal
        visible={showCustomAmount}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomAmount(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)', 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>Custom Amount</Text>
              <TouchableOpacity onPress={() => setShowCustomAmount(false)}>
                <Ionicons name="close-circle" size={32} color={mutedColor} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              placeholder="Enter amount in liters"
              placeholderTextColor={mutedColor}
              style={{
                backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(245,245,245,0.7)',
                padding: 16,
                borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                color: textColor,
                fontSize: 14,
                marginBottom: 16,
              }}
            />

            <TouchableOpacity
              onPress={handleCustomAmount}
              style={{
                backgroundColor: accentColor,
                padding: 16,
                borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>Add Water</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)', 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24, 
            maxHeight: '80%',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>Hydration Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close-circle" size={32} color={mutedColor} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Daily Goal */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: textColor, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                  Daily Goal: {(dailyGoal / 1000).toFixed(2)} L
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[1000, 1500, 2000, 2500, 3000].map((goal) => (
                    <TouchableOpacity
                      key={goal}
                      onPress={() => setDailyGoal(goal)}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 12,
          borderWidth: 1,
          borderColor: dailyGoal === goal ? accentColor : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"),
                        backgroundColor: dailyGoal === goal ? 'rgba(79, 195, 247, 0.2)' : (isDark ? 'rgba(0,0,0,0.3)' : 'rgba(245,245,245,0.7)'),
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: dailyGoal === goal ? accentColor : textColor, fontWeight: '600' }}>
                        {goal}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notifications Toggle */}
              <View style={{ marginBottom: 24 }}>
                <TouchableOpacity
                  onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(245,245,245,0.7)',
                    borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Text style={{ color: textColor, fontSize: 12, fontWeight: '600' }}>
                    Enable Reminders
                  </Text>
                  <Ionicons
                    name={notificationsEnabled ? 'toggle' : 'toggle-outline'}
                    size={32}
                    color={notificationsEnabled ? accentColor : mutedColor}
                  />
                </TouchableOpacity>
              </View>

              {/* Notification Interval */}
              {notificationsEnabled && (
                <>
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: textColor, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                      Reminder Interval
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      {[15, 30, 60, 120, 180].map((interval) => (
                        <TouchableOpacity
                          key={interval}
                          onPress={() => setIntervalMinutes(interval)}
                          style={{
                            padding: 12,
                            borderRadius: 12,
          borderWidth: 1,
          borderColor: intervalMinutes === interval ? accentColor : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"),
                            backgroundColor: intervalMinutes === interval ? 'rgba(79, 195, 247, 0.2)' : (isDark ? 'rgba(0,0,0,0.3)' : 'rgba(245,245,245,0.7)'),
                            minWidth: 80,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: intervalMinutes === interval ? accentColor : textColor, fontWeight: '600' }}>
                            {interval} min
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Active Hours */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: textColor, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                      Active Hours: {startHour}:00 - {endHour}:00
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: mutedColor, marginBottom: 4 }}>Start</Text>
                        <TextInput
                          value={startHour.toString()}
                          onChangeText={(text) => {
                            const hour = parseInt(text) || 0;
                            setStartHour(Math.max(0, Math.min(23, hour)));
                          }}
                          keyboardType="numeric"
                          style={{
                            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(245,245,245,0.7)',
                            padding: 12,
                            borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                            color: textColor,
                          }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: mutedColor, marginBottom: 4 }}>End</Text>
                        <TextInput
                          value={endHour.toString()}
                          onChangeText={(text) => {
                            const hour = parseInt(text) || 0;
                            setEndHour(Math.max(0, Math.min(23, hour)));
                          }}
                          keyboardType="numeric"
                          style={{
                            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(245,245,245,0.7)',
                            padding: 12,
                            borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                            color: textColor,
                          }}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Test Notification */}
                  <TouchableOpacity
                    onPress={handleTestNotification}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(245,245,245,0.7)',
                      borderWidth: 1,
                      borderColor: accentColor,
                      alignItems: 'center',
                      marginBottom: 24,
                    }}
                  >
                    <Text style={{ color: accentColor, fontWeight: '600' }}>
                      Test Notification
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveSettings}
                style={{
                  backgroundColor: accentColor,
                  padding: 16,
                  borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.18)",
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>Save Settings</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      )}

      {/* Congratulations Modal */}
      <CongratulationsModal
        visible={showCongratulations}
        onClose={() => { setShowCongratulations(false); }}
        amountDrank={todayLog?.amountMl || 0}
        goal={settings?.dailyGoalMl || 2000}
        isDark={isDark}
      />
    </View>
  );
}
