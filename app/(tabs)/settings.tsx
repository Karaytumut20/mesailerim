import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { TextInput, Button, Text, Divider, Switch, useTheme, Surface, HelperText } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const { settings, updateSettings, isDarkMode, toggleTheme, clearAllData } = useAppStore();

  const [targetSalary, setTargetSalary] = useState(settings.targetMonthlySalary);
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate);
  const [payDay, setPayDay] = useState(settings.payDay.toString());

  // Sihirli Buton: Aylık maaştan saatliği hesapla
  const calculateFromMonthly = () => {
    const monthly = parseFloat(targetSalary.replace(',', '.')) || 0;
    if (monthly > 0) {
        // Türkiye standardı 225 saat
        const calculated = (monthly / 225).toFixed(2);
        setHourlyRate(calculated);
        Alert.alert("Hesaplandı", `225 saate göre saatlik ücretiniz: ${calculated} TL olarak ayarlandı.`);
    } else {
        Alert.alert("Hata", "Lütfen önce geçerli bir aylık maaş girin.");
    }
  };

  const handleSave = () => {
    const pDay = parseInt(payDay);
    if (pDay < 1 || pDay > 31) {
        Alert.alert("Hata", "Maaş günü 1-31 arasında olmalıdır.");
        return;
    }
    updateSettings({
        targetMonthlySalary: targetSalary,
        hourlyRate: hourlyRate,
        payDay: pDay
    });
    Alert.alert("Başarılı", "Tüm parametreler kaydedildi.");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 20, marginTop: 40, color: theme.colors.primary }}>Finansal Ayarlar</Text>

      <Surface style={{ padding: 16, borderRadius: 12, backgroundColor: theme.colors.surface }} elevation={1}>

        {/* Referans Maaş */}
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8, color: theme.colors.primary }}>1. Hedef / Referans</Text>
        <TextInput
          mode="outlined"
          label="Aylık Normal Maaşınız (TL)"
          value={targetSalary}
          onChangeText={setTargetSalary}
          keyboardType="numeric"
          style={{ marginBottom: 4 }}
        />
        <HelperText type="info">Bu sadece ana sayfada "Normalde almanız gereken" tutarı göstermek içindir.</HelperText>

        <Divider style={{ marginVertical: 16 }} />

        {/* Hesaplama Parametresi */}
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8, color: theme.colors.primary }}>2. Hesaplama Parametresi</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TextInput
                mode="outlined"
                label="Saatlik Ücret (TL)"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
                style={{ flex: 1 }}
            />
            <Button mode="contained-tonal" onPress={calculateFromMonthly} compact>
                Maaştan Çevir
            </Button>
        </View>
        <HelperText type="info">Tüm hakedişleriniz BU DEĞER (Saatlik Ücret) ile çarpılarak hesaplanır.</HelperText>

        <Divider style={{ marginVertical: 16 }} />

        {/* Döngü */}
        <TextInput
          mode="outlined"
          label="Maaş Günü (Ayın kaçı?)"
          value={payDay}
          onChangeText={setPayDay}
          keyboardType="numeric"
          right={<TextInput.Affix text=". gün" />}
        />

        <Button mode="contained" onPress={handleSave} style={{ marginTop: 24 }} contentStyle={{ paddingVertical: 4 }}>
          AYARLARI KAYDET
        </Button>
      </Surface>

      <Surface style={{ padding: 16, borderRadius: 12, backgroundColor: theme.colors.surface, marginTop: 20 }} elevation={1}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Karanlık Mod</Text>
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>
        <Divider style={{ marginVertical: 12 }} />
        <Button
            mode="outlined"
            textColor={theme.colors.error}
            onPress={() => Alert.alert("Sıfırla", "Tüm veriler silinecek?", [{ text: "İptal" }, { text: "SİL", onPress: clearAllData }])}
        >
            Verileri Sıfırla
        </Button>
      </Surface>
    </ScrollView>
  );
}