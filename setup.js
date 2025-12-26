const fs = require("fs");
const path = require("path");

console.log(
  "\x1b[34m%s\x1b[0m",
  "💼 Mesailerim PRO V15 (Standart Form Yapısı) Kuruluyor..."
);

const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

const files = {
  // 1. YENİ BİLEŞEN: Standart Ekleme Modalı (Geçmiş düzenleme ekranının aynısı)
  "components/AddLogModal.tsx": `
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
`,

  // 2. DASHBOARD: "QuickEntryPanel" kaldırıldı, yerine FAB ve Modal geldi.
  "app/(tabs)/index.tsx": `
import React, { useCallback, useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface, Card, ProgressBar, Divider, FAB } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';
import { calculateCycleTotals } from '@/utils/salaryLogic';
import { getPayCycle, isDateInCycle } from '@/utils/dateHelpers';
import { formatCurrency } from '@/utils/formatters';
import { AddLogModal } from '@/components/AddLogModal';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { logs, settings } = useAppStore();
  const [refresh, setRefresh] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const cycle = getPayCycle(settings.payDay);
  const currentLogs = logs.filter(log => isDateInCycle(log.date, cycle));
  const totals = calculateCycleTotals(currentLogs, settings);

  const targetSalary = parseFloat(settings.targetMonthlySalary.replace(',', '.')) || 0;
  const currentEarnings = totals.grandTotal;
  const diff = currentEarnings - targetSalary;
  const isProfit = diff > 0;
  const progress = targetSalary > 0 ? Math.min(currentEarnings / targetSalary, 1) : 0;

  useFocusEffect(
    useCallback(() => { setRefresh(prev => !prev); }, [logs])
  );

  const InfoTile = ({ title, value, subValue, icon, color, bg }: any) => (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.outline }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ padding: 6, borderRadius: 8, backgroundColor: bg }}>
                <MaterialIcons name={icon} size={18} color={color} />
            </View>
        </View>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{value}</Text>
        <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>{title}</Text>
        {subValue && <Text variant="labelSmall" style={{ color: theme.colors.primary, marginTop: 4, fontWeight: '600' }}>{subValue}</Text>}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* HEADER */}
      <Surface style={{
          paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
          backgroundColor: theme.colors.background,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          borderBottomWidth: 1, borderBottomColor: theme.colors.outline
        }} elevation={0}>
          <View>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: theme.colors.onSurface, letterSpacing: -0.5 }}>MESAİLERİM</Text>
            <Text variant="labelMedium" style={{ color: theme.colors.secondary, letterSpacing: 1 }}>DÖNEM ÖZETİ</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} style={{ borderWidth: 1, borderColor: theme.colors.outline, padding: 8, borderRadius: 8 }}>
            <MaterialIcons name="settings" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
      </Surface>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

        {/* ANA KART */}
        <View style={{ marginBottom: 24 }}>
            <View style={{ backgroundColor: theme.colors.primary, borderRadius: 16, padding: 24, shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={{ color: theme.colors.onPrimary, opacity: 0.8, fontSize: 12, textTransform: 'uppercase' }}>Tahmini Hakediş</Text>
                        <Text variant="displaySmall" style={{ fontWeight: 'bold', color: theme.colors.onPrimary, marginTop: 4 }}>
                            {formatCurrency(currentEarnings)}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 8 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{cycle.daysLeft} Gün</Text>
                        <Text style={{ color: theme.colors.onPrimary, opacity: 0.8, fontSize: 10 }}>Kaldı</Text>
                    </View>
                </View>

                <Divider style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ color: theme.colors.onPrimary, opacity: 0.9, fontSize: 13 }}>
                            Hedef: {formatCurrency(targetSalary)}
                        </Text>
                    </View>
                    <View style={{ width: 120 }}>
                        <ProgressBar progress={progress} color="#4ADE80" style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.3)' }} />
                    </View>
                </View>
            </View>
        </View>

        {/* İSTATİSTİK GRID */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <InfoTile
                title="Normal Çalışma"
                value={\`\${totals.totalNormalHours} Saat\`}
                subValue={formatCurrency(totals.basePay)}
                icon="access-time"
                color={theme.colors.onSurface}
                bg={theme.colors.surfaceVariant}
            />
            <InfoTile
                title="Fazla Mesai"
                value={\`\${totals.totalOvertimeHours} Saat\`}
                subValue={formatCurrency(totals.totalOvertimePay)}
                icon="bolt"
                color="#D97706"
                bg="#FEF3C7"
            />
        </View>

        {/* LİSTE BAŞLIĞI */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 12 }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>HAREKETLER</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Geçmiş</Text>
            </TouchableOpacity>
        </View>

        {/* LİSTE */}
        {currentLogs.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 12, borderStyle: 'dashed', backgroundColor: theme.colors.surface }}>
                <Text style={{ color: theme.colors.secondary }}>Henüz kayıt girmediniz.</Text>
            </View>
        ) : (
            currentLogs.map((log, index) => {
                const dayEarn = (log.normalHours * parseFloat(settings.hourlyRate)) +
                                (log.overtimeHours * parseFloat(settings.hourlyRate) * (1 + log.overtimeRate/100)) +
                                log.extras;
                return (
                    <View key={log.id} style={{
                        flexDirection: 'row',
                        paddingVertical: 16,
                        paddingHorizontal: 16,
                        backgroundColor: theme.colors.surface,
                        marginBottom: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: theme.colors.outline,
                        elevation: 0
                    }}>
                        <View style={{ width: 50, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderRightWidth: 1, borderRightColor: theme.colors.outline }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.colors.primary }}>{new Date(log.date).getDate()}</Text>
                            <Text style={{ fontSize: 10, color: theme.colors.secondary, textTransform: 'uppercase' }}>{format(new Date(log.date), 'MMM', {locale:tr})}</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 14, color: theme.colors.onSurface, fontWeight: '600' }}>
                                {log.overtimeHours > 0 ? \`\${log.overtimeHours}s Mesai (% \${log.overtimeRate})\` : 'Standart Gün'}
                            </Text>
                            <Text style={{ fontSize: 12, color: theme.colors.secondary }}>
                                {log.normalHours} Saat Normal Çalışma
                            </Text>
                        </View>
                        <View style={{ justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', color: '#16A34A', fontSize: 15 }}>{formatCurrency(dayEarn)}</Text>
                        </View>
                    </View>
                );
            })
        )}

      </ScrollView>

      {/* FAB BUTONU */}
      <FAB
        icon="plus"
        label="Kayıt Ekle"
        style={{ position: 'absolute', margin: 20, right: 0, bottom: 0, backgroundColor: theme.colors.primary }}
        color={theme.colors.onPrimary}
        onPress={() => setModalVisible(true)}
      />

      {/* EKLEME MODALI */}
      <AddLogModal visible={isModalVisible} onDismiss={() => setModalVisible(false)} />
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

writeFiles();
console.log("\n💼 V15 TASARIM YÜKLENDİ!");
console.log(
  "👉 Artık 'Ekle' butonu, düzenleme ekranı ile aynı profesyonel yapıda açılıyor."
);
