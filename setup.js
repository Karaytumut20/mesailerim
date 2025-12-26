const fs = require("fs");
const path = require("path");

// --- OLUŞTURULACAK DOSYALAR VE İÇERİKLERİ ---
const files = {
  // 1. TEMA
  "constants/theme.ts": `
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightColors = {
  primary: '#059669', // Emerald 600 - Güven veren ana renk
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1FAE5', // Emerald 100
  secondary: '#374151', // Gray 700
  background: '#F9FAFB', // Gray 50 - Daha yumuşak beyaz
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6', // Gray 100
  error: '#EF4444',
  outline: '#E5E7EB',
  elevation: {
    level1: '#FFFFFF',
    level2: '#F9FAFB',
  }
};

const darkColors = {
  primary: '#34D399', // Emerald 400
  onPrimary: '#064E3B',
  primaryContainer: '#065F46',
  secondary: '#D1D5DB', // Gray 300
  background: '#111827', // Gray 900
  surface: '#1F2937', // Gray 800
  surfaceVariant: '#374151',
  error: '#CF6679',
  outline: '#4B5563',
  elevation: {
    level1: '#1F2937',
    level2: '#111827',
  }
};

export const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
};
`,

  // 2. TİPLER
  "types/index.ts": `
export interface OvertimeItem {
  id: string;
  title: string;
  hours: number;
  percentage: number; // Örn: 50, 100
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
  overtimeItems: OvertimeItem[]; // Detayları saklamak için
  note?: string;
}

export interface AppSettings {
  defaultHourlyRate: string;
  defaultWorkHours: string;
  currencySymbol: string;
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
  if (!text) return 0;
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
import { HistoryRecord, AppSettings } from '../types';

interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Geçmiş Verileri
  history: HistoryRecord[];
  addToHistory: (record: HistoryRecord) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  // Uygulama Ayarları
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
      name: 'mesailerim-storage-v2', // Versiyonlama ile temiz başlangıç
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
`,

  // 5. YENİ BİLEŞEN: STEPPER INPUT
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
    // Küçük bir titreşim ile fiziksel his ver
    if (process.env.EXPO_OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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

  // 6. GÜNCELLENMİŞ KART BİLEŞENİ
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

  const calculatedRate = item.isOverride && item.manualRate
    ? item.manualRate
    : baseRate * (1 + item.percentage / 100);

  const totalEarn = item.hours * calculatedRate;

  return (
    <Card style={{ marginBottom: 12, backgroundColor: theme.colors.surface, borderRadius: 16 }} mode="elevated" elevation={1}>
      <Card.Content>
        {/* Header: Başlık ve Sil Butonu */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
             <View style={{ width: 4, height: 24, backgroundColor: theme.colors.primary, borderRadius: 2 }} />
             <Text variant="titleMedium" style={{ fontWeight: '600' }}>{item.title}</Text>
          </View>
          <IconButton icon="close" size={18} onPress={() => onDelete(item.id)} style={{ margin: 0 }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Sol Taraf: Yüzde Seçimi */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {PRESET_PERCENTAGES.map((pct) => (
                <Chip
                  key={pct}
                  selected={!item.isOverride && item.percentage === pct}
                  onPress={() => onUpdate(item.id, 'percentage', pct)}
                  showSelectedOverlay
                  style={{ backgroundColor: !item.isOverride && item.percentage === pct ? theme.colors.primaryContainer : undefined }}
                  textStyle={{ fontSize: 11 }}
                  compact
                >
                  %{pct}
                </Chip>
              ))}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
              Birim: {formatCurrency(calculatedRate)} / saat
            </Text>
          </View>

          {/* Sağ Taraf: Hızlı Saat Girişi */}
          <StepperInput
            value={item.hours}
            onChange={(val) => onUpdate(item.id, 'hours', val)}
          />
        </View>

        {/* Footer: Toplam Tutar */}
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.outline, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.secondary }}>Bu Kalem Toplamı</Text>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {formatCurrency(totalEarn)}
            </Text>
        </View>

      </Card.Content>
    </Card>
  );
};
`,

  // 7. ROOT LAYOUT
  "app/_layout.tsx": `
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { AppLightTheme, AppDarkTheme } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const theme = isDarkMode ? AppDarkTheme : AppLightTheme;

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </PaperProvider>
  );
}
`,

  // 8. TABS LAYOUT
  "app/(tabs)/_layout.tsx": `
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
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600'
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hesapla',
          tabBarIcon: ({ color }) => <MaterialIcons size={26} name="calculate" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Geçmiş',
          tabBarIcon: ({ color }) => <MaterialIcons size={26} name="history" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color }) => <MaterialIcons size={26} name="settings" color={color} />,
        }}
      />
      {/* Kullanılmayan rotaları gizle */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
`,

  // 9. ANA DASHBOARD EKRANI
  "app/(tabs)/index.tsx": `
import React, { useEffect } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Text, Button, useTheme, Surface } from 'react-native-paper';
import { useCalculator } from '@/hooks/useCalculator';
import { OvertimeCard } from '@/components/OvertimeCard';
import { formatCurrency, parseNumber } from '@/utils/formatters';
import { useAppStore } from '@/store/appStore';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const theme = useTheme();
  const { addToHistory, settings } = useAppStore();

  const {
    hourlyRate, setHourlyRate,
    overtimeItems, addCategory, removeCategory, updateItem,
    results
  } = useCalculator();

  // Ayarlardan varsayılan saatlik ücreti çek
  useEffect(() => {
    if (settings.defaultHourlyRate && (!hourlyRate || hourlyRate === '')) {
        setHourlyRate(settings.defaultHourlyRate);
    }
  }, [settings.defaultHourlyRate]);

  const handleSave = () => {
    if (results.overtimeSalary <= 0) {
        Alert.alert("Uyarı", "Hesaplanmış bir mesai tutarı bulunamadı.");
        return;
    }

    if (process.env.EXPO_OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    addToHistory({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      hourlyRate: parseNumber(hourlyRate),
      result: results,
      overtimeItems: [...overtimeItems],
      note: 'Hızlı Giriş'
    });

    Alert.alert("Başarılı", "Mesai kaydı başarıyla eklendi! 🎉");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header - Büyük Kazanç Göstergesi */}
        <Surface style={{
            backgroundColor: theme.colors.primary,
            paddingTop: 60,
            paddingBottom: 30,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            elevation: 4
        }}>
            <Animated.View entering={SlideInUp.delay(100)}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' }}>
                    HESAPLANAN MESAİ
                </Text>
                <Text style={{ color: '#fff', fontSize: 40, fontWeight: 'bold', marginVertical: 4 }}>
                    {formatCurrency(results.overtimeSalary)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'flex-start', padding: 4, paddingHorizontal: 8, borderRadius: 8 }}>
                    <MaterialIcons name="attach-money" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' }}>
                        Saatlik: {formatCurrency(parseNumber(hourlyRate) || 0)}
                    </Text>
                </View>
            </Animated.View>
        </Surface>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>Mesai Kalemleri</Text>
                <Button mode="text" onPress={addCategory} icon="plus" textColor={theme.colors.primary}>Ekle</Button>
            </View>

            {overtimeItems.map((item, index) => (
                <Animated.View key={item.id} entering={FadeInDown.delay(index * 100).springify()}>
                    <OvertimeCard
                        item={item}
                        baseRate={parseNumber(hourlyRate)}
                        onUpdate={updateItem}
                        onDelete={removeCategory}
                    />
                </Animated.View>
            ))}

            <Button
                mode="contained"
                onPress={handleSave}
                style={{ marginTop: 20, borderRadius: 12, paddingVertical: 6 }}
                icon="check-circle-outline"
                buttonColor={theme.colors.primary}
            >
                KAYDET VE BİTİR
            </Button>
        </ScrollView>
    </View>
  );
}
`,

  // 10. GEÇMİŞ EKRANI
  "app/(tabs)/history.tsx": `
