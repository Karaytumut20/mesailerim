import React from 'react';
import { View } from 'react-native';
import { Card, Text, Chip, useTheme, IconButton } from 'react-native-paper';
import { OvertimeItem } from '../types';
import { StepperInput } from './ui/StepperInput';
import { formatCurrency } from '../utils/formatters';

interface Props {
  item: OvertimeItem;
  baseRate: number;
  onUpdate: (id: string, field: keyof OvertimeItem, value: any) => void;
  onDelete: (id: string) => void;
}

const PRESET_PERCENTAGES = [50, 100];

export const OvertimeCard: React.FC<Props> = ({ item, baseRate, onUpdate, onDelete }) => {
  const theme = useTheme();

  const calculatedRate = item.isOverride && item.manualRate
    ? item.manualRate
    : baseRate * (1 + item.percentage / 100);

  const totalEarn = item.hours * calculatedRate;

  return (
    <Card style={{ marginBottom: 12, backgroundColor: theme.colors.surface, borderRadius: 16 }} mode="elevated" elevation={1}>
      <Card.Content>
        {/* Header: Başlık ve Sil Butonu */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
             <View style={{ width: 4, height: 24, backgroundColor: theme.colors.primary, borderRadius: 2 }} />
             <Text variant="titleMedium" style={{ fontWeight: '600' }}>{item.title}</Text>
          </View>
          <IconButton icon="close" size={18} onPress={() => onDelete(item.id)} style={{ margin: 0 }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Sol Taraf: Yüzde Seçimi */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {PRESET_PERCENTAGES.map((pct) => (
                <Chip
                  key={pct}
                  selected={!item.isOverride && item.percentage === pct}
                  onPress={() => onUpdate(item.id, 'percentage', pct)}
                  showSelectedOverlay
                  style={{ backgroundColor: !item.isOverride && item.percentage === pct ? theme.colors.primaryContainer : undefined }}
                  textStyle={{ fontSize: 11 }}
                  compact
                >
                  %{pct}
                </Chip>
              ))}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
              Birim: {formatCurrency(calculatedRate)} / saat
            </Text>
          </View>

          {/* Sağ Taraf: Hızlı Saat Girişi */}
          <StepperInput
            value={item.hours}
            onChange={(val) => onUpdate(item.id, 'hours', val)}
          />
        </View>

        {/* Footer: Toplam Tutar */}
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.outline, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.secondary }}>Bu Kalem Toplamı</Text>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {formatCurrency(totalEarn)}
            </Text>
        </View>

      </Card.Content>
    </Card>
  );
};