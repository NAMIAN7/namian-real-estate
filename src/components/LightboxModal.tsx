import React, { useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, ZoomIn } from 'lucide-react';

interface LightboxModalProps {
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        onNavigate((currentIndex - 1 + photos.length) % photos.length);
      }
      if (e.key === 'ArrowLeft') {
        onNavigate((currentIndex + 1) % photos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos.length, onClose, onNavigate]);

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      {/* Header bar */}
      <div className="absolute top-4 right-4 left-4 flex items-center justify-between z-10 text-stone-300">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18181f]/80 border border-amber-500/30 text-xs font-mono font-bold">
          <ZoomIn className="w-4 h-4 text-amber-400" />
          <span>تصویر {currentIndex + 1} از {photos.length}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-xl bg-[#18181f] hover:bg-stone-800 text-stone-300 hover:text-rose-400 border border-stone-800 transition-all"
          title="بستن (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Arrows RTL */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onNavigate((currentIndex - 1 + photos.length) % photos.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-[#18181f]/80 hover:bg-amber-500 hover:text-[#0f0f13] text-stone-300 border border-stone-700 transition-all z-10"
            title="تصویر قبلی"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate((currentIndex + 1) % photos.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-[#18181f]/80 hover:bg-amber-500 hover:text-[#0f0f13] text-stone-300 border border-stone-700 transition-all z-10"
            title="تصویر بعدی"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image View */}
      <div className="max-w-6xl max-h-[80vh] flex items-center justify-center">
        <img
          src={currentPhoto}
          alt={`مشاهده بزرگ تصویر ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-amber-500/20"
        />
      </div>

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-xl py-2 px-4 rounded-2xl bg-[#141418] border border-stone-800">
          {photos.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(idx)}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                idx === currentIndex
                  ? 'border-amber-400 scale-105 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={url} alt={`انگشتی ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
