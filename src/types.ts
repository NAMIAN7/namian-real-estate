export type PropertyStatus = 'active' | 'reserved' | 'sold_inactive';

export type PropertyCategory = 
  | 'خانه' 
  | 'زمین' 
  | 'باغ' 
  | 'مغازه' 
  | 'اجاره' 
  | 'نیمهساز';

export interface PropertyFile {
  id: string;
  code: string;             // کد فایل: مثلا NMN-101
  title: string;            // عنوان فایل: مثلا ویلای استخردار دوبلکس کردان
  propertyType: string;     // نوع ملک: مثلا ویلایی، آپارتمان، کلنگی، اداری
  category: PropertyCategory; // دسته بندی: خانه، زمین، باغ، مغازه، اجاره، نیمهساز
  region: string;           // منطقه: مثلا زعفرانیه، الهیه، عظیمیه
  address: string;          // آدرس دقیق
  area: number;             // متراژ (متر مربع)
  price: string;            // قیمت (مثلا ۱۵,۰۰۰,۰۰۰,۰۰۰ تومان یا توافقی) — برای اجاره استفاده نمی‌شود
  width: string;            // عرض ملک / بر ملک (مثلا ۱۴ متر)
  bedrooms: number;         // تعداد خواب
  floor: string;            // طبقه (مثلا طبقه ۳ از ۵ یا همکف)
  parking: string;          // پارکینگ (مثلا دارد - ۲ سندی)
  storage: string;          // انباری (مثلا دارد - ۱۲ متر)
  elevator: string;         // آسانسور (مثلا دارد - لاین ایتالیایی)
  documentType: string;     // نوع سند (مثلا سند تک برگ ۶ دانگ)
  description: string;      // توضیحات عمومی ملک
  privateNote: string;      // یادداشت خصوصی برای همکاران (شماره مالک، شرایط کمیسیون و غیره)
  status: PropertyStatus;   // وضعیت: فعال، رزرو، فروخته شده/غیرفعال
  photos: string[];         // لیست آدرس عکس‌ها
  videos: string[];         // لیست آدرس ویدیوها
  createdAt: string;
  updatedAt: string;

  // ── مشترک بین همه‌ی دسته‌ها ──
  utilities?: string;       // انشعابات (آب، برق، گاز)

  // ── فیلدهای اختصاصیِ «زمین» ──
  parcelNumber?: string;    // شماره قطعه
  mapName?: string;         // نام نقشه (مثلا نقشه مهران)
  landUse?: string;         // کاربری زمین (مسکونی / تجاری / کشاورزی)

  // ── فیلدهای اختصاصیِ «باغ» ──
  waterWellStatus?: string; // وضعیت آب و چاه
  hasStructure?: 'بله' | 'خیر' | '';  // آیا بنا / کلبه دارد

  // ── فیلد اختصاصیِ «مغازه» ──
  ceilingHeight?: string;   // ارتفاع سقف

  // ── فیلدهای اختصاصیِ «اجاره» ──
  depositAmount?: string;   // مبلغ ودیعه (رهن)
  monthlyRent?: string;     // اجاره ماهیانه
  convertible?: 'بله' | 'خیر' | ''; // قابل تبدیل یا نه
}

export interface PropertyFilter {
  search: string;           // جستجو بر اساس کد، منطقه و عنوان
  status: PropertyStatus | 'all'; // وضعیت
  category: PropertyCategory | 'all'; // دسته بندی
  minArea?: number;
  maxArea?: number;
}

// ── خواهان‌ها (متقاضیان ملک) ──
export interface ApplicantRequest {
  id: string;
  code: string;              // کد خواهان: مثلا KH-101
  name: string;               // نام مراجعه‌کننده
  phone: string;               // شماره تماس
  category: PropertyCategory;  // دسته‌بندی مورد نظر
  regions: string;              // منطقه یا مناطق مورد نظر (آزاد، با ویرگول جدا می‌شود)
  budget: string;               // بودجه / سقف قیمت یا شرایط رهن و اجاره
  area: string;                  // متراژ مورد نیاز (تقریبی)
  note: string;                   // یادداشت آزاد
  createdAt: string;
  updatedAt: string;
}
