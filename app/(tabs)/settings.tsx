import React from 'react';
import { View, ScrollView } from 'react-native';
import { List, Switch, TextInput, useTheme, Divider, Text } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDarkMode, toggleTheme, settings, updateSettings, clearHistory } = useAppStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 20, paddingTop: 60 }}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Ayarlar</Text>
      </View>

      <List.Section>
        <List.Subheader style={{ color: theme.colors.primary, fontWeight: '600' }}>GENEL</List.Subheader>
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <TextInput
                mode="outlined"
                label="Varsayılan Saatlik Ücret (₺)"
                keyboardType="numeric"
                value={settings.defaultHourlyRate}
                onChangeText={(t) => updateSettings({ defaultHourlyRate: t })}
                style={{ backgroundColor: theme.colors.surface }}
                right={<TextInput.Icon icon="currency-try" />}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginTop: 6, marginLeft: 4 }}>
                Yeni bir hesaplama başlattığınızda bu ücret otomatik olarak gelir.
            </Text>
        </View>

        <List.Item
          title="Karanlık Mod"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} color={theme.colors.primary} />}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </List.Section>

      <Divider style={{ marginVertical: 10 }} />

      <List.Section>
        <List.Subheader style={{ color: theme.colors.error, fontWeight: '600' }}>VERİ YÖNETİMİ</List.Subheader>
        <List.Item
          title="Tüm Geçmişi Temizle"
          description="Kaydedilen tüm mesai verileri silinir."
          left={props => <List.Icon {...props} icon="delete-outline" color={theme.colors.error} />}
          onPress={clearHistory}
          titleStyle={{ color: theme.colors.error }}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </List.Section>

      <View style={{ padding: 30, alignItems: 'center' }}>
        <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
            Mesailerim v1.1.0
        </Text>
      </View>
    </ScrollView>
  );
}