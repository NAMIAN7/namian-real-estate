import { normalizeText } from './search';

function toNumber(str: string): number | null {
  let s = str.replace(/٫/g, '.');
  if (s.includes(',')) {
    // "1,500" (thousands separator) vs "2,5" (decimal comma)
    if (/^\d{1,3}(,\d{3})+$/.test(s)) {
      s = s.replace(/,/g, '');
    } else {
      s = s.replace(/,/g, '.');
    }
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Converts the price text of a property to a number in billions of tomans.
 * "2.200 میلیارد تومان" -> 2.2, "600 میلیون تومان" -> 0.6, "11 میلیارد" -> 11.
 * Returns null when no sale price can be read (rent/mortgage, "توافقی", empty...).
 */
export function parsePriceToBillions(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null;
  const text = normalizeText(raw as string | number);
  if (!text) return null;

  // Rent / mortgage listings have two numbers and are handled separately later
  if (text.includes('رهن') || text.includes('اجاره')) return null;

  const re = /(\d+(?:[.,٫]\d+)*)\s*(میلیارد|میلیون)/g;
  let total = 0;
  let found = false;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const num = toNumber(m[1]);
    if (num === null) continue;
    total += m[2] === 'میلیارد' ? num : num / 1000;
    found = true;
  }
  if (found) return round3(total);

  // Plain toman number, e.g. "2,300,000,000"
  const plain = text.replace(/[,،٫.\s]/g, '').match(/\d{7,}/);
  if (plain) return round3(parseInt(plain[0], 10) / 1e9);

  return null;
}

/**
 * Reads what the user typed in the "from" / "to" boxes (Persian or English digits).
 * Empty or invalid input returns null (= no limit).
 */
export function parseFilterNumber(value: string): number | null {
  if (!value || !value.trim()) return null;
  const s = normalizeText(value).replace(/[,،٫]/g, '.');
  const n = parseFloat(s);
  return isNaN(n) || n < 0 ? null : n;
}
