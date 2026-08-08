import React, { useState } from 'react';
import { ApplicantRequest, PropertyCategory } from '../types';
import { X, CheckCircle2, AlertCircle, Loader2, UserSearch } from 'lucide-react';

interface ApplicantFormModalProps {
  initialData?: ApplicantRequest | null;
  onClose: () => void;
  onSave: (data: Partial<ApplicantRequest>) => Promise<void>;
}

const CATEGORIES: PropertyCategory[] = [
  'خانه',
  'زمین',
  'باغ',
  'مغازه',
  'اجاره',
  'نیمهساز',
];

export const ApplicantFormModal: React.FC<ApplicantFormModalProps> = ({
  initialData,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<Partial<ApplicantRequest>>({
    code: initialData?.code || `KH-${Math.floor(100 + Math.random() * 900)}`,
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    category: initialData?.category || 'خانه',
    regions: initialData?.regions || '',
    budget: initialData?.budget || '',
    area: initialData?.area || '',
    note: initialData?.note || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field: keyof ApplicantRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      setErrorMessage('نام و شماره تماس خواهان الزامی است.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ذخیره مشخصات خواهان');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="rtl">
      <div className="bg-[#141418] border border-amber-500/30 rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl shadow-black overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-[#18181f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <UserSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-100 font-serif">
                {isEditing ? `ویرایش خواهان (کد ${formData.code})` : 'ثبت خواهان جدید'}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                ثبت اطلاعات متقاضی برای پیگیری بعدی
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

        {errorMessage && (
          <div className="mx-5 mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">

          <div className="bg-[#18181f] border border-stone-800 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  نام مراجعه‌کننده <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="مثال: احمد رضایی"
                  className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  شماره تماس <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="مثال: ۰۹۱۲۱۲۳۴۵۶۷"
                  className="w-full bg-[#121217] text-amber-300 font-mono font-bold rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  دسته‌بندی مورد نظر
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

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  منطقه یا مناطق مورد نظر
                </label>
                <input
                  type="text"
                  value={formData.regions || ''}
                  onChange={(e) => handleChange('regions', e.target.value)}
                  placeholder="مثال: زعفرانیه، الهیه"
                  className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  بودجه / سقف قیمت
                </label>
                <input
                  type="text"
                  value={formData.budget || ''}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  placeholder="مثال: تا ۱۵ میلیارد تومان یا ودیعه ۳۰۰م"
                  className="w-full bg-[#121217] text-amber-300 font-semibold rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  متراژ مورد نیاز (تقریبی)
                </label>
                <input
                  type="text"
                  value={formData.area || ''}
                  onChange={(e) => handleChange('area', e.target.value)}
                  placeholder="مثال: حدود ۱۸۰ متر"
                  className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                یادداشت آزاد
              </label>
              <textarea
                rows={3}
                value={formData.note || ''}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="مثال: حتماً پارکینگ داشته باشد، فوری می‌خواهد..."
                className="w-full bg-[#121217] text-stone-100 rounded-xl px-3.5 py-2.5 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
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
                  <span>{isEditing ? 'ذخیره تغییرات' : 'ثبت خواهان'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
