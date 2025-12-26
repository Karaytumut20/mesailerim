import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryRecord } from '../types';

interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  history: HistoryRecord[];
  addToHistory: (record: HistoryRecord) => void;
  clearHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      history: [],
      addToHistory: (record) => set((state) => ({ history: [record, ...state.history] })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'mesailerim-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);