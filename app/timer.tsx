import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/hooks/useTheme';
import { useSettingsStore } from '../src/store/settingsStore';
import { Audio } from 'expo-av';

type TimerPhase = 'prepare' | 'work' | 'rest' | 'cooldown' | 'finished';

export default function TimerScreen() {
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);

  // Config
  const [prepareTime, setPrepareTime] = useState(10);
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(15);
  const [rounds, setRounds] = useState(4);
  const [cycles, setCycles] = useState(1);

  // State
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('prepare');
  const [timeLeft, setTimeLeft] = useState(prepareTime);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentCycle, setCurrentCycle] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const playSound = async (type: 'beep' | 'finished') => {
    if (!soundEnabled) return;
    // In a real app, we would load and play actual sound files here.
    // For this MVP, we'll just placeholder logic or console log.
    // implementation of `Audio.Sound.createAsync` would go here.
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    
    // Initial setup if starting from fresh
    if (phase === 'finished' || (phase === 'prepare' && timeLeft === prepareTime)) {
      setPhase('prepare');
      setTimeLeft(prepareTime);
      setCurrentRound(1);
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setPhase('prepare');
    setTimeLeft(prepareTime);
    setCurrentRound(1);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseChange();
            return 0; // Will be overwritten by handlePhaseChange
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, phase, timeLeft]);

  const handlePhaseChange = () => {
    playSound('beep');

    if (phase === 'prepare') {
      setPhase('work');
      setTimeLeft(workTime);
    } else if (phase === 'work') {
      if (currentRound < rounds) {
        setPhase('rest');
        setTimeLeft(restTime);
      } else {
        // End of rounds
        finishTimer();
      }
    } else if (phase === 'rest') {
      setPhase('work');
      setTimeLeft(workTime);
      setCurrentRound((prev) => prev + 1);
    }
  };

  const finishTimer = () => {
    setPhase('finished');
    setIsRunning(false);
    playSound('finished');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const bgColor = isDark ? '#000000' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  const getPhaseColor = () => {
    switch (phase) {
      case 'work': return '#10b981'; // Green
      case 'rest': return '#f59e0b'; // Orange
      case 'prepare': return '#3b82f6'; // Blue
      case 'finished': return '#6366f1'; // Indigo
      default: return mutedColor;
    }
  };

  const getPhaseName = () => {
    switch (phase) {
      case 'work': return 'WORK';
      case 'rest': return 'REST';
      case 'prepare': return 'GET READY';
      case 'finished': return 'COMPLETED';
      default: return '';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <Stack.Screen 
        options={{
          headerTitle: 'Interval Timer',
          headerStyle: { backgroundColor: surfaceColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      {isRunning ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          {/* Active Timer UI */}
          <Text style={{ fontSize: 44, fontWeight: 'bold', color: getPhaseColor(), marginBottom: 20 }}>
            {getPhaseName()}
          </Text>

          <Text style={{ fontSize: 116, fontWeight: 'bold', color: textColor, fontVariant: ['tabular-nums'] }}>
            {formatTime(timeLeft)}
          </Text>

          <View style={{ flexDirection: 'row', gap: 40, marginBottom: 60 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: mutedColor }}>Round</Text>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: textColor }}>{currentRound}/{rounds}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 20 }}>
            {phase !== 'finished' && (
              <TouchableOpacity
                onPress={isPaused ? startTimer : pauseTimer}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: isPaused ? '#10b981' : '#f59e0b',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name={isPaused ? 'play' : 'pause'} size={40} color="#ffffff" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={resetTimer}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#ef4444',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="stop" size={40} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 20 }}>
            {/* Configuration */}
            <View style={{ backgroundColor: surfaceColor, borderRadius: 20, padding: 24 }}>
              
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, color: mutedColor, marginBottom: 8 }}>Work Duration</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                   <TouchableOpacity onPress={() => setWorkTime(Math.max(5, workTime - 5))}>
                    <Ionicons name="remove-circle" size={32} color={mutedColor} />
                   </TouchableOpacity>
                   <Text style={{ fontSize: 28, fontWeight: 'bold', color: textColor }}>{formatTime(workTime)}</Text>
                   <TouchableOpacity onPress={() => setWorkTime(workTime + 5)}>
                    <Ionicons name="add-circle" size={32} color={mutedColor} />
                   </TouchableOpacity>
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, color: mutedColor, marginBottom: 8 }}>Rest Duration</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                   <TouchableOpacity onPress={() => setRestTime(Math.max(5, restTime - 5))}>
                    <Ionicons name="remove-circle" size={32} color={mutedColor} />
                   </TouchableOpacity>
                   <Text style={{ fontSize: 28, fontWeight: 'bold', color: textColor }}>{formatTime(restTime)}</Text>
                   <TouchableOpacity onPress={() => setRestTime(restTime + 5)}>
                    <Ionicons name="add-circle" size={32} color={mutedColor} />
                   </TouchableOpacity>
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, color: mutedColor, marginBottom: 8 }}>Rounds</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                   <TouchableOpacity onPress={() => setRounds(Math.max(1, rounds - 1))}>
                    <Ionicons name="remove-circle" size={32} color={mutedColor} />
                   </TouchableOpacity>
                   <Text style={{ fontSize: 28, fontWeight: 'bold', color: textColor }}>{rounds}</Text>
                   <TouchableOpacity onPress={() => setRounds(rounds + 1)}>
                    <Ionicons name="add-circle" size={32} color={mutedColor} />
                   </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={startTimer}
                style={{
                  backgroundColor: '#6366f1',
                  padding: 20,
                  borderRadius: 16,
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                  Start Workout
                </Text>
              </TouchableOpacity>

            </View>

            <View style={{ marginTop: 24, padding: 20, backgroundColor: surfaceColor, borderRadius: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor, marginBottom: 8 }}>
                Total Time
              </Text>
              <Text style={{ fontSize: 12, color: mutedColor }}>
                {formatTime((workTime + restTime) * rounds + prepareTime)}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
