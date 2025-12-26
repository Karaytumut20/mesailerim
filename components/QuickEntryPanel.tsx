import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Surface, useTheme, TextInput, IconButton, SegmentedButtons, Chip } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';
import * as Haptics from 'expo-haptics';

const OVERTIME_RATES = [25, 50, 75, 100, 150, 200, 250, 300];

export const QuickEntryPanel = () => {
  const theme = useTheme();
  const { addLog } = useAppStore();

  const [mode, setMode] = useState<'normal' | 'overtime'>('normal');
  const [hours, setHours] = useState('');
  const [selectedRate, setSelectedRate] = useState(50);
  const [expanded, setExpanded] = useState(false);

  const handleAdd = () => {
    if (!hours) return;
    const h = parseFloat(hours);
    const today = new Date().toISOString().split('T')[0];

    let newLog = {
      date: today,
      type: 'normal' as const,
      normalHours: 8,
      overtimeHours: 0,
      overtimeRate: 50,
      extras: 0
    };

    if (mode === 'normal') {
        newLog.normalHours = h;
    } else {
        newLog.overtimeHours = h;
        newLog.overtimeRate = selectedRate;
        newLog.normalHours = 8; // Varsayılan normal saati koru
    }

    addLog(newLog);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHours('');
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <Surface style={[styles.collapsedContainer, { backgroundColor: theme.colors.elevation.level3, borderTopColor: theme.colors.outline }]} elevation={4}>
        <TouchableOpacity style={styles.expandButton} onPress={() => setExpanded(true)}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>+ Hızlı Ekle</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>Bugünün verisini gir</Text>
        </TouchableOpacity>
      </Surface>
    );
  }

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.elevation.level3, borderTopColor: theme.colors.primary }]} elevation={5}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Hızlı Giriş</Text>
        <IconButton icon="close" size={20} onPress={() => setExpanded(false)} />
      </View>

      <SegmentedButtons
        value={mode}
        onValueChange={val => setMode(val as 'normal' | 'overtime')}
        buttons={[
          { value: 'normal', label: 'Normal', icon: 'briefcase' },
          { value: 'overtime', label: 'Mesai', icon: 'clock-plus-outline' },
        ]}
        style={{ marginBottom: 12 }}
      />

      {/* Sadece Mesai Modunda Oran Seçici Göster */}
      {mode === 'overtime' && (
        <View style={{ marginBottom: 12 }}>
            <Text variant="labelSmall" style={{ marginBottom: 4, color: theme.colors.secondary }}>Mesai Oranı:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    {OVERTIME_RATES.map((rate) => (
                        <Chip
                            key={rate}
                            selected={selectedRate === rate}
                            onPress={() => setSelectedRate(rate)}
                            showSelectedOverlay
                            compact
                            style={{ backgroundColor: selectedRate === rate ? theme.colors.primaryContainer : theme.colors.surface }}
                        >
                            %{rate}
                        </Chip>
                    ))}
                </View>
            </ScrollView>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TextInput
            mode="outlined"
            value={hours}
            onChangeText={setHours}
            placeholder="Süre (Saat)"
            keyboardType="numeric"
            style={{ flex: 1, backgroundColor: theme.colors.surface }}
            autoFocus
            right={<TextInput.Affix text="sa" />}
        />
        <TouchableOpacity
            onPress={handleAdd}
            style={{ backgroundColor: theme.colors.primary, borderRadius: 10, padding: 10, height: 50, width: 50, justifyContent: 'center', alignItems: 'center' }}
        >
            <IconButton icon="check" iconColor={theme.colors.onPrimary} size={24} style={{ margin: 0 }} />
        </TouchableOpacity>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  collapsedContainer: { padding: 16, borderTopWidth: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  expandButton: { alignItems: 'center', paddingVertical: 8 },
  container: { padding: 16, paddingBottom: 30, borderTopWidth: 2, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }
});