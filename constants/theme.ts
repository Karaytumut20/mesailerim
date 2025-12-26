import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Pro Finans Light
const lightColors = {
  primary: '#0F172A', // Slate 900 (Ciddi, Kurumsal Koyu)
  onPrimary: '#FFFFFF',
  primaryContainer: '#F1F5F9', // Slate 100
  onPrimaryContainer: '#0F172A',
  secondary: '#334155', // Slate 700
  onSecondary: '#FFFFFF',
  background: '#FFFFFF', // Bembeyaz Temiz Arkaplan
  surface: '#F8FAFC', // Slate 50 (Kartlar için çok hafif gri)
  surfaceVariant: '#E2E8F0', // Slate 200 (Inputlar)
  onSurface: '#020617', // Slate 950
  onSurfaceVariant: '#475569',
  error: '#DC2626', // Red 600
  outline: '#CBD5E1', // Slate 300
  elevation: { level1: '#FFFFFF', level2: '#F1F5F9', level3: '#E2E8F0' }
};

// Pro Finans Dark
const darkColors = {
  primary: '#F8FAFC', // Slate 50 (Dark modda ana renk beyaz)
  onPrimary: '#0F172A',
  primaryContainer: '#1E293B', // Slate 800
  onPrimaryContainer: '#F1F5F9',
  secondary: '#94A3B8', // Slate 400
  onSecondary: '#0F172A',
  background: '#020617', // Slate 950 (Simsiyah değil)
  surface: '#0F172A', // Slate 900
  surfaceVariant: '#1E293B',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#CBD5E1',
  error: '#EF4444',
  outline: '#334155',
  elevation: { level1: '#1E293B', level2: '#0F172A', level3: '#020617' }
};

export const AppLightTheme = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...lightColors } };
export const AppDarkTheme = { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...darkColors } };