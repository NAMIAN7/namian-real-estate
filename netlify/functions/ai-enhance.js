const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: 'کلید GEMINI_API_KEY در تنظیمات یافت نشد. لطفاً در پنل تنظیمات اضافه کنید.' }, 503);
  }

  try {
    const { title, region, area, bedrooms, category, propertyType, features, price } = await req.json();

    const prompt = `شما مشاور و نویسنده حرفه‌ای آگهی‌های املاک لوکس در «املاک نامیان» هستید.
بر اساس اطلاعات زیر، یک توضیحات جذاب، حرفه‌ای و دقیق برای این ملک به زبان فارسی و با لحن محترمانه و ترغیب‌کننده بنویسید (در حدود ۳ تا ۴ بند کوتاه):

- دسته بندی: ${category || 'ملک'}
- نوع ملک: ${propertyType || ''}
- عنوان اولیه: ${title || ''}
- منطقه: ${region || ''}
- متراژ: ${area || ''} متر
- تعداد خواب: ${bedrooms || ''}
- قیمت/شرایط: ${price || ''}
- ویژگی‌های خاص: ${features || ''}

در خروجی، متن توضیحات آگهی را بدون توضیحات اضافی تحویل دهید تا مشاور املاک بتواند مستقیماً در فایل ملک استفاده کند.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API error:', geminiData);
      return json({ error: geminiData.error?.message || 'خطا در ارتباط با هوش مصنوعی' }, 500);
    }

    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return json({ enhancedDescription: text.trim() });
  } catch (err) {
    console.error('AI enhance function error:', err);
    return json({ error: err.message || 'خطا در ارتباط با هوش مصنوعی' }, 500);
  }
};
