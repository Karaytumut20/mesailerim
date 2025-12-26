const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log(
  "\x1b[36m%s\x1b[0m",
  "🚀 Mesailerim Premium V3 (Hibrit Sistem) Kuruluyor..."
);

// --- KLASÖR OLUŞTURMA ---
const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

// --- DOSYA İÇERİKLERİ ---
const files = {
  // 1. TEMA (DARK MODE İÇİN FULL OPTİMİZE EDİLDİ)
  "constants/theme.ts": `
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Light: Temiz ve Kurumsal
const lightColors = {
  primary: '#059669', // Emerald 600
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1FAE5',
  onPrimaryContainer: '#064E3B',
  secondary: '#475569', // Slate 600
  onSecondary: '#FFFFFF',
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9', // Slate 100
  onSurface: '#0F172A', // Slate 900 (Daha koyu metin)
  onSurfaceVariant: '#475569',
  error: '#EF4444',
  outline: '#E2E8F0',
  elevation: { level1: '#FFFFFF', level2: '#F8FAFC' }
};

// Dark: Yüksek Kontrastlı Premium Slate
const darkColors = {
  primary: '#34D399', // Emerald 400 (Daha parlak)
  onPrimary: '#022C22',
  primaryContainer: '#065F46',
  onPrimaryContainer: '#D1FAE5',
  secondary: '#94A3B8', // Slate 400
  onSecondary: '#0F172A',
  background: '#020617', // Slate 950 (Simsiyah değil, çok koyu lacivert)
  surface: '#1E293B', // Slate 800
  surfaceVariant: '#334155', // Slate 700 (Inputlar için)
  onSurface: '#F8FAFC', // Slate 50 (Bembeyaz metin)
  onSurfaceVariant: '#CBD5E1', // Slate 300
  error: '#F87171',
  outline: '#334155',
  elevation: { level1: '#1E293B', level2: '#0F172A' }
};

export const AppLightTheme = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...lightColors } };
export const AppDarkTheme = { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...darkColors } };
`,

  // 2. TİPLER (YENİ: type alanı eklendi)
  "types/index.ts": `
export type ItemType = 'rate' | 'fixed'; // rate: Saatlik/Yüzdeli, fixed: Günlük/Sabit Tutar

export interface OvertimeItem {
  id: string;
  type: ItemType;
  title: string;
  hours: number; // type='fixed' ise bu 'adet/gün' olur
  percentage: number; // Sadece type='rate' için
  manualRate?: number; // Sadece type='fixed' için birim fiyat
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

  // 3. STORE (Aynı kalıyor ama güncel tiplerle uyumlu)
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
      name: 'mesailerim-storage-v5', // Yapı değiştiği için versiyonu artırdık
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
`,

  // 4. HESAPLAMA MOTORU (Hibrit Yapı)
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

  // Varsayılanlar: Biri Mesai, Biri Günlük örnek
  const [overtimeItems, setOvertimeItems] = useState<OvertimeItem[]>([
    { id: '1', type: 'rate', title: 'Mesai (%50)', hours: 0, percentage: 50, isOverride: false },
    { id: '2', type: 'fixed', title: 'Yol / Yemek', hours: 0, percentage: 0, manualRate: 0, isOverride: true },
  ]);

  const addCategory = () => {
    setOvertimeItems([
      ...overtimeItems,
      // Varsayılan olarak saatlik mesai ekle
      { id: uuidv4(), type: 'rate', title: 'Yeni Mesai', hours: 0, percentage: 50, isOverride: false }
    ]);
  };

  const removeCategory = (id: string) => {
    setOvertimeItems(overtimeItems.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof OvertimeItem, value: any) => {
    setOvertimeItems(prev => prev.map(item => {
      if (item.id !== id) return item;

      // Tip değişirse bazı alanları sıfırla
      if (field === 'type') {
        return {
            ...item,
            type: value,
            percentage: value === 'rate' ? 50 : 0,
            manualRate: value === 'fixed' ? 0 : undefined,
            isOverride: value === 'fixed'
        };
      }

      return { ...item, [field]: value };
    }));
  };

  const results: CalculationResult = useMemo(() => {
    const rate = parseFloat(hourlyRate.toString().replace(',', '.')) || 0;
    const normHours = parseFloat(normalHours.toString().replace(',', '.')) || 0;
    const deduc = parseFloat(deductions.toString().replace(',', '.')) || 0;

    let totalOvertimePay = 0;

    overtimeItems.forEach(item => {
      let itemTotal = 0;

      if (item.type === 'fixed') {
        // Sabit Tutar Modu: Adet * Birim Fiyat
        const unitPrice = item.manualRate || 0;
        itemTotal = item.hours * unitPrice;
      } else {
        // Mesai Modu: Saat * Saatlik Ücret * Katsayı
        const multiplier = (1 + item.percentage / 100);
        itemTotal = item.hours * rate * multiplier;
      }

      totalOvertimePay += itemTotal;
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

  // 5. UI BİLEŞENLERİ
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
  suffix?: string;
}

export const StepperInput: React.FC<Props> = ({ value, onChange, label, step = 1, suffix }) => {
  const theme = useTheme();
  const handlePress = (direction: 'up' | 'down') => {
    if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = direction === 'up' ? value + step : value - step;
    if (newValue >= 0) onChange(newValue);
  };

  return (
    <View style={styles.container}>
      {label && <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginBottom: 6 }}>{label}</Text>}
      <View style={[styles.controls, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline, borderWidth: 1 }]}>
        <TouchableOpacity onPress={() => handlePress('down')} style={styles.btn}>
          <MaterialIcons name="remove" size={20} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.valueContainer}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                {value} <Text style={{fontSize: 12, fontWeight: 'normal', color: theme.colors.secondary}}>{suffix}</Text>
            </Text>
        </View>
        <TouchableOpacity onPress={() => handlePress('up')} style={styles.btn}>
          <MaterialIcons name="add" size={20} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { alignItems: 'flex-end' },
  controls: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 2 },
  btn: { padding: 8, borderRadius: 10, backgroundColor: 'transparent' },
  valueContainer: { minWidth: 40, alignItems: 'center', paddingHorizontal: 4 }
});
`,

  "components/OvertimeCard.tsx": `
