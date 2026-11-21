import { normalizeText } from './search';

function toNumber(str: string): number | null {
  let s = str.replace(/Ù«/g, '.');
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
 * Decides what a word after a number means.
 * Tolerates spelling variants such as "Ù…Ù„ÛŒÙˆÙ†", "Ù…ÛŒÙ„ÛŒÙˆÙ†ÛŒ", "Ù…ÛŒÙ„ÛŒØ§Ø±Ø¯", "Ù…Ù„ÛŒØ§Ø±Ø¯".
 */
function unitOf(word: string): 'billion' | 'million' | null {
  const w = word.replace(/[ÙŠ]/g, 'ÛŒ');
  if (/^(Ù…ÛŒÙ„ÛŒØ§Ø±|Ù…Ù„ÛŒØ§Ø±|Ø¨ÛŒÙ„ÛŒÙˆÙ†)/.test(w)) return 'billion';
  if (/^(Ù…ÛŒÙ„ÛŒÙˆÙ†|Ù…Ù„ÛŒÙˆÙ†|Ù…ÛŒÙ„ÛŒÙˆ|Ù…Ù„ÛŒÙˆ|Ù…ÛŒÙ„ÙˆÙ†|Ù…Ù„ÙˆÙ†)/.test(w)) return 'million';
  return null;
}

/**
 * Converts the price text of a property to a number in billions of tomans.
 * "2.200 Ù…ÛŒÙ„ÛŒØ§Ø±Ø¯ ØªÙˆÙ…Ø§Ù†" -> 2.2, "650Ù…ÛŒÙ„ÛŒÙˆÙ† ØªÙˆÙ…Ø§Ù†" -> 0.65, "11 Ù…ÛŒÙ„ÛŒØ§Ø±Ø¯" -> 11.
 * If no unit is written: 100 to 99999 is read as millions (650 -> 0.65),
 * smaller numbers or numbers with decimals as billions (2.5 -> 2.5, 11 -> 11).
 * Returns null when no sale price can be read (rent/mortgage, "ØªÙˆØ§ÙÙ‚ÛŒ", empty...).
 */
export function parsePriceToBillions(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null;
  const text = normalizeText(raw as string | number);
  if (!text) return null;

  // Rent / mortgage listings have two numbers and are handled separately later
  if (text.includes('Ø±Ù‡Ù†') || text.includes('Ø§Ø¬Ø§Ø±Ù‡')) return null;

  // 1. Number followed by a unit word (sums "2 Ù…ÛŒÙ„ÛŒØ§Ø±Ø¯ Ùˆ 500 Ù…ÛŒÙ„ÛŒÙˆÙ†")
  const re = /(\d+(?:[.,Ù«]\d+)*)\s*([^\d\s.,Ù«ØŒ]+)/g;
  let total = 0;
  let found = false;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const unit = unitOf(m[2]);
    if (!unit) continue;
    const num = toNumber(m[1]);
    if (num === null) continue;
    total += unit === 'billion' ? num : num / 1000;
    found = true;
  }
  if (found) return round3(total);

  // 2. Plain toman number, e.g. "2,300,000,000"
  const plain = text.replace(/[,ØŒÙ«.\s]/g, '').match(/\d{7,}/);
  if (plain) return round3(parseInt(plain[0], 10) / 1e9);

  // 3. Number without any unit
  const first = text.match(/\d+(?:[.,Ù«]\d+)*/);
  if (first) {
    const n = toNumber(first[0]);
    if (n !== null) {
      const hasFraction = /[.,Ù«]\d/.test(first[0]);
      if (!hasFraction && n >= 100 && n < 100000) return round3(n / 1000);
      if (n < 100 || hasFraction) return round3(n);
    }
  }

  return null;
}

/**
 * Reads what the user typed in the "from" / "to" boxes (Persian or English digits).
 * Empty or invalid input returns null (= no limit).
 */
export function parseFilterNumber(value: string): number | null {
  if (!value || !value.trim()) return null;
  const s = normalizeText(value).replace(/[,ØŒÙ«]/g, '.');
  const n = parseFloat(s);
  return isNaN(n) || n < 0 ? null : n;
}
