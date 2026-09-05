import React, { useState, useEffect, useMemo } from 'react';
import { PropertyFile, PropertyFilter, PropertyStatus, PropertyCategory, ApplicantRequest } from './types';
import { smartSearchMatch } from './utils/search';
import {
  fetchProperties,
  createPropertyFile,
  updatePropertyFile,
  deletePropertyFile,
  updatePropertyStatus,
  addSamplePropertyFile,
  fetchApplicants,
  createApplicant,
  updateApplicant,
  deleteApplicant,
} from './services/api';
import { Header } from './components/Header';
import { StatusTabs } from './components/StatusTabs';
import { FilterBar } from './components/FilterBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { PropertyFormModal } from './components/PropertyFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ApplicantCard } from './components/ApplicantCard';
import { ApplicantFormModal } from './components/ApplicantFormModal';
import { ApplicantDeleteConfirmModal } from './components/ApplicantDeleteConfirmModal';
import { BulkImportModal } from './components/BulkImportModal';
import {
  Building2,
  Plus,
  Layers,
  AlertCircle,
  CheckCircle2,
  Loader2,
  SearchX,
  Sparkles,
  Search,
  UserSearch,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  const [properties, setProperties] = useState<PropertyFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Main Status Tab
  const [activeStatusTab, setActiveStatusTab] = useState<PropertyStatus | 'all'>('active');

  // Filters
  const [filter, setFilter] = useState<PropertyFilter>({
    search: '',
    status: 'active',
    category: 'all',
  });

  // Modal States
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState<PropertyFile | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyFile | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  // ── خواهان‌ها (متقاضیان ملک) ──
  const [isApplicantsView, setIsApplicantsView] = useState(false);
  const [applicants, setApplicants] = useState<ApplicantRequest[]>([]);
  const [applicantsSearch, setApplicantsSearch] = useState('');
  const [applicantFormOpen, setApplicantFormOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<ApplicantRequest | null>(null);
  const [applicantToDelete, setApplicantToDelete] = useState<ApplicantRequest | null>(null);
  const [isDeletingApplicant, setIsDeletingApplicant] = useState(false);
  const [deleteApplicantError, setDeleteApplicantError] = useState<string | null>(null);

  // Sync activeStatusTab with filter.status
  const handleSelectStatusTab = (status: PropertyStatus | 'all') => {
    setActiveStatusTab(status);
    setFilter(prev => ({ ...prev, status }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadProperties = async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) setIsRefreshing(true);
      setErrorMessage(null);
      const data = await fetchProperties();
      setProperties(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ارتباط با سرور دفتر املاک');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProperties();
    loadApplicants();
  }, []);

  // ── منطق بارگذاری و عملیات خواهان‌ها ──
  const loadApplicants = async () => {
    try {
      const data = await fetchApplicants();
      setApplicants(data);
    } catch (err: any) {
      // خطای بارگذاری خواهان‌ها مانع کار بخش فایل‌های ملک نمی‌شود
      console.error(err);
    }
  };

  const filteredApplicants = useMemo(() => {
    if (!applicantsSearch.trim()) return applicants;
    const q = applicantsSearch.trim().toLowerCase();
    return applicants.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q) ||
      a.regions?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      a.code?.toLowerCase().includes(q)
    );
  }, [applicants, applicantsSearch]);

  const handleOpenNewApplicantForm = () => {
    setEditingApplicant(null);
    setApplicantFormOpen(true);
  };

  const handleOpenEditApplicantForm = (applicant: ApplicantRequest) => {
    setEditingApplicant(applicant);
    setApplicantFormOpen(true);
  };

  const handleSaveApplicant = async (data: Partial<ApplicantRequest>) => {
    if (editingApplicant) {
      await updateApplicant(editingApplicant.id, data);
      showToast(`اطلاعات خواهان «${data.name || editingApplicant.name}» ویرایش شد.`);
    } else {
      const created = await createApplicant(data);
      showToast(`خواهان جدید با کد ${created.code} ثبت شد.`);
    }
    await loadApplicants();
  };

  const handleDeleteApplicant = (applicant: ApplicantRequest) => {
    setDeleteApplicantError(null);
    setApplicantToDelete(applicant);
  };

  const handleConfirmDeleteApplicant = async () => {
    if (!applicantToDelete) return;
    setIsDeletingApplicant(true);
    setDeleteApplicantError(null);
    try {
      await deleteApplicant(applicantToDelete.id);
      setApplicants(prev => prev.filter(a => a.id !== applicantToDelete.id));
      showToast(`خواهان «${applicantToDelete.name}» حذف شد.`);
      setApplicantToDelete(null);
      await loadApplicants();
    } catch (err: any) {
      setDeleteApplicantError(err.message || 'خطا در حذف خواهان');
    } finally {
      setIsDeletingApplicant(false);
    }
  };

  // Filtered Properties
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // 1. Status Filter
      if (filter.status !== 'all' && p.status !== filter.status) {
        return false;
      }
      // 2. Category Filter
      if (filter.category !== 'all' && p.category !== filter.category) {
        return false;
      }
      // 3. Smart Search Filter across all fields (code, title, category, region, address, area, price, rent, mortgage, bedrooms, features, description, notes)
      if (filter.search.trim()) {
        if (!smartSearchMatch(p, filter.search)) {
          return false;
        }
      }
      return true;
    });
  }, [properties, filter]);

  // Handlers
  const handleOpenNewForm = () => {
    setEditingProperty(null);
    setFormModalOpen(true);
  };

  const handleOpenEditForm = (property: PropertyFile) => {
    setEditingProperty(property);
    setFormModalOpen(true);
  };

  const handleSaveProperty = async (data: Partial<PropertyFile>) => {
    if (editingProperty) {
      await updatePropertyFile(editingProperty.id, data);
      showToast(`فایل ملک با کد ${data.code || editingProperty.code} با موفقیت ویرایش شد.`);
    } else {
      const created = await createPropertyFile(data);
      showToast(`فایل ملک جدید با کد ${created.code} در سرور ثبت شد.`);
    }
    await loadProperties();
  };

  const handleDeleteProperty = (property: PropertyFile) => {
    setDeleteErrorMessage(null);
    setPropertyToDelete(property);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    setDeleteErrorMessage(null);
    try {
      await deletePropertyFile(propertyToDelete.id);
      // Immediately remove from local state so UI updates instantly without manual refresh
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      if (selectedPropertyDetail?.id === propertyToDelete.id) {
        setSelectedPropertyDetail(null);
      }
      showToast(`فایل ملک با کد ${propertyToDelete.code} و رسانه‌های مرتبط با موفقیت حذف شد.`);
      setPropertyToDelete(null);
      // Also sync from backend
      await loadProperties();
    } catch (err: any) {
      setDeleteErrorMessage(err.message || 'خطا در حذف فایل ملک');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeStatus = async (id: string, newStatus: PropertyStatus) => {
    try {
      await updatePropertyStatus(id, newStatus);
      const statusNames: Record<PropertyStatus, string> = {
        active: 'فایل فعال',
        reserved: 'رزرو شده',
        sold_inactive: 'فروخته شده / غیرفعال',
      };
      showToast(`وضعیت ملک به «${statusNames[newStatus]}» تغییر کرد.`);
      await loadProperties();
    } catch (err: any) {
      alert(err.message || 'خطا در تغییر وضعیت فایل');
    }
  };

  const handleAddSample = async () => {
    try {
      setIsRefreshing(true);
      await addSamplePropertyFile();
      await loadProperties();
      showToast('فایل نمونه با مشخصات کامل، عکس و ویدیو به سیستم اضافه شد.');
    } catch (err: any) {
      alert(err.message || 'خطا در افزودن فایل نمونه');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-stone-100 font-sans selection:bg-amber-500 selection:text-black flex flex-col" dir="rtl">
      
      {/* Top Navigation & Status Bar */}
      <Header
        properties={properties}
        onAddNew={handleOpenNewForm}
        onRefresh={() => loadProperties(true)}
        isRefreshing={isRefreshing}
        onAddSample={handleAddSample}
      />

      {/* Main Single-View Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => loadProperties(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Status Tabs ("داشبورد اصلی شامل: 1. فایلهای فعال 2. فایلهای رزرو شده 3. فایلهای فروخته شده / غیر فعال + خواهان‌ها") */}
        <StatusTabs
          properties={properties}
          activeStatus={activeStatusTab}
          onSelectStatus={(status) => {
            setIsApplicantsView(false);
            handleSelectStatusTab(status);
          }}
          applicantsCount={applicants.length}
          isApplicantsView={isApplicantsView}
          onSelectApplicants={() => setIsApplicantsView(true)}
        />

        {isApplicantsView ? (
          <>
            {/* نوار جستجو و افزودن خواهان جدید */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-stone-800">
                <Search className="w-4 h-4 text-stone-500 shrink-0" />
                <input
                  type="text"
                  value={applicantsSearch}
                  onChange={(e) => setApplicantsSearch(e.target.value)}
                  placeholder="جستجوی خواهان (نام، تماس، منطقه، دسته)..."
                  className="flex-1 bg-transparent text-stone-100 text-sm focus:outline-none placeholder:text-stone-600"
                />
              </div>
              <button
                type="button"
                onClick={handleOpenNewApplicantForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-[#0f0f13] font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>افزودن خواهان</span>
              </button>
            </div>

            {/* لیست خواهان‌ها */}
            {filteredApplicants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {filteredApplicants.map((applicant) => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    onEdit={handleOpenEditApplicantForm}
                    onDelete={handleDeleteApplicant}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 bg-[#141418] border border-stone-800/80 rounded-3xl text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400">
                  <UserSearch className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-stone-200 mb-2">
                  هنوز هیچ خواهانی ثبت نشده
                </h3>
                <p className="text-sm text-stone-400 max-w-md mx-auto mb-6">
                  اطلاعات متقاضیانی که به دنبال ملک هستند را اینجا ثبت کنید تا به‌جای دفترچه کاغذی، دیجیتال و قابل جستجو بماند.
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewApplicantForm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0f0f13] text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن اولین خواهان</span>
                </button>
              </div>
            )}
          </>
        ) : (
        <>
        {/* Filter Bar (Search by code, title, region + Category filter) + Bulk Import */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <FilterBar
              filter={filter}
              onUpdateFilter={(changes) => setFilter(prev => ({ ...prev, ...changes }))}
              onClearFilters={() => setFilter({ search: '', status: activeStatusTab, category: 'all' })}
            />
          </div>
          <button
            type="button"
            onClick={() => setBulkImportOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181f] border border-stone-700 hover:border-amber-500/60 hover:text-amber-300 text-stone-300 text-xs font-bold transition-all whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ورود گروهی از اکسل</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-400 gap-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-sm font-medium">در حال دریافت فایلهای املاک از سرور دفتر...</span>
          </div>
        ) : filteredProperties.length > 0 ? (
          /* Properties Grid ("کارتهای زیبا برای نمایش فایلها") */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetail={(item) => setSelectedPropertyDetail(item)}
                onEdit={handleOpenEditForm}
                onDelete={handleDeleteProperty}
                onChangeStatus={handleChangeStatus}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 bg-[#141418] border border-stone-800/80 rounded-3xl text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-200 mb-2">
              هیچ فایلی با این فیلتر یا وضعیت یافت نشد
            </h3>
            <p className="text-sm text-stone-400 max-w-md mx-auto mb-6">
              می‌توانید فیلترهای جستجو را پاک کنید یا یک فایل جدید در این بخش به ثبت برسانید.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setFilter({ search: '', status: 'all', category: 'all' })}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all"
              >
                نمایش همه فایل‌ها
              </button>

              <button
                type="button"
                onClick={handleAddSample}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>تزریق فایل نمونه آزمایشی</span>
              </button>

              <button
                type="button"
                onClick={handleOpenNewForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0f0f13] text-xs font-bold transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن فایل جدید</span>
              </button>
            </div>
          </div>
        )}
        </>
        )}

      </main>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1e26] border border-amber-500/40 text-stone-100 px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/60 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Property Details & Media Modal */}
      {selectedPropertyDetail && (
        <PropertyDetailModal
          property={selectedPropertyDetail}
          onClose={() => setSelectedPropertyDetail(null)}
          onEdit={(item) => {
            setSelectedPropertyDetail(null);
            handleOpenEditForm(item);
          }}
          onDelete={handleDeleteProperty}
          onChangeStatus={(id, status) => {
            handleChangeStatus(id, status);
            // update currently viewed modal property status immediately
            setSelectedPropertyDetail(prev => prev && prev.id === id ? { ...prev, status } : prev);
          }}
        />
      )}

      {/* Add / Edit Property Form Modal */}
      {formModalOpen && (
        <PropertyFormModal
          initialData={editingProperty}
          onClose={() => {
            setFormModalOpen(false);
            setEditingProperty(null);
          }}
          onSave={handleSaveProperty}
        />
      )}

      {/* Bulk Import Modal (Excel paste) */}
      {bulkImportOpen && (
        <BulkImportModal
          existingProperties={properties}
          onClose={() => setBulkImportOpen(false)}
          onDone={() => loadProperties(true)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        property={propertyToDelete}
        isOpen={!!propertyToDelete}
        isDeleting={isDeleting}
        errorMessage={deleteErrorMessage}
        onClose={() => {
          if (!isDeleting) setPropertyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Add / Edit Applicant Form Modal */}
      {applicantFormOpen && (
        <ApplicantFormModal
          initialData={editingApplicant}
          onClose={() => {
            setApplicantFormOpen(false);
            setEditingApplicant(null);
          }}
          onSave={handleSaveApplicant}
        />
      )}

      {/* Applicant Delete Confirmation Modal */}
      <ApplicantDeleteConfirmModal
        applicant={applicantToDelete}
        isOpen={!!applicantToDelete}
        isDeleting={isDeletingApplicant}
        errorMessage={deleteApplicantError}
        onClose={() => {
          if (!isDeletingApplicant) setApplicantToDelete(null);
        }}
        onConfirm={handleConfirmDeleteApplicant}
      />

      {/* Footer */}
      <footer className="border-t border-stone-800/60 py-6 mt-auto bg-[#121217]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <strong className="text-stone-400">املاک نامیان</strong>
            <span>• سامانه مدیریت داخلی فایلهای املاک (نسخه ۲.۵)</span>
          </div>
          <div>
            تمام حقوق محفوظ است. دسترسی مختص مشاوران و همکاران مجاز دفتر.
          </div>
        </div>
      </footer>

    </div>
  );
}
