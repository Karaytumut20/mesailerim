import React from 'react';
import { FlatList, View } from 'react-native';
import { Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function HistoryScreen() {
  const { history, removeFromHistory } = useAppStore();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 20, paddingTop: 60, paddingBottom: 10 }}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Geçmiş Kayıtlar</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
              <Surface style={{
                  marginBottom: 12,
                  borderRadius: 16,
                  backgroundColor: theme.colors.surface,
                  padding: 16,
                  elevation: 1,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.primary
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                            +{formatCurrency(item.result.overtimeSalary)}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginTop: 4 }}>
                            {format(new Date(item.date), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                        </Text>
                    </View>
                    <IconButton
                        icon="trash-can-outline"
                        size={20}
                        iconColor={theme.colors.error}
                        onPress={() => removeFromHistory(item.id)}
                        style={{ margin: 0, marginTop: -8, marginRight: -8, opacity: 0.7 }}
                    />
                </View>

                {item.overtimeItems && item.overtimeItems.length > 0 && (
                    <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {item.overtimeItems.map((detail, idx) => (
                            <View key={idx} style={{ backgroundColor: theme.colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                <Text variant="labelSmall" style={{color: theme.colors.onSurface}}>{detail.title}: <Text style={{fontWeight:'bold'}}>{detail.hours}s</Text> (%{detail.percentage})</Text>
                            </View>
                        ))}
                    </View>
                )}
              </Surface>
          </Animated.View>
        )}
        ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 100 }}>
                <Text variant="bodyLarge" style={{ opacity: 0.5, color: theme.colors.secondary }}>Henüz kayıt bulunmuyor.</Text>
            </View>
        }
      />
    </View>
  );
}