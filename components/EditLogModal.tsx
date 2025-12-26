import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, Surface, useTheme, SegmentedButtons, Chip, Divider, Switch } from 'react-native-paper';
import { DailyLog } from '@/types';
import { useAppStore } from '@/store/appStore';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  log: DailyLog | null;
}

const OVERTIME_RATES = [25, 50, 75, 100, 150, 200, 250, 300];

export const EditLogModal = ({ visible, onDismiss, log }: Props) => {
  const theme = useTheme();
  const { editLog, removeLog } = useAppStore();

  const [date, setDate] = useState(new Date());
  const [normalHours, setNormalHours] = useState('');
  const [overtimeHours, setOvertimeHours] = useState('');
  const [overtimeRate, setOvertimeRate] = useState(50);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Modal açıldığında verileri doldur
  useEffect(() => {
    if (log) {
        setDate(new Date(log.date));
        setNormalHours(log.normalHours.toString());
        setOvertimeHours(log.overtimeHours.toString());
        setOvertimeRate(log.overtimeRate);
    }
  }, [log]);

  const handleSave = () => {
    if (!log) return;
    const nh = parseFloat(normalHours) || 0;
    const oh = parseFloat(overtimeHours) || 0;

    editLog(log.id, {
        date: date.toISOString().split('T')[0],
        normalHours: nh,
        overtimeHours: oh,
        overtimeRate: overtimeRate
    });
    onDismiss();
  };

  const handleDelete = () => {
    if (!log) return;
    removeLog(log.id);
    onDismiss();
  };

  if (!log) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={{ backgroundColor: theme.colors.surface, padding: 20, margin: 20, borderRadius: 16 }}>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 16 }}>Kaydı Düzenle</Text>

        <ScrollView>
            {/* Tarih */}
            <Button mode="outlined" onPress={() => setShowDatePicker(true)} icon="calendar" style={{ marginBottom: 16 }}>
                {date.toLocaleDateString('tr-TR')}
            </Button>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(e, d) => { setShowDatePicker(false); if(d) setDate(d); }}
                />
            )}

            {/* Saatler */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                    <TextInput label="Normal Saat" value={normalHours} onChangeText={setNormalHours} keyboardType="numeric" mode="outlined" right={<TextInput.Affix text="sa" />} />
                </View>
                <View style={{ flex: 1 }}>
                    <TextInput label="Mesai Saati" value={overtimeHours} onChangeText={setOvertimeHours} keyboardType="numeric" mode="outlined" right={<TextInput.Affix text="sa" />} />
                </View>
            </View>

            {/* Oran */}
            <Text variant="labelMedium" style={{ marginBottom: 8 }}>Mesai Oranı</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {OVERTIME_RATES.map((rate) => (
                        <Chip
                            key={rate}
                            selected={overtimeRate === rate}
                            onPress={() => setOvertimeRate(rate)}
                            showSelectedOverlay
                            style={{ backgroundColor: overtimeRate === rate ? theme.colors.primaryContainer : theme.colors.surfaceVariant }}
                        >
                            %{rate}
                        </Chip>
                    ))}
                </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                <Button mode="text" textColor={theme.colors.error} onPress={handleDelete}>Sil</Button>
                <Button mode="contained" onPress={handleSave}>Güncelle</Button>
            </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};