import { getStore } from '@netlify/blobs';

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

const SAMPLE_PROPERTY = {
  id: 'sample-nmn-1042',
  code: 'NMN-1042',
  title: 'ویلای مدرن استخردار ۴۵۰ متری با روف گاردن اختصاصی - زعفرانیه',
  propertyType: 'ویلایی مدرن تریبلکس',
  category: 'خانه',
  region: 'زعفرانیه (بخش کوهپایه)',
  address: 'خیابان مقدس اردبیلی، خیابان الف، کوچه شفق، پلاک ۱۸',
  area: 450,
  price: '۴۸,۵۰۰,۰۰۰,۰۰۰ تومان (قابل معاوضه با آپارتمان در منطقه ۱)',
  width: '۱۶ متر بر اصلی خیابان ۱۴ متری',
  bedrooms: 4,
  floor: 'تریبلکس با روف گاردن مجهز و آسانسور داخلی',
  parking: 'دارد (۳ سندی بدون مزاحم با سقف بلند)',
  storage: 'دارد (۲۵ متر مربع انباری قفسه‌بندی شده در زیرزمین)',
  elevator: 'دارد (آسانسور هیدرولیک شیشه‌ای ۴ نفره داخل ویلا)',
  documentType: 'سند تک‌برگ ۶ دانگ شاهنشاهی، بدون ریشه و وقف',
  description: 'ویلای سوپر لوکس ۴۵۰ متری طراحی شده توسط معمار برجسته، دارای استخر چهار فصل سرپوشیده با سیستم تصفیه اتریشی، سونا خشک و بخار، سالن جیم مجهز، روف گاردن با آلاچیق و باربیکیو.',
  privateNote: '',
  status: 'active',
  photos: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  ],
  videos: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function store() {
  return getStore('namian-properties');
}

async function readDatabase() {
  const s = store();
  const data = await s.get('db', { type: 'json' });
  if (!data || !Array.isArray(data)) {
    const initial = [SAMPLE_PROPERTY];
    await s.setJSON('db', initial);
    return initial;
  }
  return data;
}

async function writeDatabase(data) {
  await store().setJSON('db', data);
}

// ── خواهان‌ها (متقاضیان ملک) ──
function applicantsStore() {
  return getStore('namian-applicants');
}

async function readApplicants() {
  const s = applicantsStore();
  const data = await s.get('db', { type: 'json' });
  if (!data || !Array.isArray(data)) {
    await s.setJSON('db', []);
    return [];
  }
  return data;
}

