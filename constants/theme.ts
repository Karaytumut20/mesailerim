import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightColors = {
  primary: '#059669', // Emerald 600 - Güven veren ana renk
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1FAE5', // Emerald 100
  secondary: '#374151', // Gray 700
  background: '#F9FAFB', // Gray 50 - Daha yumuşak beyaz
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6', // Gray 100
  error: '#EF4444',
  outline: '#E5E7EB',
  elevation: {
    level1: '#FFFFFF',
    level2: '#F9FAFB',
  }
};

const darkColors = {
  primary: '#34D399', // Emerald 400
  onPrimary: '#064E3B',
  primaryContainer: '#065F46',
  secondary: '#D1D5DB', // Gray 300
  background: '#111827', // Gray 900
  surface: '#1F2937', // Gray 800
  surfaceVariant: '#374151',
  error: '#CF6679',
  outline: '#4B5563',
  elevation: {
    level1: '#1F2937',
    level2: '#111827',
  }
};

export const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
};