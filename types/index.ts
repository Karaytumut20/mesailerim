export type WorkType = 'normal' | 'off' | 'holiday';

export interface DailyLog {
  id: string;
  date: string;
  type: WorkType;
  normalHours: number;
  overtimeHours: number;
  overtimeRate: number;
  extras: number;
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
  targetMonthlySalary: string;
  hourlyRate: string;
  payDay: number;
  currencySymbol: string;
  // YENİ ALANLAR
  workDaysPerWeek: string; // "5", "6" vs.
  workStart: string; // "09:00"
  workEnd: string;   // "18:00"
}