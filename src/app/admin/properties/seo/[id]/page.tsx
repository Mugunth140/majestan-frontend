'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, AlertCircle, Save } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { toast } from '@/components/ui/toast-store';
import { ModernLoader } from '@/components/admin/ui/ModernLoader';
import { GoogleSearchPreview } from '@/components/admin/seo/GoogleSearchPreview';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SeoPageFields {
  title?: string;
  description?: string;
  h1?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  robots?: string;
}

interface LocalitySeoFields extends SeoPageFields {
  content_overview?: string;
  content_connectivity?: string;
  content_education?: string;
  content_healthcare?: string;
  content_shopping?: string;
}

interface FormData {
  overview: SeoPageFields;
  amenities: SeoPageFields;
  floor_plan: SeoPageFields;
  locality: LocalitySeoFields;
  photos: SeoPageFields;
}

interface PublishData {
  verificationStatus: string;
  approvalStatus: string;
}

interface PropertySeoResponse {
  id: number;
  title: string;
  slug: string;
  propertyCode: string;
  propertyType: string;
  status: string;
  seo?: {
    id: number;
    seoData: {
      overview?: SeoPageFields;
      amenities?: SeoPageFields;
      floor_plan?: SeoPageFields;
      locality?: LocalitySeoFields;
      photos?: SeoPageFields;
    };
    verificationStatus: string;
    approvalStatus: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

type TabKey = 'overview' | 'amenities' | 'floor_plan' | 'locality' | 'photos';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'floor_plan', label: 'Floor Plan' },
  { key: 'locality', label: 'Locality' },
  { key: 'photos', label: 'Photos' },
];

const ROBOTS_OPTIONS = [
  { value: 'index,follow', label: 'Index & Follow' },
  { value: 'noindex,follow', label: 'No Index, Follow' },
  { value: 'noindex,nofollow', label: 'No Index, No Follow' },
];

const EMPTY_PAGE_FIELDS: SeoPageFields = {
  title: '',
  description: '',
  h1: '',
  og_title: '',
  og_description: '',
  og_image: '',
  robots: 'index,follow',
};

const EMPTY_LOCALITY_FIELDS: LocalitySeoFields = {
  ...EMPTY_PAGE_FIELDS,
  content_overview: '',
  content_connectivity: '',
  content_education: '',
  content_healthcare: '',
  content_shopping: '',
};

const DEFAULT_FORM_DATA: FormData = {
  overview: { ...EMPTY_PAGE_FIELDS },
  amenities: { ...EMPTY_PAGE_FIELDS },
  floor_plan: { ...EMPTY_PAGE_FIELDS },
  locality: { ...EMPTY_LOCALITY_FIELDS },
  photos: { ...EMPTY_PAGE_FIELDS },
};

// ─── Field helpers ────────────────────────────────────────────────────────────

const LABEL_CLASS =
  '!block !text-[13px] !font-medium !text-gray-300 !mb-1.5';

const INPUT_CLASS =
  '!bg-gray-50 dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !text-gray-900 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-[#27427f]/40 focus:!border-[#27427f] !shadow-sm !block !w-full !px-3.5 !py-2.5 !outline-none !transition-all !placeholder-gray-600';

const TEXTAREA_CLASS =
  '!bg-gray-50 dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !text-gray-900 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-[#27427f]/40 focus:!border-[#27427f] !shadow-sm !block !w-full !px-3.5 !py-2.5 !outline-none !transition-all !resize-none !placeholder-gray-600';

const SELECT_CLASS =
  '!bg-gray-50 dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !text-gray-900 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-[#27427f]/40 focus:!border-[#27427f] !shadow-sm !block !w-full !px-3.5 !py-2.5 !outline-none !transition-all';

