import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  title: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color?: string;
  trend?: string;
}

export const StatCard: React.FC<Props> = ({ title, value, icon, color, trend }) => {
  const theme = useTheme();
  const iconColor = color || theme.colors.primary;
  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor + '15' }]}>
            <MaterialIcons name={icon} size={22} color={iconColor} />
        </View>
        {trend && <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{trend}</Text>}
      </View>
      <View style={styles.content}>
        <Text variant="bodyMedium" style={{ color: theme.colors.secondary, marginBottom: 2 }}>{title}</Text>
        <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{value}</Text>
      </View>
    </Surface>
  );
};
const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, padding: 16, minWidth: '45%' },
  iconContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  content: { gap: 2 }
});