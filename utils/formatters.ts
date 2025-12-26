export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const parseNumber = (text: string) => {
  if (!text) return 0;
  const cleanText = text.toString().replace(',', '.');
  const num = parseFloat(cleanText);
  return isNaN(num) ? 0 : num;
};