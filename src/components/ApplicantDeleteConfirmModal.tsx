import React from 'react';
import { ApplicantRequest } from '../types';
import { AlertTriangle, Trash2, X, Loader2, AlertCircle } from 'lucide-react';

interface ApplicantDeleteConfirmModalProps {
  applicant: ApplicantRequest | null;
  isOpen: boolean;
  isDeleting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ApplicantDeleteConfirmModal: React.FC<ApplicantDeleteConfirmModalProps> = ({
  applicant,
  isOpen,
  isDeleting,
  errorMessage,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !applicant) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" dir="rtl">
      <div
        className="bg-[#141418] border-2 border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-rose-950/30 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-base">تأیید حذف خواهان</h3>
              <span className="text-xs text-rose-400 font-mono">کد: {applicant.code}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 rounded-xl bg-[#1c1c24] hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-6 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-black text-stone-100 leading-relaxed">
              «آیا از حذف این خواهان مطمئن هستید؟»
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              اطلاعات این متقاضی برای همیشه از دیتابیس حذف خواهد شد:
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1a1a22] border border-stone-800/80 space-y-2">
            <h4 className="font-bold text-sm text-stone-200">{applicant.name}</h4>
            <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
              <span dir="ltr">{applicant.phone}</span>
              <span>دسته: <strong className="text-amber-400">{applicant.category}</strong></span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="font-bold">{errorMessage}</span>
            </div>
          )}
        </div>

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
