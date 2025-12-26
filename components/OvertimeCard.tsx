import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as NativeTextInput } from 'react-native';
import { Card, Text, useTheme, IconButton, TextInput, SegmentedButtons } from 'react-native-paper';
import { OvertimeItem } from '../types';
import { StepperInput } from './ui/StepperInput';
import { formatCurrency, parseNumber } from '../utils/formatters';
import * as Haptics from 'expo-haptics';

interface Props {
  item: OvertimeItem;
  baseRate: number;
  onUpdate: (id: string, field: keyof OvertimeItem, value: any) => void;
  onDelete: (id: string) => void;
}

const PRESET_PERCENTAGES = [25, 50, 75, 100];

export const OvertimeCard: React.FC<Props> = ({ item, baseRate, onUpdate, onDelete }) => {
  const theme = useTheme();
  // BUG FIX: Kalem ikonuna basınca inputa odaklanmak için ref
  const titleInputRef = useRef<NativeTextInput>(null);

  // Hesaplama Mantığı
  let calculatedUnit = 0;
  let totalEarn = 0;

  if (item.type === 'fixed') {
    calculatedUnit = item.manualRate || 0;
    totalEarn = item.hours * calculatedUnit;
  } else {
    calculatedUnit = baseRate * (1 + item.percentage / 100);
    totalEarn = item.hours * calculatedUnit;
  }

  const handlePercentageChange = (pct: number) => {
    if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
    onUpdate(item.id, 'percentage', pct);
  };

  return (
    <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface, borderRadius: 16, borderColor: theme.colors.outline, borderWidth: 1 }} mode="contained" elevation={0}>
      <Card.Content>
        {/* Header: Başlık ve Edit İkonu */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
             <View style={[styles.indicator, { backgroundColor: item.type === 'rate' ? theme.colors.primary : '#F59E0B' }]} />
             <TextInput
                ref={titleInputRef}
                value={item.title}
                onChangeText={(t) => onUpdate(item.id, 'title', t)}
                style={[styles.titleInput, { color: theme.colors.onSurface }]}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={theme.colors.onSurface}
                placeholder="Kalem Adı (Örn: Hafta Sonu)"
                placeholderTextColor={theme.colors.secondary}
                dense
             />
             <IconButton
                icon="pencil-outline"
                size={16}
                iconColor={theme.colors.secondary}
                style={{margin:0}}
                onPress={() => titleInputRef.current?.focus()}
             />
          </View>
          <IconButton icon="close" size={20} onPress={() => onDelete(item.id)} iconColor={theme.colors.error} style={{ margin: 0, opacity: 0.8 }} />
        </View>

        {/* Tip Seçici (Segmented Control) */}
        <View style={{ marginBottom: 16 }}>
            <SegmentedButtons
                value={item.type}
                onValueChange={(val) => onUpdate(item.id, 'type', val)}
                density="small"
                buttons={[
                { value: 'rate', label: 'Mesai (Saat)', icon: 'clock-outline' },
                { value: 'fixed', label: 'Sabit (Tutar)', icon: 'cash' },
                ]}
                theme={{ colors: { secondaryContainer: theme.colors.primaryContainer, onSecondaryContainer: theme.colors.onPrimaryContainer } }}
            />
        </View>

        {/* İçerik Gövdesi - Tipe Göre Değişir */}
        <View style={styles.body}>
            {/* SOL TARAF */}
            <View style={{ flex: 1, marginRight: 12 }}>
                {item.type === 'rate' ? (
                    <>
                        <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginBottom: 8 }}>Mesai Oranı</Text>
                        <View style={styles.chipContainer}>
                        {PRESET_PERCENTAGES.map((pct) => (
                            <TouchableOpacity
                            key={pct}
                            onPress={() => handlePercentageChange(pct)}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: item.percentage === pct ? theme.colors.primary : theme.colors.surfaceVariant,
                                    borderColor: item.percentage === pct ? theme.colors.primary : theme.colors.outline
                                }
                            ]}
                            >
                                <Text style={{
                                    fontSize: 12, fontWeight: '600',
                                    color: item.percentage === pct ? theme.colors.onPrimary : theme.colors.onSurface
                                }}>%{pct}</Text>
                            </TouchableOpacity>
                        ))}
                        </View>
                        <Text variant="labelSmall" style={{ color: theme.colors.secondary, marginTop: 6 }}>
                            Saatlik: {formatCurrency(calculatedUnit)}
                        </Text>
                    </>
                ) : (
                    <>
                        <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginBottom: 4 }}>Birim Tutar (Günlük/Sefer)</Text>
                        <TextInput
                            mode="outlined"
                            keyboardType="numeric"
                            value={item.manualRate?.toString() || ''}
                            onChangeText={(t) => onUpdate(item.id, 'manualRate', parseNumber(t))}
                            style={{ height: 40, backgroundColor: theme.colors.surface }}
                            contentStyle={{ paddingVertical: 0 }}
                            right={<TextInput.Icon icon="currency-try" />}
                            placeholder="0"
                        />
                    </>
                )}
            </View>

            {/* SAĞ TARAF: Stepper */}
            <View>
                <StepperInput
                    label={item.type === 'rate' ? "Süre" : "Adet / Gün"}
                    value={item.hours}
                    onChange={(val) => onUpdate(item.id, 'hours', val)}
                    suffix={item.type === 'rate' ? 'sa' : ''}
                />
            </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.colors.outline }]}>
            <View>
                <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                    {item.type === 'rate' ? 'Hesaplanan Tutar' : 'Ara Toplam'}
                </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    {formatCurrency(totalEarn)}
                </Text>
            </View>
        </View>

      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    titleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    titleInput: { flex: 1, backgroundColor: 'transparent', height: 40, padding: 0, fontSize: 16, fontWeight: '600', marginLeft: -6 },
    indicator: { width: 4, height: 24, borderRadius: 2, marginRight: 8 },
    body: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
        paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
        minWidth: 40, alignItems: 'center', justifyContent: 'center'
    },
    footer: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});