import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as NativeTextInput } from 'react-native';
import { Card, Text, useTheme, IconButton, TextInput, SegmentedButtons } from 'react-native-paper';
import { OvertimeItem } from '../types';
import { StepperInput } from './ui/StepperInput';
import { formatCurrency, parseNumber } from '../utils/formatters';
import * as Haptics from 'expo-haptics';

interface Props {
  item: OvertimeItem;
  baseRate: number;
  onUpdate: (id: string, field: keyof OvertimeItem, value: any) => void;
  onDelete: (id: string) => void;
}

const PRESET_PERCENTAGES = [25, 50, 75, 100];

export const OvertimeCard: React.FC<Props> = ({ item, baseRate, onUpdate, onDelete }) => {
  const theme = useTheme();
  // BUG FIX: Kalem ikonuna basınca inputa odaklanmak için ref
  const titleInputRef = useRef<NativeTextInput>(null);

  // Hesaplama Mantığı
  let calculatedUnit = 0;
  let totalEarn = 0;

  if (item.type === 'fixed') {
    calculatedUnit = item.manualRate || 0;
    totalEarn = item.hours * calculatedUnit;
  } else {
    calculatedUnit = baseRate * (1 + item.percentage / 100);
    totalEarn = item.hours * calculatedUnit;
  }

  const handlePercentageChange = (pct: number) => {
    if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
    onUpdate(item.id, 'percentage', pct);
  };

  return (
    <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface, borderRadius: 16, borderColor: theme.colors.outline, borderWidth: 1 }} mode="contained" elevation={0}>
      <Card.Content>
        {/* Header: Başlık ve Edit İkonu */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
             <View style={[styles.indicator, { backgroundColor: item.type === 'rate' ? theme.colors.primary : '#F59E0B' }]} />
             <TextInput
                ref={titleInputRef}
                value={item.title}
                onChangeText={(t) => onUpdate(item.id, 'title', t)}
                style={[styles.titleInput, { color: theme.colors.onSurface }]}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={theme.colors.onSurface}
                placeholder="Kalem Adı (Örn: Hafta Sonu)"
                placeholderTextColor={theme.colors.secondary}
                dense
             />
             <IconButton
                icon="pencil-outline"
                size={16}
                iconColor={theme.colors.secondary}
                style={{margin:0}}
                onPress={() => titleInputRef.current?.focus()}
             />
          </View>
          <IconButton icon="close" size={20} onPress={() => onDelete(item.id)} iconColor={theme.colors.error} style={{ margin: 0, opacity: 0.8 }} />
        </View>

        {/* Tip Seçici (Segmented Control) */}
        <View style={{ marginBottom: 16 }}>
            <SegmentedButtons
                value={item.type}
                onValueChange={(val) => onUpdate(item.id, 'type', val)}
                density="small"
                buttons={[
                { value: 'rate', label: 'Mesai (Saat)', icon: 'clock-outline' },
                { value: 'fixed', label: 'Sabit (Tutar)', icon: 'cash' },
                ]}
                theme={{ colors: { secondaryContainer: theme.colors.primaryContainer, onSecondaryContainer: theme.colors.onPrimaryContainer } }}
            />
        </View>

        {/* İçerik Gövdesi - Tipe Göre Değişir */}
        <View style={styles.body}>
            {/* SOL TARAF */}
            <View style={{ flex: 1, marginRight: 12 }}>
                {item.type === 'rate' ? (
                    <>
                        <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginBottom: 8 }}>Mesai Oranı</Text>
                        <View style={styles.chipContainer}>
                        {PRESET_PERCENTAGES.map((pct) => (
                            <TouchableOpacity
                            key={pct}
                            onPress={() => handlePercentageChange(pct)}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: item.percentage === pct ? theme.colors.primary : theme.colors.surfaceVariant,
                                    borderColor: item.percentage === pct ? theme.colors.primary : theme.colors.outline
                                }
                            ]}
                            >
                                <Text style={{
                                    fontSize: 12, fontWeight: '600',
                                    color: item.percentage === pct ? theme.colors.onPrimary : theme.colors.onSurface
                                }}>%{pct}</Text>
                            </TouchableOpacity>
                        ))}
                        </View>
                        <Text variant="labelSmall" style={{ color: theme.colors.secondary, marginTop: 6 }}>
                            Saatlik: {formatCurrency(calculatedUnit)}
                        </Text>
                    </>
                ) : (
                    <>
                        <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginBottom: 4 }}>Birim Tutar (Günlük/Sefer)</Text>
                        <TextInput
                            mode="outlined"
                            keyboardType="numeric"
                            value={item.manualRate?.toString() || ''}
                            onChangeText={(t) => onUpdate(item.id, 'manualRate', parseNumber(t))}
                            style={{ height: 40, backgroundColor: theme.colors.surface }}
                            contentStyle={{ paddingVertical: 0 }}
                            right={<TextInput.Icon icon="currency-try" />}
                            placeholder="0"
                        />
                    </>
                )}
            </View>

            {/* SAĞ TARAF: Stepper */}
            <View>
                <StepperInput
                    label={item.type === 'rate' ? "Süre" : "Adet / Gün"}
                    value={item.hours}
                    onChange={(val) => onUpdate(item.id, 'hours', val)}
                    suffix={item.type === 'rate' ? 'sa' : ''}
                />
            </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.colors.outline }]}>
            <View>
                <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                    {item.type === 'rate' ? 'Hesaplanan Tutar' : 'Ara Toplam'}
                </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    {formatCurrency(totalEarn)}
                </Text>
            </View>
        </View>

      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    titleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    titleInput: { flex: 1, backgroundColor: 'transparent', height: 40, padding: 0, fontSize: 16, fontWeight: '600', marginLeft: -6 },
    indicator: { width: 4, height: 24, borderRadius: 2, marginRight: 8 },
    body: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
        paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
        minWidth: 40, alignItems: 'center', justifyContent: 'center'
    },
    footer: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
