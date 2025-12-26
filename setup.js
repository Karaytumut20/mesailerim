const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("\x1b[36m%s\x1b[0m", "🚀 Mesailerim Premium Refactor Başlıyor...");

// --- DOSYA İÇERİKLERİ ---
// (Not: Yukarıdaki kodların aynısını buraya string olarak gömüyoruz)
const files = {
  // 1. Types
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
  date: string;
  result: CalculationResult;
  hourlyRate: number;
  overtimeItems: OvertimeItem[];
  note?: string;
}

export interface AppSettings {
  defaultHourlyRate: string;
  defaultWorkHours: string;
  currencySymbol: string;
}
`,

  // 2. Theme
  "constants/theme.ts": `
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightColors = {
  primary: '#059669',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1FAE5',
  secondary: '#374151',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  error: '#EF4444',
  outline: '#E5E7EB',
  elevation: { level1: '#FFFFFF', level2: '#F9FAFB' }
};

const darkColors = {
  primary: '#34D399',
  onPrimary: '#064E3B',
  primaryContainer: '#065F46',
  secondary: '#D1D5DB',
  background: '#111827',
  surface: '#1F2937',
  surfaceVariant: '#374151',
  error: '#CF6679',
  outline: '#4B5563',
  elevation: { level1: '#1F2937', level2: '#111827' }
};

export const AppLightTheme = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...lightColors } };
export const AppDarkTheme = { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...darkColors } };
`,

  // 3. Store
  "store/appStore.ts": `
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryRecord, AppSettings } from '../types';

interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  history: HistoryRecord[];
  addToHistory: (record: HistoryRecord) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  defaultHourlyRate: '',
  defaultWorkHours: '225',
  currencySymbol: '₺',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      history: [],
      addToHistory: (record) => set((state) => ({ history: [record, ...state.history] })),
      removeFromHistory: (id) => set((state) => ({ history: state.history.filter(h => h.id !== id) })),
      clearHistory: () => set({ history: [] }),
      settings: defaultSettings,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'mesailerim-storage-v3',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
`,

  // 4. Hook
  "hooks/useCalculator.ts": `
import { useState, useMemo, useEffect } from 'react';
import { OvertimeItem, CalculationResult } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '../store/appStore';
import 'react-native-get-random-values';

export const useCalculator = () => {
  const defaultHourlyRate = useAppStore((state) => state.settings.defaultHourlyRate);
  const [hourlyRate, setHourlyRate] = useState<string>(defaultHourlyRate);
  const [normalHours, setNormalHours] = useState<string>('');
  const [deductions, setDeductions] = useState<string>('');

  useEffect(() => {
    if (defaultHourlyRate) {
        setHourlyRate(defaultHourlyRate);
    }
  }, [defaultHourlyRate]);

  const [overtimeItems, setOvertimeItems] = useState<OvertimeItem[]>([
    { id: '1', title: 'Hafta İçi (%50)', hours: 0, percentage: 50, isOverride: false },
    { id: '2', title: 'Hafta Sonu (%100)', hours: 0, percentage: 100, isOverride: false },
  ]);

  const addCategory = () => {
    setOvertimeItems([
      ...overtimeItems,
      { id: uuidv4(), title: 'Ek Mesai', hours: 0, percentage: 50, isOverride: false }
    ]);
  };

  const removeCategory = (id: string) => {
    setOvertimeItems(overtimeItems.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof OvertimeItem, value: any) => {
    setOvertimeItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (field === 'manualRate') return { ...item, manualRate: value, isOverride: true };
      if (field === 'percentage') return { ...item, percentage: value, isOverride: false, manualRate: undefined };
      if (field === 'isOverride' && value === false) return { ...item, isOverride: false, manualRate: undefined };
      return { ...item, [field]: value };
    }));
  };

  const results: CalculationResult = useMemo(() => {
    const rate = parseFloat(hourlyRate.toString().replace(',', '.')) || 0;
    const normHours = parseFloat(normalHours.toString().replace(',', '.')) || 0;
    const deduc = parseFloat(deductions.toString().replace(',', '.')) || 0;
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
      baseSalary, overtimeSalary: totalOvertimePay, grossTotal, deductions: deduc, netTotal: netTotal > 0 ? netTotal : 0
    };
  }, [hourlyRate, normalHours, deductions, overtimeItems]);

  return {
    hourlyRate, setHourlyRate, normalHours, setNormalHours, deductions, setDeductions,
    overtimeItems, addCategory, removeCategory, updateItem, results
  };
};
`,

  // 5. Components
  "components/ui/StepperInput.tsx": `
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  step?: number;
}

