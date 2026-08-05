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
  // Get a fresh, secure upload signature from our tiny server function
  const authRes = await fetch(`${BASE_URL}/imagekit-auth`);
  if (!authRes.ok) {
    throw new Error('خطا در دریافت مجوز آپلود');
  }
  const auth = await authRes.json();

  const urls: string[] = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('publicKey', auth.publicKey);
    formData.append('signature', auth.signature);
    formData.append('expire', String(auth.expire));
    formData.append('token', auth.token);
    formData.append('useUniqueFileName', 'true');

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'خطا در آپلود رسانه');
    }
    const data = await response.json();
    urls.push(data.url);
  }
  return urls;
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
