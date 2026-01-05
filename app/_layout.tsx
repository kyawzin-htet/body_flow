import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from '../src/database/db';
import { useUserStore } from '../src/store/userStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useTheme } from '../src/hooks/useTheme';

export default function RootLayout() {
  const colorScheme = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const user = useUserStore((state) => state.user);
  const loadUser = useUserStore((state) => state.loadUser);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const [isReady, setIsReady] = useState(false);

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
            backgroundColor: colorScheme === 'dark' ? '#1a1f3a' : '#ffffff',
          },
          headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen 
          name="exercise/[id]" 
          options={{ 
            title: 'Exercise Details',
            presentation: 'modal'
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}