const COUNTER_CLASS = '!text-[12px] !text-gray-500 !mt-1 !text-right';

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="!space-y-1.5">{children}</div>;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PropertySeoEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [property, setProperty] = useState<PropertySeoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [publishData, setPublishData] = useState<PublishData>({
    verificationStatus: 'pending',
    approvalStatus: 'draft',
  });
  const [isSaving, setIsSaving] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const token = window.localStorage.getItem('majestan_access_token');
      const res = await fetch(`${API_BASE_URL}/admin/seo/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data: PropertySeoResponse = json.data ?? json;
      setProperty(data);

      if (data.seo?.seoData) {
        const sd = data.seo.seoData;
        setFormData({
          overview: { ...EMPTY_PAGE_FIELDS, ...(sd.overview ?? {}) },
          amenities: { ...EMPTY_PAGE_FIELDS, ...(sd.amenities ?? {}) },
          floor_plan: { ...EMPTY_PAGE_FIELDS, ...(sd.floor_plan ?? {}) },
          locality: { ...EMPTY_LOCALITY_FIELDS, ...(sd.locality ?? {}) },
          photos: { ...EMPTY_PAGE_FIELDS, ...(sd.photos ?? {}) },
        });
      }

      if (data.seo) {
        setPublishData({
          verificationStatus: data.seo.verificationStatus ?? 'pending',
          approvalStatus: data.seo.approvalStatus ?? 'draft',
        });
      }
    } catch {
      setError(true);
      toast.error('Failed to load SEO data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function updateField<T extends TabKey>(
    tab: T,
    field: keyof FormData[T],
    value: string
  ) {
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const token = window.localStorage.getItem('majestan_access_token');
      const body = {
        ...formData,
        verificationStatus: publishData.verificationStatus,
        approvalStatus: publishData.approvalStatus,
      };
      const res = await fetch(`${API_BASE_URL}/admin/seo/properties/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success('SEO data saved successfully');
    } catch {
      toast.error('Failed to save SEO data');
    } finally {
      setIsSaving(false);
    }
  }

  // ── Loading / Error states ─────────────────────────────────────────────────

  if (loading) return <ModernLoader text="Loading SEO Data..." />;

  if (error) {
    return (
      <div className="!flex !flex-col !items-center !justify-center !min-h-[60vh] !gap-4">
        <AlertCircle size={40} className="!text-red-400" />
        <p className="!text-[15px] !text-gray-400">
          Failed to load SEO data for this property.
        </p>
        <button
          onClick={fetchData}
          className="!px-5 !py-2.5 !text-[14px] !font-medium !rounded-xl !bg-[#27427f] !text-gray-900 dark:!text-white hover:!bg-[#2d4f99] !transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentTab = formData[activeTab] as SeoPageFields;
  const slug = property?.slug ?? '';

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="!w-full !space-y-6 !pb-20">
      {/* Page Header */}
      <div className="!flex !items-start !gap-3 !ml-1">
        <button
          onClick={() => router.push('/admin/properties/seo')}
          className="!mt-0.5 !p-2 !rounded-xl !text-gray-400 hover:!text-gray-900 dark:!text-white hover:!bg-white dark:!bg-[#1a1f2e] !transition-all !border !border-transparent hover:!border-gray-200 dark:!border-[#262730]"
          aria-label="Back to SEO list"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="!text-2xl !font-medium !text-gray-900 dark:!text-white !tracking-tight">
            SEO &amp; Publish
          </h2>
          {property && (
            <p className="!text-[14px] !text-gray-400 !mt-0.5">
              {property.title}
              {property.propertyCode && (
                <span className="!ml-2 !text-gray-600">
                  · {property.propertyCode}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="!border-b !border-gray-200 dark:!border-[#262730] !overflow-x-auto">
        <div className="!flex !gap-0 !min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  '!px-5 !py-3 !text-[14px] !font-medium !transition-all !whitespace-nowrap !border-b-2',
                  isActive
                    ? '!text-[#27427f] !border-[#27427f]'
                    : '!text-gray-500 !border-transparent hover:!text-gray-300 hover:!border-gray-200 dark:!border-[#262730]',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEO Form */}
      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6">
        <div className="!space-y-6">
          {/* Meta Title */}
          <FieldGroup>
            <label className={LABEL_CLASS}>Meta Title</label>
            <input
              type="text"
              className={INPUT_CLASS}
              placeholder="Enter meta title..."
              maxLength={60}
              value={currentTab.title ?? ''}
              onChange={(e) =>
                updateField(activeTab, 'title' as keyof FormData[typeof activeTab], e.target.value)
              }
            />
            <p className={COUNTER_CLASS}>
              {(currentTab.title ?? '').length}/60
            </p>
          </FieldGroup>

          {/* Meta Description */}
          <FieldGroup>
            <label className={LABEL_CLASS}>Meta Description</label>
            <textarea
              className={TEXTAREA_CLASS}
              rows={3}
              placeholder="Enter meta description..."
              maxLength={160}
              value={currentTab.description ?? ''}
              onChange={(e) =>
                updateField(activeTab, 'description' as keyof FormData[typeof activeTab], e.target.value)
              }
            />
            <p className={COUNTER_CLASS}>
              {(currentTab.description ?? '').length}/160
            </p>
          </FieldGroup>

          {/* Google Search Preview */}
          <GoogleSearchPreview
            title={currentTab.title}
            description={currentTab.description}
            slug={slug}
          />

          {/* H1 Heading */}
          <FieldGroup>
            <label className={LABEL_CLASS}>
              H1 Heading{' '}
              <span className="!text-gray-600 !font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className={INPUT_CLASS}
              placeholder="Enter H1 heading..."
              value={currentTab.h1 ?? ''}
              onChange={(e) =>
                updateField(activeTab, 'h1' as keyof FormData[typeof activeTab], e.target.value)
              }
            />
          </FieldGroup>

          {/* OG Title */}
          <FieldGroup>
            <label className={LABEL_CLASS}>
              OG Title{' '}
              <span className="!text-gray-600 !font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className={INPUT_CLASS}
              placeholder="Enter Open Graph title..."
              value={currentTab.og_title ?? ''}
              onChange={(e) =>
                updateField(activeTab, 'og_title' as keyof FormData[typeof activeTab], e.target.value)
              }
            />
          </FieldGroup>

          {/* OG Description */}
          <FieldGroup>
            <label className={LABEL_CLASS}>
              OG Description{' '}
              <span className="!text-gray-600 !font-normal">(optional)</span>
            </label>
            <textarea
              className={TEXTAREA_CLASS}
              rows={2}
              placeholder="Enter Open Graph description..."
              value={currentTab.og_description ?? ''}
              onChange={(e) =>
                updateField(activeTab, 'og_description' as keyof FormData[typeof activeTab], e.target.value)
              }
            />
          </FieldGroup>

          {/* OG Image URL */}
          <FieldGroup>
            <label className={LABEL_CLASS}>
              OG Image URL{' '}
              <span className="!text-gray-600 !font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className={INPUT_CLASS}
              placeholder="https://..."
              value={currentTab.og_image ?? ''}
              onChange={(e) =>
                updateField(activeTab, 'og_image' as keyof FormData[typeof activeTab], e.target.value)
              }
            />
          </FieldGroup>

          {/* Robots */}
          <FieldGroup>
            <label className={LABEL_CLASS}>Robots</label>
            <select
              className={SELECT_CLASS}
              value={currentTab.robots ?? 'index,follow'}
              onChange={(e) =>
                updateField(activeTab, 'robots' as keyof FormData[typeof activeTab], e.target.value)
              }
            >
              {ROBOTS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FieldGroup>

          {/* Locality-only extra content fields */}
          {activeTab === 'locality' && (
            <>
              <div className="!pt-2 !border-t !border-gray-200 dark:!border-[#262730]">
                <p className="!text-[13px] !font-semibold !text-gray-300 !uppercase !tracking-wider !mb-5">
                  Locality Content
                </p>
                <div className="!space-y-6">
                  <FieldGroup>
                    <label className={LABEL_CLASS}>Content: Overview</label>
                    <textarea
                      className={TEXTAREA_CLASS}
                      rows={5}
                      placeholder="Write about the locality overview..."
                      value={(formData.locality as LocalitySeoFields).content_overview ?? ''}
                      onChange={(e) =>
                        updateField('locality', 'content_overview', e.target.value)
                      }
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <label className={LABEL_CLASS}>Content: Connectivity</label>
                    <textarea
                      className={TEXTAREA_CLASS}
                      rows={5}
                      placeholder="Write about connectivity (metro, roads, transport)..."
                      value={(formData.locality as LocalitySeoFields).content_connectivity ?? ''}
                      onChange={(e) =>
                        updateField('locality', 'content_connectivity', e.target.value)
                      }
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <label className={LABEL_CLASS}>Content: Education</label>
                    <textarea
                      className={TEXTAREA_CLASS}
                      rows={5}
                      placeholder="Write about nearby schools and educational institutions..."
                      value={(formData.locality as LocalitySeoFields).content_education ?? ''}
                      onChange={(e) =>
                        updateField('locality', 'content_education', e.target.value)
                      }
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <label className={LABEL_CLASS}>Content: Healthcare</label>
                    <textarea
                      className={TEXTAREA_CLASS}
                      rows={5}
                      placeholder="Write about nearby hospitals and clinics..."
                      value={(formData.locality as LocalitySeoFields).content_healthcare ?? ''}
                      onChange={(e) =>
                        updateField('locality', 'content_healthcare', e.target.value)
                      }
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <label className={LABEL_CLASS}>Content: Shopping</label>
                    <textarea
                      className={TEXTAREA_CLASS}
                      rows={5}
                      placeholder="Write about nearby malls and shopping centres..."
                      value={(formData.locality as LocalitySeoFields).content_shopping ?? ''}
                      onChange={(e) =>
                        updateField('locality', 'content_shopping', e.target.value)
                      }
                    />
                  </FieldGroup>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Publish Controls */}
      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6">
        <p className="!text-[15px] !font-semibold !text-gray-900 dark:!text-white !mb-5">
          Publish Controls
        </p>
        <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-5">
          <FieldGroup>
            <label className={LABEL_CLASS}>Verification Status</label>
            <select
              className={SELECT_CLASS}
              value={publishData.verificationStatus}
              onChange={(e) =>
                setPublishData((prev) => ({
                  ...prev,
                  verificationStatus: e.target.value,
                }))
              }
            >
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
            </select>
          </FieldGroup>

          <FieldGroup>
            <label className={LABEL_CLASS}>Approval Status</label>
            <select
              className={SELECT_CLASS}
              value={publishData.approvalStatus}
              onChange={(e) =>
                setPublishData((prev) => ({
                  ...prev,
                  approvalStatus: e.target.value,
                }))
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </FieldGroup>
        </div>
      </div>

      {/* Save Button */}
      <div className="!flex !justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="!inline-flex !items-center !gap-2 !px-6 !py-3 !text-[14px] !font-semibold !rounded-xl !bg-[#27427f] !text-gray-900 dark:!text-white hover:!bg-[#2d4f99] !transition-all disabled:!opacity-60 disabled:!cursor-not-allowed !shadow-lg"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
