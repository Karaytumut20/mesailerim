import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { AppLightTheme, AppDarkTheme } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const theme = isDarkMode ? AppDarkTheme : AppLightTheme;

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Mesailerim' }} />
        <Stack.Screen name="history" options={{ title: 'Geçmiş Kayıtlar' }} />
      </Stack>
    </PaperProvider>
  );
}