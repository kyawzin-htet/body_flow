// Glassmorphism styles for Apple-like UI
export const glassStyles = {
  // Light theme glass
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    border: 'rgba(255, 255, 255, 0.18)',
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
  },
  // Dark theme glass
  dark: {
    background: 'rgba(26, 26, 26, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
  },
};

// Get glass style for current theme
export const getGlassStyle = (isDark: boolean) => {
  const theme = isDark ? glassStyles.dark : glassStyles.light;
  return {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow,
  };
};

// Card glass style
export const getGlassCard = (isDark: boolean) => {
  return {
    ...getGlassStyle(isDark),
    borderRadius: 20,
    overflow: 'hidden' as const,
  };
};

// Button glass style
export const getGlassButton = (isDark: boolean) => {
  return {
    ...getGlassStyle(isDark),
    borderRadius: 16,
  };
};

// Modal glass style
export const getGlassModal = (isDark: boolean) => {
  return {
    ...getGlassStyle(isDark),
    borderRadius: 24,
  };
};
