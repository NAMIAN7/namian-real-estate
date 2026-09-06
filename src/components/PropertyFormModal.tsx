import React, { useState } from 'react';
import { PropertyFile, PropertyCategory, PropertyStatus } from '../types';
import { uploadMediaFiles, generateAiDescription } from '../services/api';
import {
  X,
  Sparkles,
  Lock,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Loader2,
  Droplets,
  Ruler,
  Landmark,
  Home,
  KeyRound
} from 'lucide-react';

interface PropertyFormModalProps {
  initialData?: PropertyFile | null;
  onClose: () => void;
  onSave: (data: Partial<PropertyFile>) => Promise<void>;
}

const CATEGORIES: PropertyCategory[] = [
  'خانه',
  'زمین',
  'باغ',
  'مغازه',
  'اجاره',
  'نیمهساز',
];

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  initialData,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<Partial<PropertyFile>>({
    code: initialData?.code ?? `NMN-${Math.floor(1000 + Math.random() * 9000)}`,
    title: initialData?.title ?? '',
    category: initialData?.category ?? 'خانه',
    propertyType: initialData?.propertyType ?? 'ویلایی / آپارتمان',
    region: initialData?.region ?? '',
    address: initialData?.address ?? '',
    area: initialData?.area ?? (isEditing ? 0 : 100),
    price: initialData?.price ?? '',
    width: initialData?.width ?? '',
    bedrooms: initialData?.bedrooms ?? (isEditing ? 0 : 2),
    floor: initialData?.floor ?? (isEditing ? '' : 'همکف'),
    parking: initialData?.parking ?? (isEditing ? '' : 'دارد'),
    storage: initialData?.storage ?? (isEditing ? '' : 'دارد'),
    elevator: initialData?.elevator ?? (isEditing ? '' : 'دارد'),
    documentType: initialData?.documentType ?? (isEditing ? '' : 'سند تک‌برگ ۶ دانگ'),
    description: initialData?.description ?? '',
    privateNote: initialData?.privateNote ?? '',
    status: initialData?.status ?? 'active',
    photos: initialData?.photos ?? [],
    videos: initialData?.videos ?? [],
    // فیلدهای اختصاصی دسته‌بندی‌ها
    utilities: initialData?.utilities ?? '',
    parcelNumber: initialData?.parcelNumber ?? '',
    mapName: initialData?.mapName ?? '',
    landUse: initialData?.landUse ?? (isEditing ? '' : 'مسکونی'),
    waterWellStatus: initialData?.waterWellStatus ?? '',
    hasStructure: initialData?.hasStructure ?? 'خیر',
    ceilingHeight: initialData?.ceilingHeight ?? '',
    depositAmount: initialData?.depositAmount ?? '',
    monthlyRent: initialData?.monthlyRent ?? '',
    convertible: initialData?.convertible ?? 'خیر',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const category = formData.category || 'خانه';

  // ── منطق نمایش/مخفی‌سازی فیلدها بر اساس دسته‌بندی ──
  const isLand = category === 'زمین';
  const isGarden = category === 'باغ';
  const isShop = category === 'مغازه';
  const isRent = category === 'اجاره';

  const showPrice = !isRent;
  const showBedrooms = !isLand && !isShop && (!isGarden || formData.hasStructure === 'بله');
  const showFloor = !isLand && !isGarden;
  const showParking = !isLand;
  const showStorage = !isLand;
  const showElevator = !isLand && !isGarden;
  const showCategoryExtrasBlock = isLand || isGarden || isShop || isRent;

  const handleChange = (field: keyof PropertyFile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'videos') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploadingMedia(true);
      setErrorMessage('');
      const fileList = Array.from(files) as File[];
      const urls = await uploadMediaFiles(fileList);
      setFormData(prev => ({
        ...prev,
        [type]: [...(prev[type] || []), ...urls]
      }));
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در آپلود فایل‌ها');
    } finally {
      setIsUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handleAddPhotoByUrl = () => {
    if (!newPhotoUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), newPhotoUrl.trim()]
    }));
    setNewPhotoUrl('');
  };

  const handleAddVideoByUrl = () => {
    if (!newVideoUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      videos: [...(prev.videos || []), newVideoUrl.trim()]
    }));
    setNewVideoUrl('');
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleRemoveVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: (prev.videos || []).filter((_, i) => i !== index)
    }));
  };

  const handleAiEnhance = async () => {
    try {
      setIsAiGenerating(true);
      setErrorMessage('');
      const enhanced = await generateAiDescription({
        title: formData.title || '',
        region: formData.region || '',
        area: formData.area || '',
        bedrooms: formData.bedrooms || '',
        category: formData.category || 'خانه',
        propertyType: formData.propertyType || '',
        features: formData.description || '',
        price: formData.price || '',
      });
      if (enhanced) {
        handleChange('description', enhanced);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در نگارش با هوش مصنوعی');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.region?.trim() || !formData.code?.trim()) {
      setErrorMessage('کد فایل، عنوان و منطقه ملزوم هستند.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ذخیره مشخصات فایل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#141418] border border-amber-500/30 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl shadow-black overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header RTL */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-[#18181f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-100 font-serif">
                {isEditing ? `ویرایش فایل ملک (کد ${formData.code})` : 'افزودن فایل ملک جدید'}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                ثبت و همگام‌سازی فوری مشخصات ملک در سرور املاک نامیان
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#1c1c24] hover:bg-rose-500/10 text-stone-400 hover:text-rose-400 border border-stone-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Section 1: کد، دسته، وضعیت و عنوان */}
          <div className="bg-[#18181f] border border-stone-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              ۱. مشخصات اصلی و دسته‌بندی
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* کد فایل */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  کد فایل <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="مثال: NMN-1042"
                  className="w-full bg-[#121217] text-amber-400 font-mono font-bold rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* دسته‌بندی */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  دسته‌بندی ملک
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as PropertyCategory)}
                  className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* وضعیت ملک */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  وضعیت فایل
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as PropertyStatus)}
                  className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                >
                  <option value="active">فایل فعال</option>
                  <option value="reserved">رزرو شده</option>
                  <option value="sold_inactive">فروخته شده / غیرفعال</option>
                </select>
              </div>
            </div>

            {/* عنوان فایل */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                عنوان فایل ملک <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="مثال: ویلای مدرن استخردار ۴۵۰ متری با روف گاردن - زعفرانیه"
                className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* نوع ملک */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  نوع ملک (مثلاً ویلایی، آپارتمان، کلنگی...)
                </label>
                <input
                  type="text"
                  value={formData.propertyType || ''}
                  onChange={(e) => handleChange('propertyType', e.target.value)}
                  placeholder="مثال: ویلایی مدرن تریبلکس"
                  className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  منطقه ملک <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.region || ''}
                  onChange={(e) => handleChange('region', e.target.value)}
                  placeholder="مثال: زعفرانیه، الهیه، عظیمیه"
                  className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* آدرس دقیق */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                آدرس دقیق ملک
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="مثال: خیابان مقدس اردبیلی، خیابان الف، کوچه شفق، پلاک ۱۸"
                className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: متراژ، قیمت و ابعاد (بر اساس دسته‌بندی) */}
          <div className="bg-[#18181f] border border-stone-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              ۲. ابعاد، متراژ{showPrice ? ' و قیمت' : ''}
            </h3>

            <div className={`grid grid-cols-1 ${showPrice ? 'sm:grid-cols-3' : ''} gap-4`}>
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  متراژ (متر مربع) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.area ?? 0}
                  onChange={(e) => handleChange('area', Number(e.target.value))}
                  className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {showPrice && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    قیمت / شرایط مالی
                  </label>
                  <input
                    type="text"
                    value={formData.price || ''}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="مثال: ۴۸,۵۰۰,۰۰۰,۰۰۰ تومان (قابل معاوضه)"
                    className="w-full bg-[#121217] text-amber-300 font-semibold rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {(showBedrooms || showFloor) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {showBedrooms && (
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      تعداد خواب
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.bedrooms ?? 0}
                      onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                {showFloor && (
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      طبقه / موقعیت
                    </label>
                    <input
                      type="text"
                      value={formData.floor || ''}
                      onChange={(e) => handleChange('floor', e.target.value)}
                      placeholder="مثال: طبقه ۳ از ۵ / همکف"
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    عرض ملک / بر اصلی
                  </label>
                  <input
                    type="text"
                    value={formData.width || ''}
                    onChange={(e) => handleChange('width', e.target.value)}
                    placeholder="مثال: ۱۶ متر بر اصلی خیابان ۱۴ متری"
                    className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {!showBedrooms && !showFloor && (
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  عرض ملک / بر اصلی
                </label>
                <input
                  type="text"
                  value={formData.width || ''}
                  onChange={(e) => handleChange('width', e.target.value)}
                  placeholder="مثال: ۱۶ متر بر اصلی خیابان ۱۴ متری"
                  className="w-full sm:w-1/3 bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Section 2.5: مشخصات اختصاصی دسته‌بندی */}
          {showCategoryExtrasBlock && (
            <div className="bg-[#18181f] border border-amber-500/20 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                ۲.۵ مشخصات اختصاصی «{category}»
              </h3>

              {/* زمین */}
              {isLand && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      شماره قطعه
                    </label>
                    <input
                      type="text"
                      value={formData.parcelNumber || ''}
                      onChange={(e) => handleChange('parcelNumber', e.target.value)}
                      placeholder="مثال: قطعه ۱۴"
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      نام نقشه
                    </label>
                    <input
                      type="text"
                      value={formData.mapName || ''}
                      onChange={(e) => handleChange('mapName', e.target.value)}
                      placeholder="مثال: نقشه مهران"
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      کاربری زمین
                    </label>
                    <select
                      value={formData.landUse || ''}
                      onChange={(e) => handleChange('landUse', e.target.value)}
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">انتخاب نشده</option>
                      <option value="مسکونی">مسکونی</option>
                      <option value="تجاری">تجاری</option>
                      <option value="کشاورزی">کشاورزی</option>
                    </select>
                  </div>
                </div>
              )}

              {/* باغ */}
              {isGarden && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-amber-400" />
                      وضعیت آب و چاه
                    </label>
                    <input
                      type="text"
                      value={formData.waterWellStatus || ''}
                      onChange={(e) => handleChange('waterWellStatus', e.target.value)}
                      placeholder="مثال: دارد - چاه عمیق ۸۰ متری"
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-amber-400" />
                      آیا بنا / کلبه دارد؟
                    </label>
                    <select
                      value={formData.hasStructure || 'خیر'}
                      onChange={(e) => handleChange('hasStructure', e.target.value as 'بله' | 'خیر')}
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="خیر">خیر</option>
                      <option value="بله">بله</option>
                    </select>
                  </div>
                </div>
              )}

              {/* مغازه */}
              {isShop && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      ارتفاع سقف
                    </label>
                    <input
                      type="text"
                      value={formData.ceilingHeight || ''}
                      onChange={(e) => handleChange('ceilingHeight', e.target.value)}
                      placeholder="مثال: ۴.۵ متر"
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* اجاره: کارت مشترک ودیعه + اجاره ماهیانه */}
              {isRent && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-1.5 mb-3">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300">شرایط رهن و اجاره</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-300 mb-1.5">
                          مبلغ ودیعه (رهن)
                        </label>
                        <input
                          type="text"
                          value={formData.depositAmount || ''}
                          onChange={(e) => handleChange('depositAmount', e.target.value)}
                          placeholder="مثال: ۵۰۰,۰۰۰,۰۰۰ تومان"
                          className="w-full bg-[#121217] text-amber-300 font-semibold rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-300 mb-1.5">
                          اجاره ماهیانه
                        </label>
                        <input
                          type="text"
                          value={formData.monthlyRent || ''}
                          onChange={(e) => handleChange('monthlyRent', e.target.value)}
                          placeholder="مثال: ۱۵,۰۰۰,۰۰۰ تومان"
                          className="w-full bg-[#121217] text-amber-300 font-semibold rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      قابل تبدیل به رهن کامل / اجاره کامل؟
                    </label>
                    <select
                      value={formData.convertible || 'خیر'}
                      onChange={(e) => handleChange('convertible', e.target.value as 'بله' | 'خیر')}
                      className="w-full sm:w-1/3 bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="خیر">خیر</option>
                      <option value="بله">بله</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: امکانات و سند */}
          <div className="bg-[#18181f] border border-stone-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              ۳. امکانات و سند مالکیت
            </h3>

            {(showParking || showStorage || showElevator) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {showParking && (
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      پارکینگ
                    </label>
                    <input
                      type="text"
                      value={formData.parking || ''}
                      onChange={(e) => handleChange('parking', e.target.value)}
                      placeholder="مثال: دارد (۳ سندی) — یا خالی بگذارید برای «ندارد»"
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                {showStorage && (
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      انباری
                    </label>
                    <input
                      type="text"
                      value={formData.storage || ''}
                      onChange={(e) => handleChange('storage', e.target.value)}
                      placeholder="مثال: دارد (۲۵ متر) — یا خالی بگذارید برای «ندارد»"
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                {showElevator && (
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      آسانسور
                    </label>
                    <input
                      type="text"
                      value={formData.elevator || ''}
                      onChange={(e) => handleChange('elevator', e.target.value)}
                      placeholder="مثال: دارد (هیدرولیک شیشه‌ای) — یا خالی بگذارید برای «ندارد»"
                      className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  نوع سند
                </label>
                <input
                  type="text"
                  value={formData.documentType || ''}
                  onChange={(e) => handleChange('documentType', e.target.value)}
                  placeholder="مثال: تک‌برگ ۶ دانگ"
                  className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-amber-400" />
                  انشعابات (آب، برق، گاز)
                </label>
                <input
                  type="text"
                  value={formData.utilities || ''}
                  onChange={(e) => handleChange('utilities', e.target.value)}
                  placeholder="مثال: آب، برق، گاز کامل"
                  className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: توضیحات عمومی و یادداشت خصوصی همکاران */}
          <div className="bg-[#18181f] border border-stone-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                ۴. توضیحات عمومی و یادداشت محرمانه
              </h3>

              <button
                type="button"
                onClick={handleAiEnhance}
                disabled={isAiGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                title="تولید توضیحات حرفه‌ای با هوش مصنوعی جمینای"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال نگارش هوشمند...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>نگارش هوشمند با هوش مصنوعی</span>
                  </>
                )}
              </button>
            </div>

            {/* عمومی */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                توضیحات عمومی ملک (قابل ارائه به مشتری)
              </label>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="ویژگی‌های معماری، متریال، نورگیری، نقشه، سیستم‌های هوشمند و موقعیت مکانی ملک..."
                className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* یادداشت خصوصی همکاران */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/30">
              <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>یادداشت خصوصی برای همکاران (فقط مشاوران دفتر می‌بینند)</span>
              </label>
              <textarea
                rows={3}
                value={formData.privateNote || ''}
                onChange={(e) => handleChange('privateNote', e.target.value)}
                placeholder="شماره تماس مالک، شرایط کمیسیون دفتر، کد لاک باکس، ساعت هماهنگی بازدید یا تخفیف نهایی..."
                className="w-full bg-[#121217] text-amber-100 rounded-xl px-3.5 py-2.5 text-sm border border-amber-500/30 focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 5: بخش رسانه (آپلود واقعی عکس و ویدیو) */}
          <div className="bg-[#18181f] border border-stone-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              ۵. بخش رسانه: افزودن تصاویر و ویدیوهای ملک (ذخیره واقعی در سرور)
            </h3>

            {/* Upload buttons row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo Upload Zone */}
              <div className="p-4 rounded-xl bg-[#121217] border border-stone-800 text-center">
                <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-200 block">انتخاب و آپلود عکس‌ها</span>
                    <span className="text-[11px] text-stone-500">امکان انتخاب چند عکس همزمان</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'photos')}
                    className="hidden"
                  />
                </label>

                {/* Add Photo URL Input */}
                <div className="mt-3 pt-3 border-t border-stone-800 flex items-center gap-1.5">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="یا چسباندن لینک عکس..."
                    className="flex-1 bg-[#18181f] text-stone-200 rounded-lg px-2.5 py-1.5 text-xs border border-stone-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoByUrl}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold"
                  >
                    + افزودن
                  </button>
                </div>
              </div>

              {/* Video Upload Zone */}
              <div className="p-4 rounded-xl bg-[#121217] border border-stone-800 text-center">
                <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                    <VideoIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-200 block">انتخاب و آپلود ویدیوها (MP4)</span>
                    <span className="text-[11px] text-stone-500">پخش زنده درون برنامه</span>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'videos')}
                    className="hidden"
                  />
                </label>

                {/* Add Video URL Input */}
                <div className="mt-3 pt-3 border-t border-stone-800 flex items-center gap-1.5">
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="یا چسباندن لینک ویدیو MP4..."
                    className="flex-1 bg-[#18181f] text-stone-200 rounded-lg px-2.5 py-1.5 text-xs border border-stone-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddVideoByUrl}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold"
                  >
                    + افزودن
                  </button>
                </div>
              </div>
            </div>

            {/* Upload status indicator */}
            {isUploadingMedia && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال آپلود و ذخیره‌سازی دائمی فایل‌های رسانه در سرور...</span>
              </div>
            )}

            {/* Uploaded Photos Preview List */}
            {formData.photos && formData.photos.length > 0 && (
              <div>
                <span className="text-xs font-bold text-stone-300 block mb-2">
                  عکس‌های متصل به این ملک ({formData.photos.length}):
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {formData.photos.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-stone-800 aspect-square">
                      <img src={url} alt={`پیش‌نمایش ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 left-1 p-1 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف این عکس"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Videos Preview List */}
            {formData.videos && formData.videos.length > 0 && (
              <div>
                <span className="text-xs font-bold text-stone-300 block mb-2">
                  ویدیوهای متصل به این ملک ({formData.videos.length}):
                </span>
                <div className="space-y-2">
                  {formData.videos.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#121217] border border-stone-800 text-xs">
                      <span className="truncate text-stone-300 font-mono">
                        ویدیو {idx + 1}: {url.substring(0, 50)}...
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(idx)}
                        className="p-1 rounded-lg hover:bg-rose-500/10 text-stone-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Submit / Cancel Footer Buttons */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUploadingMedia}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-[#0f0f13] font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره‌سازی...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'ذخیره تغییرات ملک' : 'ثبت فایل جدید در دفتر'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
