import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Light: Temiz ve Kurumsal
const lightColors = {
  primary: '#059669', // Emerald 600
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1FAE5',
  onPrimaryContainer: '#064E3B',
  secondary: '#475569', // Slate 600
  onSecondary: '#FFFFFF',
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9', // Slate 100
  onSurface: '#0F172A', // Slate 900 (Daha koyu metin)
  onSurfaceVariant: '#475569',
  error: '#EF4444',
  outline: '#E2E8F0',
  elevation: { level1: '#FFFFFF', level2: '#F8FAFC' }
};

// Dark: Yüksek Kontrastlı Premium Slate
const darkColors = {
  primary: '#34D399', // Emerald 400 (Daha parlak)
  onPrimary: '#022C22',
  primaryContainer: '#065F46',
  onPrimaryContainer: '#D1FAE5',
  secondary: '#94A3B8', // Slate 400
  onSecondary: '#0F172A',
  background: '#020617', // Slate 950 (Simsiyah değil, çok koyu lacivert)
  surface: '#1E293B', // Slate 800
  surfaceVariant: '#334155', // Slate 700 (Inputlar için)
  onSurface: '#F8FAFC', // Slate 50 (Bembeyaz metin)
  onSurfaceVariant: '#CBD5E1', // Slate 300
  error: '#F87171',
  outline: '#334155',
  elevation: { level1: '#1E293B', level2: '#0F172A' }
};

export const AppLightTheme = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...lightColors } };
export const AppDarkTheme = { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...darkColors } };