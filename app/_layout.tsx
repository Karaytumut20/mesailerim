import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { AppLightTheme, AppDarkTheme } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const theme = isDarkMode ? AppDarkTheme : AppLightTheme;

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </PaperProvider>
  );
}