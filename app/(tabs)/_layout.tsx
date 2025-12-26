import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Platform } from 'react-native';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        headerShown: false,
        tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 12,
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: -2 }
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' }
      }}>
      <Tabs.Screen name="index" options={{ title: 'Hesapla', tabBarIcon: ({ color }) => <MaterialIcons size={26} name="calculate" color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Geçmiş', tabBarIcon: ({ color }) => <MaterialIcons size={26} name="history" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Ayarlar', tabBarIcon: ({ color }) => <MaterialIcons size={26} name="settings" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}