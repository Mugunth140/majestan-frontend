"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ExternalLink, Eye } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/components/ui/toast-store";

interface ListingPageSeoData {
  id: number;
  pageKey: string;
  metaTitle: string | null;
  metaDescription: string | null;
  h1: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  robotsIndex: number;
  robotsFollow: number;
  customContent: string | null;
}

type FormState = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  customContent: string;
};

function charCounter(value: string, max: number) {
  const len = value.length;
  return (
    <span
      className={`!text-[12px] !font-medium ${
        len > max ? "!text-red-400" : len > max * 0.85 ? "!text-yellow-400" : "!text-gray-400"
      }`}
    >
      {len}/{max}
    </span>
  );
}

function autoGenerateSeo(pageKey: string): { title: string; description: string } {
  // e.g. "for-sale/apartments/coimbatore/saravanampatti/3-bhk"
  const parts = pageKey.split("/");
  const listingTypeRaw = parts[0] ?? "";
  const propertyTypeRaw = parts[1] ?? "properties";
  const cityRaw = parts[2] ?? "coimbatore";
  const localityRaw = parts[3];
  const bedroomRaw = parts[4];

  const toTitle = (s: string) =>
    s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const listingVerb = listingTypeRaw === "for-sale" ? "Sale" : "Rent";
  const propertyLabel = toTitle(propertyTypeRaw);
  const city = toTitle(cityRaw);
  const locality = localityRaw ? toTitle(localityRaw) : null;
  const bhk = bedroomRaw?.match(/^(\d+)-bhk$/) ? bedroomRaw.replace("-bhk", " BHK ") : "";

  const locationLabel = locality ? `${locality}, ${city}` : city;
  const title = `${bhk}${propertyLabel} for ${listingVerb} in ${locationLabel} | Majestan Realty`;
  const description = `Find the best ${bhk.toLowerCase()}${propertyLabel.toLowerCase()} for ${listingVerb.toLowerCase()} in ${locationLabel}. Browse verified listings with photos, prices, and floor plans at Majestan Realty.`;

  return { title: title.slice(0, 60), description: description.slice(0, 160) };
}

export default function AdminListingPageSeoEditPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const isNew = id === "new";

  const [record, setRecord] = useState<ListingPageSeoData | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [pageKeyInput, setPageKeyInput] = useState(() => {
    if (isNew) return searchParams.get("path")?.replace(/^\/+/, "") ?? "";
    return "";
  });

  const [form, setForm] = useState<FormState>({
    metaTitle: "",
    metaDescription: "",
    h1: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    robotsIndex: true,
    robotsFollow: true,
    customContent: "",
  });

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("majestan_access_token")
      : "";

  useEffect(() => {
    if (isNew) return;
    const fetchRecord = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/seo/listing-pages/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data: ListingPageSeoData = json.data ?? json;
        setRecord(data);
        setPageKeyInput(data.pageKey);
        setForm({
          metaTitle: data.metaTitle ?? "",
          metaDescription: data.metaDescription ?? "",
          h1: data.h1 ?? "",
          ogTitle: data.ogTitle ?? "",
          ogDescription: data.ogDescription ?? "",
          ogImageUrl: data.ogImageUrl ?? "",
          robotsIndex: !!data.robotsIndex,
          robotsFollow: !!data.robotsFollow,
          customContent: data.customContent ?? "",
        });
      } catch {
        toast.error("Failed to load SEO entry");
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id, isNew, token]);

  function handleAutoFill() {
    const key = record?.pageKey ?? pageKeyInput;
    if (!key) return;
    const { title, description } = autoGenerateSeo(key);
    setForm((f) => ({ ...f, metaTitle: title, metaDescription: description }));
    toast.success("Auto-filled from URL structure");
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        pageKey: isNew ? pageKeyInput.replace(/^\/+/, "") : undefined,
      };

      const url = isNew
        ? `${API_BASE_URL}/admin/seo/listing-pages`
        : `${API_BASE_URL}/admin/seo/listing-pages/${id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(isNew ? "SEO entry created" : "SEO entry saved");
      if (isNew) {
        router.push("/admin/seo");
      }
    } catch {
      toast.error("Failed to save SEO entry");
    } finally {
      setSaving(false);
    }
  }

  const Field = ({
    label,
    children,
  }: {
    label: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="!space-y-1.5">
      <label className="!block !text-[13px] !font-medium !text-gray-700 dark:!text-gray-300">
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls =
    "!w-full !bg-white dark:!bg-[#0f1117] !border !border-gray-200 dark:!border-[#262730] !text-gray-900 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-[#27427f]/40 focus:!border-[#27427f] !shadow-sm !outline-none !p-3 !transition-all !placeholder-gray-400";

  if (loading) {
    return (
      <div className="!w-full !flex !items-center !justify-center !py-24">
        <div className="!w-8 !h-8 !rounded-full !border-2 !border-[#27427f] !border-t-transparent !animate-spin" />
      </div>
    );
  }

  const pageKey = record?.pageKey ?? pageKeyInput;
  const previewTitle =
    form.metaTitle || (pageKey ? autoGenerateSeo(pageKey).title : "Page Title");
  const previewDesc =
    form.metaDescription ||
    (pageKey ? autoGenerateSeo(pageKey).description : "Page description...");

  return (
    <div className="!w-full !space-y-6 !max-w-4xl">
      {/* Header */}
      <div className="!flex !items-center !gap-4">
        <Link
          href="/admin/seo"
          className="!inline-flex !items-center !gap-2 !text-[14px] !text-gray-500 hover:!text-gray-900 dark:hover:!text-white !transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="!flex-1">
          <h2 className="!text-2xl !font-medium !text-gray-900 dark:!text-white !tracking-tight">
            {isNew ? "Add Listing Page SEO" : "Edit Listing Page SEO"}
          </h2>
          {pageKey && (
            <p className="!text-[13px] !font-mono !text-gray-500 !mt-0.5">/{pageKey}</p>
          )}
        </div>
        {pageKey && (
          <a
            href={`/${pageKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="!inline-flex !items-center !gap-2 !px-3 !py-2 !text-[13px] !text-gray-500 hover:!text-gray-900 dark:hover:!text-white !border !border-gray-200 dark:!border-[#262730] !rounded-xl !transition-colors"
          >
            <ExternalLink size={14} />
            View page
          </a>
        )}
      </div>

      {/* Page Key (new only) */}
      {isNew && (
        <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6 !space-y-3">
          <Field label="Page Path (without leading slash)">
            <input
              type="text"
              className={inputCls}
              placeholder="for-sale/apartments/coimbatore/saravanampatti"
              value={pageKeyInput}
              onChange={(e) => setPageKeyInput(e.target.value.replace(/^\/+/, ""))}
            />
            <p className="!text-[12px] !text-gray-400 !mt-1">
              Examples: for-sale/apartments/coimbatore · for-rent/villas/coimbatore/saravanampatti/2-bhk
            </p>
          </Field>
          {searchParams.get("path") && (
            <p className="!text-[12px] !text-green-600 dark:!text-green-400 !flex !items-center !gap-1.5">
              <span className="!w-1.5 !h-1.5 !rounded-full !bg-green-500 !inline-block" />
              Pre-filled from locality manager — verify and save to create the override.
            </p>
          )}
        </div>
      )}

      {/* Google Search Preview */}
      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6">
        <div className="!flex !items-center !gap-2 !mb-4">
          <Eye size={16} className="!text-gray-500" />
          <h3 className="!text-[14px] !font-semibold !text-gray-700 dark:!text-gray-300">
            Google Search Preview
          </h3>
        </div>
        <div className="!border !border-gray-100 dark:!border-[#262730] !rounded-xl !p-4 !bg-gray-50 dark:!bg-[#0f1117]">
          <div className="!text-[13px] !text-green-600 dark:!text-green-400 !mb-1">
            majestanrealty.com/{pageKey || "..."}
          </div>
          <div className="!text-[18px] !text-[#1a0dab] dark:!text-[#8ab4f8] !font-medium !leading-snug !mb-1 !truncate">
            {previewTitle}
          </div>
          <div className="!text-[14px] !text-gray-600 dark:!text-gray-400 !line-clamp-2">
            {previewDesc}
          </div>
        </div>
      </div>

      {/* Meta Tags */}
      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6 !space-y-5">
        <div className="!flex !items-center !justify-between">
          <h3 className="!text-[15px] !font-semibold !text-gray-900 dark:!text-white">
            Meta Tags
          </h3>
          <button
            type="button"
            onClick={handleAutoFill}
            className="!text-[13px] !text-[#27427f] dark:!text-[#6b93d6] hover:!underline !font-medium"
          >
            Auto-fill from URL
          </button>
        </div>

        <Field
          label={
            <div className="!flex !items-center !justify-between">
              <span>Meta Title</span>
              {charCounter(form.metaTitle, 60)}
            </div>
          }
        >
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. 3 BHK Apartments for Sale in Saravanampatti, Coimbatore | Majestan Realty"
            value={form.metaTitle}
            onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
          />
        </Field>

        <Field
          label={
            <div className="!flex !items-center !justify-between">
              <span>Meta Description</span>
              {charCounter(form.metaDescription, 160)}
            </div>
          }
        >
          <textarea
            rows={3}
            className={`${inputCls} !resize-none`}
            placeholder="Brief description of this listing page for search engines..."
            value={form.metaDescription}
            onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
          />
        </Field>

        <Field label="H1 Heading (overrides auto-generated heading)">
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. 3 BHK Apartments for Sale in Saravanampatti"
            value={form.h1}
            onChange={(e) => setForm((f) => ({ ...f, h1: e.target.value }))}
          />
        </Field>
      </div>

      {/* Open Graph */}
      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6 !space-y-5">
        <h3 className="!text-[15px] !font-semibold !text-gray-900 dark:!text-white">
          Open Graph (Social Sharing)
        </h3>

        <Field
          label={
            <div className="!flex !items-center !justify-between">
              <span>OG Title</span>
              {charCounter(form.ogTitle, 60)}
            </div>
          }
        >
          <input
            type="text"
            className={inputCls}
            placeholder="Defaults to Meta Title if empty"
            value={form.ogTitle}
            onChange={(e) => setForm((f) => ({ ...f, ogTitle: e.target.value }))}
          />
        </Field>

        <Field
          label={
            <div className="!flex !items-center !justify-between">
              <span>OG Description</span>
              {charCounter(form.ogDescription, 160)}
            </div>
          }
        >
          <textarea
            rows={2}
            className={`${inputCls} !resize-none`}
            placeholder="Defaults to Meta Description if empty"
            value={form.ogDescription}
            onChange={(e) => setForm((f) => ({ ...f, ogDescription: e.target.value }))}
          />
        </Field>

        <Field label="OG Image URL">
          <input
            type="text"
            className={inputCls}
            placeholder="https://..."
            value={form.ogImageUrl}
            onChange={(e) => setForm((f) => ({ ...f, ogImageUrl: e.target.value }))}
          />
        </Field>
      </div>

      {/* Robots */}
      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6 !space-y-4">
        <h3 className="!text-[15px] !font-semibold !text-gray-900 dark:!text-white">
          Robots
        </h3>
        <div className="!flex !flex-col !gap-3">
          {[
            { key: "robotsIndex", label: "Allow indexing (index)", desc: "Let search engines index this page" },
            { key: "robotsFollow", label: "Allow following links (follow)", desc: "Let crawlers follow links on this page" },
          ].map(({ key, label, desc }) => (
            <label key={key} className="!flex !items-start !gap-3 !cursor-pointer !group">
              <input
                type="checkbox"
                checked={form[key as keyof FormState] as boolean}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.checked }))
                }
                className="!mt-0.5 !w-4 !h-4 !rounded !border-gray-300 !text-[#27427f] focus:!ring-[#27427f]/40"
              />
              <div>
                <div className="!text-[14px] !font-medium !text-gray-800 dark:!text-gray-200 group-hover:!text-[#27427f] !transition-colors">
                  {label}
                </div>
                <div className="!text-[12px] !text-gray-500">{desc}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="!mt-2 !text-[13px] !text-gray-400">
          Robots tag: <span className="!font-mono !text-gray-600 dark:!text-gray-300">
            {form.robotsIndex ? "index" : "noindex"}, {form.robotsFollow ? "follow" : "nofollow"}
          </span>
        </div>
      </div>

      {/* Custom Content */}
      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6 !space-y-4">
        <div>
          <h3 className="!text-[15px] !font-semibold !text-gray-900 dark:!text-white">
            Custom Intro Content
          </h3>
          <p className="!text-[13px] !text-gray-500 !mt-1">
            Optional introductory paragraph shown above property listings. Useful for locality-specific content.
          </p>
        </div>
        <textarea
          rows={5}
          className={`${inputCls} !resize-y`}
          placeholder="e.g. Saravanampatti is a fast-growing IT corridor in Coimbatore, offering excellent connectivity to the tech park and city centre..."
          value={form.customContent}
          onChange={(e) => setForm((f) => ({ ...f, customContent: e.target.value }))}
        />
      </div>

      {/* Save bar */}
      <div className="!flex !items-center !justify-end !gap-3 !pb-4">
        <Link
          href="/admin/seo"
          className="!px-5 !py-2.5 !text-[14px] !font-medium !text-gray-600 dark:!text-gray-400 !border !border-gray-200 dark:!border-[#262730] !rounded-xl hover:!bg-gray-50 dark:hover:!bg-[#1e2436] !transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || (isNew && !pageKeyInput.trim())}
          className="!inline-flex !items-center !gap-2 !px-6 !py-2.5 !text-[14px] !font-semibold !rounded-xl !bg-[#27427f] !text-white hover:!bg-[#1d3162] disabled:!opacity-60 disabled:!cursor-not-allowed !transition-colors !shadow-sm"
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save SEO"}
        </button>
      </div>
    </div>
  );
}