import React from 'react';
import { FlatList, View } from 'react-native';
import { Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function HistoryScreen() {
  const { history, removeFromHistory } = useAppStore();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 20, paddingTop: 60, paddingBottom: 10 }}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Geçmiş Kayıtlar</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
              <Surface style={{
                  marginBottom: 12,
                  borderRadius: 16,
                  backgroundColor: theme.colors.surface,
                  padding: 16,
                  elevation: 1,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.primary
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                            +{formatCurrency(item.result.overtimeSalary)}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginTop: 4 }}>
                            {format(new Date(item.date), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                        </Text>
                    </View>
                    <IconButton
                        icon="trash-can-outline"
                        size={20}
                        iconColor={theme.colors.error}
                        onPress={() => removeFromHistory(item.id)}
                        style={{ margin: 0, marginTop: -8, marginRight: -8, opacity: 0.7 }}
                    />
                </View>

                {/* Detayları göster (Varsa) */}
                {item.overtimeItems && item.overtimeItems.length > 0 && (
                    <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {item.overtimeItems.map((detail, idx) => (
                            <View key={idx} style={{ backgroundColor: theme.colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                <Text variant="labelSmall" style={{color: theme.colors.onSurface}}>{detail.title}: <Text style={{fontWeight:'bold'}}>{detail.hours}s</Text></Text>
                            </View>
                        ))}
                    </View>
                )}
              </Surface>
          </Animated.View>
        )}
        ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 100 }}>
                <Text variant="bodyLarge" style={{ opacity: 0.5 }}>Henüz kayıt bulunmuyor.</Text>
            </View>
        }
      />
    </View>
  );
}
`,

  // 11. AYARLAR EKRANI
  "app/(tabs)/settings.tsx": `
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
`,
};

// --- KURULUMU GERÇEKLEŞTİR ---
async function setup() {
  console.log("🚀 Kurulum başlıyor...");

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);

    // Klasör yoksa oluştur
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📂 Klasör oluşturuldu: ${dir}`);
    }

    // Dosyayı yaz
    fs.writeFileSync(fullPath, content.trim());
    console.log(`✅ Dosya oluşturuldu: ${filePath}`);
  }

  console.log(
    '\n✨ Kurulum başarıyla tamamlandı! "npx expo start -c" ile başlatabilirsiniz.'
  );
}

setup();
