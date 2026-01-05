import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

/**
 * Custom hook that respects user's theme preference
 * Falls back to system theme if set to 'auto'
 */
export function useTheme() {
  const systemColorScheme = useSystemColorScheme();
  const theme = useSettingsStore((state) => state.theme);

  if (theme === 'auto') {
    return systemColorScheme || 'light';
  }

  return theme;
}
