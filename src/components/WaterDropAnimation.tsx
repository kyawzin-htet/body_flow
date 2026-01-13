import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

interface WaterDropAnimationProps {
  progress: number; // 0-100
  size?: number;
}

export const WaterDropAnimation: React.FC<WaterDropAnimationProps> = ({ 
  progress, 
  size = 200 
}) => {
  const fillProgress = useSharedValue(0);
  const bounceScale = useSharedValue(1);

  useEffect(() => {
    fillProgress.value = withSpring(progress / 100, {
      damping: 15,
      stiffness: 90,
    });
  }, [progress]);

  const animatedWaterStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      fillProgress.value,
      [0, 1],
      [size, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateY },
        { scale: bounceScale.value },
      ],
    };
  });

  const animatedDropStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceScale.value }],
  }));

  // Trigger bounce animation when progress changes
  useEffect(() => {
    if (progress > 0) {
      bounceScale.value = withSequence(
        withTiming(1.1, { duration: 200, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 200, easing: Easing.in(Easing.ease) })
      );
    }
  }, [progress]);

  // Determine face expression based on progress
  const getFaceExpression = () => {
    if (progress >= 100) {
      return { eyes: '✨', mouth: '😊' }; // Happy/Complete
    } else if (progress >= 75) {
      return { eyes: '😊', mouth: '😄' }; // Very happy
    } else if (progress >= 50) {
      return { eyes: '😊', mouth: '🙂' }; // Happy
    } else if (progress >= 25) {
      return { eyes: '😐', mouth: '😐' }; // Neutral
    } else {
      return { eyes: '😢', mouth: '🥺' }; // Thirsty
    }
  };

  const face = getFaceExpression();

  return (
    <View style={[styles.container, { width: size, height: size * 1.2 }]}>
      <Animated.View style={[styles.dropContainer, animatedDropStyle]}>
        {/* Water Drop Shape */}
        <Svg width={size} height={size * 1.2} viewBox="0 0 100 120">
          <Path
            d="M50 10 C30 40, 10 60, 10 80 C10 95, 25 110, 50 110 C75 110, 90 95, 90 80 C90 60, 70 40, 50 10 Z"
            fill="#E0F7FA"
            stroke="#4FC3F7"
            strokeWidth="2"
          />
        </Svg>

        {/* Water Fill */}
        <Animated.View style={[styles.waterFill, animatedWaterStyle]}>
          <View style={styles.waterGradient}>
            <View style={[styles.water, { backgroundColor: '#4FC3F7' }]} />
          </View>
        </Animated.View>

        {/* Cute Face */}
        <View style={styles.face}>
          <View style={styles.eyes}>
            <View style={styles.eye}>
              <Circle cx="35" cy="45" r="5" fill="#333" />
            </View>
            <View style={styles.eye}>
              <Circle cx="65" cy="45" r="5" fill="#333" />
            </View>
          </View>
          
          {/* Mouth changes based on progress */}
          <View style={styles.mouth}>
            {progress >= 100 ? (
              // Big smile for completion
              <Svg width="40" height="20" viewBox="0 0 40 20">
                <Path
                  d="M5 5 Q20 15, 35 5"
                  stroke="#333"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </Svg>
            ) : progress >= 50 ? (
              // Small smile
              <Svg width="30" height="15" viewBox="0 0 30 15">
                <Path
                  d="M5 5 Q15 10, 25 5"
                  stroke="#333"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </Svg>
            ) : progress >= 25 ? (
              // Neutral line
              <View style={styles.neutralMouth} />
            ) : (
              // Sad mouth
              <Svg width="30" height="15" viewBox="0 0 30 15">
                <Path
                  d="M5 10 Q15 5, 25 10"
                  stroke="#333"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </Svg>
            )}
          </View>
        </View>

        {/* Sparkles when goal reached */}
        {progress >= 100 && (
          <View style={styles.sparkles}>
            <Animated.Text style={styles.sparkle}>✨</Animated.Text>
            <Animated.Text style={[styles.sparkle, { top: 10, right: 20 }]}>⭐</Animated.Text>
            <Animated.Text style={[styles.sparkle, { bottom: 30, left: 15 }]}>💫</Animated.Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  waterGradient: {
    flex: 1,
  },
  water: {
    flex: 1,
    opacity: 0.7,
  },
  face: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '35%',
  },
  eyes: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 15,
  },
  eye: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mouth: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  neutralMouth: {
    width: 25,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  sparkles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
  },
});
