import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from '../src/database/db';
import { useUserStore } from '../src/store/userStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useTheme } from '../src/hooks/useTheme';
import { useColorScheme } from 'nativewind';

export default function RootLayout() {
  const colorScheme = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const user = useUserStore((state) => state.user);
  const loadUser = useUserStore((state) => state.loadUser);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const theme = useSettingsStore((state) => state.theme);
  const { setColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);

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
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsReady(true);
      }
    };

    init();
  }, [loadUser, loadSettings]);

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!user && !inOnboarding) {
      // No user exists, redirect to onboarding
      router.replace('/onboarding');
    } else if (user && inOnboarding) {
      // User exists but on onboarding, redirect to home
      router.replace('/(tabs)');
    }
  }, [user, segments, isReady]);

  if (!isReady) {
    return null; // or a splash screen
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
