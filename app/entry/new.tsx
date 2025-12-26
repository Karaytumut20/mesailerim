import React, { useState } from 'react';
import { View, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme, Checkbox, Appbar, Divider, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/appStore';
import DateTimePicker from '@react-native-community/datetimepicker';

const OVERTIME_RATES = [25, 50, 75, 100, 150, 200, 250, 300];

export default function NewEntryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { addLog } = useAppStore();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [normalHours, setNormalHours] = useState('8');
  const [overtimeHours, setOvertimeHours] = useState('0');
  const [overtimeRate, setOvertimeRate] = useState(50); // Number olarak tutuyoruz
  const [hasFood, setHasFood] = useState(true);
  const [hasTravel, setHasTravel] = useState(true);

  const handleSave = () => {
    const nh = parseFloat(normalHours) || 0;
    const oh = parseFloat(overtimeHours) || 0;

    addLog({
        date: date.toISOString().split('T')[0],
        type: 'normal',
        normalHours: nh,
        overtimeHours: oh,
        overtimeRate: overtimeRate,
        extras: 0, // Basitlik için 0, detayda hesaplanıyor
        note: 'Manuel Giriş'
    });

    router.back();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Detaylı Giriş Yap" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Tarih */}
        <View style={{ marginBottom: 20 }}>
            <Text variant="labelLarge" style={{ marginBottom: 6 }}>Tarih</Text>
            <Button mode="outlined" onPress={() => setShowDatePicker(true)} icon="calendar" style={{ backgroundColor: theme.colors.surface }}>
                {date.toLocaleDateString('tr-TR')}
            </Button>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </View>

        {/* Saatler */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
                <Text variant="labelLarge" style={{ marginBottom: 6 }}>Normal Saat</Text>
                <TextInput
                    mode="outlined"
                    value={normalHours}
                    onChangeText={setNormalHours}
                    keyboardType="numeric"
                    style={{ backgroundColor: theme.colors.surface }}
                    right={<TextInput.Affix text="sa" />}
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text variant="labelLarge" style={{ marginBottom: 6 }}>Mesai Saati</Text>
                <TextInput
                    mode="outlined"
                    value={overtimeHours}
                    onChangeText={setOvertimeHours}
                    keyboardType="numeric"
                    style={{ backgroundColor: theme.colors.surface }}
                    right={<TextInput.Affix text="sa" />}
                />
            </View>
        </View>

        {/* Genişletilmiş Mesai Oranları (Yatay Scroll) */}
        <Text variant="labelLarge" style={{ marginBottom: 10 }}>Mesai Yüzdesi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {OVERTIME_RATES.map((rate) => (
                    <Chip
                        key={rate}
                        selected={overtimeRate === rate}
                        onPress={() => setOvertimeRate(rate)}
                        showSelectedOverlay
                        style={{ backgroundColor: overtimeRate === rate ? theme.colors.primaryContainer : theme.colors.surfaceVariant }}
                    >
                        %{rate}
                    </Chip>
                ))}
            </View>
        </ScrollView>

        {/* Ekstralar */}
        <View style={{ backgroundColor: theme.colors.surfaceVariant, borderRadius: 12, padding: 8, marginBottom: 24 }}>
            <Checkbox.Item
                label="Yemek Ücreti Dahil Et"
                status={hasFood ? 'checked' : 'unchecked'}
                onPress={() => setHasFood(!hasFood)}
            />
            <Divider />
            <Checkbox.Item
                label="Yol Ücreti Dahil Et"
                status={hasTravel ? 'checked' : 'unchecked'}
                onPress={() => setHasTravel(!hasTravel)}
            />
        </View>

        <Button mode="contained" onPress={handleSave} size="large">
            KAYDET
        </Button>

      </ScrollView>
    </View>
  );
}