export const StepperInput: React.FC<Props> = ({ value, onChange, label, step = 1 }) => {
  const theme = useTheme();
  const handlePress = (direction: 'up' | 'down') => {
    if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = direction === 'up' ? value + step : value - step;
    if (newValue >= 0) onChange(newValue);
  };

  return (
    <View style={styles.container}>
      {label && <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>{label}</Text>}
      <View style={[styles.controls, { backgroundColor: theme.colors.surfaceVariant }]}>
        <TouchableOpacity onPress={() => handlePress('down')} style={styles.btn}>
          <MaterialIcons name="remove" size={20} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.valueContainer}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{value}</Text>
            <Text variant="bodySmall" style={{ opacity: 0.6 }}>saat</Text>
        </View>
        <TouchableOpacity onPress={() => handlePress('up')} style={styles.btn}>
          <MaterialIcons name="add" size={20} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 4 },
  btn: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
  valueContainer: { minWidth: 50, alignItems: 'center', paddingHorizontal: 8 }
});
`,

  "components/ui/StatCard.tsx": `
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  title: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color?: string;
  trend?: string;
}

export const StatCard: React.FC<Props> = ({ title, value, icon, color, trend }) => {
  const theme = useTheme();
  const iconColor = color || theme.colors.primary;
  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
            <MaterialIcons name={icon} size={22} color={iconColor} />
        </View>
        {trend && <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{trend}</Text>}
      </View>
      <View style={styles.content}>
        <Text variant="bodyMedium" style={{ color: theme.colors.secondary, marginBottom: 2 }}>{title}</Text>
        <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{value}</Text>
      </View>
    </Surface>
  );
};
const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, padding: 16, minWidth: '45%' },
  iconContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  content: { gap: 2 }
});
`,

  "components/OvertimeCard.tsx": `
import React from 'react';
import { View } from 'react-native';
import { Card, Text, Chip, useTheme, IconButton } from 'react-native-paper';
import { OvertimeItem } from '../types';
import { StepperInput } from './ui/StepperInput';
import { formatCurrency } from '../utils/formatters';

interface Props {
  item: OvertimeItem;
  baseRate: number;
  onUpdate: (id: string, field: keyof OvertimeItem, value: any) => void;
  onDelete: (id: string) => void;
}
const PRESET_PERCENTAGES = [50, 100];

export const OvertimeCard: React.FC<Props> = ({ item, baseRate, onUpdate, onDelete }) => {
  const theme = useTheme();
  const calculatedRate = item.isOverride && item.manualRate ? item.manualRate : baseRate * (1 + item.percentage / 100);
  const totalEarn = item.hours * calculatedRate;

  return (
    <Card style={{ marginBottom: 12, backgroundColor: theme.colors.surface, borderRadius: 16 }} mode="elevated" elevation={1}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
             <View style={{ width: 4, height: 24, backgroundColor: theme.colors.primary, borderRadius: 2 }} />
             <Text variant="titleMedium" style={{ fontWeight: '600' }}>{item.title}</Text>
          </View>
          <IconButton icon="close" size={18} onPress={() => onDelete(item.id)} style={{ margin: 0 }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {PRESET_PERCENTAGES.map((pct) => (
                <Chip key={pct} selected={!item.isOverride && item.percentage === pct} onPress={() => onUpdate(item.id, 'percentage', pct)} showSelectedOverlay style={{ backgroundColor: !item.isOverride && item.percentage === pct ? theme.colors.primaryContainer : undefined }} textStyle={{ fontSize: 11 }} compact>%{pct}</Chip>
              ))}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>Birim: {formatCurrency(calculatedRate)} / saat</Text>
          </View>
          <StepperInput value={item.hours} onChange={(val) => onUpdate(item.id, 'hours', val)} />
        </View>
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.outline, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.secondary }}>Bu Kalem Toplamı</Text>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{formatCurrency(totalEarn)}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};
`,

  // 6. Screens
  "app/(tabs)/index.tsx": `
