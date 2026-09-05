import { PropertyFile, PropertyCategory } from '../types';

type ColumnRole =
  | 'code'
  | 'propertyType'
  | 'area'
  | 'dealType'
  | 'region'
  | 'price'
  | 'status'
  | 'widthOrDepth'
  | 'description'
  | 'registryNumber'
  | 'ownerName'
  | 'ownerPhone'
  | 'registeredDate'
  | 'ignore';

// ترتیب دقیق ستون‌ها در هر شیت اکسل نامیان (بدون نیاز به سطر هدر)
const KHANE_ORDER: ColumnRole[] = [
  'code', 'propertyType', 'area', 'dealType', 'region', 'price',
  'registryNumber', 'status', 'description', 'ownerName', 'ownerPhone',
  'registeredDate', 'ignore',
];

const MAGHAZE_ORDER: ColumnRole[] = [
  'code', 'propertyType', 'area', 'dealType', 'region', 'price',
  'status', 'description', 'registryNumber', 'ownerName', 'ownerPhone',
  'registeredDate', 'ignore',
];

const ZAMIN_ORDER: ColumnRole[] = [
  'code', 'propertyType', 'area', 'dealType', 'region', 'price',
  'status', 'widthOrDepth', 'description', 'registryNumber', 'ownerName',
  'ownerPhone', 'registeredDate', 'ignore',
];

const CATEGORY_COLUMN_MAP: Record<string, ColumnRole[]> = {
  'خانه': KHANE_ORDER,
  'مغازه': MAGHAZE_ORDER,
  'زمین': ZAMIN_ORDER,
  'باغ': KHANE_ORDER,
  'اجاره': KHANE_ORDER,
  'نیمهساز': KHANE_ORDER,
};

const STATUS_MAP: Record<string, PropertyFile['status']> = {
  'فعال': 'active',
  'رزرو': 'reserved',
  'رزروشده': 'reserved',
  'فروختهشده': 'sold_inactive',
  'غیرفعال': 'sold_inactive',
  'فروختهشده/غیرفعال': 'sold_inactive',
};

function normalize(s: string): string {
  return (s || '').replace(/\u200c/g, '').replace(/\s+/g, '').trim();
}

function parseStatus(raw: string): PropertyFile['status'] {
  return STATUS_MAP[normalize(raw)] || 'active';
}

function parseAreaNumber(raw: string): number {
  const match = (raw || '').match(/[\d۰-۹]+/);
  if (!match) return 0;
  const digits = match[0].replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const n = parseInt(digits, 10);
  return isNaN(n) ? 0 : n;
}

// پارسر متن جدولی کپی‌شده از اکسل — سلول‌های چندخطی (Alt+Enter) را هم درست می‌خواند
function parseDelimitedText(text: string, delimiter = '\t'): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += char; i++; continue;
    }
    if (char === '"') { inQuotes = true; i++; continue; }
    if (char === delimiter) { row.push(field); field = ''; i++; continue; }
    if (char === '\r') { i++; continue; }
    if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += char; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.some((cell) => cell && cell.trim().length > 0));
}

export interface ParsedRow {
  data: Partial<PropertyFile>;
  rawCode: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: string[];
  unrecognizedHeaders: string[];
}

// نکته: دیگر نیازی به سطر هدر نیست؛ فقط ردیف‌های داده (خام از اکسل) کپی شوند
export function parsePastedExcelText(
  text: string,
  category: PropertyCategory
): ParseResult {
  const table = parseDelimitedText(text);
  const errors: string[] = [];

  if (table.length < 1) {
    return { rows: [], errors: ['هیچ ردیف داده‌ای پیدا نشد.'], unrecognizedHeaders: [] };
  }

  const order = CATEGORY_COLUMN_MAP[category] || KHANE_ORDER;
  const rows: ParsedRow[] = [];

  for (let ri = 0; ri < table.length; ri++) {
    const cells = table[ri];
    if (cells.every((c) => !c || !c.trim())) continue;

    // اگر این سطر همان سطر هدر باشد (یعنی سلول اول‌اش دقیقاً «کد» باشد)، رد شود
    if (normalize(cells[0] || '') === 'کد') continue;

    const notesParts: string[] = [];
    let code = '';
    let propertyType = '';
    let area = 0;
    let region = '';
    let price = '';
    let status: PropertyFile['status'] = 'active';
    let width = '';
    let description = '';

    for (let ci = 0; ci < order.length; ci++) {
      const role = order[ci];
      const value = (cells[ci] || '').trim();
      if (!value) continue;

      switch (role) {
        case 'code': code = value; break;
        case 'propertyType': propertyType = value; break;
        case 'area':
          area = parseAreaNumber(value);
          if (area === 0 && value) notesParts.push(`متراژ (متن اصلی): ${value}`);
          break;
        case 'dealType': notesParts.push(`نوع معامله: ${value}`); break;
        case 'region': region = value; break;
        case 'price': price = value; break;
        case 'status': status = parseStatus(value); break;
        case 'widthOrDepth': width = value; break;
        case 'description': description = value; break;
        case 'registryNumber': notesParts.push(`شماره دفتر: ${value}`); break;
        case 'ownerName': notesParts.push(`نام مالک: ${value}`); break;
        case 'ownerPhone': notesParts.push(`شماره مالک: ${value}`); break;
        case 'registeredDate': notesParts.push(`تاریخ ثبت در دفتر: ${value}`); break;
        default: break;
      }
    }

    if (!code) {
      errors.push(`ردیف ${ri + 1}: کد شناسایی نشد (اولین ستون باید کد فایل باشد)، این ردیف رد شد.`);
      continue;
    }

    const title = [propertyType, region, area ? `${area} متر` : '']
      .filter(Boolean)
      .join(' - ') || `فایل ${code}`;

    const data: Partial<PropertyFile> = {
      code, title, propertyType, category, region,
      address: region, area, price, width,
      bedrooms: 0, floor: '', parking: '', storage: '',
      elevator: '', documentType: '', description,
      privateNote: notesParts.join(' | '),
      status, photos: [], videos: [],
    };

    rows.push({ data, rawCode: code });
  }

  return { rows, errors, unrecognizedHeaders: [] };
}
