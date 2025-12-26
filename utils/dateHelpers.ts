import { CycleInfo } from '../types';

export const getPayCycle = (payDay: number): CycleInfo => {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let startDate = new Date(currentYear, currentMonth, payDay);
  let endDate = new Date(currentYear, currentMonth + 1, payDay - 1);

  // Eğer bugün maaş gününden önceyse, döngü geçen ayın maaş gününde başlamıştır.
  // Örn: Maaş günü 15'i, bugün ayın 10'u ise -> Başlangıç geçen ayın 15'idir.
  if (currentDay < payDay) {
    startDate = new Date(currentYear, currentMonth - 1, payDay);
    endDate = new Date(currentYear, currentMonth, payDay - 1);
  }

  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);

  // Maaşa kalan gün
  const diffTime = Math.abs(endDate.getTime() - now.getTime());
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    daysLeft,
    progress
  };
};

export const isDateInCycle = (dateStr: string, cycle: CycleInfo): boolean => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const start = new Date(cycle.startDate);
  const end = new Date(cycle.endDate);

  // Saat farklarını yoksaymak için sadece tarih karşılaştırması (setHours ile sıfırlanabilir ama basitlik için böyle bırakıyoruz)
  return d >= start && d <= end;
};