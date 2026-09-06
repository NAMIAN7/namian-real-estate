import React, { useState } from 'react';
import { PropertyFile, PropertyCategory } from '../types';
import { parsePastedExcelText, ParsedRow } from '../utils/bulkImportParser';
import { createPropertyFile } from '../services/api';
import { X, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, Eraser } from 'lucide-react';

interface BulkImportModalProps {
  existingProperties: PropertyFile[];
  onClose: () => void;
  onDone: () => void;
}

const CATEGORY_OPTIONS: PropertyCategory[] = ['خانه', 'زمین', 'باغ', 'مغازه', 'اجاره', 'نیمهساز'];

// حرف اول کدهایی که معمولاً برای هر دسته استفاده می‌شود (برای هشدار پیشگیرانه)
const EXPECTED_PREFIX: Partial<Record<PropertyCategory, string>> = {
  'خانه': 'H',
  'زمین': 'Z',
  'مغازه': 'G',
};

export function BulkImportModal({ existingProperties, onClose, onDone }: BulkImportModalProps) {
  const [category, setCategory] = useState<PropertyCategory>('خانه');
  const [pastedText, setPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [duplicateCodes, setDuplicateCodes] = useState<string[]>([]);
  const [prefixWarning, setPrefixWarning] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const existingCodes = new Set(existingProperties.map((p) => p.code));

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const clipboardText = e.clipboardData.getData('text');
    setPastedText(clipboardText);
    setParsedRows(null);
    setPrefixWarning(null);
  };

  const handleClear = () => {
    setPastedText('');
    setParsedRows(null);
    setParseErrors([]);
    setDuplicateCodes([]);
    setPrefixWarning(null);
    setImportDone(false);
    setImportErrors([]);
  };

  const handleParse = () => {
    const result = parsePastedExcelText(pastedText, category);
    setParseErrors(result.errors);

    const dupes: string[] = [];
    const fresh: ParsedRow[] = [];
    for (const row of result.rows) {
      if (existingCodes.has(row.rawCode)) {
        dupes.push(row.rawCode);
      } else {
        fresh.push(row);
      }
    }
    setDuplicateCodes(dupes);
    setParsedRows(fresh);
    setImportDone(false);
    setImportErrors([]);

    // ── هشدار عدم تطابق دسته‌بندی با حرف کد ──
    const expected = EXPECTED_PREFIX[category];
    if (expected) {
      const mismatched = fresh
        .map((r) => r.rawCode)
        .filter((code) => /^[A-Za-z]/.test(code) && code[0].toUpperCase() !== expected);
      if (mismatched.length > 0) {
        setPrefixWarning(
          `توجه: این کدها با حرف دیگری شروع شده‌اند (${mismatched.join('، ')})، در حالی که دسته انتخابی شما «${category}» است. لطفاً مطمئن شوید دسته‌بندی درستی انتخاب کرده‌اید، وگرنه فایل با دسته اشتباه ثبت می‌شود.`
        );
      } else {
        setPrefixWarning(null);
      }
    } else {
      setPrefixWarning(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedRows || parsedRows.length === 0) return;
    setIsImporting(true);
    setImportProgress(0);
    const errors: string[] = [];

    for (let i = 0; i < parsedRows.length; i++) {
      try {
        await createPropertyFile(parsedRows[i].data);
      } catch (err: any) {
        errors.push(`کد ${parsedRows[i].rawCode}: ${err.message || 'خطای نامشخص'}`);
      }
      setImportProgress(i + 1);
    }

    setImportErrors(errors);
    setIsImporting(false);
    setImportDone(true);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" dir="rtl">
      <div className="bg-[#141418] border border-stone-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800 sticky top-0 bg-[#141418] z-10">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-stone-100">ورود گروهی فایل‌ها از اکسل</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-800 text-stone-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!importDone && (
            <>
              <div>
                <label className="block text-sm font-bold text-stone-300 mb-2">
                  ۱. دسته‌بندی این فایل‌ها چیست؟ (حتماً قبل از Paste چک کن درست انتخاب شده باشد)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setParsedRows(null);
                        setPrefixWarning(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        category === cat
                          ? 'bg-amber-500 text-[#0f0f13] ring-2 ring-amber-300'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-amber-400/80 mt-2">
                  دسته انتخاب‌شده الان: <strong>{category}</strong>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-stone-300">
                    ۲. توی اکسل ردیف‌های داده را انتخاب و کپی کن (Ctrl+C)، بعد اینجا Paste کن (Ctrl+V):
                  </label>
                  {pastedText && (
                    <button
                      onClick={handleClear}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      پاک کردن جعبه
                    </button>
                  )}
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="اینجا Paste کنید... (هر بار Paste جدید، محتوای قبلی را کامل جایگزین می‌کند)"
                  rows={8}
                  className="w-full bg-[#0f0f13] border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                  dir="ltr"
                />
                <p className="text-xs text-stone-500 mt-1.5">
                  {pastedText ? `${pastedText.split(/\r\n|\r|\n/).filter(l => l.trim()).length} خط در جعبه هست.` : 'جعبه خالی است.'}
                </p>
              </div>

              <button
                onClick={handleParse}
                disabled={!pastedText.trim()}
                className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed text-stone-100 font-bold text-sm transition-all"
              >
                بررسی و پیش‌نمایش
              </button>

              {parsedRows !== null && (
                <div className="space-y-3 border-t border-stone-800 pt-5">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    {parsedRows.length} ردیف آماده ثبت شناسایی شد. (دسته: {category})
                  </div>

                  {prefixWarning && (
                    <div className="flex items-start gap-2 text-rose-300 text-xs bg-rose-500/15 border-2 border-rose-500/50 rounded-xl px-3 py-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{prefixWarning}</span>
                    </div>
                  )}

                  {duplicateCodes.length > 0 && (
                    <div className="flex items-start gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        {duplicateCodes.length} کد تکراری (از قبل ثبت‌شده) رد شد: {duplicateCodes.join('، ')}
                      </span>
                    </div>
                  )}

                  {parseErrors.length > 0 && (
                    <div className="flex items-start gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        {parseErrors.map((e, i) => <div key={i}>{e}</div>)}
                      </div>
                    </div>
                  )}

                  {parsedRows.length > 0 && (
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-stone-800">
                      <table className="w-full text-xs">
                        <thead className="bg-stone-900 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-right text-stone-400">کد</th>
                            <th className="px-3 py-2 text-right text-stone-400">دسته</th>
                            <th className="px-3 py-2 text-right text-stone-400">عنوان</th>
                            <th className="px-3 py-2 text-right text-stone-400">قیمت</th>
                            <th className="px-3 py-2 text-right text-stone-400">متراژ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedRows.map((row, i) => (
                            <tr key={i} className="border-t border-stone-800/60">
                              <td className="px-3 py-2 text-stone-300 font-bold">{row.data.code}</td>
                              <td className="px-3 py-2 text-amber-400">{row.data.category}</td>
                              <td className="px-3 py-2 text-stone-300">{row.data.title}</td>
                              <td className="px-3 py-2 text-stone-300">{row.data.price}</td>
                              <td className="px-3 py-2 text-stone-300">{row.data.area}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {parsedRows.length > 0 && (
                    <button
                      onClick={handleConfirmImport}
                      disabled={isImporting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0f0f13] font-bold text-sm shadow-md disabled:opacity-60"
                    >
                      {isImporting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          در حال ثبت... ({importProgress}/{parsedRows.length})
                        </span>
                      ) : (
                        `تایید و ثبت ${parsedRows.length} فایل با دسته «${category}»`
                      )}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {importDone && (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-stone-200 font-bold">
                عملیات تمام شد. {(parsedRows?.length || 0) - importErrors.length} فایل با موفقیت ثبت شد.
              </p>
              {importErrors.length > 0 && (
                <div className="text-right text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5 space-y-1">
                  <p className="font-bold">{importErrors.length} مورد با خطا مواجه شد:</p>
                  {importErrors.map((e, i) => <div key={i}>{e}</div>)}
                </div>
              )}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleClear}
                  className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-bold"
                >
                  ورود دسته بعدی
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0f0f13] text-sm font-bold"
                >
                  بستن
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
