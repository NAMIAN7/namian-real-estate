import React, { useState } from 'react';
import { PropertyFile, PropertyStatus } from '../types';
import { LightboxModal } from './LightboxModal';
import { getDetailFields } from '../utils/categoryFields';
import {
  X,
  MapPin,
  Maximize2,
  BedDouble,
  Ruler,
  Lock,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle2,
  Clock,
  Ban,
  Edit3,
  Trash2,
  Building,
  FileText,
  Car,
  Box,
  ArrowUpRight,
  Printer,
  Share2,
  ShieldAlert
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: PropertyFile | null;
  onClose: () => void;
  onEdit: (property: PropertyFile) => void;
  onDelete: (property: PropertyFile) => void;
  onChangeStatus: (id: string, status: PropertyStatus) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'videos'>('photos');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!property) return null;

  const statusMap: Record<PropertyStatus, { label: string; badge: string }> = {
    active: { label: 'فایل فعال', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    reserved: { label: 'رزرو شده', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    sold_inactive: { label: 'فروخته شده / غیرفعال', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  };

  const currentStatus = statusMap[property.status] || statusMap.active;
  const hasPhotos = property.photos && property.photos.length > 0;
  const hasVideos = property.videos && property.videos.length > 0;
  const detailFields = getDetailFields(property);

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#141418] border border-amber-500/25 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-black overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-[#18181f]">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 font-mono font-bold text-sm border border-amber-500/30">
              کد: {property.code}
            </span>
            <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${currentStatus.badge}`}>
              {currentStatus.label}
            </span>
            <span className="hidden sm:inline-block px-3 py-1 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold">
              دسته: {property.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="p-2.5 rounded-xl bg-[#1c1c24] hover:bg-stone-800 text-stone-300 border border-stone-800 transition-all text-xs flex items-center gap-1.5"
              title="چاپ یا ذخیره PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">چاپ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-[#1c1c24] hover:bg-rose-500/10 text-stone-300 hover:text-rose-400 border border-stone-800 transition-all"
              title="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* 1. Media Section */}
          <div className="bg-[#18181f] border border-stone-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('photos')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeMediaTab === 'photos'
                      ? 'bg-amber-500 text-[#0f0f13] shadow-md shadow-amber-500/20'
                      : 'bg-[#121217] text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>گالری تصاویر</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-black/40">
                    {property.photos?.length || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMediaTab('videos')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeMediaTab === 'videos'
                      ? 'bg-amber-500 text-[#0f0f13] shadow-md shadow-amber-500/20'
                      : 'bg-[#121217] text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <VideoIcon className="w-4 h-4" />
                  <span>ویدیوهای ملک</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-black/40">
                    {property.videos?.length || 0}
                  </span>
                </button>
              </div>

              {activeMediaTab === 'photos' && hasPhotos && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>مشاهده عکس به صورت بزرگ</span>
                </button>
              )}
            </div>

            {activeMediaTab === 'photos' ? (
              hasPhotos ? (
                <div>
                  <div
                    onClick={() => setLightboxOpen(true)}
                    className="relative h-64 sm:h-96 rounded-2xl overflow-hidden bg-[#121217] border border-stone-800 cursor-pointer group"
                  >
                    <img
                      src={property.photos[selectedPhotoIndex]}
                      alt={property.title}
                      className="w-full h-full object-contain sm:object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-xl bg-black/80 text-amber-400 border border-amber-500/40 text-sm font-bold flex items-center gap-2">
                        <Maximize2 className="w-4 h-4" />
                        <span>برای مشاهده تمام‌صفحه کلیک کنید</span>
                      </span>
                    </div>
                  </div>

                  {property.photos.length > 1 && (
                    <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                      {property.photos.map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPhotoIndex(idx)}
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                            idx === selectedPhotoIndex
                              ? 'border-amber-400 scale-105 shadow-md'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={photo} alt={`عکس ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-stone-500 bg-[#121217] rounded-2xl border border-dashed border-stone-800">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
                  <p className="text-sm">هیچ عکسی برای این ملک ثبت نشده است.</p>
                </div>
              )
            ) : (
              hasVideos ? (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-stone-800 aspect-video max-h-[480px] w-full flex items-center justify-center">
                    <video
                      key={property.videos[selectedVideoIndex]}
                      controls
                      src={property.videos[selectedVideoIndex]}
                      className="w-full h-full object-contain"
                    >
                      مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                    </video>
                  </div>

                  {property.videos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {property.videos.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedVideoIndex(idx)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            idx === selectedVideoIndex
                              ? 'bg-amber-500 text-[#0f0f13] border-amber-400'
                              : 'bg-[#121217] text-stone-400 border-stone-800 hover:text-stone-200'
                          }`}
                        >
                          ویدیو شماره {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-stone-500 bg-[#121217] rounded-2xl border border-dashed border-stone-800">
                  <VideoIcon className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
                  <p className="text-sm">هیچ ویدیویی برای این ملک ثبت نشده است.</p>
                </div>
              )
            )}
          </div>

          {/* 2. Main Title and Address Header */}
          <div className="bg-[#18181f] border border-amber-500/20 rounded-2xl p-5">
            <h2 className="text-xl sm:text-2xl font-black text-stone-100 font-serif leading-snug">
              {property.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-stone-400 text-sm">
              <span className="flex items-center gap-1.5 text-stone-300">
                <MapPin className="w-4 h-4 text-amber-400" />
                <strong>منطقه:</strong> {property.region}
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-300">
                <strong>آدرس:</strong> {property.address}
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs text-stone-400 block mb-0.5">قیمت پیشنهادی ملک:</span>
                <div className="text-amber-400 font-extrabold text-lg sm:text-xl">
                  {property.price || 'توافقی'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(property);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0f0f13] text-xs font-bold transition-all shadow-md"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>ویرایش مشخصات</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Two-Column Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Right Column: Key Property Specifications (category-aware) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#18181f] border border-stone-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-4">
                  <Building className="w-4 h-4" />
                  <span>مشخصات فنی و امکانات ملک</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailFields.map((field, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#121217] border border-stone-800/80">
                      <span className="text-xs text-stone-400 block mb-1">{field.label}</span>
                      <strong className="text-sm text-stone-200">{field.value}</strong>
                    </div>
                  ))}
                </div>

                {/* Public Description */}
                <div className="mt-5 pt-4 border-t border-stone-800">
                  <h4 className="text-xs font-bold text-stone-400 mb-2">توضیحات و ویژگی‌های عمومی:</h4>
                  <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                    {property.description || 'توضیحات تکمیلی ثبت نشده است.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Left Column: Private Note for Colleagues + Status Control */}
            <div className="space-y-4">
              <div className="bg-gradient-to-b from-amber-500/10 to-[#18181f] border-2 border-amber-500/40 rounded-2xl p-5 shadow-lg shadow-amber-500/5">
                <div className="flex items-center gap-2 pb-3 border-b border-amber-500/20 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-[#0f0f13]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-300">
                      یادداشت خصوصی برای همکاران
                    </h3>
                    <span className="text-[10px] text-amber-400/80 block">
                      محرمانه - ویژه مشاوران دفتر املاک نامیان
                    </span>
                  </div>
                </div>

                <div className="bg-[#121217]/90 rounded-xl p-4 border border-amber-500/20">
                  <p className="text-sm text-amber-100/90 leading-relaxed whitespace-pre-wrap">
                    {property.privateNote || 'هیچ یادداشت خصوصی یا اطلاعات مالکی برای این فایل ثبت نشده است.'}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-400">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>شماره مالک، شرایط کمیسیون و کلید را فقط در این بخش ثبت کنید.</span>
                </div>
              </div>

              <div className="bg-[#18181f] border border-stone-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-stone-300 mb-3">تغییر وضعیت فایل ملک:</h3>
                
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeStatus(property.id, 'active')}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                      property.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                        : 'bg-[#121217] text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>فایل فعال</span>
                    </span>
                    {property.status === 'active' && <span className="text-emerald-400">فعلی ✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeStatus(property.id, 'reserved')}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                      property.status === 'reserved'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                        : 'bg-[#121217] text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>فایل رزرو شده</span>
                    </span>
                    {property.status === 'reserved' && <span className="text-amber-400">فعلی ✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeStatus(property.id, 'sold_inactive')}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                      property.status === 'sold_inactive'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md'
                        : 'bg-[#121217] text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-rose-400" />
                      <span>فروخته شده / غیرفعال</span>
                    </span>
                    {property.status === 'sold_inactive' && <span className="text-rose-400">فعلی ✓</span>}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(property);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف دائم این فایل ملک</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-[#18181f] flex items-center justify-between">
          <div className="text-xs text-stone-500">
            آخرین به‌روزرسانی: {new Date(property.updatedAt).toLocaleDateString('fa-IR')}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all"
          >
            بستن پنجره
          </button>
        </div>

      </div>

      {lightboxOpen && property.photos && (
        <LightboxModal
          photos={property.photos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(newIdx) => setSelectedPhotoIndex(newIdx)}
        />
      )}
    </div>
  );
};
