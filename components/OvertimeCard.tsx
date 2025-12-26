import React from 'react';
import { View } from 'react-native';
import { Card, TextInput, IconButton, Chip, useTheme } from 'react-native-paper';
import { OvertimeItem } from '../types';
import { parseNumber } from '../utils/formatters';

interface Props {
  item: OvertimeItem;
  baseRate: number;
  onUpdate: (id: string, field: keyof OvertimeItem, value: any) => void;
  onDelete: (id: string) => void;
}

const PRESET_PERCENTAGES = [25, 50, 100, 200];

export const OvertimeCard: React.FC<Props> = ({ item, baseRate, onUpdate, onDelete }) => {
  const theme = useTheme();

  const calculatedRate = item.isOverride && item.manualRate
    ? item.manualRate
    : baseRate * (1 + item.percentage / 100);

  return (
    <Card style={{ marginBottom: 12, backgroundColor: theme.colors.elevation.level1 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TextInput
            mode="outlined"
            label="Kategori Adı"
            value={item.title}
            onChangeText={(t) => onUpdate(item.id, 'title', t)}
            style={{ flex: 1, height: 40, fontSize: 14 }}
            dense
          />
          <IconButton icon="trash-can-outline" iconColor={theme.colors.error} onPress={() => onDelete(item.id)} />
        </View>

        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
          {PRESET_PERCENTAGES.map((pct) => (
            <Chip
              key={pct}
              selected={!item.isOverride && item.percentage === pct}
              onPress={() => onUpdate(item.id, 'percentage', pct)}
              showSelectedOverlay
              compact
            >
              %{pct}
            </Chip>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            mode="outlined"
            label="Saat"
            keyboardType="numeric"
            value={item.hours === 0 ? '' : item.hours.toString()}
            onChangeText={(t) => onUpdate(item.id, 'hours', parseNumber(t))}
            style={{ flex: 1, backgroundColor: 'transparent' }}
          />
          <TextInput
            mode="outlined"
            label={item.isOverride ? "Özel" : "Tutar"}
            keyboardType="numeric"
            value={calculatedRate.toFixed(2)}
            onChangeText={(t) => onUpdate(item.id, 'manualRate', parseNumber(t))}
            style={{ flex: 1, backgroundColor: item.isOverride ? theme.colors.secondaryContainer : 'transparent' }}
            right={
              item.isOverride ? (
                <TextInput.Icon icon="lock-reset" onPress={() => onUpdate(item.id, 'isOverride', false)} />
              ) : ( <TextInput.Icon icon="calculator" /> )
            }
          />
        </View>
      </Card.Content>
    </Card>
  );
};