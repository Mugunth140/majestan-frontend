"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { seoApi } from "./seo-admin-shell";

type Row = Record<string, any>;
type ImageOverride = {
  alt_text?: string;
  title_text?: string;
  caption?: string;
};
const tabs = [
  "Core search",
  "Local entity",
  "AI search",
  "Images",
  "Indexing & social",
];
const projectEntityFields = [
  ["builder_name", "Builder name"],
  ["rera_number", "RERA number"],
  ["approval_authority", "Approval authority"],
  ["sub_locality_override", "Sub locality"],
  ["pincode", "Pin code"],
  ["latitude", "Latitude", "number"],
  ["longitude", "Longitude", "number"],
  ["low_price", "Low price", "number"],
  ["high_price", "High price", "number"],
  ["price_per_sqft", "Price per sq. ft.", "number"],
  ["unit_configurations", "Unit configurations"],
  ["total_units", "Total units", "number"],
  ["total_area_acres", "Total area (acres)", "number"],
  ["possession_status", "Possession status"],
  ["possession_date", "Possession date", "date"],
  ["brochure_seo_title", "Brochure SEO title"],
] as const;
const propertyEntityFields = [
  ["builder_name", "Builder name"],
  ["rera_number", "RERA number"],
  ["approval_authority", "Approval authority"],
  ["sub_locality_override", "Sub locality"],
  ["pincode", "Pin code"],
  ["latitude", "Latitude", "number"],
  ["longitude", "Longitude", "number"],
  ["price_override", "Price override", "number"],
  ["builtup_area_sqft", "Built-up area (sq. ft.)", "number"],
  ["bhk_config", "BHK configuration"],
  ["approval_status", "Approval status"],
  ["furnishing_status", "Furnishing status"],
  ["facing_direction", "Facing direction"],
] as const;
const schemaTypes = [
  { value: "Apartment", label: "Apartment" },
  { value: "ApartmentComplex", label: "Apartment complex" },
  { value: "SingleFamilyResidence", label: "Single-family residence" },
  { value: "House", label: "House" },
  { value: "Landform", label: "Land / plot" },
  { value: "CommercialProperty", label: "Commercial property" },
  { value: "Industrial", label: "Industrial" },
  { value: "CoworkingSpace", label: "Coworking space" },
  { value: "Place", label: "Place" },
];

