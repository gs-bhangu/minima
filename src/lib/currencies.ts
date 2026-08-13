import type { CurrencyEntry } from './types';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

/** Common ISO codes for the picker — Frankfurter covers many more via typed codes. */
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
  { code: 'VND', name: 'Vietnamese Đồng', symbol: '₫' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
];

const byCode = new Map(CURRENCIES.map((entry) => [entry.code, entry]));

export function normalizeCode(input: string) {
  return input.trim().toUpperCase();
}

export function isCurrencyCode(code: string) {
  return /^[A-Z]{3}$/.test(code);
}

export function currencyInfo(code: string): CurrencyInfo {
  const normalized = normalizeCode(code);
  return byCode.get(normalized) ?? { code: normalized, name: normalized, symbol: normalized };
}

export function labelFor(code: string) {
  const info = currencyInfo(code);
  return info.name === info.code ? info.code : `${info.code} — ${info.name}`;
}

export function makeQuote(code: string): CurrencyEntry {
  return { id: crypto.randomUUID(), code: normalizeCode(code) };
}

/** Format a rate so small FX pairs stay readable and large ones stay compact. */
export function formatRate(rate: number) {
  if (!Number.isFinite(rate) || rate <= 0) return '—';
  if (rate >= 1000) {
    return rate.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  if (rate >= 100) {
    return rate.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }
  if (rate >= 1) {
    return rate.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return rate.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function resolveCurrency(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  const exact = normalizeCode(value);
  if (isCurrencyCode(exact)) return exact;
  const needle = value.toLowerCase();
  return (
    CURRENCIES.find((entry) => entry.name.toLowerCase() === needle)?.code ??
    CURRENCIES.find((entry) => entry.name.toLowerCase().includes(needle))?.code ??
    null
  );
}
