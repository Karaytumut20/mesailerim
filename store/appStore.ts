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
  editLog: (id: string, updatedLog: Partial<DailyLog>) => void; // <-- YENİ
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  clearAllData: () => void;
}

const defaultSettings: AppSettings = {
  targetMonthlySalary: '17002',
  hourlyRate: '75.56',
  payDay: 1,
  currencySymbol: '₺',
  workDaysPerWeek: '5',
  workStart: '09:00',
  workEnd: '18:00'
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
          ...state.logs.filter(l => l.date !== newLog.date)
        ].sort((a, b) => b.timestamp - a.timestamp)
      })),

      removeLog: (id) => set((state) => ({ logs: state.logs.filter(l => l.id !== id) })),

      // YENİ: Var olan kaydı güncelle
      editLog: (id, updatedLog) => set((state) => ({
        logs: state.logs.map(log => log.id === id ? { ...log, ...updatedLog } : log)
                  .sort((a, b) => b.timestamp - a.timestamp)
      })),

      settings: defaultSettings,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      clearAllData: () => set({ logs: [] })
    }),
    {
      name: 'mesailerim-pro-v13',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);