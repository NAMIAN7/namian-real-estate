import React from 'react';
import { PropertyFile, PropertyStatus } from '../types';
import { CheckCircle2, Clock, Ban, Layers, UserSearch } from 'lucide-react';

interface StatusTabsProps {
  properties: PropertyFile[];
  activeStatus: PropertyStatus | 'all';
  onSelectStatus: (status: PropertyStatus | 'all') => void;
  applicantsCount?: number;
  isApplicantsView?: boolean;
  onSelectApplicants?: () => void;
}

export const StatusTabs: React.FC<StatusTabsProps> = ({
  properties,
  activeStatus,
  onSelectStatus,
  applicantsCount = 0,
  isApplicantsView = false,
  onSelectApplicants,
}) => {
  const allCount = properties.length;
  const activeCount = properties.filter(p => p.status === 'active').length;
  const reservedCount = properties.filter(p => p.status === 'reserved').length;
  const soldCount = properties.filter(p => p.status === 'sold_inactive').length;

  const tabs = [
    {
      id: 'active' as const,
      label: 'فایل‌های فعال',
      count: activeCount,
      icon: CheckCircle2,
      activeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'reserved' as const,
      label: 'فایل‌های رزرو شده',
      count: reservedCount,
      icon: Clock,
      activeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'sold_inactive' as const,
      label: 'فروخته شده / غیرفعال',
      count: soldCount,
      icon: Ban,
      activeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
      badgeColor: 'bg-rose-500/20 text-rose-300',
    },
    {
      id: 'all' as const,
      label: 'همه فایل‌های دفتر',
      count: allCount,
      icon: Layers,
      activeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
      badgeColor: 'bg-stone-800 text-stone-300',
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isSelected = !isApplicantsView && activeStatus === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectStatus(tab.id)}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all ${
              isSelected
                ? `${tab.activeColor} shadow-md shadow-black/20 scale-[1.02]`
                : 'bg-[#18181f] text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isSelected ? tab.badgeColor : 'bg-stone-800 text-stone-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}

      {/* تب جدا برای بخش خواهان‌ها (متقاضیان ملک) */}
      {onSelectApplicants && (
        <button
          type="button"
          onClick={onSelectApplicants}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all ${
            isApplicantsView
              ? 'bg-blue-500/15 text-blue-400 border-blue-500/40 shadow-md shadow-black/20 scale-[1.02]'
              : 'bg-[#18181f] text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
          }`}
        >
          <UserSearch className="w-4 h-4" />
          <span>خواهان‌ها</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              isApplicantsView ? 'bg-blue-500/20 text-blue-300' : 'bg-stone-800 text-stone-400'
            }`}
          >
            {applicantsCount}
          </span>
        </button>
      )}
    </div>
  );
};
