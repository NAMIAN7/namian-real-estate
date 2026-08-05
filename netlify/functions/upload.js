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

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return json({ error: 'کلید IMAGEKIT_PRIVATE_KEY در تنظیمات یافت نشد.' }, 503);
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return json({ error: 'هیچ فایلی ارسال نشده است' }, 400);
    }

    const authHeader = 'Basic ' + Buffer.from(`${privateKey}:`).toString('base64');
    const urls = [];

    for (const file of files) {
      if (typeof file === 'string') continue; // skip non-file fields

      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');

      const uploadForm = new URLSearchParams();
      uploadForm.append('file', `data:${file.type};base64,${base64Data}`);
      uploadForm.append('fileName', file.name || `namian-${Date.now()}`);
      uploadForm.append('useUniqueFileName', 'true');

      const ikResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: uploadForm.toString(),
      });

      const ikData = await ikResponse.json();

      if (!ikResponse.ok) {
        console.error('ImageKit upload error:', ikData);
        return json({ error: ikData.message || 'خطا در آپلود به ImageKit' }, 500);
      }

      urls.push(ikData.url);
    }

    return json({ urls });
  } catch (err) {
    console.error('Upload function error:', err);
    return json({ error: err.message || 'خطا در آپلود رسانه' }, 500);
  }
};
