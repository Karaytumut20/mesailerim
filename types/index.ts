export type ItemType = 'rate' | 'fixed'; // rate: Saatlik/Yüzdeli, fixed: Günlük/Sabit Tutar

export interface OvertimeItem {
  id: string;
  type: ItemType;
  title: string;
  hours: number; // type='fixed' ise bu 'adet/gün' olur
  percentage: number; // Sadece type='rate' için
  manualRate?: number; // Sadece type='fixed' için birim fiyat
  isOverride: boolean;
}

export interface CalculationResult {
  baseSalary: number;
  overtimeSalary: number;
  grossTotal: number;
  deductions: number;
  netTotal: number;
}

export interface HistoryRecord {
  id: string;
  date: string;
  result: CalculationResult;
  hourlyRate: number;
  overtimeItems: OvertimeItem[];
  note?: string;
}

export interface AppSettings {
  defaultHourlyRate: string;
  defaultWorkHours: string;
  currencySymbol: string;
}