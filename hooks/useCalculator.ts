import { useState, useMemo, useEffect } from 'react';
import { OvertimeItem, CalculationResult } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '../store/appStore';
import 'react-native-get-random-values';

export const useCalculator = () => {
  const defaultHourlyRate = useAppStore((state) => state.settings.defaultHourlyRate);
  const [hourlyRate, setHourlyRate] = useState<string>(defaultHourlyRate);
  const [normalHours, setNormalHours] = useState<string>('');
  const [deductions, setDeductions] = useState<string>('');

  useEffect(() => {
    if (defaultHourlyRate) {
        setHourlyRate(defaultHourlyRate);
    }
  }, [defaultHourlyRate]);

  const [overtimeItems, setOvertimeItems] = useState<OvertimeItem[]>([
    { id: '1', title: 'Hafta İçi (%50)', hours: 0, percentage: 50, isOverride: false },
    { id: '2', title: 'Hafta Sonu (%100)', hours: 0, percentage: 100, isOverride: false },
  ]);

  const addCategory = () => {
    setOvertimeItems([
      ...overtimeItems,
      { id: uuidv4(), title: 'Ek Mesai', hours: 0, percentage: 50, isOverride: false }
    ]);
  };

  const removeCategory = (id: string) => {
    setOvertimeItems(overtimeItems.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof OvertimeItem, value: any) => {
    setOvertimeItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (field === 'manualRate') return { ...item, manualRate: value, isOverride: true };
      if (field === 'percentage') return { ...item, percentage: value, isOverride: false, manualRate: undefined };
      if (field === 'isOverride' && value === false) return { ...item, isOverride: false, manualRate: undefined };
      return { ...item, [field]: value };
    }));
  };

  const results: CalculationResult = useMemo(() => {
    const rate = parseFloat(hourlyRate.toString().replace(',', '.')) || 0;
    const normHours = parseFloat(normalHours.toString().replace(',', '.')) || 0;
    const deduc = parseFloat(deductions.toString().replace(',', '.')) || 0;
    let totalOvertimePay = 0;

    overtimeItems.forEach(item => {
      let effectiveHourlyPay = 0;
      if (item.isOverride && item.manualRate !== undefined) {
        effectiveHourlyPay = item.manualRate;
      } else {
        effectiveHourlyPay = rate * (1 + item.percentage / 100);
      }
      totalOvertimePay += (item.hours * effectiveHourlyPay);
    });

    const baseSalary = normHours * rate;
    const grossTotal = baseSalary + totalOvertimePay;
    const netTotal = grossTotal - deduc;

    return {
      baseSalary, overtimeSalary: totalOvertimePay, grossTotal, deductions: deduc, netTotal: netTotal > 0 ? netTotal : 0
    };
  }, [hourlyRate, normalHours, deductions, overtimeItems]);

  return {
    hourlyRate, setHourlyRate, normalHours, setNormalHours, deductions, setDeductions,
    overtimeItems, addCategory, removeCategory, updateItem, results
  };
};