import React from 'react';
import { FlatList, View } from 'react-native';
import { List, Text, useTheme, IconButton } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function HistoryScreen() {
  const { history, clearHistory } = useAppStore();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="titleMedium">Son Hesaplamalar</Text>
        <IconButton icon="delete-sweep" onPress={clearHistory} />
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={`Net: ${formatCurrency(item.result.netTotal)}`}
            description={format(new Date(item.date), 'dd MMMM HH:mm', { locale: tr })}
            left={props => <List.Icon {...props} icon="file-document-outline" />}
            right={() => (
                <View style={{ justifyContent: 'center' }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.primary }}>+${formatCurrency(item.result.overtimeSalary)} Mesai</Text>
                </View>
            )}
            style={{ backgroundColor: theme.colors.surface, marginBottom: 1 }}
          />
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, opacity: 0.5 }}>Henüz kayıt yok.</Text>}
      />
    </View>
  );
}