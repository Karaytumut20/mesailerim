import React, { useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, Surface, useTheme, Chip, Checkbox, Divider } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

const OVERTIME_RATES = [25, 50, 75, 100, 150, 200, 250, 300];

export const AddLogModal = ({ visible, onDismiss }: Props) => {
  const theme = useTheme();
  const { addLog } = useAppStore();

  // Form State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [normalHours, setNormalHours] = useState('8');
  const [overtimeHours, setOvertimeHours] = useState('');
  const [overtimeRate, setOvertimeRate] = useState(50);

  // Ekstralar
  const [hasFood, setHasFood] = useState(true);
  const [hasTravel, setHasTravel] = useState(true);

  const handleSave = () => {
    const nh = parseFloat(normalHours) || 0;
    const oh = parseFloat(overtimeHours) || 0;

    // Basit doğrulama
    if (nh === 0 && oh === 0) {
        onDismiss();
        return;
    }

    addLog({
        date: date.toISOString().split('T')[0],
        type: 'normal',
        normalHours: nh,
        overtimeHours: oh,
        overtimeRate: overtimeRate,
        extras: 0, // Not: Gelişmiş hesaplama sonraki adımda eklenebilir, şimdilik UI odaklıyız
        note: 'Manuel Kayıt'
    });

    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Formu Sıfırla ve Kapat
    setNormalHours('8');
    setOvertimeHours('');
    setOvertimeRate(50);
    onDismiss();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={{ backgroundColor: theme.colors.surface, padding: 20, margin: 20, borderRadius: 16 }}>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 16, color: theme.colors.primary }}>Yeni Kayıt Ekle</Text>

        <ScrollView>
            {/* Tarih Seçici */}
            <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                icon="calendar"
                style={{ marginBottom: 16, borderColor: theme.colors.outline }}
                textColor={theme.colors.onSurface}
            >
                {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Button>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}

            {/* Saat Inputları */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label="Normal Çalışma"
                        value={normalHours}
                        onChangeText={setNormalHours}
                        keyboardType="numeric"
                        mode="outlined"
                        right={<TextInput.Affix text="sa" />}
                        style={{ backgroundColor: theme.colors.surface }}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label="Fazla Mesai"
                        value={overtimeHours}
                        onChangeText={setOvertimeHours}
                        keyboardType="numeric"
                        mode="outlined"
                        right={<TextInput.Affix text="sa" />}
                        style={{ backgroundColor: theme.colors.surface }}
                        placeholder="0"
                    />
                </View>
            </View>

            {/* Mesai Oranları */}
            <Text variant="labelMedium" style={{ marginBottom: 8, color: theme.colors.secondary, fontWeight: 'bold' }}>MESAİ ÇARPANI</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {OVERTIME_RATES.map((rate) => (
                        <Chip
                            key={rate}
                            selected={overtimeRate === rate}
                            onPress={() => setOvertimeRate(rate)}
                            showSelectedOverlay
                            style={{ backgroundColor: overtimeRate === rate ? theme.colors.primaryContainer : theme.colors.surfaceVariant }}
                            textStyle={{ color: overtimeRate === rate ? theme.colors.primary : theme.colors.onSurfaceVariant, fontWeight: 'bold' }}
                        >
                            %{rate}
                        </Chip>
                    ))}
                </View>
            </ScrollView>

            <Divider style={{marginBottom: 16}} />

            {/* Ekstralar (Checkbox) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Checkbox status={hasFood ? 'checked' : 'unchecked'} onPress={() => setHasFood(!hasFood)} color={theme.colors.primary} />
                    <Text>Yemek</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Checkbox status={hasTravel ? 'checked' : 'unchecked'} onPress={() => setHasTravel(!hasTravel)} color={theme.colors.primary} />
                    <Text>Yol</Text>
                </View>
            </View>

            {/* Butonlar */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                <Button mode="text" onPress={onDismiss} textColor={theme.colors.secondary}>İptal</Button>
                <Button mode="contained" onPress={handleSave} style={{ minWidth: 100 }}>KAYDET</Button>
            </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};