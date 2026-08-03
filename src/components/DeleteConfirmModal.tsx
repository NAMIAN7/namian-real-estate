import React from 'react';
import { PropertyFile } from '../types';
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  Image as ImageIcon,
  Video as VideoIcon,
  AlertCircle
} from 'lucide-react';

interface DeleteConfirmModalProps {
  property: PropertyFile | null;
  isOpen: boolean;
  isDeleting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  property,
  isOpen,
  isDeleting,
  errorMessage,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !property) return null;

  const photoCount = property.photos?.length || 0;
  const videoCount = property.videos?.length || 0;
  const totalMediaCount = photoCount + videoCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" dir="rtl">
      <div 
        className="bg-[#141418] border-2 border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-rose-950/30 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Close */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-base">تأیید حذف فایل ملک</h3>
              <span className="text-xs text-rose-400 font-mono">کد ملک: {property.code}</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 rounded-xl bg-[#1c1c24] hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-all disabled:opacity-50"
            title="انصراف و بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-6 space-y-4">
          {/* Main required question */}
          <div className="text-center space-y-2">
            <p className="text-lg font-black text-stone-100 leading-relaxed">
              «آیا از حذف این فایل مطمئن هستید؟»
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              با تأیید شما، فایل ملک با عنوان زیر برای همیشه از دیتابیس حذف خواهد شد:
            </p>
          </div>

          {/* Property Summary Card */}
          <div className="p-4 rounded-2xl bg-[#1a1a22] border border-stone-800/80 space-y-2">
            <h4 className="font-bold text-sm text-stone-200 line-clamp-2 leading-snug">
              {property.title}
            </h4>
            <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
              <span>منطقه: <strong className="text-stone-300">{property.region}</strong></span>
              <span>دسته: <strong className="text-amber-400">{property.category}</strong></span>
            </div>
          </div>

          {/* Media Deletion Warning */}
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-3">
            <Trash2 className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <span className="font-bold block text-rose-200">
                حذف کامل فایل و رسانه‌های مربوط به آن
              </span>
              <p className="text-rose-300/90 leading-relaxed">
                {totalMediaCount > 0 ? (
                  <span>
                    تعداد <strong className="text-white underline">{photoCount} تصویر</strong> و{' '}
                    <strong className="text-white underline">{videoCount} ویدیو</strong> مرتبط با این ملک نیز از سرور و فضای ذخیره‌سازی حذف خواهند شد.
                  </span>
                ) : (
                  <span>تمام اطلاعات این ملک به صورت دائمی از دیتابیس املاک نامیان پاک خواهد شد.</span>
                )}
              </p>
            </div>
          </div>

          {/* Error message banner if deletion fails */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="font-bold">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-stone-800 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 rounded-xl bg-[#1c1c24] hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white font-bold text-xs transition-all disabled:opacity-50"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال حذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>بله، حذف شود</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