`,

  // 6. DASHBOARD (Yeni Tiplere Göre Ayarlandı)
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
    if (results.overtimeSalary <= 0) { Alert.alert("Uyarı", "Hesaplanacak bir tutar yok."); return; }
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToHistory({ id: Date.now().toString(), date: new Date().toISOString(), hourlyRate: parseNumber(hourlyRate), result: results, overtimeItems: [...overtimeItems], note: 'Hızlı Giriş' });
    Alert.alert("Başarılı", "Kaydedildi! 🎉");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Surface style={{ backgroundColor: theme.colors.surface, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View>
                    <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>Hoş Geldiniz 👋</Text>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Mesai Takibi</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/settings')} style={{ backgroundColor: theme.colors.surfaceVariant, padding: 8, borderRadius: 12 }}>
                    <MaterialIcons name="settings" size={24} color={theme.colors.onSurface} />
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
                <Text style={{ marginLeft: 6, color: theme.colors.secondary }}>Aktif Saatlik Ücret: <Text style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{formatCurrency(parseNumber(hourlyRate) || 0)}</Text></Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Girişler</Text>
                <Button mode="contained-tonal" onPress={addCategory} icon="plus" compact textColor={theme.colors.primary}>Ekle</Button>
            </View>
            {overtimeItems.map((item, index) => (
                <Animated.View key={item.id} entering={FadeInDown.delay(index * 100).springify()}>
                    <OvertimeCard item={item} baseRate={parseNumber(hourlyRate)} onUpdate={updateItem} onDelete={removeCategory} />
                </Animated.View>
            ))}
            <Button mode="contained" onPress={handleSave} style={{ marginTop: 24, borderRadius: 12, paddingVertical: 8 }} icon="check" buttonColor={theme.colors.primary}>HESAPLA VE KAYDET</Button>
        </ScrollView>
    </View>
  );
}
`,
};

// --- YAZMA İŞLEMİ ---
const writeFiles = () => {
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    createDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content.trim());
    console.log(`✅ Güncellendi: ${filePath}`);
  }
};

// --- MAIN ---
writeFiles();
console.log("\n🎉 GÜNCELLEME TAMAMLANDI! (V3 Hibrit Sistem)");
console.log("👉 Test etmek için: npx expo start -c");
