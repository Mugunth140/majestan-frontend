"use client";

import { useEffect, useRef, useState } from "react";
import { seoApi } from "./seo-admin-shell";

type Row = Record<string, any>;
const tabs = [
  "Core search",
  "Local entity",
  "AI search",
  "Images",
  "Indexing & social",
];
const fieldNames: Record<string, string> = {
  locality: "Sub locality name",
  pincode: "Pin code",
  builder_entity_name: "Developer or builder name",
  rera_id: "RERA registration ID",
  lowPrice: "Low price",
  highPrice: "High price",
  pricePerSqFt: "Price per square foot",
  latitude: "Latitude",
  longitude: "Longitude",
};

function Field({
  label,
  value,
  onChange,
  area = false,
  type = "text",
  placeholder = "",
  step,
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
  area?: boolean;
  type?: string;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="seo-field">
      {label}
      {area ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          step={step}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
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
  const [form, setForm] = useState<Row>({
    ...original,
    settings: { ...(original.settings || {}) },
  });
  const [tab, setTab] = useState(0);
  const [preview, setPreview] = useState<"Desktop" | "Mobile">("Desktop");
  const [schema, setSchema] = useState(
    JSON.stringify(original.schema_overrides || {}, null, 2),
  );
  const [secondaryKeywordsText, setSecondaryKeywordsText] = useState(
    (original.settings?.secondary_keywords || []).join(", "),
  );
  const [highlightsText, setHighlightsText] = useState(
    (original.highlights || []).join("\n"),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const settings = form.settings || {};
  const sections: Row = form.section_seo || {};
  const childName = form.scope === "project" ? "floor-plans" : "floor-plan";
  const title =
    form.meta_title ||
    initial.effective?.meta_title ||
    initial.target?.name ||
    "Page title";
  const description =
    form.meta_description || initial.effective?.meta_description || "";
  const set = (key: string, value: any) =>
    setForm((current: Row) => ({ ...current, [key]: value }));
  const setSetting = (key: string, value: any) =>
    setForm((current: Row) => ({
      ...current,
      settings: { ...(current.settings || {}), [key]: value },
    }));
  const setSection = (section: string, key: string, value: string) =>
    setForm((current: Row) => ({
      ...current,
      section_seo: {
        ...(current.section_seo || {}),
        [section]: { ...(current.section_seo?.[section] || {}), [key]: value },
      },
    }));

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
      await seoApi(
        "configs/" + encodeURIComponent(form.config_key),
        {
          ...form,
          settings: {
            ...(form.settings || {}),
            secondary_keywords: secondaryKeywordsText
              .split(",")
              .map((word: string) => word.trim())
              .filter(Boolean),
          },
          highlights: highlightsText
            .split("\n")
            .map((line: string) => line.trim())
            .filter(Boolean),
          schema_overrides: JSON.parse(schema),
        },
        "PUT",
      );
      onSaved();
      onClose();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const target = initial.target || {};
  const entity = { ...(initial.entity || {}), ...(settings.entity || {}) };
  const images: Row[] = initial.images || [];
  const faq: Row[] = form.faqs || [];
  const updateFaq = (index: number, key: string, value: string) =>
    set(
      "faqs",
      faq.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  const variables = initial.effective?.variables || {};
  const makeAlt = (index: number) => {
    const name = variables.Property_Name || target.name || "";
    const bhk = variables.BHK || target.bedrooms || "";
    const propertyType =
      variables.Property_Type ||
      target.property_type ||
      target.project_type ||
      "";
    const locality =
      settings.entity?.locality ||
      variables.Sub_Locality ||
      target.sublocation_name ||
      "";
    const city = variables.City || target.city || "";
    return `${name} - ${bhk} ${propertyType} in ${locality} ${city} - View ${index + 1}`
      .replace(/\s+/g, " ")
      .trim();
  };
  const entityValue = (key: string) => entity[key] ?? "";
  const setEntity = (key: string, value: string) =>
    setForm((current: Row) => ({
      ...current,
      settings: {
        ...(current.settings || {}),
        entity: { ...(current.settings?.entity || {}), [key]: value },
      },
    }));
  const imageAlt = (image: Row) =>
    form.image_alt_overrides?.[image.image_url] ??
    form.image_alt_overrides?.[image.key] ??
    form.image_alt_overrides?.[image.id] ??
    image.alt ??
    "";

  return (
    <div
      className="seo-editor-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="seo-editor"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="advanced-editor-title"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !busy) onClose();
          if (e.key === "Tab") {
            const nodes = ref.current?.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input,select,textarea,a[href]",
            );
            if (!nodes?.length) return;
            const first = nodes[0],
              last = nodes[nodes.length - 1];
            if (
              e.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === ref.current)
            ) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <header>
          <div>
            <h2 id="advanced-editor-title">
              {target.name ||
                target.title ||
                form.public_path ||
                "Edit page SEO"}
            </h2>
            <div className="seo-muted">
              {form.scope === "project" ? "Project" : "Property"}
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
                <h3>Search appearance</h3>
                <div className="seo-form-grid">
                  <Field
                    label="Custom URL slug"
                    value={form.public_path || ""}
                    placeholder={initial.effective?.path || "/page-slug"}
                    onChange={(value) => set("public_path", value)}
                  />
                  <label className="seo-check">
                    <input
                      type="checkbox"
                      checked={settings.auto_redirect !== false}
                      onChange={(e) =>
                        setSetting("auto_redirect", e.target.checked)
                      }
                    />
                    Create a 301 redirect when this URL changes
                  </label>
                </div>
                <Field
                  label="Main page meta title"
                  value={form.meta_title}
                  onChange={(value) => set("meta_title", value)}
                />
                <Field
                  label="Main page meta description"
                  value={form.meta_description}
                  area
                  onChange={(value) => set("meta_description", value)}
                />
                <div className="seo-form-grid">
                  <Field
                    label="H1 heading"
                    value={form.h1}
                    onChange={(value) => set("h1", value)}
                  />
                  <Field
                    label="H2 subheading"
                    value={form.h2}
                    onChange={(value) => set("h2", value)}
                  />
                </div>
                <h4 className="seo-section-label">
                  {form.scope === "project" ? "Floor plans" : "Floor plan"} page
                </h4>
                {["metaTitle", "metaDescription", "h1", "canonicalUrl"].map(
                  (key, i) => (
                    <Field
                      key={key}
                      label={
                        [
                          "Meta title",
                          "Meta description",
                          "H1 heading",
                          "Canonical URL",
                        ][i]
                      }
                      value={sections[childName]?.[key] || ""}
                      area={key === "metaDescription"}
                      onChange={(value) => setSection(childName, key, value)}
                    />
                  ),
                )}
                <h4 className="seo-section-label">Photos page</h4>
                {["metaTitle", "metaDescription", "h1", "canonicalUrl"].map(
                  (key, i) => (
                    <Field
                      key={key}
                      label={
                        [
                          "Meta title",
                          "Meta description",
                          "H1 heading",
                          "Canonical URL",
                        ][i]
                      }
                      value={sections.photos?.[key] || ""}
                      area={key === "metaDescription"}
                      onChange={(value) => setSection("photos", key, value)}
                    />
                  ),
                )}
                <div className="seo-form-grid">
                  <Field
                    label="Focus keyword"
                    value={settings.focus_keyword}
                    onChange={(value) => setSetting("focus_keyword", value)}
                  />
                  <Field
                    label="Secondary keywords, comma separated"
                    value={secondaryKeywordsText}
                    onChange={setSecondaryKeywordsText}
                  />
                </div>
              </section>
              <section className="seo-panel">
                <h3>Google search preview</h3>
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
                    width: "100%",
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
            </>
          )}
          {tab === 1 && (
            <section className="seo-panel">
              <h3>Local entity details</h3>
              <div className="seo-form-grid">
                {Object.entries(fieldNames).map(([key, label]) => (
                  <Field
                    key={key}
                    label={label}
                    value={entityValue(key)}
                    type={
                      [
                        "lowPrice",
                        "highPrice",
                        "pricePerSqFt",
                        "latitude",
                        "longitude",
                      ].includes(key)
                        ? "number"
                        : "text"
                    }
                    step={
                      ["latitude", "longitude"].includes(key)
                        ? "any"
                        : undefined
                    }
                    onChange={(value) => setEntity(key, value)}
                  />
                ))}
              </div>
              <Field
                label="Nearby landmarks"
                area
                value={entityValue("landmarks")}
                onChange={(value) => setEntity("landmarks", value)}
              />
              <label className="seo-field">
                Custom JSON LD override
                <textarea
                  className="seo-code"
                  rows={12}
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                />
              </label>
            </section>
          )}
          {tab === 2 && (
            <section className="seo-panel">
              <h3>AI overview summary</h3>
              <Field
                label="Factual summary"
                area
                value={settings.ai_summary || ""}
                onChange={(value) => setSetting("ai_summary", value)}
              />
              <Field
                label="Key highlights, one per line"
                area
                value={highlightsText}
                onChange={setHighlightsText}
              />
              <h3>Custom questions and answers</h3>
              {faq.map((item, index) => (
                <div className="seo-faq-row" key={index}>
                  <Field
                    label="Question"
                    value={item.question}
                    onChange={(value) => updateFaq(index, "question", value)}
                  />
                  <Field
                    label="Answer"
                    area
                    value={item.answer}
                    onChange={(value) => updateFaq(index, "answer", value)}
                  />
                  <div>
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
                    </button>{" "}
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
                    </button>{" "}
                    <button
                      type="button"
                      className="seo-button seo-secondary seo-danger"
                      onClick={() =>
                        set(
                          "faqs",
                          faq.filter((_: Row, i: number) => i !== index),
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
              <h3>Image descriptions</h3>
              <button
                type="button"
                className="seo-button seo-secondary"
                onClick={() => {
                  const next = { ...(form.image_alt_overrides || {}) };
                  images.forEach((image, index) => {
                    if (image.image_url) next[image.image_url] = makeAlt(index);
                  });
                  set("image_alt_overrides", next);
                }}
              >
                Auto generate SEO alt tags
              </button>
              <div className="seo-media-grid">
                {images.map((image, index) => {
                  const key = image.image_url || image.key || image.id;
                  const src = image.image_url || image.url;
                  return (
                    <div className="seo-media-card" key={key || src || index}>
                      {src && <img src={src} alt={imageAlt(image)} />}
                      <div>
                        <strong>{image.kind || "Image"}</strong>
                        <Field
                          label="Alt text"
                          value={imageAlt(image)}
                          onChange={(value) =>
                            set("image_alt_overrides", {
                              ...(form.image_alt_overrides || {}),
                              [image.image_url || key]: value,
                            })
                          }
                        />
                      </div>
                    </div>
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
                <label className="seo-field">
                  Robots meta
                  <select
                    value={
                      form.robots_index === false || form.robots_index === 0
                        ? "noindex,follow"
                        : "index,follow"
                    }
                    onChange={(e) => {
                      set("robots_index", e.target.value === "index,follow");
                      set("robots_follow", true);
                    }}
                  >
                    <option value="index,follow">index, follow</option>
                    <option value="noindex,follow">noindex, follow</option>
                  </select>
                </label>
                <Field
                  label="Canonical URL"
                  value={form.canonical_url}
                  onChange={(value) => set("canonical_url", value)}
                />
                <h3>Social sharing preview</h3>
                <div className="seo-form-grid">
                  <Field
                    label="OpenGraph title"
                    value={form.og_title}
                    onChange={(value) => set("og_title", value)}
                  />
                  <Field
                    label="OpenGraph description"
                    value={form.og_description}
                    area
                    onChange={(value) => set("og_description", value)}
                  />
                </div>
                <label className="seo-field">
                  OpenGraph image
                  <select
                    value={form.og_image_url || ""}
                    onChange={(e) => set("og_image_url", e.target.value)}
                  >
                    <option value="">Use default image</option>
                    {images.map((image, index) => (
                      <option
                        key={image.key || image.id || index}
                        value={image.image_url || image.url}
                      >
                        {image.kind || `Image ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="seo-preview">
                  <small>WhatsApp link preview</small>
                  <h3>{form.og_title || title}</h3>
                  <p>{form.og_description || description}</p>
                  {form.og_image_url && (
                    <img
                      src={form.og_image_url}
                      alt="Selected social sharing image"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 180,
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              </section>
              <section className="seo-panel">
                <h3>Off market redirect</h3>
                <Field
                  label="Sold, expired or removed redirect path"
                  value={settings.expired_redirect_path || ""}
                  placeholder="/apartments-for-sale-in-coimbatore"
                  onChange={(value) =>
                    setSetting("expired_redirect_path", value)
                  }
                />
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
              className="seo-button seo-secondary"
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
