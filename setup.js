const fs = require("fs");
const path = require("path");

// --- OLUŞTURULACAK DOSYALAR VE İÇERİKLERİ ---
const files = {
  // 1. TEMA
  "constants/theme.ts": `
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
`,

  // 2. TİPLER
  "types/index.ts": `
export interface OvertimeItem {
  id: string;
  title: string;
  hours: number;
  percentage: number;
  manualRate?: number;
  isOverride: boolean;
}

export interface CalculationResult {
  baseSalary: number;
  overtimeSalary: number;
  grossTotal: number;
  deductions: number;
  netTotal: number;
}

export interface HistoryRecord {
  id: string;
  date: string; // ISO string
  result: CalculationResult;
  hourlyRate: number;
  note?: string;
}
`,

  // 3. YARDIMCI FONKSİYONLAR
  "utils/formatters.ts": `
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const parseNumber = (text: string) => {
  const cleanText = text.replace(',', '.');
  const num = parseFloat(cleanText);
  return isNaN(num) ? 0 : num;
};
`,

  // 4. GLOBAL STATE (STORE)
  "store/appStore.ts": `
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryRecord } from '../types';

interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  history: HistoryRecord[];
  addToHistory: (record: HistoryRecord) => void;
  clearHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      history: [],
      addToHistory: (record) => set((state) => ({ history: [record, ...state.history] })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'mesailerim-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
`,

  // 5. HESAPLAMA MANTIĞI (HOOK)
  "hooks/useCalculator.ts": `
import { useState, useMemo } from 'react';
import { OvertimeItem, CalculationResult } from '../types';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

export const useCalculator = () => {
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [normalHours, setNormalHours] = useState<string>('');
  const [deductions, setDeductions] = useState<string>('');

  const [overtimeItems, setOvertimeItems] = useState<OvertimeItem[]>([
    { id: '1', title: 'Hafta İçi', hours: 0, percentage: 50, isOverride: false },
    { id: '2', title: 'Hafta Sonu', hours: 0, percentage: 100, isOverride: false },
  ]);

  const addCategory = () => {
    setOvertimeItems([
      ...overtimeItems,
      { id: uuidv4(), title: 'Yeni Mesai', hours: 0, percentage: 50, isOverride: false }
    ]);
  };

  const removeCategory = (id: string) => {
    setOvertimeItems(overtimeItems.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof OvertimeItem, value: any) => {
    setOvertimeItems(prev => prev.map(item => {
      if (item.id !== id) return item;

      if (field === 'manualRate') {
        return { ...item, manualRate: value, isOverride: true };
      }
      if (field === 'percentage') {
        return { ...item, percentage: value, isOverride: false, manualRate: undefined };
      }
      if (field === 'isOverride' && value === false) {
        return { ...item, isOverride: false, manualRate: undefined };
      }
      return { ...item, [field]: value };
    }));
  };

  const results: CalculationResult = useMemo(() => {
    const rate = parseFloat(hourlyRate.replace(',', '.')) || 0;
    const normHours = parseFloat(normalHours.replace(',', '.')) || 0;
    const deduc = parseFloat(deductions.replace(',', '.')) || 0;

    let totalOvertimePay = 0;

    overtimeItems.forEach(item => {
      let effectiveHourlyPay = 0;
      if (item.isOverride && item.manualRate !== undefined) {
        effectiveHourlyPay = item.manualRate;
      } else {
        effectiveHourlyPay = rate * (1 + item.percentage / 100);
      }
      totalOvertimePay += (item.hours * effectiveHourlyPay);
    });

    const baseSalary = normHours * rate;
    const grossTotal = baseSalary + totalOvertimePay;
    const netTotal = grossTotal - deduc;

    return {
      baseSalary,
      overtimeSalary: totalOvertimePay,
      grossTotal,
      deductions: deduc,
      netTotal: netTotal > 0 ? netTotal : 0
    };
  }, [hourlyRate, normalHours, deductions, overtimeItems]);

  return {
    hourlyRate, setHourlyRate,
    normalHours, setNormalHours,
    deductions, setDeductions,
    overtimeItems, addCategory, removeCategory, updateItem,
    results
  };
};
`,

  // 6. UI BİLEŞENİ (CARD)
  "components/OvertimeCard.tsx": `
import React from 'react';
import { View } from 'react-native';
import { Card, TextInput, IconButton, Chip, useTheme } from 'react-native-paper';
import { OvertimeItem } from '../types';
import { parseNumber } from '../utils/formatters';

interface Props {
  item: OvertimeItem;
  baseRate: number;
  onUpdate: (id: string, field: keyof OvertimeItem, value: any) => void;
  onDelete: (id: string) => void;
}

const PRESET_PERCENTAGES = [25, 50, 100, 200];

export const OvertimeCard: React.FC<Props> = ({ item, baseRate, onUpdate, onDelete }) => {
  const theme = useTheme();

  const calculatedRate = item.isOverride && item.manualRate
    ? item.manualRate
    : baseRate * (1 + item.percentage / 100);

  return (
    <Card style={{ marginBottom: 12, backgroundColor: theme.colors.elevation.level1 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TextInput
            mode="outlined"
            label="Kategori Adı"
            value={item.title}
            onChangeText={(t) => onUpdate(item.id, 'title', t)}
            style={{ flex: 1, height: 40, fontSize: 14 }}
            dense
          />
          <IconButton icon="trash-can-outline" iconColor={theme.colors.error} onPress={() => onDelete(item.id)} />
        </View>

        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
          {PRESET_PERCENTAGES.map((pct) => (
            <Chip
              key={pct}
              selected={!item.isOverride && item.percentage === pct}
              onPress={() => onUpdate(item.id, 'percentage', pct)}
              showSelectedOverlay
              compact
            >
              %{pct}
            </Chip>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            mode="outlined"
            label="Saat"
            keyboardType="numeric"
            value={item.hours === 0 ? '' : item.hours.toString()}
            onChangeText={(t) => onUpdate(item.id, 'hours', parseNumber(t))}
            style={{ flex: 1, backgroundColor: 'transparent' }}
          />
          <TextInput
            mode="outlined"
            label={item.isOverride ? "Özel" : "Tutar"}
            keyboardType="numeric"
            value={calculatedRate.toFixed(2)}
            onChangeText={(t) => onUpdate(item.id, 'manualRate', parseNumber(t))}
            style={{ flex: 1, backgroundColor: item.isOverride ? theme.colors.secondaryContainer : 'transparent' }}
            right={
              item.isOverride ? (
                <TextInput.Icon icon="lock-reset" onPress={() => onUpdate(item.id, 'isOverride', false)} />
              ) : ( <TextInput.Icon icon="calculator" /> )
            }
          />
        </View>
      </Card.Content>
    </Card>
  );
};
`,

  // 7. NAVİGASYON (LAYOUT)
  "app/_layout.tsx": `
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
`,

  // 8. ANA EKRAN (HOME)
  "app/index.tsx": `
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
`,

  // 9. GEÇMİŞ SAYFASI (HISTORY)
  "app/history.tsx": `
import React from 'react';
import { FlatList, View } from 'react-native';
import { List, Text, useTheme, IconButton } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function HistoryScreen() {
  const { history, clearHistory } = useAppStore();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="titleMedium">Son Hesaplamalar</Text>
        <IconButton icon="delete-sweep" onPress={clearHistory} />
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={\`Net: \${formatCurrency(item.result.netTotal)}\`}
            description={format(new Date(item.date), 'dd MMMM HH:mm', { locale: tr })}
            left={props => <List.Icon {...props} icon="file-document-outline" />}
            right={() => (
                <View style={{ justifyContent: 'center' }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.primary }}>+\${formatCurrency(item.result.overtimeSalary)} Mesai</Text>
                </View>
            )}
            style={{ backgroundColor: theme.colors.surface, marginBottom: 1 }}
          />
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, opacity: 0.5 }}>Henüz kayıt yok.</Text>}
      />
    </View>
  );
}
`,
};

// --- DOSYALARI OLUŞTURMA MANTIĞI ---

async function createFiles() {
  console.log("🚀 Proje dosyaları oluşturuluyor...");

  for (const [filePath, content] of Object.entries(files)) {
    const absolutePath = path.join(__dirname, filePath);
    const dir = path.dirname(absolutePath);

    // Klasör yoksa oluştur
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📂 Klasör oluşturuldu: ${dir}`);
    }

    // Dosyayı yaz
    fs.writeFileSync(absolutePath, content.trim());
    console.log(`✅ Dosya oluşturuldu: ${filePath}`);
  }

  console.log(
    '\n✨ Kurulum tamamlandı! Şimdi "npx expo start --clear" komutuyla başlatabilirsin.'
  );
}

createFiles();
