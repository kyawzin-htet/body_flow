import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { useHydrationStore } from '../../src/store/hydrationStore';
import { useTheme } from '../../src/hooks/useTheme';
import { WaterDropAnimation } from '../../src/components/WaterDropAnimation';
import { NotificationService } from '../../src/services/notificationService';

export default function HydrationScreen() {
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

  const handleAddWater = async (amount: number) => {
    if (!user) return;
    await logWater(user.id, amount);
  };

  const handleCustomAmount = async () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number');
      return;
    }
    await handleAddWater(amount);
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

  const bgColor = isDark ? '#0a0e27' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1f3a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const accentColor = '#4FC3F7';

  const progress = getProgress();
  const remaining = getRemainingMl();
  const goalReached = isGoalReached();

  const quickAmounts = [250, 500, 750];

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <Stack.Screen 
        options={{
          headerTitle: 'Hydration',
          headerStyle: { backgroundColor: surfaceColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowSettings(true)}>
              <Ionicons name="settings-outline" size={24} color={textColor} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20, alignItems: 'center' }}>
          {/* Water Drop Animation */}
          <WaterDropAnimation progress={progress} size={220} />

          {/* Progress Info */}
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: accentColor }}>
              {Math.round(progress)}%
            </Text>
            <Text style={{ fontSize: 18, color: textColor, marginTop: 8 }}>
              {todayLog?.amountMl || 0} ml / {settings?.dailyGoalMl || 2000} ml
            </Text>
            {!goalReached && (
              <Text style={{ fontSize: 14, color: mutedColor, marginTop: 4 }}>
                {remaining} ml remaining
              </Text>
            )}
            {goalReached && (
              <Text style={{ fontSize: 16, color: accentColor, marginTop: 8, fontWeight: '600' }}>
                🎉 Daily goal reached! Great job! 🎉
              </Text>
            )}
          </View>

          {/* Quick Add Buttons */}
          <View style={{ marginTop: 32, width: '100%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
              Quick Add
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => handleAddWater(amount)}
                  style={{
                    flex: 1,
                    minWidth: 100,
                    backgroundColor: accentColor,
                    padding: 16,
                    borderRadius: 16,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="water" size={28} color="#ffffff" />
                  <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
                    {amount} ml
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setShowCustomAmount(true)}
                style={{
                  flex: 1,
                  minWidth: 100,
                  backgroundColor: surfaceColor,
                  borderWidth: 2,
                  borderColor: accentColor,
                  padding: 16,
                  borderRadius: 16,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="add-circle-outline" size={28} color={accentColor} />
                <Text style={{ color: accentColor, fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's History */}
          {todayLog && todayLog.amountMl > 0 && (
            <View style={{ marginTop: 32, width: '100%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
                Today's Progress
              </Text>
              <View style={{ backgroundColor: surfaceColor, padding: 16, borderRadius: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: mutedColor }}>Total Intake</Text>
                  <Text style={{ color: textColor, fontWeight: '600' }}>{todayLog.amountMl} ml</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: mutedColor }}>Daily Goal</Text>
                  <Text style={{ color: textColor, fontWeight: '600' }}>{todayLog.goalMl} ml</Text>
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
          <View style={{ backgroundColor: surfaceColor, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor }}>Custom Amount</Text>
              <TouchableOpacity onPress={() => setShowCustomAmount(false)}>
                <Ionicons name="close-circle" size={32} color={mutedColor} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              placeholder="Enter amount in ml"
              placeholderTextColor={mutedColor}
              style={{
                backgroundColor: bgColor,
                padding: 16,
                borderRadius: 12,
                color: textColor,
                fontSize: 18,
                marginBottom: 16,
              }}
            />

            <TouchableOpacity
              onPress={handleCustomAmount}
              style={{
                backgroundColor: accentColor,
                padding: 16,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>Add Water</Text>
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
          <View style={{ backgroundColor: surfaceColor, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor }}>Hydration Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close-circle" size={32} color={mutedColor} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Daily Goal */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: textColor, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                  Daily Goal: {dailyGoal} ml
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
                        backgroundColor: dailyGoal === goal ? accentColor : bgColor,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: dailyGoal === goal ? '#ffffff' : textColor, fontWeight: '600' }}>
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
                    backgroundColor: bgColor,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
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
                    <Text style={{ color: textColor, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
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
                            backgroundColor: intervalMinutes === interval ? accentColor : bgColor,
                            minWidth: 80,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: intervalMinutes === interval ? '#ffffff' : textColor, fontWeight: '600' }}>
                            {interval} min
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Active Hours */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: textColor, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
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
                            backgroundColor: bgColor,
                            padding: 12,
                            borderRadius: 12,
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
                            backgroundColor: bgColor,
                            padding: 12,
                            borderRadius: 12,
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
                      backgroundColor: bgColor,
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
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>Save Settings</Text>
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
    </View>
  );
}
