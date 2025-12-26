export type WorkType = 'normal' | 'off' | 'holiday';

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  type: WorkType;
  normalHours: number;
  overtimeHours: number;
  overtimeRate: number; // 25, 50, 100 vs
  extras: number; // Nakit ekstralar (Yol/Yemek)
  note?: string;
  timestamp: number;
}

export interface CycleInfo {
  startDate: string;
  endDate: string;
  daysLeft: number;
  progress: number;
}

export interface AppSettings {
  targetMonthlySalary: string; // Sadece GÖSTERİM (Referans) için
  hourlyRate: string;          // Sadece HESAPLAMA için
  payDay: number;
  currencySymbol: string;
}