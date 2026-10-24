"use client";
import { SeoReview } from "./seo-review";
import { AdminSelect, AdminCheckbox } from "./admin-controls";

import { useMemo, useState } from "react";
import { Button, Dialog, TextField, TextArea, Tabs } from "@radix-ui/themes";
import {
  Search,
  Files,
  AlignLeft,
  Images,
  Settings2,
  ArrowLeft,
  Save,
} from "lucide-react";
import { CanonicalControl, countEditorialWords } from "./canonical-control";
import { SeoWidthMeter } from "./seo-width-meter";
import { seoApi } from "./seo-admin-shell";
import { propertySeoProfile } from "./property-seo-profile";

type Row = Record<string, any>;
type ImageOverride = {
  alt_text?: string;
  title_text?: string;
  caption?: string;
};
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
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error();
    return parsed;
  } catch {
    throw new Error(`${label} must contain a valid JSON object (use @graph for multiple nodes).`);
  }
}
function schemaText(value: Row): string {
  const schema = value.schema_overrides ?? value.custom_schema_json ??
    value.json_ld ?? value.jsonLd ?? {};
  return typeof schema === "string" ? schema : JSON.stringify(schema, null, 2);
}
function JsonLdField({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="seo-field seo-wide">
      <span>Additional JSON-LD</span>
      <TextArea
        aria-label="Additional JSON-LD"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
      />
      <small>
        Enter a JSON object, without script tags. Use @graph for multiple nodes.
        Saved schema applies only to this page; generated schema remains available.
        Clear this field to remove the custom schema.
      </small>
    </label>
  );
}
function InventoryImagePreview({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <p role="status">
      The original image could not be loaded.{" "}
      <a href={src} target="_blank" rel="noopener noreferrer">
        Open original image
      </a>{" "}
      or check its upload in Sierra.
    </p>
  ) : (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  );
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
        <TextArea
          size="2"
          variant="surface"
          value={text}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          readOnly={readOnly}
        />
      ) : (
        <TextField.Root
          size="2"
          variant="surface"
          type={type as React.ComponentProps<typeof TextField.Root>["type"]}
          step={step}
          value={type === "date" && text ? text.slice(0, 10) : text}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          readOnly={readOnly}
        />
      )}
      {/meta (title|description)/i.test(label) && (
        <SeoWidthMeter
          text={text || placeholder}
          description={/description/i.test(label)}
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
  path,
  parent,
  readOnlyCanonical,
}: {
  title: string;
  value: Row;
  fallback: Row;
  onChange: (key: string, value: unknown) => void;
  allowIntro?: boolean;
  path: string;
  parent: string;
  readOnlyCanonical?: boolean;
}) {
  return (
    <section className="seo-panel seo-child-section">
      <h3>{title}</h3>
      <div className="seo-form-grid">
        <Field
          label="Meta title"
          maxLength={80}
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
          label="H2 subheading"
          value={value.h2}
          onChange={(next) => onChange("h2", next)}
        />
        <label className="seo-check">
          <AdminCheckbox
            checked={value.robots_follow !== false && value.robots_follow !== 0}
            onChange={(event) =>
              onChange("robots_follow", event.target.checked)
            }
          />
          Follow links in this section
        </label>
        <CanonicalControl
          value={value}
          path={path}
          parent={parent}
          readOnly={readOnlyCanonical}
          words={countEditorialWords([value.intro_text])}
          onChange={onChange}
        />
        <label className="seo-check">
          <AdminCheckbox
            checked={value.robots_index !== false && value.robots_index !== 0}
            onChange={(event) => onChange("robots_index", event.target.checked)}
          />
          Allow this section to be indexed
        </label>
        <div className="seo-wide">
          <Field
            label="Meta description"
            maxLength={200}
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
  onSaved: (saved?: Row) => void;
}) {
  const original = initial.config || initial;
  const target = initial.target || {};
  const scope = original.scope || initial.scope;
  const isProject = scope === "project";
  const isProperty = scope === "property";
  const typeProfile = isProperty
    ? propertySeoProfile(
        target.property_type ||
          target.type ||
          initial.effective?.variables?.property_type,
      )
    : undefined;
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
    if (isProject)
      return (
        projectCover?.image_url ||
        target.cover_image_url ||
        target.coverImageUrl ||
        ""
      );
    return initial.default_og_image_url || firstPhoto?.image_url || "";
  }, [
    images,
    isProject,
    initial.effective?.og_image_url,
    initial.default_og_image_url,
    target.coverImageUrl,
    target.cover_image_url,
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
  const [secondaryKeywordsText, setSecondaryKeywordsText] = useState(() => {
    const words =
      initialSettings.secondary_keywords || original.secondary_keywords || [];
    return Array.isArray(words) ? words.join(", ") : String(words);
  });
  const [highlightsText, setHighlightsText] = useState(() =>
    (original.highlights || []).join("\n"),
  );
  const [landmarks] = useState<Row[]>(() =>
    parseArray(
      initialSettings.nearby_landmarks ??
        original.nearby_landmarks ??
        initial.effective?.nearby_landmarks ??
        initialEntity.nearby_landmarks ??
        initialEntity.landmarks,
    ),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const settings = asObject(form.settings);
  const entity = asObject(settings.entity);
  const sections = asObject(form.section_seo);
  const [activeSection, setActiveSection] = useState(
    isProject ? "floor_plans" : "floor_plan",
  );
  const [rootSchemaText, setRootSchemaText] = useState(() => schemaText(original));
  const [sectionSchemaDrafts, setSectionSchemaDrafts] = useState<Record<string, string>>({});
  function sectionsWithSchemaDrafts() {
    const result = { ...sections };
    for (const [key, text] of Object.entries(sectionSchemaDrafts))
      result[key] = {
        ...asObject(result[key]),
        schema_overrides: parseJsonText(text, `${key} JSON-LD`),
      };
    return result;
  }
  const [rawSections, setRawSections] = useState(false);
  const [rawSectionText, setRawSectionText] = useState("");
  function previewJson(text: string) {
    try { return JSON.parse(text || "{}"); } catch { return text; }
  }
  const reviewSections = rawSections ? previewJson(rawSectionText) : {
    ...sections,
    ...Object.fromEntries(
      Object.entries(sectionSchemaDrafts).map(([key, text]) => [key, {
        ...asObject(sections[key]),
        schema_overrides: previewJson(text),
      }]),
    ),
  };
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
  const selectedOgImage = isProject
    ? defaultOgImage
    : form.og_image_url || defaultOgImage;
  const overviewPath =
    "/" +
    String(
      form.public_path ||
        initial.effective?.path ||
        target.canonical_slug ||
        target.slug ||
        "",
    ).replace(/^\/+/, "");
  const title = effectiveTitle || "Search result title";
  const description = effectiveDescription || "Search result description";
  const set = (key: string, value: unknown) =>
    setForm((current) => ({ ...current, [key]: value }));
  const setSetting = (key: string, value: unknown) =>
    setForm((current) => ({
      ...current,
      settings: { ...asObject(current.settings), [key]: value },
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

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const savedSections = rawSections
        ? parseJsonText(rawSectionText, "Section SEO")
        : sectionsWithSchemaDrafts();
      const rootSchema = parseJsonText(rootSchemaText, "Main page JSON-LD");
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
      };
      const payload = {
        ...form,
        settings: {
          ...settings,
          entity: {},
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
        schema_overrides: rootSchema,
        custom_schema_json: rootSchema,
        ...(isProject
          ? { canonical_type: "self", canonical_url: null, og_image_url: null }
          : {}),
        image_alt_overrides: asObject(form.image_alt_overrides),
        section_seo: Object.fromEntries(
          [...new Set([...Object.keys(savedSections), ...editedSections])].map(
            (key) => {
              const section: Row = {
                ...asObject(savedSections[key]),
                ...(isProject
                  ? { canonical_type: "self", canonical_url: null }
                  : {}),
              };
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
      const saved = await seoApi(
        "configs/" + encodeURIComponent(form.config_key),
        payload,
        "PUT",
      );
      onSaved(saved);
      onClose();
    } catch (cause) {
      setError((cause as Error).message || "Could not save SEO settings.");
    } finally {
      setBusy(false);
    }
  }

  const sectionList = isProject
    ? [
        ["floor_plans", "Floor plans"],
        ["photos", "Photos"],
        ["amenities", "Amenities"],
        ["locality", "Locality"],
      ]
    : [
        ["floor_plan", typeProfile?.floor || "Floor plan"],
        ["photos", "Photos"],
        ["amenities", typeProfile?.amenities || "Amenities"],
        ["locality", "Locality"],
      ];

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <Dialog.Content
        className="seo-command seo-fullscreen-editor"
        aria-describedby={undefined}
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <header className="seo-edit-header">
          <div>
            <Dialog.Title as="h2" id="advanced-editor-title">
              {target.name || target.title || form.public_path || "Edit SEO"}
            </Dialog.Title>
            <div className="seo-muted">
              {isProject ? "Project" : typeProfile?.label || "Property"}
              {target.city ? ` · ${target.city}` : ""}
            </div>
          </div>
          <Button
            type="button"
            variant="soft"
            color="gray"
            onClick={onClose}
            disabled={busy}
          >
            <ArrowLeft size={14} />
            Close
          </Button>
        </header>
        <form onSubmit={save} className="seo-edit-form">
          <Tabs.Root
            value={String(tab)}
            onValueChange={(value) => setTab(Number(value))}
            className="seo-edit-workspace"
            orientation="vertical"
          >
            <Tabs.List
              className="seo-edit-navigation"
              aria-label="SEO editor sections"
            >
              {[
                {
                  key: 0,
                  label: "Search",
                  hint: "Title, description and URL",
                  icon: Search,
                },
                {
                  key: 5,
                  label: "Subpages",
                  hint: "Floor plans, photos and more",
                  icon: Files,
                },
                {
                  key: 2,
                  label: "Content",
                  hint: "Editorial copy and publication",
                  icon: AlignLeft,
                },
                {
                  key: 3,
                  label: "Images",
                  hint: "Alt text and captions",
                  icon: Images,
                },
                {
                  key: 4,
                  label: "Sharing & indexing",
                  hint: "Social preview and visibility",
                  icon: Settings2,
                },
              ].map(({ key, label, hint, icon: Icon }) => (
                <Tabs.Trigger key={key} value={String(key)} aria-label={label}>
                  <Icon size={16} />
                  <span>
                    <strong>{label}</strong>
                    <small>{hint}</small>
                  </span>
                </Tabs.Trigger>
              ))}
              <div className="seo-edit-nav-note">
                Inventory details stay in Sierra. This editor manages SEO only.
              </div>
            </Tabs.List>
            <Tabs.Content value={String(tab)} className="seo-edit-scroll">
              <div className="seo-edit-content">
                {tab === 0 && (
                  <>
                    <section className="seo-panel">
                      <h3>Search appearance</h3>
                      <p className="seo-edit-intro">
                        Set how this page appears in search results. Leave
                        fields blank to use the automatic SEO.
                      </p>
                      {typeProfile && (
                        <p className="seo-edit-intro">
                          <strong>{typeProfile.label} SEO</strong> ·{" "}
                          {target.listing_type === "Rent" ? "Rent" : "Sale"}
                          <br />
                          {typeProfile.focus} Only describe facts available in
                          Sierra.
                        </p>
                      )}
                      <div className="seo-form-grid">
                        <Field
                          label="Meta title"
                          value={form.meta_title}
                          placeholder={
                            initial.effective?.meta_title ||
                            "Inherit from template"
                          }
                          maxLength={80}
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
                          maxLength={200}
                          onChange={(value) => set("meta_description", value)}
                        />
                        <CanonicalControl
                          value={form}
                          path={overviewPath}
                          readOnly={isProject}
                          words={countEditorialWords([
                            target.description,
                            settings.intro_content,
                            settings.bottom_content,
                            settings.ai_summary,
                            ...faq.map((f) => f.answer),
                          ])}
                          onChange={set}
                        />
                        {isProject ? (
                          <label className="seo-field">
                            <span>Custom project slug</span>
                            <div className="seo-inline-control">
                              <span>https://www.majestanrealty.com/</span>
                              <TextField.Root
                                aria-label="Custom project slug"
                                value={String(
                                  form.public_path ||
                                    initial.effective?.path ||
                                    target.canonical_slug ||
                                    "",
                                ).replace(/^\/+/, "")}
                                placeholder="project-name-pa0010"
                                onChange={(event) =>
                                  set(
                                    "public_path",
                                    "/" +
                                      event.target.value
                                        .replace(
                                          /^https?:\/\/www\.majestanrealty\.com\//i,
                                          "",
                                        )
                                        .replace(/^\/+/, ""),
                                  )
                                }
                              />
                            </div>
                          </label>
                        ) : (
                          <Field
                            label="Custom URL path"
                            value={form.public_path}
                            placeholder={
                              initial.effective?.path || "/property-path"
                            }
                            onChange={(value) => set("public_path", value)}
                          />
                        )}
                      </div>
                    </section>

                    <details className="seo-edit-advanced">
                      <summary>Advanced search settings</summary>
                      <div className="seo-form-grid">
                        <Field
                          label="SEO H1 (does not rename the project)"
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
                        <label className="seo-field">
                          <span className="seo-field-label">Focus keyword</span>
                          <TextField.Root
                            value={
                              settings.focus_keyword || form.focus_keyword || ""
                            }
                            onChange={(event) =>
                              setSetting("focus_keyword", event.target.value)
                            }
                          />
                        </label>
                        <label className="seo-field">
                          <span className="seo-field-label">
                            Secondary keywords
                          </span>
                          <TextField.Root
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
                          <AdminCheckbox
                            checked={
                              form.robots_index !== false &&
                              form.robots_index !== 0
                            }
                            onChange={(event) =>
                              set("robots_index", event.target.checked)
                            }
                          />
                          Index this page
                        </label>
                        <label className="seo-check">
                          <AdminCheckbox
                            checked={
                              form.robots_follow !== false &&
                              form.robots_follow !== 0
                            }
                            onChange={(event) =>
                              set("robots_follow", event.target.checked)
                            }
                          />
                          Follow links
                        </label>
                      </div>
                    </details>
                    <section className="seo-panel">
                      <h3>Live Google result preview</h3>
                      <div
                        className="seo-preview-tabs"
                        role="tablist"
                        aria-label="Preview size"
                      >
                        {(["Desktop", "Mobile"] as const).map((size) => (
                          <Button
                            variant="soft"
                            type="button"
                            role="tab"
                            aria-selected={preview === size}
                            key={size}
                            onClick={() => setPreview(size)}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                      <div
                        className="seo-preview"
                        data-preview={preview.toLowerCase()}
                        style={{
                          maxWidth: preview === "Mobile" ? 360 : "100%",
                          margin: "0",
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

                {tab === 5 && (
                  <>
                    {" "}
                    <section className="seo-panel">
                      <h3>Subpage SEO</h3>
                      <p className="seo-edit-intro">
                        Choose a page to edit its search appearance and
                        introduction.
                      </p>
                      <div
                        className="seo-editor-tabs"
                        role="tablist"
                        aria-label="Child page sections"
                      >
                        {sectionList.map(([key, label]) => (
                          <Button
                            variant="soft"
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={activeSection === key}
                            onClick={() => setActiveSection(key)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                      <label className="seo-check">
                        <AdminCheckbox
                          checked={rawSections}
                          onChange={(e) => {
                            if (e.target.checked) {
                              try {
                                setRawSectionText(JSON.stringify(sectionsWithSchemaDrafts(), null, 2));
                              } catch (error) {
                                setError((error as Error).message);
                                return;
                              }
                            } else {
                              try {
                                set(
                                  "section_seo",
                                  parseJsonText(rawSectionText, "Section SEO"),
                                );
                                setSectionSchemaDrafts({});
                              } catch (error) {
                                setError((error as Error).message);
                                return;
                              }
                            }
                            setRawSections(e.target.checked);
                          }}
                        />
                        Advanced Raw JSON
                      </label>
                      {rawSections && (
                        <TextArea
                          aria-label="Section SEO JSON"
                          value={rawSectionText}
                          onChange={(e) => setRawSectionText(e.target.value)}
                          rows={12}
                        />
                      )}
                      {!rawSections &&
                        sectionList
                          .filter(([key]) => key === activeSection)
                          .map(([key, label]) =>
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
                                <div key={key}>
                                  <SectionFields
                                    path={
                                      overviewPath +
                                      "/" +
                                      key.replaceAll("_", "-")
                                    }
                                    parent={overviewPath}
                                    readOnlyCanonical={isProject}
                                    title={`${label} page`}
                                    value={asObject(sections[key])}
                                    fallback={{
                                      meta_title:
                                        fallback.meta_title || fallback.metaTitle,
                                      meta_description:
                                        fallback.meta_description ||
                                        fallback.metaDescription,
                                      h1: fallback.h1,
                                      canonical_url:
                                        fallback.canonical_url ||
                                        fallback.canonicalUrl,
                                      intro_text:
                                        fallback.intro_text ||
                                        fallback.introText ||
                                        fallback.intro_content,
                                    }}
                                    onChange={(field, value) =>
                                      setSection(key, field, value)
                                    }
                                  />
                                  <JsonLdField
                                    value={sectionSchemaDrafts[key] ?? schemaText(asObject(sections[key]))}
                                    onChange={(text) => setSectionSchemaDrafts((current) => ({ ...current, [key]: text }))}
                                  />
                                </div>
                              );
                            })(),
                          )}
                    </section>{" "}
                  </>
                )}
                {tab === 2 && (
                  <section className="seo-panel">
                    <h3>Editorial content</h3>
                    <p className="seo-edit-intro">
                      These notes stay private until you enable publication below.
                      Published copy appears on the public overview. Inventory facts
                      and the original FAQs remain managed in the CRM.
                    </p>
                    <label className="seo-check">
                      <AdminCheckbox checked={settings.publish_editorial_content === true}
                        onChange={event => setSetting("publish_editorial_content", event.target.checked)} />
                      Publish this editorial content on the public overview
                    </label>
                    <Field
                      label="Overview introduction"
                      value={settings.intro_content}
                      area
                      onChange={(value) => setSetting("intro_content", value)}
                    />
                    <Field
                      label="Editorial footer content"
                      value={settings.bottom_content}
                      area
                      rows={6}
                      onChange={(value) => setSetting("bottom_content", value)}
                    />
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
                      <div
                        className="seo-faq-row"
                        key={`${index}-${item.question}`}
                      >
                        <Field
                          label="Question"
                          value={item.question}
                          onChange={(value) =>
                            updateFaq(index, "question", value)
                          }
                        />
                        <Field
                          label="Answer"
                          value={item.answer}
                          area
                          rows={2}
                          onChange={(value) =>
                            updateFaq(index, "answer", value)
                          }
                        />
                        <div className="seo-faq-actions">
                          <Button
                            variant="soft"
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
                          </Button>
                          <Button
                            variant="soft"
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
                          </Button>
                          <Button
                            variant="soft"
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
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="soft"
                      type="button"
                      className="seo-button seo-secondary"
                      onClick={() =>
                        set("faqs", [...faq, { question: "", answer: "" }])
                      }
                    >
                      Add question
                    </Button>
                  </section>
                )}

                {tab === 3 && (
                  <section className="seo-panel">
                    <h3>Image metadata</h3>
                    <p className="seo-muted">
                      Edits are saved by stable media key and URL alias.
                    </p>
                    <Button
                      variant="soft"
                      type="button"
                      className="seo-button seo-secondary"
                      onClick={generateMissingAltText}
                    >
                      Generate missing alt text
                    </Button>
                    <div className="seo-media-grid">
                      {images.map((image, index) => {
                        const src = image.image_url || image.url;
                        const fields = getImageFields(image);
                        const stableKey =
                          image.key || image.image_url || image.id || index;
                        return (
                          <article className="seo-media-card" key={stableKey}>
                            {src && (
                              <InventoryImagePreview
                                key={src}
                                src={src}
                                alt={
                                  fields.alt_text ||
                                  image.alt ||
                                  `${image.kind || "Inventory"} image preview`
                                }
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
                                label="Caption / image description"
                                area
                                rows={3}
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
                          <AdminCheckbox
                            checked={
                              form.robots_index !== false &&
                              form.robots_index !== 0
                            }
                            onChange={(event) =>
                              set("robots_index", event.target.checked)
                            }
                          />
                          Index page
                        </label>
                        <label className="seo-check">
                          <AdminCheckbox
                            checked={
                              form.robots_follow !== false &&
                              form.robots_follow !== 0
                            }
                            onChange={(event) =>
                              set("robots_follow", event.target.checked)
                            }
                          />
                          Follow links
                        </label>
                      </div>
                      <CanonicalControl
                        value={form}
                        path={overviewPath}
                        readOnly={isProject}
                        words={countEditorialWords([
                          target.description,
                          settings.intro_content,
                          settings.bottom_content,
                          settings.ai_summary,
                          ...faq.map((f) => f.answer),
                        ])}
                        onChange={set}
                      />
                    </section>
                    <section className="seo-panel">
                      <h3>Main page structured data</h3>
                      <JsonLdField value={rootSchemaText} onChange={setRootSchemaText} />
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
                          placeholder={
                            effectiveDescription || "Use page description"
                          }
                          onChange={(value) => set("og_description", value)}
                        />
                      </div>
                      <label className="seo-field">
                        <span className="seo-field-label">
                          OpenGraph image URL
                        </span>
                        {isProject ? (
                          <TextField.Root
                            aria-label="Project cover image URL"
                            readOnly
                            value={defaultOgImage}
                            placeholder="No project cover image. Add one in Sierra."
                          />
                        ) : (
                          <AdminSelect
                            value={form.og_image_url || ""}
                            onChange={(event) =>
                              set("og_image_url", event.target.value)
                            }
                          >
                            <option value="">
                              Automatic: property thumbnail
                            </option>
                            {socialImages.map((image, index) => (
                              <option
                                key={image.key || index}
                                value={image.image_url || image.url}
                              >
                                {image.kind || `Image ${index + 1}`}
                              </option>
                            ))}
                          </AdminSelect>
                        )}
                        <small className="seo-muted">
                          {defaultOgImage ||
                            "No inventory image available. Add an image in the CRM."}
                        </small>
                      </label>
                      <div className="seo-preview seo-social-preview">
                        <small>Link preview</small>
                        <h3>{socialTitle || "Social preview title"}</h3>
                        <p>
                          {socialDescription || "Social preview description"}
                        </p>
                        {selectedOgImage && (
                          <InventoryImagePreview
                            key={selectedOgImage}
                            src={selectedOgImage}
                            alt="Social preview thumbnail"
                          />
                        )}
                      </div>
                    </section>
                    <section className="seo-panel">
                      <h3>Expired listing behavior</h3>
                      {(isProperty || isProject) && (
                        <label className="seo-field">
                          <span className="seo-field-label">
                            When this listing expires
                          </span>
                          <AdminSelect
                            value={
                              settings.expired_redirect_policy ||
                              "redirect_to_locality"
                            }
                            onChange={(event) => {
                              const policy = event.target.value;
                              setSetting("expired_redirect_policy", policy);
                            }}
                          >
                            <option value="gone">
                              410 Gone / Remove from Index
                            </option>
                            <option value="redirect_to_locality">
                              Redirect to locality listings
                            </option>
                            <option value="keep_live_sold_banner">
                              Keep live with sold banner
                            </option>
                          </AdminSelect>
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

                <SeoReview
                  initial={initial.config || initial}
                  current={{
                    ...form, settings,
                    highlights: highlightsText.split("\n").filter(Boolean),
                    schema_overrides: previewJson(rootSchemaText),
                    section_seo: reviewSections,
                  }}
                  target={target}
                  onRestored={() => { onSaved(); onClose(); }}
                />
                {error && (
                  <p className="seo-error" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </Tabs.Content>
          </Tabs.Root>
          <footer className="seo-edit-savebar">
            <span>Changes apply after saving.</span>
            <div>
              <Button
                type="button"
                variant="soft"
                color="red"
                onClick={onClose}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy} loading={busy}>
                <Save size={14} />
                {busy ? "Saving…" : "Save SEO changes"}
              </Button>
            </div>
          </footer>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
