import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

export type PriceSort = 'new' | 'asc' | 'desc';

interface PriceFilterProps {
  minValue: string;
  maxValue: string;
  sort: PriceSort;
  resultCount: number;
  hiddenNoPrice: number;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
  onChangeSort: (value: PriceSort) => void;
  onQuick: (min: string, max: string) => void;
  onClear: () => void;
}

const QUICK = [
  { label: 'همه', min: '', max: '' },
  { label: 'تا ۱', min: '', max: '1' },
  { label: '۱ تا ۲', min: '1', max: '2' },
  { label: '۲ تا ۳', min: '2', max: '3' },
  { label: '۳ تا ۵', min: '3', max: '5' },
  { label: 'بالای ۵', min: '5', max: '' },
];

export function PriceFilter({
  minValue,
  maxValue,
  sort,
  resultCount,
  hiddenNoPrice,
  onChangeMin,
  onChangeMax,
  onChangeSort,
  onQuick,
  onClear,
}: PriceFilterProps) {
  const isActive = minValue.trim() !== '' || maxValue.trim() !== '' || sort !== 'new';

  return (
    <div className="rounded-2xl bg-[#18181f] border border-stone-800 p-3.5 space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-stone-300 text-sm font-bold">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span>قیمت (میلیارد تومان)</span>
        </div>

        <input
          type="text"
          inputMode="decimal"
          value={minValue}
          onChange={(e) => onChangeMin(e.target.value)}
          placeholder="از"
          className="w-24 px-3 py-2 rounded-xl bg-[#0f0f13] border border-stone-700 focus:border-amber-500/60 text-stone-100 text-sm text-center focus:outline-none placeholder:text-stone-600"
        />
        <input
          type="text"
          inputMode="decimal"
          value={maxValue}
          onChange={(e) => onChangeMax(e.target.value)}
          placeholder="تا"
          className="w-24 px-3 py-2 rounded-xl bg-[#0f0f13] border border-stone-700 focus:border-amber-500/60 text-stone-100 text-sm text-center focus:outline-none placeholder:text-stone-600"
        />

        <select
          value={sort}
          onChange={(e) => onChangeSort(e.target.value as PriceSort)}
          className="px-3 py-2 rounded-xl bg-[#0f0f13] border border-stone-700 focus:border-amber-500/60 text-stone-200 text-sm focus:outline-none"
        >
          <option value="new">جدیدترین</option>
          <option value="asc">ارزان‌ترین اول</option>
          <option value="desc">گران‌ترین اول</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((q) => {
          const selected = minValue.trim() === q.min && maxValue.trim() === q.max;
          return (
            <button
              key={q.label}
              type="button"
              onClick={() => onQuick(q.min, q.max)}
              className={
                selected
                  ? 'px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300'
                  : 'px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0f0f13] border border-stone-700 hover:border-amber-500/40 text-stone-300'
              }
            >
              {q.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-stone-400">
          {resultCount.toLocaleString('fa-IR')} ملک
          {hiddenNoPrice > 0 && (
            <span className="text-stone-500">
              {' '}
              • {hiddenNoPrice.toLocaleString('fa-IR')} ملک بدون قیمت مشخص (مثل اجاره یا توافقی) به‌خاطر فیلتر قیمت نمایش داده نشد
            </span>
          )}
        </span>
        {isActive && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            <span>پاک کردن فیلتر قیمت</span>
          </button>
        )}
      </div>
    </div>
  );
}