async function writeApplicants(data) {
  await applicantsStore().setJSON('db', data);
}

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  let routePath = url.searchParams.get('path');
  if (!routePath) {
    routePath = url.pathname
      .replace(/^\/\.netlify\/functions\/api\/?/, '')
      .replace(/^\/api\/?/, '');
  }
  const segments = routePath.split('/').filter(Boolean);
  const method = req.method;

  try {
    // GET /api/health
    if (segments[0] === 'health') {
      return json({ status: 'ok', app: 'املاک نامیان - سیستم مدیریت فایل املاک' });
    }

    // ── مسیرهای خواهان‌ها (متقاضیان ملک) ──
    if (segments[0] === 'applicants') {
      // /api/applicants/:id
      if (segments.length === 2) {
        const id = segments[1];
        const applicants = await readApplicants();
        const index = applicants.findIndex((a) => a.id === id);

        if (method === 'GET') {
          if (index === -1) return json({ error: 'خواهان مورد نظر یافت نشد' }, 404);
          return json(applicants[index]);
        }

        if (method === 'PUT') {
          if (index === -1) return json({ error: 'خواهان مورد نظر یافت نشد' }, 404);
          const body = await req.json();
          applicants[index] = {
            ...applicants[index],
            ...body,
            id: applicants[index].id,
            updatedAt: new Date().toISOString(),
          };
          await writeApplicants(applicants);
          return json(applicants[index]);
        }

        if (method === 'DELETE') {
          const target = applicants.find((a) => a.id === id);
          if (!target) return json({ error: 'خواهان مورد نظر یافت نشد' }, 404);
          const filtered = applicants.filter((a) => a.id !== id);
          await writeApplicants(filtered);
          return json({ success: true, id, message: 'خواهان با موفقیت حذف شد.' });
        }
      }

      // /api/applicants (list / create)
      if (segments.length === 1) {
        if (method === 'GET') {
          const applicants = await readApplicants();
          return json(applicants);
        }
        if (method === 'POST') {
          const body = await req.json();
          const applicants = await readApplicants();
          const newApplicant = {
            id: `kh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...body,
          };
          applicants.unshift(newApplicant);
          await writeApplicants(applicants);
          return json(newApplicant, 201);
        }
      }

      return json({ error: 'Not found' }, 404);
    }

    if (segments[0] !== 'properties') {
      return json({ error: 'Not found' }, 404);
    }

    // POST /api/properties/sample/add
    if (segments[1] === 'sample' && segments[2] === 'add' && method === 'POST') {
      const properties = await readDatabase();
      const exists = properties.some((p) => p.id === SAMPLE_PROPERTY.id);
      if (!exists) {
        properties.unshift(SAMPLE_PROPERTY);
        await writeDatabase(properties);
      }
      return json({ success: true, properties });
    }

    // /api/properties/:id/status (PATCH)
    if (segments.length === 3 && segments[2] === 'status' && method === 'PATCH') {
      const id = segments[1];
      const body = await req.json();
      const { status } = body;
      if (!['active', 'reserved', 'sold_inactive'].includes(status)) {
        return json({ error: 'وضعیت نامعتبر است' }, 400);
      }
      const properties = await readDatabase();
      const index = properties.findIndex((p) => p.id === id);
      if (index === -1) return json({ error: 'فایل مورد نظر یافت نشد' }, 404);
      properties[index].status = status;
      properties[index].updatedAt = new Date().toISOString();
      await writeDatabase(properties);
      return json(properties[index]);
    }

    // /api/properties/:id
    if (segments.length === 2) {
      const id = segments[1];
      const properties = await readDatabase();
      const index = properties.findIndex((p) => p.id === id);

      if (method === 'GET') {
        if (index === -1) return json({ error: 'فایل مورد نظر یافت نشد' }, 404);
        return json(properties[index]);
      }

      if (method === 'PUT') {
        if (index === -1) return json({ error: 'فایل مورد نظر یافت نشد' }, 404);
        const body = await req.json();
        properties[index] = {
          ...properties[index],
          ...body,
          id: properties[index].id,
          updatedAt: new Date().toISOString(),
        };
        await writeDatabase(properties);
        return json(properties[index]);
      }

      if (method === 'DELETE') {
        const target = properties.find((p) => p.id === id);
        if (!target) return json({ error: 'فایل مورد نظر در دیتابیس یافت نشد.' }, 404);
        const filtered = properties.filter((p) => p.id !== id);
        await writeDatabase(filtered);
        return json({
          success: true,
          id,
          message: 'فایل ملک با موفقیت حذف شد.',
        });
      }
    }

    // /api/properties (list / create)
    if (segments.length === 1) {
      if (method === 'GET') {
        const properties = await readDatabase();
        return json(properties);
      }
      if (method === 'POST') {
        const body = await req.json();
        const properties = await readDatabase();
        const newProperty = {
          id: `nmn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          photos: [],
          videos: [],
          ...body,
        };
        properties.unshift(newProperty);
        await writeDatabase(properties);
        return json(newProperty, 201);
      }
    }

    return json({ error: 'Not found' }, 404);
  } catch (err) {
    console.error('API error:', err);
    return json({ error: err.message || 'خطای داخلی سرور' }, 500);
  }
};
