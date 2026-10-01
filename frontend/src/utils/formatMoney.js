export const formatMoney = (amountInIdr, settings) => {
  if (amountInIdr === undefined || amountInIdr === null) return '---';
  
  const currency = settings?.currency || 'IDR';
  const exchangeRate = settings?.exchangeRate || 16000;
  
  if (currency === 'USD') {
    const amountUsd = amountInIdr / exchangeRate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountUsd);
  }

  // Default IDR
  const isNegative = amountInIdr < 0;
  const absAmount = Math.abs(amountInIdr);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount).replace(/,00$/, '').replace(/IDR\s?|Rp\s?/, '').trim();
  
  return `${isNegative ? '-' : ''}Rp ${formatted}`;
};
