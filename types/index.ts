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
  date: string; // ISO string
  result: CalculationResult;
  hourlyRate: number;
  note?: string;
}