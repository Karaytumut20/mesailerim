import React, { useState } from 'react';
import { ScrollView, View, Alert, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, Text, Divider, Switch, useTheme, Surface, HelperText, List, IconButton } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SettingsScreen() {
  const theme = useTheme();
  const { settings, updateSettings, isDarkMode, toggleTheme, clearAllData } = useAppStore();

  const [targetSalary, setTargetSalary] = useState(settings.targetMonthlySalary);
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate);
  const [payDay, setPayDay] = useState(settings.payDay.toString());

  // Yeni Alanlar
  const [workDays, setWorkDays] = useState(settings.workDaysPerWeek);

  // Saat seçimi için yardımcı state'ler (String <-> Date dönüşümü)
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };

  const [startTime, setStartTime] = useState(parseTime(settings.workStart));
  const [endTime, setEndTime] = useState(parseTime(settings.workEnd));

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // --- AKILLI HESAPLAMA FONKSİYONU ---
  const calculateSmartRate = () => {
    const salary = parseFloat(targetSalary.replace(',', '.')) || 0;
    const days = parseFloat(workDays.replace(',', '.')) || 5;

    // Günlük çalışma süresi (Saat farkı)
    let dailyHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (dailyHours < 0) dailyHours += 24; // Gece vardiyası durumu

    // Mola varsayımı: Eğer 6 saatten fazlaysa 1 saat mola düşelim
    const netDailyHours = dailyHours > 5 ? dailyHours - 1 : dailyHours;

    if (salary > 0 && days > 0 && netDailyHours > 0) {
        // Formül: (Günlük Saat * Haftalık Gün * 4.33 Hafta) = Aylık Toplam Saat
        const weeklyHours = netDailyHours * days;
        const monthlyHours = weeklyHours * 4.33;

        const calculatedRate = (salary / monthlyHours).toFixed(2);

        setHourlyRate(calculatedRate);
        Alert.alert(
            "Otomatik Hesaplandı ✅",
            `Çalışma Düzeniniz:\n• Günde: ${netDailyHours.toFixed(1)} saat (Mola düşüldü)\n• Haftada: ${days} gün\n• Ayda: ~${monthlyHours.toFixed(0)} saat\n\nBuna göre saatlik ücretiniz: ${calculatedRate} TL`
        );
    } else {
        Alert.alert("Eksik Bilgi", "Lütfen maaş, gün sayısı ve saatleri kontrol edin.");
    }
  };

  const handleSave = () => {
    const pDay = parseInt(payDay);
    if (pDay < 1 || pDay > 31) {
        Alert.alert("Hata", "Maaş günü 1-31 arasında olmalıdır.");
        return;
    }

    // Saatleri string olarak formatla HH:mm
    const formatTime = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    updateSettings({
        targetMonthlySalary: targetSalary,
        hourlyRate: hourlyRate,
        payDay: pDay,
        workDaysPerWeek: workDays,
        workStart: formatTime(startTime),
        workEnd: formatTime(endTime)
    });
    Alert.alert("Başarılı", "Tüm ayarlar kaydedildi.");
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setStartTime(selectedDate);
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) setEndTime(selectedDate);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 20 }}>
      <Text variant="headlineMedium" style={{ fontWeight: '800', marginBottom: 24, marginTop: 40, color: theme.colors.onSurface }}>Ayarlar</Text>

      <Surface style={{ padding: 20, borderRadius: 20, backgroundColor: theme.colors.surface, marginBottom: 20 }} elevation={1}>
        <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700', paddingLeft: 0, marginBottom: 10 }}>ÇALIŞMA DÜZENİ & MAAŞ</List.Subheader>

        {/* 1. Maaş */}
        <TextInput
          mode="outlined"
          label="Net Aylık Maaş (TL)"
          value={targetSalary}
          onChangeText={setTargetSalary}
          keyboardType="numeric"
          style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
        />

        {/* 2. Gün Sayısı */}
        <TextInput
          mode="outlined"
          label="Haftada Kaç Gün Çalışıyorsun?"
          value={workDays}
          onChangeText={setWorkDays}
          keyboardType="numeric"
          placeholder="Örn: 5"
          style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
        />

        {/* 3. Giriş - Çıkış Saatleri */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
                <Text variant="labelSmall" style={{ marginBottom: 4, color: theme.colors.secondary }}>GİRİŞ SAATİ</Text>
                <TouchableOpacity onPress={() => setShowStartPicker(true)} style={{ borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 4, padding: 14, backgroundColor: theme.colors.surface }}>
                    <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>
                        {startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
                <Text variant="labelSmall" style={{ marginBottom: 4, color: theme.colors.secondary }}>ÇIKIŞ SAATİ</Text>
                <TouchableOpacity onPress={() => setShowEndPicker(true)} style={{ borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 4, padding: 14, backgroundColor: theme.colors.surface }}>
                    <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>
                        {endTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Date Pickers (Invisible) */}
        {showStartPicker && (
            <DateTimePicker value={startTime} mode="time" is24Hour={true} display="default" onChange={onStartTimeChange} />
        )}
        {showEndPicker && (
            <DateTimePicker value={endTime} mode="time" is24Hour={true} display="default" onChange={onEndTimeChange} />
        )}

        {/* HESAPLA BUTONU */}
        <Button
            mode="contained-tonal"
            onPress={calculateSmartRate}
            icon="calculator"
            style={{ marginBottom: 20 }}
        >
            SAATLİK ÜCRETİ OTOMATİK BUL
        </Button>

        <Divider style={{ marginBottom: 20 }} />

        {/* Sonuç: Saatlik Ücret */}
        <TextInput
            mode="outlined"
            label="Hesaplanan Saatlik Ücret (TL)"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
            style={{ backgroundColor: theme.colors.surface, fontWeight: 'bold' }}
            right={<TextInput.Icon icon="lock-open-outline" />}
        />
        <HelperText type="info">Bu değer hakediş hesaplamalarında kullanılacaktır. İsterseniz elle düzeltebilirsiniz.</HelperText>

        <Divider style={{ marginVertical: 16 }} />

        <TextInput
          mode="outlined"
          label="Maaş Günü (Ayın kaçı?)"
          value={payDay}
          onChangeText={setPayDay}
          keyboardType="numeric"
          right={<TextInput.Affix text=". gün" />}
          style={{ backgroundColor: theme.colors.surface }}
        />

        <Button mode="contained" onPress={handleSave} style={{ marginTop: 24, borderRadius: 12 }} contentStyle={{ paddingVertical: 6 }}>
          AYARLARI KAYDET
        </Button>
      </Surface>

      <Surface style={{ padding: 20, borderRadius: 20, backgroundColor: theme.colors.surface }} elevation={1}>
        <List.Subheader style={{ color: theme.colors.secondary, fontWeight: '700', paddingLeft: 0 }}>UYGULAMA</List.Subheader>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text variant="bodyLarge" style={{fontWeight:'600'}}>Karanlık Mod</Text>
            <Switch value={isDarkMode} onValueChange={toggleTheme} color={theme.colors.primary} />
        </View>
        <Divider style={{ marginVertical: 12 }} />
        <TouchableOpacity onPress={() => Alert.alert("Sıfırla", "Tüm veriler silinecek?", [{ text: "İptal" }, { text: "SİL", onPress: clearAllData }])}>
            <Text style={{ color: theme.colors.error, fontWeight: 'bold', textAlign: 'center', padding: 10 }}>VERİLERİ SIFIRLA</Text>
        </TouchableOpacity>
      </Surface>
    </ScrollView>
  );
}