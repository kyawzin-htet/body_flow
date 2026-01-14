import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

const VISIBLE_TABS = ['index', 'muscles', 'hydration', 'profile'];

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  
  // Store tab layouts
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const slidePosition = useSharedValue(0);
  const slideWidth = useSharedValue(0);

  // Calculate which visible tab is active
  const currentRoute = state.routes[state.index];
  const visibleIndex = VISIBLE_TABS.indexOf(currentRoute?.name || '');

  // Update slide position and width when tab changes
  useEffect(() => {
    if (visibleIndex >= 0 && tabLayouts[visibleIndex]) {
      slidePosition.value = withSpring(tabLayouts[visibleIndex].x, {
        damping: 30,
        stiffness: 180,
      });
      slideWidth.value = withSpring(tabLayouts[visibleIndex].width, {
        damping: 20,
        stiffness: 180,
      });
    }
  }, [visibleIndex, tabLayouts]);

  // Animated style for the sliding background
  const slideStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slidePosition.value }],
      width: slideWidth.value,
    };
  });

  // Handle layout measurement for each tab
  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = { x, width };
      return newLayouts;
    });
  };

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        {
          bottom: insets.bottom - 15,
          marginHorizontal: '10%',
        },
      ]}
    >
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: isDark ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.18)',
          },
        ]}
      >
        {/* Animated sliding background */}
        <Animated.View
          style={[
            styles.slidingBackground,
            {
              backgroundColor: isDark 
                ? 'rgba(99, 102, 241, 0.15)' 
                : 'rgba(99, 102, 241, 0.12)',
              borderColor: isDark 
                ? 'rgba(99, 102, 241, 0.3)' 
                : 'rgba(99, 102, 241, 0.25)',
            },
            slideStyle,
          ]}
        />

        {state.routes.map((route, routeIndex) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === routeIndex;

          // Only show these specific tabs in the navigation bar
          if (!VISIBLE_TABS.includes(route.name)) {
            return null;
          }

          // Get the visible index for this route
          const visibleTabIndex = VISIBLE_TABS.indexOf(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const label = options.title || route.name;
          const icon = options.tabBarIcon;
          const activeColor = '#6366f1';
          const inactiveColor = isDark ? '#9ca3af' : '#6b7280';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              onLayout={(event) => handleTabLayout(visibleTabIndex, event)}
              style={styles.tabItem}
            >
              <View style={styles.iconContainer}>
                {icon &&
                  icon({
                    focused: isFocused,
                    color: isFocused ? activeColor : inactiveColor,
                    size: 24,
                  })}
              </View>
              {options.tabBarShowLabel !== false && (
                <Animated.Text
                  style={[
                    styles.label,
                    {
                      color: isFocused ? activeColor : inactiveColor,
                      fontWeight: isFocused ? '600' : '400',
                    },
                  ]}
                >
                  {label}
                </Animated.Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
  },
  slidingBackground: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: 0,
    borderRadius: 15,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default CustomTabBar;
