import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Splash } from '../src/components/Splash';
import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from '../src/database/db';
import { useUserStore } from '../src/store/userStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useTheme } from '../src/hooks/useTheme';
import { useColorScheme } from 'nativewind';
import { NotificationService } from '../src/services/notificationService';

export default function RootLayout() {
  const colorScheme = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const user = useUserStore((state) => state.user);
  const loadUser = useUserStore((state) => state.loadUser);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const theme = useSettingsStore((state) => state.theme);
  const { setColorScheme } = useColorScheme();
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Sync theme with NativeWind
  useEffect(() => {
    setColorScheme(theme === 'auto' ? 'system' : theme);
  }, [theme]);

  useEffect(() => {
    // Initialize database and load user data
    const init = async () => {
      try {
        await initDatabase();
        await loadSettings();
        await loadUser();
        
        // Request notification permissions early
        const hasPermission = await NotificationService.requestPermissions();
        if (hasPermission) {
          console.log('✅ Notification permissions granted');
        } else {
          console.log('❌ Notification permissions denied');
        }
        
        // Artificial delay for splash screen for returning users
        const currentUser = useUserStore.getState().user;
        if (currentUser) {
          setTimeout(() => {
            setIsAppReady(true);
            setShowSplash(false);
          }, 2000); // 2 seconds splash for returning users
        } else {
          setIsAppReady(true);
          setShowSplash(false);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsAppReady(true);
        setShowSplash(false);
      }
    };

    init();
  }, [loadUser, loadSettings]);

  useEffect(() => {
    if (!isAppReady) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!user && !inOnboarding) {
      // No user exists, redirect to onboarding
      router.replace('/onboarding');
    } else if (user && inOnboarding) {
      // User exists but on onboarding, redirect to home
      router.replace('/(tabs)');
    }
  }, [user, segments, isAppReady]);

  if (!isAppReady || showSplash) {
    return <Splash />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(248, 249, 250, 0.95)',
          },
          headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          animation: 'slide_from_right',
          animationDuration: 250,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen 
          name="exercise/[id]" 
          options={{ 
            title: 'Exercise Details',
            presentation: 'card'
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}
