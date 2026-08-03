import React from 'react';
import { Building2, Plus, RefreshCw, Sparkles, ShieldCheck, Layers } from 'lucide-react';
import { PropertyFile } from '../types';

interface HeaderProps {
  properties: PropertyFile[];
  onAddNew: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onAddSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  properties,
  onAddNew,
  onRefresh,
  isRefreshing,
  onAddSample
}) => {
  const activeCount = properties.filter(p => p.status === 'active').length;
  const reservedCount = properties.filter(p => p.status === 'reserved').length;
  const soldCount = properties.filter(p => p.status === 'sold_inactive').length;

  return (
    <header className="sticky top-0 z-30 bg-[#121217]/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Brand & Logo Right RTL */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40">
              <Building2 className="w-6 h-6 text-[#0f0f13]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-100 font-serif">
                  املاک نامیان
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  سامانه مدیریت فایلینگ
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>ویژه مشاوران و همکاران داخلی دفتر املاک نامیان</span>
              </p>
            </div>
          </div>

          {/* Center Quick Stats Badges */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a22] border border-stone-800 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>فعال:</span>
              <strong className="text-emerald-400 font-bold">{activeCount}</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a22] border border-stone-800 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>رزرو:</span>
              <strong className="text-amber-400 font-bold">{reservedCount}</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a22] border border-stone-800 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>فروخته/غیرفعال:</span>
              <strong className="text-rose-400 font-bold">{soldCount}</strong>
            </div>
          </div>

          {/* Left Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="به‌روزرسانی اطلاعات سرور"
              className="p-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#252530] border border-stone-800 text-stone-300 hover:text-amber-400 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onAddSample}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1c1c24] hover:bg-[#252530] border border-amber-500/30 text-amber-400 text-xs font-semibold transition-all"
              title="تزریق فایل نمونه و تست ذخیره‌سازی"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>فایل نمونه</span>
            </button>

            <button
              type="button"
              onClick={onAddNew}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-[#0f0f13] font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>افزودن فایل جدید</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
