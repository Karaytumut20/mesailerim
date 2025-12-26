import React, { useState } from 'react';
import { View, ScrollView, Alert, Keyboard } from 'react-native';
import { List, Switch, TextInput, useTheme, Divider, Text, Snackbar } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDarkMode, toggleTheme, settings, updateSettings, clearHistory } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [localRate, setLocalRate] = useState(settings.defaultHourlyRate);

  const handleSaveRate = () => {
    const num = parseFloat(localRate.replace(',', '.'));
    if (isNaN(num) || num < 0) {
        Alert.alert("Hata", "Geçersiz saatlik ücret.");
        setLocalRate(settings.defaultHourlyRate);
        return;
    }
    updateSettings({ defaultHourlyRate: localRate });
    Keyboard.dismiss();
    setVisible(true);
  };

  const handleClearHistory = () => {
    Alert.alert("Geçmişi Sil", "Emin misiniz?", [{ text: "Vazgeç", style: "cancel" }, { text: "Sil", style: "destructive", onPress: clearHistory }]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        <View style={{ padding: 20, paddingTop: 60 }}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Ayarlar</Text>
        </View>
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary, fontWeight: '600' }}>HESAPLAMA</List.Subheader>
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              <TextInput mode="outlined" label="Varsayılan Saatlik Ücret (₺)" keyboardType="numeric" value={localRate} onChangeText={setLocalRate} onBlur={handleSaveRate} style={{ backgroundColor: theme.colors.surface }} right={<TextInput.Icon icon="check-circle" color={settings.defaultHourlyRate === localRate ? theme.colors.primary : theme.colors.outline} />} />
              <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginTop: 6, marginLeft: 4 }}>Otomatik kaydedilir.</Text>
          </View>
        </List.Section>
        <Divider />
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary, fontWeight: '600' }}>GÖRÜNÜM</List.Subheader>
          <List.Item title="Karanlık Mod" left={props => <List.Icon {...props} icon="theme-light-dark" />} right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} color={theme.colors.primary} />} style={{ backgroundColor: theme.colors.surface }} />
        </List.Section>
        <Divider style={{ marginVertical: 10 }} />
        <List.Section>
          <List.Subheader style={{ color: theme.colors.error, fontWeight: '600' }}>TEHLİKELİ BÖLGE</List.Subheader>
          <List.Item title="Tüm Geçmişi Temizle" left={props => <List.Icon {...props} icon="delete-outline" color={theme.colors.error} />} onPress={handleClearHistory} titleStyle={{ color: theme.colors.error }} style={{ backgroundColor: theme.colors.surface }} />
        </List.Section>
      </ScrollView>
      <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={2000}>Ayarlar kaydedildi.</Snackbar>
    </View>
  );
}