import React, { useState } from 'react';
import { FlatList, View, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { useAppStore } from '@/store/appStore';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { EditLogModal } from '@/components/EditLogModal'; // <-- Import edildi
import { DailyLog } from '@/types';

export default function HistoryScreen() {
  const { logs } = useAppStore();
  const theme = useTheme();

  // Edit State
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleEditPress = (log: DailyLog) => {
    setSelectedLog(log);
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 20, paddingTop: 60, backgroundColor: theme.colors.surface }}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Hareket Geçmişi</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>Düzenlemek için kayda tıklayın</Text>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleEditPress(item)}>
              <Surface style={{
                  marginBottom: 12,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: theme.colors.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  elevation: 1
              }}>
                <View style={{ width: 50, alignItems: 'center', marginRight: 12 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme.colors.primary }}>{new Date(item.date).getDate()}</Text>
                    <Text style={{ fontSize: 12, color: theme.colors.secondary, textTransform: 'uppercase' }}>{format(new Date(item.date), 'MMM', {locale:tr})}</Text>
                </View>

                <View style={{ flex: 1 }}>
                    <Text variant="titleSmall" style={{ fontWeight: '600' }}>
                        {item.overtimeHours > 0 ? 'Mesaili Gün' : 'Normal Çalışma'}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                        {item.normalHours}s Normal {item.overtimeHours > 0 ? `+ ${item.overtimeHours}s (% ${item.overtimeRate})` : ''}
                    </Text>
                </View>

                <IconButton icon="pencil-outline" size={20} iconColor={theme.colors.secondary} />
              </Surface>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 50, opacity: 0.5 }}>Henüz kayıt bulunmuyor.</Text>
        }
      />

      {/* DÜZENLEME MODALI */}
      <EditLogModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        log={selectedLog}
      />
    </View>
  );
}