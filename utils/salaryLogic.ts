import { DailyLog, AppSettings } from '../types';

export const calculateCycleTotals = (logs: DailyLog[], settings: AppSettings) => {
  // Direkt ayardan gelen saatlik ücreti kullanıyoruz.
  const rate = parseFloat(settings.hourlyRate.replace(',', '.')) || 0;

  let totalNormalHours = 0;
  let totalOvertimeHours = 0;
  let totalOvertimePay = 0;
  let totalExtras = 0;

  logs.forEach(log => {
    totalNormalHours += log.normalHours;
    totalOvertimeHours += log.overtimeHours;
    totalExtras += log.extras;

    // Mesai Hesabı: Saatlik Ücret * Saat * Katsayı
    const multiplier = 1 + (log.overtimeRate / 100);
    totalOvertimePay += (log.overtimeHours * rate * multiplier);
  });

  // Baz Kazanç: (Toplam Normal Çalışma Saati) * (Saatlik Ücret)
  const basePay = totalNormalHours * rate;

  return {
    totalNormalHours,
    totalOvertimeHours,
    totalOvertimePay,
    totalExtras,
    basePay,
    grandTotal: basePay + totalOvertimePay + totalExtras
  };
};