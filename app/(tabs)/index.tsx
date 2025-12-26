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