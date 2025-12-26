import React from 'react';
import { FlatList, View } from 'react-native';
import { List, Text, useTheme, IconButton, Divider } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function HistoryScreen() {
  const { logs, removeLog } = useAppStore();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 20, paddingTop: 60 }}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Tüm Kayıtlar</Text>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.normalHours}s Normal + ${item.overtimeHours}s Mesai`}
            description={format(new Date(item.date), 'dd MMMM yyyy, EEEE', { locale: tr })}
            left={props => <List.Icon {...props} icon="calendar-check" color={theme.colors.primary} />}
            right={props => (
                <IconButton {...props} icon="delete-outline" iconColor={theme.colors.error} onPress={() => removeLog(item.id)} />
            )}
            style={{ backgroundColor: theme.colors.surface }}
          />
        )}
        ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 50, opacity: 0.5 }}>Henüz kayıt bulunmuyor.</Text>
        }
      />
    </View>
  );
}