import React, { useEffect } from 'react';
import { ScrollView, View, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme, Surface } from 'react-native-paper';
import { useCalculator } from '@/hooks/useCalculator';
import { OvertimeCard } from '@/components/OvertimeCard';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, parseNumber } from '@/utils/formatters';
import { useAppStore } from '@/store/appStore';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { addToHistory, history } = useAppStore();
  const { hourlyRate, overtimeItems, addCategory, removeCategory, updateItem, results } = useCalculator();

  const currentMonthTotal = history.filter(h => new Date(h.date).getMonth() === new Date().getMonth()).reduce((acc, curr) => acc + curr.result.overtimeSalary, 0);

  const handleSave = () => {
    if (results.overtimeSalary <= 0) { Alert.alert("Uyarı", "Hesaplanacak mesai yok."); return; }
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToHistory({ id: Date.now().toString(), date: new Date().toISOString(), hourlyRate: parseNumber(hourlyRate), result: results, overtimeItems: [...overtimeItems], note: 'Hızlı Giriş' });
    Alert.alert("Başarılı", "Kaydedildi! 🎉");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Surface style={{ backgroundColor: theme.colors.surface, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View><Text variant="titleMedium" style={{ color: theme.colors.secondary }}>Hoş Geldiniz 👋</Text><Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Mesai Takibi</Text></View>
                <TouchableOpacity onPress={() => router.push('/settings')} style={{ backgroundColor: theme.colors.surfaceVariant, padding: 8, borderRadius: 12 }}>
                    <MaterialIcons name="settings" size={24} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <StatCard title="Bu Ay Toplam" value={formatCurrency(currentMonthTotal)} icon="bar-chart" color={theme.colors.primary} />
                <StatCard title="Anlık Hesap" value={formatCurrency(results.overtimeSalary)} icon="calculate" color="#F59E0B" />
            </View>
        </Surface>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, opacity: 0.7 }}>
                <MaterialIcons name="info-outline" size={16} color={theme.colors.secondary} />
                <Text style={{ marginLeft: 6, color: theme.colors.secondary }}>Aktif Saatlik Ücret: <Text style={{ fontWeight: 'bold' }}>{formatCurrency(parseNumber(hourlyRate) || 0)}</Text></Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Mesai Girişi</Text>
                <Button mode="contained-tonal" onPress={addCategory} icon="plus" compact>Yeni Kalem</Button>
            </View>
            {overtimeItems.map((item, index) => (
                <Animated.View key={item.id} entering={FadeInDown.delay(index * 100).springify()}>
                    <OvertimeCard item={item} baseRate={parseNumber(hourlyRate)} onUpdate={updateItem} onDelete={removeCategory} />
                </Animated.View>
            ))}
            <Button mode="contained" onPress={handleSave} style={{ marginTop: 24, borderRadius: 12, paddingVertical: 8 }} icon="check">HESAPLA VE KAYDET</Button>
        </ScrollView>
    </View>
  );
}
`,

  "app/(tabs)/settings.tsx": `
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
`,
};

// --- DOSYALARI YAZ ---
const writeFiles = () => {
  Object.entries(files).forEach(([filePath, content]) => {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim());
    console.log(`✅ Yazıldı: ${filePath}`);
  });
};

// --- BAĞIMLILIK KONTROLÜ ---
const checkAndInstallDeps = () => {
  const deps = ["expo-haptics"];
  console.log("📦 Bağımlılıklar kontrol ediliyor...");
  try {
    execSync(`npx expo install ${deps.join(" ")}`, { stdio: "inherit" });
    console.log("✅ Bağımlılıklar güncel.");
  } catch (e) {
    console.error("❌ Paket yüklenirken hata oluştu.");
  }
};

// --- MAIN ---
writeFiles();
checkAndInstallDeps();

console.log("\n🎉 GÜNCELLEME TAMAMLANDI!");
console.log("👉 Test için: npx expo start -c");
