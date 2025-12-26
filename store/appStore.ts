import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLog, AppSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  logs: DailyLog[];
  addLog: (log: Omit<DailyLog, 'id' | 'timestamp'>) => void;
  removeLog: (id: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  clearAllData: () => void;
}

const defaultSettings: AppSettings = {
  targetMonthlySalary: '17002', // Referans Asgari Ücret
  hourlyRate: '75.56',          // Hesaplama Ücreti (17002 / 225)
  payDay: 1,
  currencySymbol: '₺',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      logs: [],
      addLog: (newLog) => set((state) => ({
        logs: [
          { ...newLog, id: uuidv4(), timestamp: Date.now() },
          ...state.logs.filter(l => l.date !== newLog.date) // Aynı günü ez
        ].sort((a, b) => b.timestamp - a.timestamp)
      })),

      removeLog: (id) => set((state) => ({ logs: state.logs.filter(l => l.id !== id) })),

      settings: defaultSettings,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      clearAllData: () => set({ logs: [] })
    }),
    {
      name: 'mesailerim-pro-v8',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);