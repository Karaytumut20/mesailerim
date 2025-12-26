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