function asObject(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Row)
    : {};
}
function parseArray(value: unknown): Row[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
function parseJsonText(value: string, label: string): Row {
  if (!value.trim()) return {};
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must contain valid JSON.`);
  }
}
function Field({
  label,
  value,
  onChange,
  area = false,
  type = "text",
  placeholder = "",
  maxLength,
  step,
  rows = 3,
  readOnly = false,
}: {
  label: string;
  value: unknown;
  onChange?: (value: string) => void;
  area?: boolean;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  step?: string;
  rows?: number;
  readOnly?: boolean;
}) {
  const text = value == null ? "" : String(value);
  return (
    <label className="seo-field">
      <span className="seo-field-label">{label}</span>
      {area ? (
        <textarea
          value={text}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          readOnly={readOnly}
        />
      ) : (
        <input
          type={type}
          step={step}
          value={type === "date" && text ? text.slice(0, 10) : text}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          readOnly={readOnly}
        />
      )}
      {maxLength != null && (
        <small className="seo-counter">
          {text.length} / {maxLength}
        </small>
      )}
    </label>
  );
}

function SectionFields({
  title,
  value,
  fallback,
  onChange,
  allowIntro = true,
}: {
  title: string;
  value: Row;
  fallback: Row;
  onChange: (key: string, value: unknown) => void;
  allowIntro?: boolean;
}) {
  return (
    <section className="seo-panel seo-child-section">
      <h3>{title}</h3>
      <div className="seo-form-grid">
        <Field
          label="Meta title"
          value={value.meta_title}
          placeholder={fallback.meta_title || "Inherit from the main page"}
          onChange={(next) => onChange("meta_title", next)}
        />
        <Field
          label="H1 heading"
          value={value.h1}
          placeholder={fallback.h1 || "Inherit from the page content"}
          onChange={(next) => onChange("h1", next)}
        />
        <Field
          label="Canonical URL"
          value={value.canonical_url}
          placeholder={
            fallback.canonical_url || "Use the canonical section URL"
          }
          onChange={(next) => onChange("canonical_url", next)}
        />
        <label className="seo-check">
          <input
            type="checkbox"
            checked={value.robots_index !== false && value.robots_index !== 0}
            onChange={(event) => onChange("robots_index", event.target.checked)}
          />
          Allow this section to be indexed
        </label>
        <div className="seo-wide">
          <Field
            label="Meta description"
            value={value.meta_description}
            area
            rows={2}
            placeholder={
              fallback.meta_description || "Inherit from the main page"
            }
            onChange={(next) => onChange("meta_description", next)}
          />
        </div>
        {allowIntro && (
          <div className="seo-wide">
            <Field
              label="Section introduction"
              value={value.intro_text}
              area
              rows={3}
              placeholder={
                fallback.intro_text || "Optional section introduction"
              }
              onChange={(next) => onChange("intro_text", next)}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function AdvancedSeoEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: Row;
  onClose: () => void;
  onSaved: () => void;
}) {
  const original = initial.config || initial;
  const target = initial.target || {};
  const scope = original.scope || initial.scope;
  const isProject = scope === "project";
  const isProperty = scope === "property";
  const initialSettings = asObject(original.settings);
  const initialEntity = {
    ...asObject(initial.effective?.entity),
    ...asObject(initial.entity),
    ...asObject(initialSettings.entity),
  };
  const images: Row[] = Array.isArray(initial.images) ? initial.images : [];
  const socialImages = images.filter(
    (image) =>
      String(image.kind || "")
        .toLowerCase()
        .includes("photo") ||
      image.key === "project-cover" ||
      String(image.key || "").startsWith("property-image:"),
  );
  const defaultOgImage = useMemo(() => {
    const projectCover = images.find((image) => image.key === "project-cover");
    const firstPhoto = images.find((image) =>
      String(image.kind || "")
        .toLowerCase()
        .includes("photo"),
    );
    return (
      (isProject
        ? initial.default_og_image_url || projectCover?.image_url
        : initial.default_og_image_url || firstPhoto?.image_url) ||
      projectCover?.image_url ||
      firstPhoto?.image_url ||
      initial.default_og_image_url ||
      initial.effective?.og_image_url ||
      target.coverImageUrl ||
      ""
    );
  }, [
    images,
    isProject,
    initial.effective?.og_image_url,
    initial.default_og_image_url,
    target.coverImageUrl,
  ]);
  const [form, setForm] = useState<Row>(() => ({
    ...original,
    settings: {
      ...initialSettings,
      entity: initialEntity,
      expired_redirect_policy:
        initialSettings.expired_redirect_policy ||
        initial.effective?.expired_redirect_policy ||
        "redirect_to_locality",
      redirect_target_path:
        initialSettings.redirect_target_path ??
        initialSettings.expired_redirect_path ??
        initial.effective?.redirect_target_path ??
        "",
    },
    og_image_url: original.og_image_url || "",
  }));
  const [tab, setTab] = useState(0);
  const [editedSections, setEditedSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [preview, setPreview] = useState<"Desktop" | "Mobile">("Desktop");
  const [schema, setSchema] = useState(
    JSON.stringify(original.schema_overrides || {}, null, 2),
  );
  const [secondaryKeywordsText, setSecondaryKeywordsText] = useState(() => {
    const words =
      initialSettings.secondary_keywords || original.secondary_keywords || [];
    return Array.isArray(words) ? words.join(", ") : String(words);
  });
  const [highlightsText, setHighlightsText] = useState(() =>
    (original.highlights || []).join("\n"),
  );
  const [landmarks, setLandmarks] = useState<Row[]>(() =>
    parseArray(
      initialSettings.nearby_landmarks ??
        original.nearby_landmarks ??
        initial.effective?.nearby_landmarks ??
        initialEntity.nearby_landmarks ??
        initialEntity.landmarks,
    ),
  );
  const [commercialText, setCommercialText] = useState(() =>
    typeof initialEntity.commercial_specs === "string"
      ? initialEntity.commercial_specs
      : JSON.stringify(initialEntity.commercial_specs || {}, null, 2),
  );
  const [landText, setLandText] = useState(() =>
    typeof initialEntity.land_specs === "string"
      ? initialEntity.land_specs
      : JSON.stringify(initialEntity.land_specs || {}, null, 2),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const settings = asObject(form.settings);
  const entity = asObject(settings.entity);
  const sections = asObject(form.section_seo);
  const faq: Row[] = Array.isArray(form.faqs) ? form.faqs : [];
  const variables = asObject(initial.effective?.variables);
  const effectiveTitle =
    form.meta_title ||
    initial.effective?.meta_title ||
    target.name ||
    target.title ||
    "";
  const effectiveDescription =
    form.meta_description || initial.effective?.meta_description || "";
  const socialTitle = form.og_title || effectiveTitle;
  const socialDescription = form.og_description || effectiveDescription;
  const selectedOgImage = form.og_image_url || defaultOgImage;
  const title = effectiveTitle || "Search result title";
  const description = effectiveDescription || "Search result description";
  const set = (key: string, value: unknown) =>
    setForm((current) => ({ ...current, [key]: value }));
  const setSetting = (key: string, value: unknown) =>
    setForm((current) => ({
      ...current,
      settings: { ...asObject(current.settings), [key]: value },
    }));
  const setEntity = (key: string, value: unknown) =>
    setForm((current) => ({
      ...current,
      settings: {
        ...asObject(current.settings),
        entity: { ...asObject(current.settings?.entity), [key]: value },
      },
    }));
  const setSection = (section: string, key: string, value: unknown) => {
    setEditedSections((current) => new Set(current).add(section));
    setForm((current) => ({
      ...current,
      section_seo: {
        ...asObject(current.section_seo),
        [section]: {
          ...asObject(current.section_seo?.[section]),
          [key]: value,
        },
      },
    }));
  };
  const updateFaq = (index: number, key: string, value: string) =>
    set(
      "faqs",
      faq.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  const getImageFields = (image: Row): ImageOverride => {
    const overrides = asObject(form.image_alt_overrides);
    const entry =
      overrides[image.key] ?? overrides[image.image_url] ?? overrides[image.id];
    if (typeof entry === "string") return { alt_text: entry };
    return { ...asObject(entry) };
  };
  const setImageField = (
    image: Row,
    field: keyof ImageOverride,
    value: string,
  ) => {
    const fields = { ...getImageFields(image), [field]: value };
    const next = { ...asObject(form.image_alt_overrides) };
    if (image.key) next[image.key] = fields;
    if (image.image_url) next[image.image_url] = fields;
    set("image_alt_overrides", next);
  };
  const generateMissingAltText = () => {
    setForm((current) => {
      const next = { ...asObject(current.image_alt_overrides) };
      images.forEach((image, index) => {
        const currentEntry =
          next[image.key] ?? next[image.image_url] ?? next[image.id];
        const fields =
          typeof currentEntry === "string"
            ? { alt_text: currentEntry }
            : asObject(currentEntry);
        if (String(fields.alt_text || image.alt || "").trim()) return;
        const updated = { ...fields, alt_text: makeAlt(index) };
        if (image.key) next[image.key] = updated;
        if (image.image_url) next[image.image_url] = updated;
      });
      return { ...current, image_alt_overrides: next };
    });
  };
  const makeAlt = (index: number) => {
    const template = String(
      settings.image_alt_template ||
        initial.effective?.settings?.image_alt_template ||
        initial.effective?.image_alt_template ||
        "",
    ).trim();
    const defaults: Row = {
      Property_Name:
        variables.Property_Name || target.name || target.title || "",
      BHK: variables.BHK || target.bedrooms || "",
      Property_Type:
        variables.Property_Type ||
        target.property_type ||
        target.project_type ||
        "",
      Sub_Locality:
        entity.sub_locality_override ||
        variables.Sub_Locality ||
        target.sublocation_name ||
        target.sublocation ||
        "",
      City: variables.City || target.city || "",
      Image_Number: String(index + 1),
    };
    if (template) {
      return template
        .replace(/\{\{?([A-Za-z0-9_]+)\}?\}/g, (_, key: string) =>
          String(defaults[key] ?? variables[key] ?? ""),
        )
        .replace(/\s+/g, " ")
        .trim();
    }
    return `${defaults.Property_Name} ${defaults.BHK} ${defaults.Property_Type} in ${defaults.Sub_Locality} ${defaults.City} - View ${index + 1}`
      .replace(/\s+/g, " ")
      .trim();
  };

  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const nextEntity = {
        ...entity,
        nearby_landmarks: landmarks
          .filter(
            (item) =>
              item.name?.trim() || item.category?.trim() || item.distance_km,
          )
          .map((item) => ({
            ...item,
            ...(item.distance_km !== "" && item.distance_km != null
              ? { distance_km: Number(item.distance_km) }
              : {}),
          })),
        commercial_specs: parseJsonText(
          commercialText,
          "Commercial specifications",
        ),
        land_specs: parseJsonText(landText, "Land specifications"),
      };
      const payload = {
        ...form,
        settings: {
          ...settings,
          entity: nextEntity,
          nearby_landmarks: nextEntity.nearby_landmarks,
          focus_keyword: settings.focus_keyword ?? form.focus_keyword ?? "",
          secondary_keywords: secondaryKeywordsText
            .split(",")
            .map((word: string) => word.trim())
            .filter(Boolean),
          expired_redirect_policy:
            settings.expired_redirect_policy || "redirect_to_locality",
          redirect_target_path:
            settings.redirect_target_path ||
            settings.expired_redirect_path ||
            "",
          expired_redirect_path:
            settings.redirect_target_path ||
            settings.expired_redirect_path ||
            "",
        },
        highlights: highlightsText
          .split("\n")
          .map((line: string) => line.trim())
          .filter(Boolean),
        schema_overrides: JSON.parse(schema),
        image_alt_overrides: asObject(form.image_alt_overrides),
        section_seo: Object.fromEntries(
          [...new Set([...Object.keys(sections), ...editedSections])].map(
            (key) => {
              const section = asObject(sections[key]);
              return [
                key,
                editedSections.has(key)
                  ? {
                      ...section,
                      robots_index:
                        section.robots_index === undefined
                          ? true
                          : Boolean(section.robots_index),
                    }
                  : section,
              ];
            },
          ),
        ),
      };
      await seoApi(
        "configs/" + encodeURIComponent(form.config_key),
        payload,
        "PUT",
      );
      onSaved();
      onClose();
    } catch (cause) {
      setError((cause as Error).message || "Could not save SEO settings.");
    } finally {
      setBusy(false);
    }
  }

  const transaction = String(
    target.transaction_display || target.listing_type || target.intent || "",
  )
    .toLowerCase()
    .includes("rent")
    ? "Rent"
    : "Sale";
  const plotArea = asObject(entity.plot_area);
  const sectionList = isProject
    ? [
        ["floor_plans", "Floor plans"],
        ["photos", "Photos"],
        ["amenities", "Amenities"],
        ["locality", "Locality"],
      ]
    : [
        ["floor_plan", "Floor plan"],
        ["photos", "Photos"],
        ["amenities", "Amenities"],
        ["locality", "Locality"],
      ];

  return (
    <div
      className="seo-editor-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="seo-editor"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="advanced-editor-title"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) onClose();
          if (event.key === "Tab") {
            const nodes = ref.current?.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input,select,textarea,a[href]",
            );
            if (!nodes?.length) return;
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            if (
              event.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === ref.current)
            ) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <header>
          <div>
            <h2 id="advanced-editor-title">
              {target.name || target.title || form.public_path || "Edit SEO"}
            </h2>
            <div className="seo-muted">
              {isProject ? "Project" : "Property"}
              {target.city ? ` · ${target.city}` : ""}
            </div>
          </div>
          <button
            type="button"
            className="seo-button seo-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Close
          </button>
        </header>
        <form onSubmit={save}>
          <div
            className="seo-editor-tabs"
            role="tablist"
            aria-label="SEO editor sections"
          >
            {tabs.map((name, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={tab === index}
                key={name}
                onClick={() => setTab(index)}
              >
                {name}
              </button>
            ))}
          </div>

          {tab === 0 && (
            <>
              <section className="seo-panel">
                <h3>Main page search appearance</h3>
                <div className="seo-form-grid">
                  <Field
                    label="Meta title"
                    value={form.meta_title}
                    placeholder={
                      initial.effective?.meta_title || "Inherit from template"
                    }
                    maxLength={60}
                    onChange={(value) => set("meta_title", value)}
                  />
                  <Field
                    label="Meta description"
                    value={form.meta_description}
                    placeholder={
                      initial.effective?.meta_description ||
                      "Inherit from template"
                    }
                    area
                    rows={2}
                    maxLength={160}
                    onChange={(value) => set("meta_description", value)}
                  />
                  <Field
                    label="H1 heading"
                    value={form.h1}
                    placeholder={
                      initial.effective?.h1 || "Inherit from page title"
                    }
                    onChange={(value) => set("h1", value)}
                  />
                  <Field
                    label="H2 subheading"
                    value={form.h2}
                    onChange={(value) => set("h2", value)}
                  />
                  <Field
                    label="Canonical URL"
                    value={form.canonical_url}
                    placeholder={
                      initial.effective?.canonical_url || "Use canonical URL"
                    }
                    onChange={(value) => set("canonical_url", value)}
                  />
                  <Field
                    label="Custom URL path"
                    value={form.public_path}
                    placeholder={initial.effective?.path || "/page-path"}
                    onChange={(value) => set("public_path", value)}
                  />
                  <label className="seo-field">
                    <span className="seo-field-label">Focus keyword</span>
                    <input
                      value={settings.focus_keyword || form.focus_keyword || ""}
                      onChange={(event) =>
                        setSetting("focus_keyword", event.target.value)
                      }
                    />
                  </label>
                  <label className="seo-field">
                    <span className="seo-field-label">Secondary keywords</span>
                    <input
                      value={secondaryKeywordsText}
                      placeholder="Comma-separated keywords"
                      onChange={(event) =>
                        setSecondaryKeywordsText(event.target.value)
                      }
                    />
                  </label>
                </div>
                <div className="seo-toggle-grid">
                  <label className="seo-check">
                    <input
                      type="checkbox"
                      checked={
                        form.robots_index !== false && form.robots_index !== 0
                      }
                      onChange={(event) =>
                        set("robots_index", event.target.checked)
                      }
                    />
                    Index this page
                  </label>
                  <label className="seo-check">
                    <input
                      type="checkbox"
                      checked={
                        form.robots_follow !== false && form.robots_follow !== 0
                      }
                      onChange={(event) =>
                        set("robots_follow", event.target.checked)
                      }
                    />
                    Follow links
                  </label>
                </div>
              </section>

              <section className="seo-panel">
                <h3>Live Google result preview</h3>
                <div
                  className="seo-preview-tabs"
                  role="tablist"
                  aria-label="Preview size"
                >
                  {(["Desktop", "Mobile"] as const).map((size) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={preview === size}
                      key={size}
                      onClick={() => setPreview(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div
                  className="seo-preview"
                  data-preview={preview.toLowerCase()}
                  style={{
                    maxWidth: preview === "Mobile" ? 360 : "100%",
                    margin: "0 auto",
                  }}
                >
                  <small>
                    majestanrealty.com ›{" "}
                    {(
                      form.public_path ||
                      initial.effective?.path ||
                      ""
                    ).replace(/^\//, "")}
                  </small>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </section>

              <section className="seo-panel">
                <h3>Child page SEO</h3>
                {sectionList.map(([key, label]) =>
                  (() => {
                    const effectiveSections = asObject(
                      initial.effective?.section_seo ||
                        initial.effective?.sections,
                    );
                    const fallback = asObject(
                      effectiveSections[key] ||
                        effectiveSections[
                          key === "floor_plans" ? "floor-plans" : key
                        ],
                    );
                    return (
                      <SectionFields
                        key={key}
                        title={`${label} page`}
                        value={asObject(sections[key])}
                        fallback={{
                          meta_title: fallback.meta_title || fallback.metaTitle,
                          meta_description:
                            fallback.meta_description ||
                            fallback.metaDescription,
                          h1: fallback.h1,
                          canonical_url:
                            fallback.canonical_url || fallback.canonicalUrl,
                          intro_text:
                            fallback.intro_text ||
                            fallback.introText ||
                            fallback.intro_content,
                        }}
                        onChange={(field, value) =>
                          setSection(key, field, value)
                        }
                      />
                    );
                  })(),
                )}
              </section>
            </>
          )}

          {tab === 1 && (
            <>
              <section className="seo-panel">
                <h3>Local entity details</h3>
                {isProperty && (
                  <div className="seo-form-grid">
                    <Field label="Transaction" value={transaction} readOnly />
                    <label className="seo-field">
                      <span className="seo-field-label">
                        Property schema type
                      </span>
                      <select
                        value={entity.property_type_schema || ""}
                        onChange={(event) =>
                          setEntity("property_type_schema", event.target.value)
                        }
                      >
                        <option value="">Automatic</option>
                        {schemaTypes.map((schemaType) => (
                          <option
                            key={schemaType.value}
                            value={schemaType.value}
                          >
                            {schemaType.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
                <div className="seo-form-grid">
                  {(isProject ? projectEntityFields : propertyEntityFields).map(
                    ([key, label, type]) => (
                      <Field
                        key={key}
                        label={label}
                        value={entity[key]}
                        type={type || "text"}
                        step={type === "number" ? "any" : undefined}
                        onChange={(value) => setEntity(key, value)}
                      />
                    ),
                  )}
                  {isProperty && (
                    <>
                      <div className="seo-field">
                        <span className="seo-field-label">Plot area</span>
                        <div className="seo-inline-control">
                          <input
                            type="number"
                            value={plotArea.value ?? ""}
                            onChange={(event) =>
                              setEntity("plot_area", {
                                ...plotArea,
                                value: event.target.value,
                              })
                            }
                            aria-label="Plot area value"
                          />
                          <select
                            value={plotArea.unit || "sqft"}
                            onChange={(event) =>
                              setEntity("plot_area", {
                                ...plotArea,
                                unit: event.target.value,
                              })
                            }
                            aria-label="Plot area unit"
                          >
                            <option value="sqft">sq. ft.</option>
                            <option value="acre">acres</option>
                            <option value="sqm">sq. m.</option>
                          </select>
                        </div>
                      </div>
                      <Field
                        label="Land specifications (JSON)"
                        value={landText}
                        area
                        rows={3}
                        onChange={setLandText}
                      />
                      <Field
                        label="Commercial specifications (JSON)"
                        value={commercialText}
                        area
                        rows={3}
                        onChange={setCommercialText}
                      />
                    </>
                  )}
                </div>
                {isProperty && (
                  <div className="seo-form-grid">
                    <Field
                      label="Transaction display"
                      value={transaction}
                      readOnly
                    />
                    <Field
                      label="Brochure SEO title"
                      value={entity.brochure_seo_title}
                      onChange={(value) =>
                        setEntity("brochure_seo_title", value)
                      }
                    />
                  </div>
                )}
              </section>
              <section className="seo-panel">
                <h3>Nearby landmarks</h3>
                <div className="seo-landmarks">
                  {landmarks.map((landmark, index) => (
                    <div className="seo-landmark-row" key={index}>
                      <Field
                        label="Landmark"
                        value={landmark.name}
                        onChange={(value) =>
                          setLandmarks((rows) =>
                            rows.map((row, i) =>
                              i === index ? { ...row, name: value } : row,
                            ),
                          )
                        }
                      />
                      <Field
                        label="Category"
                        value={landmark.category}
                        onChange={(value) =>
                          setLandmarks((rows) =>
                            rows.map((row, i) =>
                              i === index ? { ...row, category: value } : row,
                            ),
                          )
                        }
                      />
                      <Field
                        label="Distance (km)"
                        type="number"
                        value={landmark.distance_km}
                        onChange={(value) =>
                          setLandmarks((rows) =>
                            rows.map((row, i) =>
                              i === index
                                ? { ...row, distance_km: value }
                                : row,
                            ),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="seo-button seo-secondary"
                        onClick={() =>
                          setLandmarks((rows) =>
                            rows.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="seo-button seo-secondary"
                    onClick={() =>
                      setLandmarks((rows) => [
                        ...rows,
                        { name: "", category: "", distance_km: "" },
                      ])
                    }
                  >
                    Add landmark
                  </button>
                </div>
              </section>
              <section className="seo-panel">
                <h3>Schema JSON-LD override</h3>
                <label className="seo-field">
                  <span className="seo-field-label">Raw JSON-LD</span>
                  <textarea
                    className="seo-code"
                    rows={10}
                    value={schema}
                    onChange={(event) => setSchema(event.target.value)}
                  />
                </label>
              </section>
            </>
          )}

          {tab === 2 && (
            <section className="seo-panel">
              <h3>AI search content</h3>
              <Field
                label="AI summary"
                value={settings.ai_summary || ""}
                area
                rows={4}
                placeholder={
                  initial.effective?.settings?.ai_summary ||
                  initial.effective?.ai_summary ||
                  "Use the generated summary unless you enter a manual version."
                }
                onChange={(value) => setSetting("ai_summary", value)}
              />
              <Field
                label="Key highlights (one per line)"
                value={highlightsText}
                area
                rows={5}
                placeholder={
                  (initial.effective?.highlights || []).join("\n") ||
                  "Use generated highlights unless you enter manual versions."
                }
                onChange={setHighlightsText}
              />
              <h3>Frequently asked questions</h3>
              {faq.map((item, index) => (
                <div className="seo-faq-row" key={`${index}-${item.question}`}>
                  <Field
                    label="Question"
                    value={item.question}
                    onChange={(value) => updateFaq(index, "question", value)}
                  />
                  <Field
                    label="Answer"
                    value={item.answer}
                    area
                    rows={2}
                    onChange={(value) => updateFaq(index, "answer", value)}
                  />
                  <div className="seo-faq-actions">
                    <button
                      type="button"
                      className="seo-button seo-secondary"
                      disabled={index === 0}
                      onClick={() => {
                        const rows = [...faq];
                        [rows[index - 1], rows[index]] = [
                          rows[index],
                          rows[index - 1],
                        ];
                        set("faqs", rows);
                      }}
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      className="seo-button seo-secondary"
                      disabled={index === faq.length - 1}
                      onClick={() => {
                        const rows = [...faq];
                        [rows[index + 1], rows[index]] = [
                          rows[index],
                          rows[index + 1],
                        ];
                        set("faqs", rows);
                      }}
                    >
                      Move down
                    </button>
                    <button
                      type="button"
                      className="seo-button seo-secondary seo-danger"
                      onClick={() =>
                        set(
                          "faqs",
                          faq.filter((_, i) => i !== index),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="seo-button seo-secondary"
                onClick={() =>
                  set("faqs", [...faq, { question: "", answer: "" }])
                }
              >
                Add question
              </button>
            </section>
          )}

          {tab === 3 && (
            <section className="seo-panel">
              <h3>Image metadata</h3>
              <p className="seo-muted">
                Edits are saved by stable media key and URL alias.
              </p>
              <button
                type="button"
                className="seo-button seo-secondary"
                onClick={generateMissingAltText}
              >
                Generate missing alt text
              </button>
              <div className="seo-media-grid">
                {images.map((image, index) => {
                  const src = image.image_url || image.url;
                  const fields = getImageFields(image);
                  const stableKey =
                    image.key || image.image_url || image.id || index;
                  return (
                    <article className="seo-media-card" key={stableKey}>
                      {src && (
                        <img
                          src={src}
                          alt={fields.alt_text || image.alt || ""}
                        />
                      )}
                      <div className="seo-media-fields">
                        <strong>{image.kind || "Image"}</strong>
                        <Field
                          label="Alt text"
                          value={fields.alt_text ?? image.alt}
                          onChange={(value) =>
                            setImageField(image, "alt_text", value)
                          }
                        />
                        <Field
                          label="Title text"
                          value={fields.title_text ?? image.title_text}
                          onChange={(value) =>
                            setImageField(image, "title_text", value)
                          }
                        />
                        <Field
                          label="Caption"
                          value={fields.caption ?? image.caption}
                          onChange={(value) =>
                            setImageField(image, "caption", value)
                          }
                        />
                      </div>
                    </article>
                  );
                })}
                {!images.length && (
                  <p className="seo-muted">
                    No images are available for this record.
                  </p>
                )}
              </div>
            </section>
          )}

          {tab === 4 && (
            <>
              <section className="seo-panel">
                <h3>Indexing</h3>
                <div className="seo-toggle-grid">
                  <label className="seo-check">
                    <input
                      type="checkbox"
                      checked={
                        form.robots_index !== false && form.robots_index !== 0
                      }
                      onChange={(event) =>
                        set("robots_index", event.target.checked)
                      }
                    />
                    Index page
                  </label>
                  <label className="seo-check">
                    <input
                      type="checkbox"
                      checked={
                        form.robots_follow !== false && form.robots_follow !== 0
                      }
                      onChange={(event) =>
                        set("robots_follow", event.target.checked)
                      }
                    />
                    Follow links
                  </label>
                </div>
                <Field
                  label="Canonical URL"
                  value={form.canonical_url}
                  placeholder={
                    initial.effective?.canonical_url || "Use canonical URL"
                  }
                  onChange={(value) => set("canonical_url", value)}
                />
              </section>
              <section className="seo-panel">
                <h3>Social sharing</h3>
                <div className="seo-form-grid">
                  <Field
                    label="Open Graph title"
                    value={form.og_title}
                    placeholder={effectiveTitle || "Use page title"}
                    onChange={(value) => set("og_title", value)}
                  />
                  <Field
                    label="Open Graph description"
                    value={form.og_description}
                    area
                    rows={2}
                    placeholder={effectiveDescription || "Use page description"}
                    onChange={(value) => set("og_description", value)}
                  />
                </div>
                <label className="seo-field">
                  <span className="seo-field-label">OpenGraph image URL</span>
                  <select
                    value={form.og_image_url || ""}
                    onChange={(event) =>
                      set("og_image_url", event.target.value)
                    }
                  >
                    <option value="">
                      Automatic:{" "}
                      {isProject ? "project cover image" : "property thumbnail"}
                    </option>
                    {form.og_image_url &&
                      form.og_image_url !== defaultOgImage &&
                      !images.some(
                        (image) =>
                          (image.image_url || image.url) === form.og_image_url,
                      ) && (
                        <option value={form.og_image_url}>
                          Saved custom thumbnail
                        </option>
                      )}
                    {socialImages.map((image, index) => (
                      <option
                        key={image.key || image.id || index}
                        value={image.image_url || image.url || ""}
                      >
                        {image.kind || `Image ${index + 1}`}
                        {image.key ? ` · ${image.key}` : ""}
                      </option>
                    ))}
                  </select>
                  <small className="seo-muted">
                    {defaultOgImage ||
                      "No inventory image available. Add an image in the CRM."}
                  </small>
                </label>
                <div className="seo-preview seo-social-preview">
                  <small>Link preview</small>
                  <h3>{socialTitle || "Social preview title"}</h3>
                  <p>{socialDescription || "Social preview description"}</p>
                  {selectedOgImage && (
                    <img src={selectedOgImage} alt="Social preview thumbnail" />
                  )}
                </div>
              </section>
              <section className="seo-panel">
                <h3>Expired listing behavior</h3>
                {isProperty && (
                  <label className="seo-field">
                    <span className="seo-field-label">
                      When this listing expires
                    </span>
                    <select
                      value={
                        settings.expired_redirect_policy ||
                        "redirect_to_locality"
                      }
                      onChange={(event) => {
                        const policy = event.target.value;
                        setSetting("expired_redirect_policy", policy);
                      }}
                    >
                      <option value="redirect_to_locality">
                        Redirect to locality listings
                      </option>
                      <option value="keep_live_sold_banner">
                        Keep live with sold banner
                      </option>
                    </select>
                  </label>
                )}
                {(isProject || isProperty) && (
                  <Field
                    label="Redirect target path"
                    value={
                      settings.redirect_target_path ||
                      settings.expired_redirect_path ||
                      ""
                    }
                    placeholder={
                      initial.effective?.redirect_target_path ||
                      "/apartments-for-sale-in-coimbatore"
                    }
                    onChange={(value) => {
                      setSetting("redirect_target_path", value);
                      setSetting("expired_redirect_path", value);
                    }}
                  />
                )}
              </section>
            </>
          )}

          {error && (
            <p className="seo-error" role="alert">
              {error}
            </p>
          )}
          <div className="seo-form-actions">
            <button
              type="button"
              className="seo-button seo-secondary seo-danger"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="seo-button" disabled={busy}>
              {busy ? "Saving…" : "Save SEO changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
