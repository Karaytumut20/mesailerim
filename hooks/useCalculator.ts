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

  // Varsayılanlar: Biri Mesai, Biri Günlük örnek
  const [overtimeItems, setOvertimeItems] = useState<OvertimeItem[]>([
    { id: '1', type: 'rate', title: 'Mesai (%50)', hours: 0, percentage: 50, isOverride: false },
    { id: '2', type: 'fixed', title: 'Yol / Yemek', hours: 0, percentage: 0, manualRate: 0, isOverride: true },
  ]);

  const addCategory = () => {
    setOvertimeItems([
      ...overtimeItems,
      // Varsayılan olarak saatlik mesai ekle
      { id: uuidv4(), type: 'rate', title: 'Yeni Mesai', hours: 0, percentage: 50, isOverride: false }
    ]);
  };

  const removeCategory = (id: string) => {
    setOvertimeItems(overtimeItems.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof OvertimeItem, value: any) => {
    setOvertimeItems(prev => prev.map(item => {
      if (item.id !== id) return item;

      // Tip değişirse bazı alanları sıfırla
      if (field === 'type') {
        return {
            ...item,
            type: value,
            percentage: value === 'rate' ? 50 : 0,
            manualRate: value === 'fixed' ? 0 : undefined,
            isOverride: value === 'fixed'
        };
      }

      return { ...item, [field]: value };
    }));
  };

  const results: CalculationResult = useMemo(() => {
    const rate = parseFloat(hourlyRate.toString().replace(',', '.')) || 0;
    const normHours = parseFloat(normalHours.toString().replace(',', '.')) || 0;
    const deduc = parseFloat(deductions.toString().replace(',', '.')) || 0;

    let totalOvertimePay = 0;

    overtimeItems.forEach(item => {
      let itemTotal = 0;

      if (item.type === 'fixed') {
        // Sabit Tutar Modu: Adet * Birim Fiyat
        const unitPrice = item.manualRate || 0;
        itemTotal = item.hours * unitPrice;
      } else {
        // Mesai Modu: Saat * Saatlik Ücret * Katsayı
        const multiplier = (1 + item.percentage / 100);
        itemTotal = item.hours * rate * multiplier;
      }

      totalOvertimePay += itemTotal;
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