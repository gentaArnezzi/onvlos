export function getCurrencySymbol(currency: string | null | undefined): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'IDR': 'Rp',
    'SGD': 'S$',
    'AUD': 'A$',
    'JPY': '¥',
    'CNY': '¥',
    'MYR': 'RM',
    'THB': '฿',
    'PHP': '₱',
    'VND': '₫',
    'INR': '₹',
    'KRW': '₩',
    'HKD': 'HK$',
    'CAD': 'C$',
    'NZD': 'NZ$',
    'CHF': 'CHF',
    'AED': 'د.إ',
  };
  return symbols[currency || 'USD'] || currency || '$';
}

