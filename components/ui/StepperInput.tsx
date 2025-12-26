import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  step?: number;
}

export const StepperInput: React.FC<Props> = ({ value, onChange, label, step = 1 }) => {
  const theme = useTheme();
  const handlePress = (direction: 'up' | 'down') => {
    if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = direction === 'up' ? value + step : value - step;
    if (newValue >= 0) onChange(newValue);
  };

  return (
    <View style={styles.container}>
      {label && <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>{label}</Text>}
      <View style={[styles.controls, { backgroundColor: theme.colors.surfaceVariant }]}>
        <TouchableOpacity onPress={() => handlePress('down')} style={styles.btn}>
          <MaterialIcons name="remove" size={20} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.valueContainer}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{value}</Text>
            <Text variant="bodySmall" style={{ opacity: 0.6 }}>saat</Text>
        </View>
        <TouchableOpacity onPress={() => handlePress('up')} style={styles.btn}>
          <MaterialIcons name="add" size={20} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 4 },
  btn: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
  valueContainer: { minWidth: 50, alignItems: 'center', paddingHorizontal: 8 }
});