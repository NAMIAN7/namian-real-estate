import React from 'react';
import { PropertyCategory, PropertyFilter } from '../types';
import { Search, X, Filter } from 'lucide-react';

interface FilterBarProps {
  filter: PropertyFilter;
  onUpdateFilter: (changes: Partial<PropertyFilter>) => void;
  onClearFilters: () => void;
}

const CATEGORIES: PropertyCategory[] = [
  'خانه',
  'زمین',
  'باغ',
  'مغازه',
  'اجاره',
  'نیمهساز',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onUpdateFilter,
  onClearFilters,
}) => {
  const hasActiveFilters = filter.search.trim() !== '' || filter.category !== 'all';

  return (
    <div className="bg-[#18181f] border border-amber-500/15 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/30">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        
        {/* Search input RTL */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => onUpdateFilter({ search: e.target.value })}
            placeholder="جستجوی هوشمند در تمام اطلاعات: کد، منطقه، متراژ (مثلاً 100 متر)، خواب، رهن و اجاره، امکانات..."
            className="w-full bg-[#121217] text-stone-100 placeholder-stone-500 rounded-xl pr-11 pl-4 py-3 text-sm border border-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
          />
          {filter.search && (
            <button
              type="button"
              onClick={() => onUpdateFilter({ search: '' })}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => onUpdateFilter({ category: 'all' })}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filter.category === 'all'
                ? 'bg-amber-500 text-[#0f0f13] border-amber-400 shadow-md font-bold'
                : 'bg-[#121217] text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            همه دسته‌ها
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = filter.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onUpdateFilter({ category: cat })}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm'
                    : 'bg-[#121217] text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Clear filters button if active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-rose-400 text-xs font-medium border border-stone-700 transition-all whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            <span>حذف فیلترها</span>
          </button>
        )}

      </div>
    </div>
  );
};
