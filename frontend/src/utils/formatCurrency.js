export function formatCurrency(amount) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numericAmount);
}
