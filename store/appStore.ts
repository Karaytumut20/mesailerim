import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryRecord, AppSettings } from '../types';

interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  history: HistoryRecord[];
  addToHistory: (record: HistoryRecord) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  defaultHourlyRate: '',
  defaultWorkHours: '225',
  currencySymbol: '₺',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      history: [],
      addToHistory: (record) => set((state) => ({ history: [record, ...state.history] })),
      removeFromHistory: (id) => set((state) => ({ history: state.history.filter(h => h.id !== id) })),
      clearHistory: () => set({ history: [] }),
      settings: defaultSettings,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'mesailerim-storage-v5', // Yapı değiştiği için versiyonu artırdık
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);