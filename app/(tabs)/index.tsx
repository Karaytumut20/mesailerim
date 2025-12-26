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
                value={`${totals.totalNormalHours} Saat`}
                subValue={formatCurrency(totals.basePay)}
                icon="access-time"
                color={theme.colors.onSurface}
                bg={theme.colors.surfaceVariant}
            />
            <InfoTile
                title="Fazla Mesai"
                value={`${totals.totalOvertimeHours} Saat`}
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
                                {log.overtimeHours > 0 ? `${log.overtimeHours}s Mesai (% ${log.overtimeRate})` : 'Standart Gün'}
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