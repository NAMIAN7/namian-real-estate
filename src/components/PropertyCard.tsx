import React, { useState } from 'react';
import { PropertyFile, PropertyStatus } from '../types';
import {
  MapPin,
  Maximize2,
  BedDouble,
  Building,
  Ruler,
  Eye,
  Edit3,
  Trash2,
  Lock,
  ChevronDown,
  Image as ImageIcon,
  Video as VideoIcon
} from 'lucide-react';

interface PropertyCardProps {
  property: PropertyFile;
  onViewDetail: (property: PropertyFile) => void;
  onEdit: (property: PropertyFile) => void;
  onDelete: (property: PropertyFile) => void;
  onChangeStatus: (id: string, newStatus: PropertyStatus) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetail,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const mainPhoto =
    property.photos && property.photos.length > 0
      ? property.photos[0]
      : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  const statusLabelMap: Record<PropertyStatus, { text: string; badge: string }> = {
    active: {
      text: 'فایل فعال',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    reserved: {
      text: 'رزرو شده',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    sold_inactive: {
      text: 'فروخته شده / غیرفعال',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
  };

  const statusInfo = statusLabelMap[property.status] || statusLabelMap.active;

  return (
    <div
      id={`property-card-${property.id}`}
      className="group bg-[#18181f] border border-amber-500/15 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg shadow-black/40 flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
    >
      {/* Photo Header with Overlay Badges */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-[#121217] cursor-pointer" onClick={() => onViewDetail(property)}>
        <img
          src={mainPhoto}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181f] via-transparent to-black/50" />

        {/* Top Right: Category Badge */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-[#0f0f13]/90 text-amber-400 border border-amber-500/30 shadow-md">
            {property.category}
          </span>
        </div>

        {/* Top Left: Status Badge */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border shadow-md ${statusInfo.badge}`}
          >
            {statusInfo.text}
          </span>
        </div>

        {/* Bottom Bar on image: Code and Media Counters */}
        <div className="absolute bottom-3 right-3.5 left-3.5 z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
            <span>کد:</span>
            <span>{property.code}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {property.photos && property.photos.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 text-stone-200 text-xs font-medium">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{property.photos.length}</span>
              </span>
            )}
            {property.videos && property.videos.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 text-stone-200 text-xs font-medium">
                <VideoIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{property.videos.length}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Title */}
          <h3
            onClick={() => onViewDetail(property)}
            className="text-base sm:text-lg font-bold text-stone-100 hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
          >
            {property.title}
          </h3>

          {/* Region & Address */}
          <div className="flex items-start gap-1.5 mt-2 text-stone-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              <strong className="text-stone-300 font-semibold">{property.region}</strong> • {property.address}
            </span>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-xl bg-[#121217] border border-stone-800/80 text-xs">
            <div className="flex flex-col items-center justify-center text-center p-1">
              <span className="text-stone-400 flex items-center gap-1 mb-0.5">
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                متراژ
              </span>
              <strong className="text-stone-200 font-bold">{property.area} متر</strong>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-1 border-x border-stone-800">
              <span className="text-stone-400 flex items-center gap-1 mb-0.5">
                <BedDouble className="w-3.5 h-3.5 text-amber-400" />
                خواب
              </span>
              <strong className="text-stone-200 font-bold">
                {property.bedrooms > 0 ? `${property.bedrooms} خوابه` : 'بدون خواب'}
              </strong>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-1">
              <span className="text-stone-400 flex items-center gap-1 mb-0.5">
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                عرض ملک
              </span>
              <strong className="text-stone-200 font-bold truncate max-w-full">
                {property.width || 'نامشخص'}
              </strong>
            </div>
          </div>

          {/* Price & Private Note Tag */}
          <div className="mt-3.5 flex items-center justify-between gap-2">
            <div>
              <span className="text-xs text-stone-400 block">قیمت / شرایط:</span>
              <div className="text-amber-400 font-extrabold text-sm sm:text-base tracking-tight truncate">
                {property.price || 'توافقی'}
              </div>
            </div>

            {property.privateNote && (
              <span
                title="دارای یادداشت محرمانه داخلی برای همکاران"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold shrink-0"
              >
                <Lock className="w-3 h-3" />
                <span>یادداشت همکاران</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
          {/* Main View Details CTA */}
          <button
            type="button"
            onClick={() => onViewDetail(property)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>مشاهده فایل و گالری</span>
          </button>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusMenu(!showStatusMenu);
              }}
              title="تغییر وضعیت"
              className="p-2 rounded-xl bg-[#121217] hover:bg-stone-800 border border-stone-800 text-stone-300 transition-all flex items-center gap-1"
            >
              <span className="text-xs">وضعیت</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showStatusMenu && (
              <div className="absolute bottom-full left-0 mb-1 w-36 rounded-xl bg-[#1c1c24] border border-amber-500/30 shadow-xl z-20 py-1 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    onChangeStatus(property.id, 'active');
                    setShowStatusMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 block font-semibold"
                >
                  فایل فعال
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeStatus(property.id, 'reserved');
                    setShowStatusMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 block font-semibold"
                >
                  رزرو شده
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeStatus(property.id, 'sold_inactive');
                    setShowStatusMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 block font-semibold"
                >
                  فروخته / غیرفعال
                </button>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(property);
            }}
            title="ویرایش مشخصات"
            className="p-2 rounded-xl bg-[#121217] hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-400 transition-all"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(property);
            }}
            title="حذف فایل ملک"
            className="p-2 rounded-xl bg-[#121217] hover:bg-rose-500/10 border border-stone-800 hover:border-rose-500/30 text-stone-400 hover:text-rose-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
