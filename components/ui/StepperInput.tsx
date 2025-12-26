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
  suffix?: string;
}

export const StepperInput: React.FC<Props> = ({ value, onChange, label, step = 1, suffix }) => {
  const theme = useTheme();
  const handlePress = (direction: 'up' | 'down') => {
    if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = direction === 'up' ? value + step : value - step;
    if (newValue >= 0) onChange(newValue);
  };

  return (
    <View style={styles.container}>
      {label && <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginBottom: 6 }}>{label}</Text>}
      <View style={[styles.controls, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline, borderWidth: 1 }]}>
        <TouchableOpacity onPress={() => handlePress('down')} style={styles.btn}>
          <MaterialIcons name="remove" size={20} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.valueContainer}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                {value} <Text style={{fontSize: 12, fontWeight: 'normal', color: theme.colors.secondary}}>{suffix}</Text>
            </Text>
        </View>
        <TouchableOpacity onPress={() => handlePress('up')} style={styles.btn}>
          <MaterialIcons name="add" size={20} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { alignItems: 'flex-end' },
  controls: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 2 },
  btn: { padding: 8, borderRadius: 10, backgroundColor: 'transparent' },
  valueContainer: { minWidth: 40, alignItems: 'center', paddingHorizontal: 4 }
});