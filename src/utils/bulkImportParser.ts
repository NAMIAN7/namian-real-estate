import { PropertyFile, PropertyCategory } from '../types';

// نگاشت اسم هدرهای اکسل (نامیان) به فیلدهای سایت
// کلید: نسخه‌ی نرمال‌شده‌ی هدر (بدون فاصله و نیم‌فاصله)، مقدار: نقش ستون
type ColumnRole =
  | 'code'
  | 'propertyType'
  | 'area'
  | 'dealType'        // نوع معامله (فروش/رهن‌اجاره) — می‌رود توی یادداشت خصوصی
  | 'region'
  | 'price'
  | 'status'
  | 'widthOrDepth'    // بر و عمق (فقط زمین) — می‌رود توی width
  | 'description'
  | 'registryNumber'  // شماره داخل دفتر فروش — یادداشت خصوصی
  | 'ownerName'        // نام مالک — یادداشت خصوصی
  | 'ownerPhone'       // شماره مالک — یادداشت خصوصی
  | 'registeredDate'   // تاریخ ثبت — یادداشت خصوصی
  | 'ignore';          // تصویر و ستون‌های ناشناس

function normalizeHeader(h: string): string {
  return (h || '')
    .replace(/\u200c/g, '') // حذف نیم‌فاصله
    .replace(/\s+/g, '')    // حذف همه فاصله‌ها
    .trim();
}

const HEADER_ROLE_MAP: Record<string, ColumnRole> = {
  'کد': 'code',
  'نوع': 'propertyType',
  'متراژ': 'area',
  'نوعمعامله': 'dealType',
  'لوکیشن': 'region',
  'قیمت': 'price',
  'وضعیت': 'status',
  'برو عمق': 'widthOrDepth',
  'بروعمق': 'widthOrDepth',
  'بروعمق:': 'widthOrDepth',
  'توضیحات': 'description',
  'شمارهداخلدفترفروش': 'registryNumber',
  'شمارهداخلدفتر فروش': 'registryNumber',
  'نامالک': 'ownerName',
  'ناممالک': 'ownerName',
  'شمارهمالک': 'ownerPhone',
  'تاریخثبت': 'registeredDate',
  'تصویر': 'ignore',
};

function roleFor(header: string): ColumnRole {
  const norm = normalizeHeader(header);
  return HEADER_ROLE_MAP[norm] || 'ignore';
}

const STATUS_MAP: Record<string, PropertyFile['status']> = {
  'فعال': 'active',
  'رزرو': 'reserved',
  'رزروشده': 'reserved',
  'فروختهشده': 'sold_inactive',
  'غیرفعال': 'sold_inactive',
  'فروختهشده/غیرفعال': 'sold_inactive',
};

function parseStatus(raw: string): PropertyFile['status'] {
  const norm = normalizeHeader(raw || '');
  return STATUS_MAP[norm] || 'active';
}

function parseAreaNumber(raw: string): number {
  const match = (raw || '').match(/[\d۰-۹]+/);
  if (!match) return 0;
  const digits = match[0].replace(/[۰-۹]/g, (d) =>
    String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  );
  const n = parseInt(digits, 10);
  return isNaN(n) ? 0 : n;
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

// ورودی: متن paste شده از اکسل (تب-جدا)، خروجی: ردیف‌های آماده برای ارسال به سرور
export function parsePastedExcelText(
  text: string,
  category: PropertyCategory
): ParseResult {
  const lines = text
    .split(/\r\n|\r|\n/)
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l) => l.trim().length > 0);

  const errors: string[] = [];
  if (lines.length < 2) {
    return { rows: [], errors: ['حداقل یک سطر هدر و یک سطر داده لازم است.'], unrecognizedHeaders: [] };
  }

  const headerCells = lines[0].split('\t');
  const roles = headerCells.map(roleFor);
  const unrecognizedHeaders = headerCells.filter((h, i) => roles[i] === 'ignore' && normalizeHeader(h) !== 'تصویر');

  const rows: ParsedRow[] = [];

  for (let li = 1; li < lines.length; li++) {
    const cells = lines[li].split('\t');
    if (cells.every((c) => !c || !c.trim())) continue;

    const notesParts: string[] = [];
    let code = '';
    let propertyType = '';
    let area = 0;
    let region = '';
    let price = '';
    let status: PropertyFile['status'] = 'active';
    let width = '';
    let description = '';

    for (let ci = 0; ci < headerCells.length; ci++) {
      const role = roles[ci];
      const value = (cells[ci] || '').trim();
      if (!value) continue;

      switch (role) {
        case 'code':
          code = value;
          break;
        case 'propertyType':
          propertyType = value;
          break;
        case 'area':
          area = parseAreaNumber(value);
          if (area === 0 && value) {
            notesParts.push(`متراژ (متن اصلی): ${value}`);
          }
          break;
        case 'dealType':
          notesParts.push(`نوع معامله: ${value}`);
          break;
        case 'region':
          region = value;
          break;
        case 'price':
          price = value;
          break;
        case 'status':
          status = parseStatus(value);
          break;
        case 'widthOrDepth':
          width = value;
          break;
        case 'description':
          description = value;
          break;
        case 'registryNumber':
          notesParts.push(`شماره دفتر: ${value}`);
          break;
        case 'ownerName':
          notesParts.push(`نام مالک: ${value}`);
          break;
        case 'ownerPhone':
          notesParts.push(`شماره مالک: ${value}`);
          break;
        case 'registeredDate':
          notesParts.push(`تاریخ ثبت در دفتر: ${value}`);
          break;
        default:
          break;
      }
    }

    if (!code) {
      errors.push(`سطر ${li + 1}: ستون «کد» خالی است، این ردیف رد شد.`);
      continue;
    }

    const title = [propertyType, region, area ? `${area} متر` : '']
      .filter(Boolean)
      .join(' - ') || `فایل ${code}`;

    const data: Partial<PropertyFile> = {
      code,
      title,
      propertyType,
      category,
      region,
      address: region,
      area,
      price,
      width,
      bedrooms: 0,
      floor: '',
      parking: '',
      storage: '',
      elevator: '',
      documentType: '',
      description,
      privateNote: notesParts.join(' | '),
      status,
      photos: [],
      videos: [],
    };

    rows.push({ data, rawCode: code });
  }

  return { rows, errors, unrecognizedHeaders };
}
