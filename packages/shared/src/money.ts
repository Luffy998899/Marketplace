// Money is always represented in integer minor units (e.g. cents) to avoid
// floating point drift. Never store or compute money as a float.

export interface Money {
  amountMinor: number;
  currency: string;
}

const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'VND', 'CLP']);

export function minorPerUnit(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 1 : 100;
}

export function toMinor(major: number, currency = 'USD'): number {
  return Math.round(major * minorPerUnit(currency));
}

export function fromMinor(amountMinor: number, currency = 'USD'): number {
  return amountMinor / minorPerUnit(currency);
}

export function formatMoney(amountMinor: number, currency = 'USD', locale = 'en-US'): string {
  const value = fromMinor(amountMinor, currency);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

/**
 * Split an amount into the platform commission and the seller's net using a
 * take-rate expressed in basis points (1% = 100 bps). The platform absorbs any
 * rounding remainder so the two parts always sum to the original amount.
 */
export function splitByTakeRate(
  amountMinor: number,
  takeRateBps: number,
): { commissionMinor: number; sellerNetMinor: number } {
  const commissionMinor = Math.round((amountMinor * takeRateBps) / 10_000);
  return { commissionMinor, sellerNetMinor: amountMinor - commissionMinor };
}
