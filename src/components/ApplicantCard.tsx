import React from 'react';
import { ApplicantRequest } from '../types';
import { Phone, Ruler, Edit3, Trash2, StickyNote } from 'lucide-react';

interface ApplicantCardProps {
  applicant: ApplicantRequest;
  onEdit: (applicant: ApplicantRequest) => void;
  onDelete: (applicant: ApplicantRequest) => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onEdit,
  onDelete,
}) => {
  const summaryParts = [
    applicant.category,
    applicant.regions ? `در ${applicant.regions}` : '',
    applicant.budget || '',
  ].filter(Boolean);

  return (
    <div className="bg-[#18181f] border border-stone-800 rounded-2xl p-4 space-y-3 hover:border-amber-500/30 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-bold text-sm text-stone-100">{applicant.name}</h4>
          <span className="text-xs text-amber-400 font-mono">{applicant.code}</span>
        </div>
        <a
          href={`tel:${applicant.phone}`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121217] border border-stone-800 text-stone-300 text-xs font-mono hover:border-amber-500/40 hover:text-amber-300 transition-all"
          dir="ltr"
        >
          <Phone className="w-3.5 h-3.5" />
          {applicant.phone}
        </a>
      </div>

      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-[11px] text-amber-400 font-bold mb-1">دنبال چی می‌گردد</p>
        <p className="text-sm text-amber-200 font-semibold leading-relaxed">
          {summaryParts.join('، ')}
        </p>
      </div>

      {applicant.area && (
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <Ruler className="w-3.5 h-3.5 text-stone-500" />
          <span>{applicant.area}</span>
        </div>
      )}

      {applicant.note && (
        <div className="flex items-start gap-1.5 text-xs text-stone-400 pt-2 border-t border-stone-800">
          <StickyNote className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{applicant.note}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onEdit(applicant)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#121217] hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-bold transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>ویرایش</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(applicant)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
