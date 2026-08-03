import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS for all routes and origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Ensure data and uploads directories exist
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'properties.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded photos and videos statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for saving uploaded photos & videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
      .substring(0, 30);
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 100000);
    cb(null, `${safeName}_${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for video/photo
});

// Sample property file data
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
  description: 'ویلای سوپر لوکس ۴۵۰ متری طراحی شده توسط معمار برجسته، دارای استخر چهار فصل سرپوشیده با سیستم تصفیه اتریشی، سونا خشک و بخار، سالن جیم مجهز، روف گاردن با آلاچیق و باربیکیو. سیستم هوشمند BMS اشنایدر آلمان. شیرآلات توکار هانس گروهه، نورپردازی حرفه‌ای و پنجره‌های ترمال بریک آلمانی.',
  privateNote: 'مالک: جناب مهندس بهرامی (۰۹۱۲۳۴۵۶۷۸۹). کلید نزد نگهبانی برج مجاور است (کد باکس: ۴۸۲۱). کمیسیون دفتر ۱.۵ درصد یکسر توافق شده. در صورت پرداخت نقدی تا ۴۶ میلیارد هم جای امضا دارد.',
  status: 'active',
  photos: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
  ],
  videos: [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  ],
  createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  updatedAt: new Date().toISOString()
};

const SECOND_SAMPLE = {
  id: 'sample-nmn-2015',
  code: 'NMN-2015',
  title: 'زمین ۶۰۰ متری دارای جواز ساخت ۵ طبقه - الهیه',
  propertyType: 'زمین مسکونی / کلنگی ارزنده',
  category: 'زمین',
  region: 'الهیه (فرشته)',
  address: 'خیابان فرشته، کوچه بوسان، پلاک ۲۴',
  area: 600,
  price: '۱۲۰,۰۰۰,۰۰۰,۰۰۰ تومان (متری ۲۰۰ میلیون)',
  width: '۲۰ متر بر کوچه ۱۲ متری دنج',
  bedrooms: 0,
  floor: 'زمین خالی با جواز ساخت معتبر',
  parking: 'ندارد',
  storage: 'ندارد',
  elevator: 'ندارد',
  documentType: 'سند تک‌برگ شخصی بدون اصلاحی',
  description: 'زمین ارزنده و بی‌نظیر به مساحت ۶۰۰ متر مربع با بر ۲۰ متر در یکی از بهترین فرعی‌های فرشته. دارای جواز ساخت ۵ طبقه مسکونی روی ۲ طبقه مشاعات (استخر، سالن اجتماعات، لابی من، ۴۰ واحد پارکینگ). کلیه عوارض شهرداری پرداخت شده و آماده گودبرداری.',
  privateNote: 'مالک: خانم دکتر شمس (۰۹۱۲۹۸۷۶۵۴۳). شرایط فروش فقط نقدی یا ۵۰٪ نقد و مابقی معاوضه با آپارتمان آماده در منطقه ۱. همکار محترم لطفاً قبل از بازدید با آقای نامیان هماهنگ شود.',
  status: 'reserved',
  photos: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
  ],
  videos: [],
  createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
};

const THIRD_SAMPLE = {
  id: 'sample-nmn-3080',
  code: 'NMN-3080',
  title: 'مغازه ۸۵ متری بر اصلی بلوار - عظیمیه',
  propertyType: 'تجاری با ملکیت و سرقفلی',
  category: 'مغازه',
  region: 'عظیمیه (میدان اسبی)',
  address: 'بلوار استقلال، ضلع شمالی میدان، جنب بانک',
  area: 85,
  price: '۳۵,۰۰۰,۰۰۰,۰۰۰ تومان',
  width: '۸ متر بر شیشه‌ای دید عالی',
  bedrooms: 0,
  floor: 'همکف + ۳۰ متر بالکن تجاری',
  parking: 'دارد (۱ واحد پارکینگ اختصاصی)',
  storage: 'دارد (۱۰ متر انبار تجاری)',
  elevator: 'ندارد',
  documentType: 'سند تک‌برگ تجاری (ملکیت و سرقفلی کامل)',
  description: 'مغازه تجاری لوکس به مساحت ۸۵ متر کف به همراه ۳۰ متر بالکن، ارتفاع سقف ۵.۵ متر، کرکره برقی آلمانی، شیشه میرال قدی با تابلوخور بی‌نظیر در پرترددترین نقطه عظیمیه. مناسب برای برندها، بانک‌ها، کافه رستوران و نمایشگاه‌های لوکس.',
  privateNote: 'فروخته شده در تاریخ ۱۴۰۳/۰۴/۱۵ توسط آقای حسینی. خریدار: برند پوشاک جین وست. کمیسیون کامل دریافت شد.',
  status: 'sold_inactive',
  photos: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?auto=format&fit=crop&w=1200&q=80'
  ],
  videos: [],
  createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
};

// Helper functions for atomic read/write of properties DB
function readDatabase(): any[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = [SAMPLE_PROPERTY, SECOND_SAMPLE, THIRD_SAMPLE];
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      const initialData = [SAMPLE_PROPERTY, SECOND_SAMPLE, THIRD_SAMPLE];
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    return data;
  } catch (error) {
    console.error('Error reading DB_FILE, resetting with samples:', error);
    const initialData = [SAMPLE_PROPERTY, SECOND_SAMPLE, THIRD_SAMPLE];
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function writeDatabase(data: any[]) {
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'املاک نامیان - سیستم مدیریت فایل املاک' });
});

// GET all properties
app.get('/api/properties', (req, res) => {
  try {
    const properties = readDatabase();
    res.json(properties);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET single property by id
app.get('/api/properties/:id', (req, res) => {
  try {
    const properties = readDatabase();
    const item = properties.find((p: any) => p.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'فایل مورد نظر یافت نشد' });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new property
app.post('/api/properties', (req, res) => {
  try {
    const properties = readDatabase();
    const newProperty = {
      id: `nmn-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      photos: [],
      videos: [],
      ...req.body
    };
    properties.unshift(newProperty); // add to top
    writeDatabase(properties);
    res.status(201).json(newProperty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update existing property
app.put('/api/properties/:id', (req, res) => {
  try {
    const properties = readDatabase();
    const index = properties.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'فایل مورد نظر یافت نشد' });
    }
    properties[index] = {
      ...properties[index],
      ...req.body,
      id: properties[index].id, // preserve id
      updatedAt: new Date().toISOString()
    };
    writeDatabase(properties);
    res.json(properties[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH change property status (active, reserved, sold_inactive)
app.patch('/api/properties/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'reserved', 'sold_inactive'].includes(status)) {
      return res.status(400).json({ error: 'وضعیت نامعتبر است' });
    }
    const properties = readDatabase();
    const index = properties.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'فایل مورد نظر یافت نشد' });
    }
    properties[index].status = status;
    properties[index].updatedAt = new Date().toISOString();
    writeDatabase(properties);
    res.json(properties[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove a property file
app.delete('/api/properties/:id', (req, res) => {
  try {
    const properties = readDatabase();
    const target = properties.find((p: any) => p.id === req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'فایل مورد نظر در دیتابیس یافت نشد.' });
    }

    // Delete associated photos and videos if they are stored locally in /uploads
    const allMedia = [...(target.photos || []), ...(target.videos || [])];
    let deletedFilesCount = 0;
    for (const url of allMedia) {
      if (typeof url === 'string' && url.startsWith('/uploads/')) {
        const filename = url.replace('/uploads/', '').replace(/^\//, '');
        const filePath = path.join(UPLOADS_DIR, filename);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            deletedFilesCount++;
          }
        } catch (fileErr) {
          console.error('Error deleting media file from disk:', filePath, fileErr);
        }
      }
    }

    const filtered = properties.filter((p: any) => p.id !== req.params.id);
    writeDatabase(filtered);
    res.json({ 
      success: true, 
      id: req.params.id, 
      deletedFilesCount, 
      message: 'فایل ملک و تمامی تصاویر و ویدیوهای مرتبط با موفقیت حذف شدند.' 
    });
  } catch (err: any) {
    console.error('Delete property error:', err);
    res.status(500).json({ error: 'خطا در حذف فایل ملک: ' + err.message });
  }
});

// POST upload media files (photos & videos)
app.post('/api/upload', upload.array('files', 15), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'هیچ فایلی ارسال نشده است' });
    }
    const urls = files.map(file => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST reset or add sample file
app.post('/api/properties/sample/add', (req, res) => {
  try {
    const properties = readDatabase();
    const exists = properties.some((p: any) => p.id === SAMPLE_PROPERTY.id);
    if (!exists) {
      properties.unshift(SAMPLE_PROPERTY);
      writeDatabase(properties);
    }
    res.json({ success: true, properties });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Copywriting Helper for real estate agents
app.post('/api/ai/enhance', async (req, res) => {
  try {
    const { title, region, area, bedrooms, category, propertyType, features, price } = req.body;
    
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ 
        error: 'کلید GEMINI_API_KEY در تنظیمات یافت نشد. لطفاً در پنل تنظیمات اضافه کنید.' 
      });
    }

    const ai = new GoogleGenAI({ apiKey });
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    res.json({ enhancedDescription: text.trim() });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'خطا در ارتباط با هوش مصنوعی: ' + err.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return res.status(404).send('Not found');
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`سیستم مدیریت فایلهای املاک نامیان روی پورت ${PORT} فعال شد`);
  });
}

startServer();
