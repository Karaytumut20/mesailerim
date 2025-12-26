import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Keyboard } from 'react-native';
import { Text, useTheme, TextInput, IconButton, Chip } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { SlideInDown, FadeOut } from 'react-native-reanimated';

const OVERTIME_RATES = [25, 50, 75, 100, 150, 200, 250, 300];
const { height } = Dimensions.get('window');

export const QuickEntryPanel = () => {
  const theme = useTheme();
  const { addLog } = useAppStore();

  const [expanded, setExpanded] = useState(false);
  const [hours, setHours] = useState('');
  const [isOvertime, setIsOvertime] = useState(false);
  const [selectedRate, setSelectedRate] = useState(50);

  const handleAdd = () => {
    const val = parseFloat(hours);
    if (!val || val <= 0) return;

    const today = new Date().toISOString().split('T')[0];

    // Mantık: Eğer 'Normal' seçiliyse normal saate ekle, 'Mesai' ise mesaiye.
    // Hızlı giriş olduğu için o günün diğer verilerini (varsayılan 8 saat vb.) korumaya çalışıyoruz.
    // Ancak basitlik için:
    // Normal mod -> Normal: Girilen, Mesai: 0
    // Mesai mod -> Normal: 8 (Standart), Mesai: Girilen

    addLog({
        date: today,
        type: 'normal',
        normalHours: !isOvertime ? val : 8,
        overtimeHours: isOvertime ? val : 0,
        overtimeRate: selectedRate,
        extras: 0,
        note: 'Hızlı Kayıt'
    });

    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Kapat ve Temizle
    Keyboard.dismiss();
    setHours('');
    setExpanded(false);
  };

  // 1. KAPALI DURUM: Sadece Şık Bir "+" Butonu
  if (!expanded) {
    return (
      <View style={styles.fabContainer}>
        <TouchableOpacity
            onPress={() => { setExpanded(true); Haptics.selectionAsync(); }}
            style={[styles.fab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
            activeOpacity={0.8}
        >
            <MaterialIcons name="add" size={32} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>
    );
  }

  // 2. AÇIK DURUM: Minimalist Bottom Sheet
  return (
    <>
        {/* Arkaplanı karart ve tıklayınca kapat */}
        <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setExpanded(false)}
        />

        <Animated.View
            entering={SlideInDown.springify().damping(18)}
            exiting={FadeOut}
            style={[styles.sheet, { backgroundColor: theme.colors.surface }]}
        >

            {/* Header */}
            <View style={styles.header}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Kayıt Ekle</Text>
                <IconButton icon="close" size={24} onPress={() => setExpanded(false)} style={{ margin: -8 }} />
            </View>

            {/* Tip Seçici (Toggle) */}
            <View style={{ flexDirection: 'row', marginBottom: 24, backgroundColor: theme.colors.surfaceVariant, borderRadius: 16, padding: 4 }}>
                <TouchableOpacity
                    onPress={() => setIsOvertime(false)}
                    style={[styles.tab, !isOvertime && { backgroundColor: theme.colors.surface, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }]}
                >
                    <Text style={{ fontWeight: !isOvertime ? 'bold' : 'normal', color: !isOvertime ? theme.colors.primary : theme.colors.secondary }}>Normal Çalışma</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setIsOvertime(true)}
                    style={[styles.tab, isOvertime && { backgroundColor: theme.colors.surface, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }]}
                >
                    <Text style={{ fontWeight: isOvertime ? 'bold' : 'normal', color: isOvertime ? '#F59E0B' : theme.colors.secondary }}>Fazla Mesai</Text>
                </TouchableOpacity>
            </View>

            {/* Dev Input Alanı */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <TextInput
                    value={hours}
                    onChangeText={setHours}
                    placeholder="0"
                    keyboardType="numeric"
                    autoFocus
                    textColor={theme.colors.onSurface}
                    style={{
                        fontSize: 56,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        backgroundColor: 'transparent',
                        minWidth: 100,
                        height: 70
                    }}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    selectionColor={theme.colors.primary}
                />
                <Text variant="headlineSmall" style={{ color: theme.colors.secondary, marginTop: 16, fontWeight: '500' }}>saat</Text>
            </View>

            {/* Sadece Mesai İse: Oran Seçici */}
            {isOvertime && (
                <View style={{ marginBottom: 24 }}>
                    <Text variant="labelSmall" style={{ textAlign: 'center', color: theme.colors.secondary, marginBottom: 12, fontWeight: 'bold', letterSpacing: 1 }}>MESAİ ORANI</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {OVERTIME_RATES.map((rate) => (
                                <Chip
                                    key={rate}
                                    selected={selectedRate === rate}
                                    onPress={() => setSelectedRate(rate)}
                                    showSelectedOverlay
                                    style={{ backgroundColor: selectedRate === rate ? '#F59E0B' : theme.colors.surfaceVariant, height: 40, borderRadius: 20 }}
                                    textStyle={{ color: selectedRate === rate ? '#FFF' : theme.colors.onSurfaceVariant, fontWeight: 'bold', fontSize: 14 }}
                                >
                                    %{rate}
                                </Chip>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Kaydet Butonu */}
            <TouchableOpacity
                onPress={handleAdd}
                disabled={!hours}
                style={[
                    styles.saveBtn,
                    {
                        backgroundColor: hours ? (isOvertime ? '#F59E0B' : theme.colors.primary) : theme.colors.surfaceVariant,
                        shadowColor: hours ? (isOvertime ? '#F59E0B' : theme.colors.primary) : 'transparent',
                    }
                ]}
            >
                <Text style={{ color: hours ? '#FFF' : theme.colors.secondary, fontWeight: 'bold', fontSize: 18 }}>
                    KAYDET
                </Text>
            </TouchableOpacity>

        </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: { position: 'absolute', bottom: 30, alignSelf: 'center', zIndex: 100 },
  fab: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOffset: {width:0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8 },
  backdrop: { position: 'absolute', top: -height, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40, borderTopLeftRadius: 32, borderTopRightRadius: 32, elevation: 20, zIndex: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14 },
  saveBtn: { paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 8, shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
});