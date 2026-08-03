import { PropertyFile, PropertyStatus } from '../types';

const BASE_URL = '/api';

export async function fetchProperties(): Promise<PropertyFile[]> {
  const response = await fetch(`${BASE_URL}/properties`);
  if (!response.ok) {
    throw new Error('خطا در دریافت لیست فایل‌ها از سرور');
  }
  return response.json();
}

export async function fetchPropertyById(id: string): Promise<PropertyFile> {
  const response = await fetch(`${BASE_URL}/properties/${id}`);
  if (!response.ok) {
    throw new Error('خطا در دریافت مشخصات فایل ملک');
  }
  return response.json();
}

export async function createPropertyFile(data: Partial<PropertyFile>): Promise<PropertyFile> {
  const response = await fetch(`${BASE_URL}/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'خطا در ثبت فایل جدید');
  }
  return response.json();
}

export async function updatePropertyFile(id: string, data: Partial<PropertyFile>): Promise<PropertyFile> {
  const response = await fetch(`${BASE_URL}/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'خطا در ویرایش فایل ملک');
  }
  return response.json();
}

export async function updatePropertyStatus(id: string, status: PropertyStatus): Promise<PropertyFile> {
  const response = await fetch(`${BASE_URL}/properties/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'خطا در تغییر وضعیت ملک');
  }
  return response.json();
}

export async function deletePropertyFile(id: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/properties/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'خطا در حذف فایل ملک و رسانه‌های مرتبط');
  }
  return response.json().catch(() => ({ success: true }));
}

export async function uploadMediaFiles(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'خطا در آپلود رسانه');
  }
  const data = await response.json();
  return data.urls;
}

export async function generateAiDescription(params: {
  title: string;
  region: string;
  area: number | string;
  bedrooms: number | string;
  category: string;
  propertyType: string;
  features?: string;
  price?: string;
}): Promise<string> {
  const response = await fetch(`${BASE_URL}/ai/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'خطا در نگارش هوشمند');
  }
  const data = await response.json();
  return data.enhancedDescription;
}

export async function addSamplePropertyFile(): Promise<PropertyFile[]> {
  const response = await fetch(`${BASE_URL}/properties/sample/add`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('خطا در افزودن فایل نمونه');
  }
  const data = await response.json();
  return data.properties;
}
