import { PropertyFile } from '../types';

/**
 * Normalizes Persian and Arabic text and digits to standard English numbers and unified Persian characters.
 */
export function normalizeText(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  let text = String(str);

  // Replace Persian numbers ۰-۹
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  for (let i = 0; i < 10; i++) {
    text = text.replace(new RegExp(persianDigits[i], 'g'), String(i));
  }

  // Replace Arabic numbers ٠-٩
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  for (let i = 0; i < 10; i++) {
    text = text.replace(new RegExp(arabicDigits[i], 'g'), String(i));
  }

  // Normalize Arabic letters to Persian
  text = text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/[إأآ]/g, 'ا');

  // Replace zero-width non-joiner (\u200c) and extra whitespace with standard space
  text = text.replace(/\u200c/g, ' ');
  text = text.replace(/\s+/g, ' ').trim().toLowerCase();

  return text;
}

/**
 * Convert common Persian number words to digit string
 */
function wordToNumber(word: string): string {
  const map: Record<string, string> = {
    'یک': '1',
    'یك': '1',
    'دو': '2',
    'سه': '3',
    'چهار': '4',
    'پنج': '5',
    'شش': '6',
    'هفت': '7',
    'هشت': '8',
    'نه': '9',
    'ده': '10',
    'صد': '100'
  };
  return map[word] || word;
}

/**
 * Combines all searchable fields of a property into a normalized searchable string,
 * and also adds synthetic tags for area and bedrooms so queries like "100 متر" or "2 خواب" match reliably.
 */
export function getPropertySearchText(property: PropertyFile): string {
  const fields = [
    property.code,
    property.title,
    property.propertyType,
    property.category,
    property.region,
    property.address,
    property.price,
    property.width,
    property.floor,
    property.parking,
    property.storage,
    property.elevator,
    property.documentType,
    property.description,
    property.privateNote,
    property.area ? `${property.area} متر ${property.area}متر ${property.area}` : '',
    property.bedrooms ? `${property.bedrooms} خواب ${property.bedrooms}خواب ${property.bedrooms} خوابه` : ''
  ];

  // Combine all normalized fields
  const combined = fields.map(f => normalizeText(f)).join(' ');

  // Add numbers without commas/separators (e.g. "15,000,000" -> "15000000")
  const noCommas = combined.replace(/[,،]/g, '');

  return `${combined} ${noCommas}`;
}

/**
 * Checks if a property matches the user's search query intelligently.
 */
export function smartSearchMatch(property: PropertyFile, rawQuery: string): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;

  let query = normalizeText(rawQuery);

  // Replace Persian word numbers before keywords like خواب / خوابه / متر
  // e.g., "دو خواب" -> "2 خواب", "صد متر" -> "100 متر"
  query = query.replace(/(یک|دو|سه|چهار|پنج|شش|هفت|هشت|نه|ده|صد)\s*(خواب|خوابه|متر|متری)/g, (_, numWord, unit) => {
    return `${wordToNumber(numWord)} ${unit}`;
  });

  const propertyText = getPropertySearchText(property);

  // 1. First check if the entire normalized phrase matches directly
  if (propertyText.includes(query)) {
    return true;
  }

  // 2. Tokenize query into meaningful keywords
  // We treat combined expressions like "100 متر" or "2 خواب" as tokens if possible,
  // or check each individual token across the property text.
  const tokens = query.split(' ').filter(Boolean);

  if (tokens.length === 0) return true;

  // For multi-word queries (e.g., "رهن 80", "باغ 500 متر", "دو خوابه زعفرانیه"):
  // Every token (word) in the search query must be found somewhere in the property's combined searchable text
  // OR match specific numeric semantics.
  return tokens.every((token, index) => {
    // Check if token is directly in propertyText
    if (propertyText.includes(token)) {
      return true;
    }

    // Special check: if token is "خواب" or "خوابه" and previous token was a number matching bedrooms
    if ((token === 'خواب' || token === 'خوابه') && index > 0) {
      const prevNum = parseInt(tokens[index - 1], 10);
      if (!isNaN(prevNum) && property.bedrooms === prevNum) {
        return true;
      }
    }

    // Special check: if token is "متر" or "متری" and previous token was a number matching area
    if ((token === 'متر' || token === 'متری') && index > 0) {
      const prevNum = parseInt(tokens[index - 1], 10);
      if (!isNaN(prevNum) && property.area === prevNum) {
        return true;
      }
    }

    // Special check: strip commas from numeric token (e.g., "80,000" -> "80000")
    const cleanToken = token.replace(/[,،]/g, '');
    if (cleanToken !== token && propertyText.includes(cleanToken)) {
      return true;
    }

    return false;
  });
}
