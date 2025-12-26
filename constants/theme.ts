import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const customColors = {
  primary: '#006A6A',
  secondary: '#4A6363',
  error: '#BA1A1A',
};

export const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: customColors.primary,
    secondary: customColors.secondary,
    background: '#FFFFFF',
    surfaceVariant: '#F0F5F5',
  },
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4CD9D9',
    background: '#191C1C',
    surfaceVariant: '#3F4848',
  },
};