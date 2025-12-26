export interface OvertimeItem {
  id: string;
  title: string;
  hours: number;
  percentage: number;
  manualRate?: number;
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