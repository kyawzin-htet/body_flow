import { View, Text, Modal, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface CongratulationsModalProps {
  visible: boolean;
  onClose: () => void;
  amountDrank: number;
  goal: number;
  isDark?: boolean;
}

export function CongratulationsModal({ 
  visible, 
  onClose, 
  amountDrank, 
  goal,
  isDark = false 
}: CongratulationsModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      fadeAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const surfaceColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const accentColor = '#6366f1';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
      }}>
        <Animated.View style={{
          backgroundColor: surfaceColor,
          borderRadius: 24,
          padding: 32,
          width: '100%',
          maxWidth: 400,
          alignItems: 'center',
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        }}>
          {/* Trophy Icon with Rotation */}
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="trophy" size={80} color="#6366f1" />
          </Animated.View>

          {/* Congratulations Text */}
          <Text style={{ 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: textColor,
            marginTop: 24,
            textAlign: 'center',
          }}>
            🎉 Congratulations! 🎉
          </Text>

          <Text style={{ 
            fontSize: 14, 
            color: mutedColor,
            marginTop: 12,
            textAlign: 'center',
          }}>
            You've reached your daily hydration goal!
          </Text>

          {/* Stats */}
          <View style={{
            backgroundColor: accentColor + '20',
            borderRadius: 16,
            padding: 20,
            marginTop: 24,
            width: '100%',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: mutedColor }}>Drank</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: accentColor, marginTop: 4 }}>
                  {(amountDrank / 1000).toFixed(2)} L
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: mutedColor + '30' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: mutedColor }}>Goal</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: accentColor, marginTop: 4 }}>
                  {(goal / 1000).toFixed(2)} L
                </Text>
              </View>
            </View>
          </View>

          {/* Motivational Message */}
          <Text style={{ 
            fontSize: 12, 
            color: textColor,
            marginTop: 20,
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            Keep up the great work! 💪💧
          </Text>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: accentColor,
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 16,
              marginTop: 24,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
              Awesome!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
