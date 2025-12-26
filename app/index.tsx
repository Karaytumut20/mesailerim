import React from 'react';
import { ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, FAB, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useCalculator } from '../hooks/useCalculator';
import { OvertimeCard } from '../components/OvertimeCard';
import { formatCurrency, parseNumber } from '../utils/formatters';
import { useAppStore } from '../store/appStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { addToHistory } = useAppStore();

  const {
    hourlyRate, setHourlyRate,
    normalHours, setNormalHours,
    deductions, setDeductions,
    overtimeItems, addCategory, removeCategory, updateItem,
    results
  } = useCalculator();

  const handleSave = () => {
    addToHistory({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      hourlyRate: parseNumber(hourlyRate),
      result: results,
      note: 'Otomatik Kayıt'
    });
    alert('Kayıt Başarılı!');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80, backgroundColor: theme.colors.background }}>

        <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16, backgroundColor: theme.colors.surface }} elevation={1}>
          <Text variant="titleMedium" style={{ marginBottom: 10, color: theme.colors.primary }}>Temel Bilgiler</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              mode="outlined"
              label="Saatlik Ücret (₺)"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="numeric"
              style={{ flex: 1 }}
            />
            <TextInput
              mode="outlined"
              label="Normal Saat"
              value={normalHours}
              onChangeText={setNormalHours}
              keyboardType="numeric"
              style={{ flex: 1 }}
              placeholder="Örn: 225"
            />
          </View>
        </Surface>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text variant="titleMedium">Kategoriler</Text>
          <Button mode="text" onPress={addCategory} icon="plus">Ekle</Button>
        </View>

        {overtimeItems.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)}>
            <OvertimeCard
              item={item}
              baseRate={parseNumber(hourlyRate)}
              onUpdate={updateItem}
              onDelete={removeCategory}
            />
          </Animated.View>
        ))}

        <Surface style={{ padding: 20, borderRadius: 16, marginTop: 20, backgroundColor: theme.colors.primaryContainer }} elevation={2}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>Mesai Kazancı:</Text>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{formatCurrency(results.overtimeSalary)}</Text>
          </View>

          <TextInput
              mode="flat"
              label="Kesintiler"
              value={deductions}
              onChangeText={setDeductions}
              keyboardType="numeric"
              style={{ backgroundColor: 'transparent', marginVertical: 5 }}
              dense
            />

          <Divider style={{ marginVertical: 10 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="headlineSmall">NET:</Text>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>{formatCurrency(results.netTotal)}</Text>
          </View>

          <Button mode="contained" onPress={handleSave} style={{ marginTop: 16 }} icon="content-save">
            Kaydet
          </Button>
        </Surface>

      </ScrollView>

      <FAB
        icon="history"
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: theme.colors.secondary }}
        color="white"
        onPress={() => router.push('/history')}
      />
    </KeyboardAvoidingView>
  );
}