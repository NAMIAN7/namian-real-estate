import { PropertyFile, PropertyCategory } from '../types';

export interface FieldDisplay {
  label: string;
  value: string;
  icon?: 'area' | 'bed' | 'width' | 'generic';
}

function yesNo(v?: string): string {
  if (!v) return 'نامشخص';
  return v;
}

// ── سه فیلد کلیدی که در کارت کوچک (PropertyCard) نشان داده می‌شود ──
export function getCardFields(property: PropertyFile): FieldDisplay[] {
  const area: FieldDisplay = { label: 'متراژ', value: `${property.area} متر`, icon: 'area' };
  const width: FieldDisplay = { label: property.category === 'زمین' ? 'بر زمین' : 'عرض ملک', value: property.width || 'نامشخص', icon: 'width' };

  switch (property.category) {
    case 'خانه':
      return [
        area,
        { label: 'خواب', value: property.bedrooms > 0 ? `${property.bedrooms} خوابه` : 'بدون خواب', icon: 'bed' },
        width,
      ];
    case 'زمین':
      return [
        area,
        { label: 'کاربری', value: yesNo(property.landUse), icon: 'generic' },
        width,
      ];
    case 'باغ':
      return [
        area,
        { label: 'دارای بنا', value: yesNo(property.hasStructure), icon: 'generic' },
        width,
      ];
    case 'مغازه':
      return [
        area,
        { label: 'ارتفاع سقف', value: yesNo(property.ceilingHeight), icon: 'generic' },
        width,
      ];
    case 'اجاره':
      return [
        area,
        { label: 'اجاره ماهیانه', value: yesNo(property.monthlyRent), icon: 'generic' },
        width,
      ];
    case 'نیمهساز':
      return [
        area,
        { label: 'طبقه', value: yesNo(property.floor), icon: 'generic' },
        width,
      ];
    default:
      return [area, width];
  }
}

// ── گرید کامل مشخصات فنی که در پنجره جزئیات (PropertyDetailModal) نشان داده می‌شود ──
export function getDetailFields(property: PropertyFile): FieldDisplay[] {
  const fields: FieldDisplay[] = [
    { label: 'نوع ملک', value: property.propertyType || 'نامشخص' },
    { label: 'متراژ', value: `${property.area} متر مربع` },
  ];

  const widthLabel = property.category === 'زمین' ? 'بر زمین' : 'عرض ملک / بر';

  switch (property.category) {
    case 'خانه':
      fields.push(
        { label: 'تعداد خواب', value: property.bedrooms > 0 ? `${property.bedrooms} خوابه` : 'بدون خواب / تجاری' },
        { label: widthLabel, value: property.width || 'نامشخص' },
        { label: 'طبقه / موقعیت', value: property.floor || 'همکف' },
        { label: 'پارکینگ', value: property.parking || 'ندارد' },
        { label: 'انباری', value: property.storage || 'ندارد' },
        { label: 'آسانسور', value: property.elevator || 'ندارد' },
      );
      break;
    case 'زمین':
      fields.push(
        { label: widthLabel, value: property.width || 'نامشخص' },
        { label: 'شماره قطعه', value: property.parcelNumber || 'نامشخص' },
        { label: 'نام نقشه', value: property.mapName || 'نامشخص' },
        { label: 'کاربری زمین', value: property.landUse || 'نامشخص' },
      );
      break;
    case 'باغ':
      fields.push(
        { label: widthLabel, value: property.width || 'نامشخص' },
        { label: 'وضعیت آب و چاه', value: property.waterWellStatus || 'نامشخص' },
        { label: 'دارای بنا / کلبه', value: property.hasStructure || 'نامشخص' },
      );
      break;
    case 'مغازه':
      fields.push(
        { label: widthLabel, value: property.width || 'نامشخص' },
        { label: 'ارتفاع سقف', value: property.ceilingHeight || 'نامشخص' },
      );
      break;
    case 'اجاره':
      fields.push(
        { label: widthLabel, value: property.width || 'نامشخص' },
        { label: 'مبلغ ودیعه (رهن)', value: property.depositAmount || 'نامشخص' },
        { label: 'اجاره ماهیانه', value: property.monthlyRent || 'نامشخص' },
        { label: 'قابل تبدیل', value: property.convertible || 'نامشخص' },
      );
      break;
    case 'نیمهساز':
      fields.push(
        { label: widthLabel, value: property.width || 'نامشخص' },
        { label: 'طبقه', value: property.floor || 'نامشخص' },
      );
      break;
  }

  fields.push({ label: 'نوع سند', value: property.documentType || 'نامشخص' });
  if (property.utilities) {
    fields.push({ label: 'انشعابات', value: property.utilities });
  }

  return fields;
}
