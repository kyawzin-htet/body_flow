import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay, 
  withTiming,
  useSharedValue,
  Easing
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

export const Splash = () => {
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';

  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 800 });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: withTiming(textOpacity.value === 1 ? 0 : 20) }],
  }));

  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDark ? '#000000' : '#ffffff' }
    ]}>
      <Animated.View style={[styles.content, logoStyle]}>
        <View style={styles.iconContainer}>
          <Ionicons name="fitness" size={80} color="#ffffff" />
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={[
          styles.title, 
          { color: isDark ? '#ffffff' : '#000000' }
        ]}>
          BodyFlow
        </Text>
        <Text style={[
          styles.subtitle,
          { color: isDark ? '#9ca3af' : '#6b7280' }
        ]}>
          Train Anywhere, Anytime
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'System',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    letterSpacing: 1.5,
  },
});
