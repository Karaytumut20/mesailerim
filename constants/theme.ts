import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightColors = {
  primary: '#059669',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1FAE5',
  secondary: '#374151',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  error: '#EF4444',
  outline: '#E5E7EB',
  elevation: { level1: '#FFFFFF', level2: '#F9FAFB' }
};

const darkColors = {
  primary: '#34D399',
  onPrimary: '#064E3B',
  primaryContainer: '#065F46',
  secondary: '#D1D5DB',
  background: '#111827',
  surface: '#1F2937',
  surfaceVariant: '#374151',
  error: '#CF6679',
  outline: '#4B5563',
  elevation: { level1: '#1F2937', level2: '#111827' }
};

export const AppLightTheme = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...lightColors } };
export const AppDarkTheme = { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...darkColors } };