const fs = require("fs");
const path = require("path");

console.log(
  "\x1b[33m%s\x1b[0m",
  "🚀 Mesailerim PRO V8.1 (Hata Düzeltmesi) Kuruluyor..."
);

const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

const files = {
  // DÜZELTİLDİ: Divider importu eklendi
  "app/(tabs)/index.tsx": `
import React, { useCallback, useState } from 'react';
import { ScrollView, View, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, useTheme, Surface, Card, ProgressBar, IconButton, Divider } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';
import { calculateCycleTotals } from '@/utils/salaryLogic';
import { getPayCycle, isDateInCycle } from '@/utils/dateHelpers';
import { formatCurrency } from '@/utils/formatters';
import { QuickEntryPanel } from '@/components/QuickEntryPanel';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { logs, settings } = useAppStore();
  const [refresh, setRefresh] = useState(false);

  // Hesaplamalar
  const cycle = getPayCycle(settings.payDay);
  const currentLogs = logs.filter(log => isDateInCycle(log.date, cycle));
  const totals = calculateCycleTotals(currentLogs, settings);

  // Karşılaştırma Mantığı
  const targetSalary = parseFloat(settings.targetMonthlySalary.replace(',', '.')) || 0;
  const currentEarnings = totals.grandTotal;
  const difference = currentEarnings - targetSalary;
  const isProfit = difference > 0;

  // Progress Bar için hedef (En azından targetSalary kadar ilerlesin)
  const incomeProgress = targetSalary > 0 ? Math.min(currentEarnings / targetSalary, 1.2) : 0;

  useFocusEffect(
    useCallback(() => { setRefresh(prev => !prev); }, [logs])
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 16 }}>
            <View>
                <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>{format(new Date(), 'MMMM yyyy', { locale: tr })}</Text>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>Finansal Durum</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings')} style={{ backgroundColor: theme.colors.surfaceVariant, padding: 8, borderRadius: 50 }}>
                <MaterialIcons name="settings" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
        </View>

        {/* BÜYÜK KARŞILAŞTIRMA KARTI */}
        <Surface style={{ padding: 20, borderRadius: 24, backgroundColor: theme.colors.surface, marginBottom: 16 }} elevation={2}>

            {/* Üst Kısım: Referans ve Gerçekleşen */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View>
                    <Text variant="labelMedium" style={{ color: theme.colors.secondary }}>NORMALDE (HEDEF)</Text>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.secondary, opacity: 0.6 }}>
                        {formatCurrency(targetSalary)}
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>ŞU ANKİ HAKEDİŞ</Text>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                        {formatCurrency(currentEarnings)}
                    </Text>
                </View>
            </View>

            <Divider style={{marginBottom: 16}} />

            {/* Orta Kısım: Fark Analizi (Mutluluk Bölgesi) */}
            <View style={{ backgroundColor: isProfit ? '#DCFCE7' : '#F1F5F9', padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                <MaterialIcons name={isProfit ? "trending-up" : "trending-flat"} size={24} color={isProfit ? "#166534" : "#475569"} />
                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: isProfit ? "#15803d" : "#475569" }}>
                    {isProfit
                        ? \`Normalden \${formatCurrency(difference)} fazlasınız! 🎉\`
                        : \`Normal hedefe \${formatCurrency(Math.abs(difference))} kaldı.\`
                    }
                </Text>
            </View>

            {/* Alt Kısım: Progress */}
            <View style={{ marginTop: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="labelSmall" style={{color: theme.colors.secondary}}>Maaş Doluluk Oranı</Text>
                    <Text variant="labelSmall" style={{fontWeight:'bold'}}>%{Math.round(incomeProgress * 100)}</Text>
                </View>
                <ProgressBar progress={incomeProgress > 1 ? 1 : incomeProgress} color={isProfit ? '#22C55E' : theme.colors.primary} style={{ height: 8, borderRadius: 4 }} />
            </View>
        </Surface>

        {/* İSTATİSTİK GRID */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }} mode="contained">
                <Card.Content style={{ paddingVertical: 12 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{totals.totalNormalHours} s</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>Normal Süre</Text>
                </Card.Content>
            </Card>
            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }} mode="contained">
                <Card.Content style={{ paddingVertical: 12 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#F59E0B' }}>{totals.totalOvertimeHours} s</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>Mesai Süresi</Text>
                </Card.Content>
            </Card>
            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }} mode="contained">
                <Card.Content style={{ paddingVertical: 12 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#10B981' }}>{formatCurrency(totals.totalOvertimePay)}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>Mesai Kazancı</Text>
                </Card.Content>
            </Card>
        </View>

        {/* LİSTE */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Son Kayıtlar</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
                <Text variant="labelLarge" style={{ color: theme.colors.primary }}>Geçmiş</Text>
            </TouchableOpacity>
        </View>

        {currentLogs.slice(0, 3).map((log) => (
            <Surface key={log.id} style={{ marginBottom: 8, borderRadius: 12, backgroundColor: theme.colors.surface }} elevation={0}>
                <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center' }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.surfaceVariant, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{new Date(log.date).getDate()}</Text>
                        <Text style={{ fontSize: 10, color: theme.colors.secondary }}>{format(new Date(log.date), 'MMM', {locale:tr})}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                            {log.overtimeHours > 0 ? 'Mesaili Gün' : 'Normal Gün'}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                            {log.normalHours}s {log.overtimeHours > 0 ? \`+ \${log.overtimeHours}s (% \${log.overtimeRate})\` : ''}
                        </Text>
                    </View>
                    <Text style={{ fontWeight: 'bold', color: log.overtimeHours > 0 ? '#10B981' : theme.colors.onSurface }}>
                        {formatCurrency((log.normalHours * parseFloat(settings.hourlyRate)) + (log.overtimeHours * parseFloat(settings.hourlyRate) * (1 + log.overtimeRate/100)))}
                    </Text>
                </View>
            </Surface>
        ))}

      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <QuickEntryPanel />
      </View>
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
console.log("\n✨ HATA DÜZELTİLDİ!");
console.log("👉 Şimdi tekrar 'npx expo start -c' komutunu çalıştırabilirsin.");
