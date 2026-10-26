"use client";
import { OgImageUpload } from "./og-image-upload";
import { SeoReview } from "./seo-review";
import { AdminSelect, AdminCheckbox } from "./admin-controls";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X, Pencil, Trash2 } from "lucide-react";
import { SeoWidthMeter, resolveSampleTokens } from "./seo-width-meter";
import {
  Button,
  Dialog,
  TextField,
  TextArea,
  Tabs,
  Table,
  Badge,
  Skeleton,
  Heading,
  Avatar,
} from "@radix-ui/themes";
import { seoApi } from "./seo-admin-shell";
import { AdvancedSeoEditor } from "./advanced-seo-editor";
import { propertySampleVariables } from "./property-seo-profile";
import { CanonicalControl, countEditorialWords } from "./canonical-control";

type Row = Record<string, any>;
const labels: Record<string, string> = {
  apartment: "Apartment",
  villa: "Villa",
  individual_portion: "Independent house",
  independent_house: "Independent house",
  plot: "Plot",
  farmland: "Farmland",
  commercial: "Commercial space",
  industrial: "Industrial",
  coworking: "Co-working",
};
const intents = [
  ["buy", "Sale"],
  ["rent", "Rent"],
];
function amount(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "—";
  if (number >= 10000000)
    return `₹${Number((number / 10000000).toFixed(2))} Cr`;
  if (number >= 100000) return `₹${Number((number / 100000).toFixed(2))} L`;
  return `₹${number.toLocaleString("en-IN")}`;
}
function templateName(row: Row) {
  const settings = row.settings || {};
  const type = settings.property_type || settings.project_type;
  return `${labels[type] || "All properties"} · ${settings.intent === "rent" ? "Rent" : "Sale"}`;
}
function Field({
  label,
  name,
  form,
  set,
  area = false,
  hint = "",
  type = "text",
  max,
}: {
  label: string;
  name: string;
  form: Row;
  set: (key: string, value: any) => void;
  area?: boolean;
  hint?: string;
  type?: string;
  max?: number;
}) {
  return (
    <label className="seo-field">
      {label}
      {area ? (
        <TextArea
          size="2"
          value={form[name] ?? ""}
          onChange={(e) => set(name, e.target.value)}
          maxLength={max}
        />
      ) : (
        <TextField.Root
          size="2"
          type={type as React.ComponentProps<typeof TextField.Root>["type"]}
          value={form[name] ?? ""}
          onChange={(e) => set(name, e.target.value)}
          maxLength={max}
        />
      )}
      {/title|description/.test(name) && (
        <SeoWidthMeter
          text={resolveSampleTokens(
            String(form[name] || ""),
            form.settings?.scope === "property"
              ? propertySampleVariables(
                  form.settings.property_type,
                  form.settings.intent,
                )
              : {},
          )}
          description={/description/.test(name)}
        />
      )}
      <small>
        {hint}
        {max ? ` ${(form[name] || "").length} / ${max} characters` : ""}
      </small>
    </label>
  );
}
function Check({
  label,
  name,
  form,
  set,
}: {
  label: string;
  name: string;
  form: Row;
  set: (key: string, value: any) => void;
}) {
  return (
    <label className="seo-check">
      <AdminCheckbox
        checked={
          name === "show_live_market_snapshot" && form[name] === undefined
            ? true
            : Boolean(form[name])
        }
        onChange={(e) => set(name, e.target.checked)}
      />
      {label}
    </label>
  );
}
function Faqs({
  items,
  onChange,
}: {
  items: Row[];
  onChange: (rows: Row[]) => void;
}) {
  return (
    <div>
      {items.map((item, i) => (
        <div className="seo-faq-row" key={i}>
          <label className="seo-field">
            Question
            <TextField.Root
              value={item.question}
              onChange={(e) =>
                onChange(
                  items.map((r, j) =>
                    j === i ? { ...r, question: e.target.value } : r,
                  ),
                )
              }
            />
          </label>
          <label className="seo-field">
            Answer
            <TextArea
              value={item.answer}
              onChange={(e) =>
                onChange(
                  items.map((r, j) =>
                    j === i ? { ...r, answer: e.target.value } : r,
                  ),
                )
              }
            />
          </label>
          <Button
            variant="soft"
            color="red"
            className="seo-button seo-secondary seo-danger"
            type="button"
            onClick={() => onChange(items.filter((_, j) => i !== j))}
          >
            Remove question
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="soft"
        color="gray"
        className="seo-button seo-secondary"
        onClick={() => onChange([...items, { question: "", answer: "" }])}
      >
        Add question
      </Button>
    </div>
  );
}
function Editor({
  initial,
  options,
  onClose,
  onSaved,
}: {
  initial: Row;
  options: Row;
  onClose: () => void;
  onSaved: (saved?: Row) => void;
}) {
  const [form, setForm] = useState<Row>(initial.config || initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const locked = busy || uploadingImage;
  const [schema, setSchema] = useState(
    JSON.stringify(
      (initial.config || initial).custom_schema_json ||
        (initial.config || initial).schema_overrides ||
        {},
      null,
      2,
    ),
  );
  const [sections, setSections] = useState(
    JSON.stringify((initial.config || initial).section_seo || {}, null, 2),
  );
  const initialConfig = initial.config || initial;
  const templateSections = initialConfig.section_seo || {};
  const templateSettings = initialConfig.settings || {};
  const templateSamples =
    templateSettings.scope === "property"
      ? propertySampleVariables(
          templateSettings.property_type,
          templateSettings.intent,
        )
      : {};
  const resolvePreview = (text: string) =>
    resolveSampleTokens(text, templateSamples);
  const templateField = (key: string) => {
    if (key === "floor_plan_title_template")
      return (
        templateSections.floor_plans?.meta_title ||
        templateSections.floor_plan?.meta_title ||
        ""
      );
    if (key === "floor_plan_description_template")
      return (
        templateSections.floor_plans?.meta_description ||
        templateSections.floor_plan?.meta_description ||
        ""
      );
    if (key === "photos_title_template")
      return templateSections.photos?.meta_title || "";
    if (key === "photos_description_template")
      return templateSections.photos?.meta_description || "";
    if (key === "image_alt_template")
      return (
        initialConfig.image_alt_template ||
        templateSettings.image_alt_template ||
        ""
      );
    return initialConfig[key.replace("_template", "")] || "";
  };
  const listing = Boolean(initial.isListing || form.listing_id),
    technical = form.scope === "technical",
    template = form.scope === "template";
  const set = (key: string, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setting = (key: string, value: any) =>
    setForm((f) => ({ ...f, settings: { ...f.settings, [key]: value } }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (uploadingImage) return;
    setBusy(true);
    setError("");
    try {
      const body: Row = {
        ...form,
        schema_overrides: JSON.parse(schema),
        custom_schema_json: JSON.parse(schema),
        section_seo: JSON.parse(sections),
      };
      if (template) {
        const nextSections = { ...body.section_seo };
        const putSection = (section: string, key: string, value: string) => {
          nextSections[section] = {
            ...(nextSections[section] || {}),
            [key]: value,
          };
        };
        body.meta_title_template =
          form.meta_title_template ?? templateField("meta_title_template");
        body.meta_description_template =
          form.meta_description_template ??
          templateField("meta_description_template");
        body.h1_template = form.h1_template ?? templateField("h1_template");
        body.meta_title = body.meta_title_template;
        body.meta_description = body.meta_description_template;
        body.h1 = body.h1_template;
        body.floor_plan_title_template =
          form.floor_plan_title_template ??
          templateField("floor_plan_title_template");
        body.floor_plan_description_template =
          form.floor_plan_description_template ??
          templateField("floor_plan_description_template");
        body.photos_title_template =
          form.photos_title_template ?? templateField("photos_title_template");
        body.photos_description_template =
          form.photos_description_template ??
          templateField("photos_description_template");
        const floorPlanSection =
          form.settings?.scope === "project" ? "floor_plans" : "floor_plan";
        putSection(
          floorPlanSection,
          "meta_title",
          body.floor_plan_title_template,
        );
        putSection(
          floorPlanSection,
          "meta_description",
          body.floor_plan_description_template,
        );
        putSection("photos", "meta_title", body.photos_title_template);
        putSection(
          "photos",
          "meta_description",
          body.photos_description_template,
        );
        body.image_alt_template =
          form.image_alt_template ?? templateField("image_alt_template");
        body.settings = {
          ...form.settings,
          image_alt_template: body.image_alt_template,
        };
        body.section_seo = nextSections;
      }
      const saved = listing ? await seoApi("listing-pages", body) :
        await seoApi(
          "configs/" + encodeURIComponent(form.config_key),
          body,
          "PUT",
        );
      onSaved(saved);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !locked) onClose();
      }}
    >
      <Dialog.Content
        className="seo-command seo-editor seo-generic-editor"
        aria-describedby={undefined}
        onEscapeKeyDown={(event) => {
          if (locked) event.preventDefault();
        }}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <header>
          <div>
            <div className="seo-eyebrow">
              {template
                ? "GLOBAL SEO TEMPLATE"
                : technical
                  ? "TECHNICAL SETTINGS"
                  : "SEO EDITOR"}
            </div>
            <Dialog.Title as="h2" id="seo-editor-title">
              {initial.target?.name ||
                initial.target?.title ||
                form.public_path ||
                form.config_key ||
                "Create listing page"}
            </Dialog.Title>
          </div>
          <Button
            variant="soft"
            color="gray"
            className="seo-button seo-secondary"
            type="button"
            onClick={onClose}
            disabled={locked}
          >
            Close
          </Button>
        </header>
        {initial.target && (
          <div className="seo-readonly">
            Inventory · {initial.target.city}
            {initial.target.builder_name
              ? ` · ${initial.target.builder_name}`
              : ""}
            {initial.target.possession_status
              ? ` · ${initial.target.possession_status.replaceAll("_", " ")}`
              : ""}
            <br />
            Inventory facts are read only.
          </div>
        )}
        <form onSubmit={save}>
          {listing && (
            <section className="seo-panel">
              <h3>Match live inventory</h3>
              <div className="seo-form-grid">
                <label className="seo-field">
                  Inventory
                  <AdminSelect
                    value={form.inventory_kind || "property"}
                    onChange={(e) => {
                      set("inventory_kind", e.target.value);
                      if (e.target.value === "project")
                        set("transaction_intent", "buy");
                    }}
                  >
                    <option value="property">Individual properties</option>
                    <option value="project">Projects</option>
                  </AdminSelect>
                </label>
                <label className="seo-field">
                  Transaction intent
                  <AdminSelect
                    value={form.transaction_intent || "buy"}
                    onChange={(e) => set("transaction_intent", e.target.value)}
                  >
                    {intents.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </AdminSelect>
                </label>
                <label className="seo-field">
                  {form.inventory_kind === "project"
                    ? "Project type"
                    : "Property type"}
                  <AdminSelect
                    value={
                      form.inventory_kind === "project"
                        ? form.project_type || ""
                        : form.property_type === "individual_portion"
                          ? "independent_house"
                          : form.property_type || ""
                    }
                    onChange={(e) =>
                      set(
                        form.inventory_kind === "project"
                          ? "project_type"
                          : "property_type",
                        e.target.value,
                      )
                    }
                  >
                    <option value="">All types</option>
                    {Object.entries(labels)
                      .filter(([v]) =>
                        form.inventory_kind === "project"
                          ? ["apartment", "villa", "plot"].includes(v)
                          : v !== "individual_portion",
                      )
                      .map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                  </AdminSelect>
                </label>
                <label className="seo-field">
                  City
                  <AdminSelect
                    value={form.city_id || ""}
                    onChange={(e) => {
                      set("city_id", Number(e.target.value));
                      set("sublocation_id", null);
                    }}
                    required
                  >
                    <option value="">Choose city</option>
                    {options.cities?.map((c: Row) => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </AdminSelect>
                </label>
                <label className="seo-field">
                  Sub-locality
                  <AdminSelect
                    value={form.sublocation_id || ""}
                    onChange={(e) =>
                      set("sublocation_id", Number(e.target.value) || null)
                    }
                  >
                    <option value="">Entire city</option>
                    {options.sublocations
                      ?.filter((l: Row) => l.city_id === Number(form.city_id))
                      .map((l: Row) => (
                        <option value={l.id} key={l.id}>
                          {l.name}
                        </option>
                      ))}
                  </AdminSelect>
                </label>
                <label className="seo-field">
                  Bedrooms
                  <AdminSelect
                    value={form.bedrooms ?? ""}
                    onChange={(e) =>
                      set(
                        "bedrooms",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">Any</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </AdminSelect>
                </label>
                <Check
                  label="Show live market snapshot"
                  name="show_live_market_snapshot"
                  form={form}
                  set={set}
                />
              </div>
            </section>
          )}
          {!technical && (
            <>
              <section className="seo-panel">
                <h3>{template ? "Template formulas" : "Search appearance"}</h3>
                {template && (
                  <p className="seo-muted">
                    Variables:{" "}
                    {
                      "{BHK}, {SqFt}, {Property_Type}, {Transaction_Type}, {Sub_Locality}, {Location}, {City}, {Price}, {Project_Name}, {Property_Name}, {Locality}, {Builder}, {Builder_Name}, {RERA_ID}, {Min_Price}, {Max_Price}"
                    }
                  </p>
                )}
                {!template && form.scope === "page" && (
                  <div className="seo-readonly">
                    Page route: {form.public_path}
                  </div>
                )}
                {!template && form.scope !== "page" && (
                  <Field
                    label="Public URL path"
                    name="public_path"
                    form={form}
                    set={set}
                    hint={
                      initial.effective?.path
                        ? `Current: ${initial.effective.path}`
                        : "Use a lowercase path beginning with /"
                    }
                  />
                )}
                <Field
                  label={template ? "Meta title template" : "Meta title"}
                  name={template ? "meta_title_template" : "meta_title"}
                  form={
                    template
                      ? {
                          ...form,
                          meta_title_template:
                            form.meta_title_template ??
                            templateField("meta_title_template"),
                        }
                      : form
                  }
                  set={set}
                  max={template ? undefined : 80}
                  hint="Aim for about 50–60 characters."
                />
                <Field
                  label={
                    template ? "Meta description template" : "Meta description"
                  }
                  name={
                    template ? "meta_description_template" : "meta_description"
                  }
                  form={
                    template
                      ? {
                          ...form,
                          meta_description_template:
                            form.meta_description_template ??
                            templateField("meta_description_template"),
                        }
                      : form
                  }
                  set={set}
                  area
                  max={template ? undefined : 200}
                  hint="Aim for about 140–160 characters."
                />
                <div className="seo-preview">
                  <small>
                    majestanrealty.com ›{" "}
                    {(
                      form.public_path ||
                      initial.effective?.path ||
                      ""
                    ).replace(/^\//, "")}
                  </small>
                  <h3>
                    {form.meta_title ||
                      initial.effective?.meta_title ||
                      "Your page title"}
                  </h3>
                  <p>
                    {form.meta_description ||
                      initial.effective?.meta_description ||
                      "Your search description will appear here."}
                  </p>
                </div>
              </section>
              <section className="seo-panel">
                <h3>Page content</h3>
                <div className="seo-form-grid">
                  <Field
                    label="H1 heading"
                    name={template ? "h1_template" : "h1"}
                    form={
                      template
                        ? {
                            ...form,
                            h1_template:
                              form.h1_template ?? templateField("h1_template"),
                          }
                        : form
                    }
                    set={set}
                    max={255}
                  />
                  {!template && (
                    <Field
                      label="H2 subheading"
                      name="h2"
                      form={form}
                      set={set}
                      max={255}
                    />
                  )}
                </div>
                {template && (
                  <div className="seo-form-grid">
                    {[
                      [
                        "floor_plan_title_template",
                        "Floor plan title template",
                      ],
                      [
                        "floor_plan_description_template",
                        "Floor plan description template",
                      ],
                      ["photos_title_template", "Photos title template"],
                      [
                        "photos_description_template",
                        "Photos description template",
                      ],
                      ["image_alt_template", "Image alt template"],
                    ].map(([name, label]) => (
                      <Field
                        key={name}
                        label={label}
                        name={name}
                        form={{
                          ...form,
                          [name]: form[name] ?? templateField(name),
                        }}
                        set={set}
                      />
                    ))}
                  </div>
                )}
                {template && (
                  <section className="seo-panel">
                    <h3>Section template formulas</h3>
                    {["amenities", "locality"].map((key) => (
                      <div key={key}>
                        <h4>{key}</h4>
                        {[
                          "meta_title",
                          "meta_description",
                          "h1",
                          "intro_text",
                        ].map((field) => (
                          <label className="seo-field" key={field}>
                            {field}
                            <TextArea
                              value={(() => {
                                try {
                                  return (
                                    JSON.parse(sections)[key]?.[field] || ""
                                  );
                                } catch {
                                  return "";
                                }
                              })()}
                              onChange={(event) => {
                                try {
                                  const next = JSON.parse(sections);
                                  setSections(
                                    JSON.stringify(
                                      {
                                        ...next,
                                        [key]: {
                                          ...next[key],
                                          [field]: event.target.value,
                                        },
                                      },
                                      null,
                                      2,
                                    ),
                                  );
                                } catch {
                                  setError(
                                    "Correct the section JSON before editing formulas.",
                                  );
                                }
                              }}
                            />
                            {["meta_title", "meta_description"].includes(
                              field,
                            ) && (
                              <SeoWidthMeter
                                text={resolvePreview(
                                  (() => {
                                    try {
                                      return (
                                        JSON.parse(sections)[key]?.[field] || ""
                                      );
                                    } catch {
                                      return "";
                                    }
                                  })(),
                                )}
                                description={field === "meta_description"}
                              />
                            )}
                            <small>
                              Sample:{" "}
                              {resolvePreview(
                                (() => {
                                  try {
                                    return (
                                      JSON.parse(sections)[key]?.[field] || ""
                                    );
                                  } catch {
                                    return "";
                                  }
                                })(),
                              )}
                            </small>
                          </label>
                        ))}
                      </div>
                    ))}
                    <p>
                      Sample inventory:{" "}
                      {templateSamples.Property_Name || "Alamo Turin"} ·{" "}
                      {templateSamples.Property_Type || "Apartment"} ·{" "}
                      {templateSamples.Transaction_Type || "Sale"} ·
                      Gandhipuram, Coimbatore ·{" "}
                      {templateSamples.Price || "₹89 Lakh"}
                    </p>
                    {[
                      "meta_title_template",
                      "meta_description_template",
                      "h1_template",
                      "floor_plan_title_template",
                      "floor_plan_description_template",
                      "photos_title_template",
                      "photos_description_template",
                    ].map((key) => (
                      <div key={key}>
                        <strong>{key}</strong>
                        <p>
                          {resolvePreview(
                            String(form[key] ?? templateField(key)),
                          )}
                        </p>
                        {/title|description/.test(key) && (
                          <SeoWidthMeter
                            text={resolvePreview(
                              String(form[key] ?? templateField(key)),
                            )}
                            description={key.includes("description")}
                          />
                        )}
                      </div>
                    ))}
                  </section>
                )}
                <label className="seo-field">
                  AI summary / key highlights
                  <TextArea
                    value={(form.highlights || []).join("\n")}
                    onChange={(e) =>
                      set("highlights", e.target.value.split("\n"))
                    }
                  />
                  <small>One factual highlight per line.</small>
                </label>
                {(listing || form.scope === "page") && (
                  <>
                    <Field
                      label="Top introduction"
                      name="intro_content"
                      form={form}
                      set={set}
                      area
                      hint="Write 100–150 words grounded in local knowledge."
                    />
                    <Field
                      label="Bottom locality guide"
                      name="bottom_content"
                      form={form}
                      set={set}
                      area
                      hint="Plain text or Markdown. HTML is not executed."
                    />
                  </>
                )}
                <Faqs
                  items={listing ? form.locality_faqs || [] : form.faqs || []}
                  onChange={(rows) =>
                    set(listing ? "locality_faqs" : "faqs", rows)
                  }
                />
              </section>
              {form.scope === "project" && (
                <section className="seo-panel">
                  <h3>Project schema</h3>
                  <div className="seo-form-grid">
                    <label className="seo-field">
                      RERA ID override
                      <TextField.Root
                        value={form.settings?.rera_id || ""}
                        placeholder={initial.target?.rera_number || ""}
                        onChange={(e) => setting("rera_id", e.target.value)}
                      />
                    </label>
                    <label className="seo-field">
                      Builder entity override
                      <TextField.Root
                        value={form.settings?.builder_entity_name || ""}
                        placeholder={initial.target?.builder_name || ""}
                        onChange={(e) =>
                          setting("builder_entity_name", e.target.value)
                        }
                      />
                    </label>
                  </div>
                </section>
              )}
              {initial.images?.length > 0 && (
                <section className="seo-panel">
                  <h3>Image descriptions</h3>
                  {initial.images.map((image: Row) => (
                    <label className="seo-field" key={image.id}>
                      Image #{image.id}
                      <small>{image.image_url.split("/").pop()}</small>
                      <TextField.Root
                        value={form.image_alt_overrides?.[image.id] || ""}
                        onChange={(e) =>
                          set("image_alt_overrides", {
                            ...form.image_alt_overrides,
                            [image.id]: e.target.value,
                          })
                        }
                      />
                    </label>
                  ))}
                </section>
              )}
              {!template && (
                <section className="seo-panel">
                  <h3>Indexing & sharing</h3>
                  <CanonicalControl
                    value={form}
                    onChange={set}
                    path={form.public_path || '/'}
                    words={countEditorialWords([form.intro_content, form.bottom_content])}
                  />
                  <div className="seo-form-grid">
                    <Field
                      label="OpenGraph title"
                      name="og_title"
                      form={form}
                      set={set}
                    />
                    <Field
                      label="OpenGraph description"
                      name="og_description"
                      form={form}
                      set={set}
                    />
                  </div>
                  {form.scope === "page" ? (
                    <OgImageUpload value={form.og_image_url || ""}
                      onChange={(url) => set("og_image_url", url)}
                      disabled={busy} onUploadingChange={setUploadingImage} />
                  ) : (
                    <Field label="OpenGraph image URL" name="og_image_url" form={form} set={set} />
                  )}
                  <Check
                    label="Allow indexing"
                    name="robots_index"
                    form={form}
                    set={set}
                  />
                  <Check
                    label="Follow links"
                    name="robots_follow"
                    form={form}
                    set={set}
                  />
                  <Check
                    label="Priority indexing (updates sitemap; pings IndexNow when configured)"
                    name="priority_indexing"
                    form={form}
                    set={set}
                  />
                  {form.scope === "property" && (
                    <label className="seo-field">
                      Sold, expired or deleted: 301 destination
                      <TextField.Root
                        value={form.settings?.expired_redirect_path || ""}
                        onChange={(e) =>
                          setting("expired_redirect_path", e.target.value)
                        }
                        placeholder="/apartments-for-sale-in-coimbatore"
                      />
                      <small>
                        Choose a relevant locality page. Inventory status stays
                        in CRM.
                      </small>
                    </label>
                  )}
                  {listing && (
                    <>
                      <Check
                        label="Automatically noindex when inventory is thin"
                        name="thin_content_guard_enabled"
                        form={form}
                        set={set}
                      />
                      <Field
                        label="Minimum active listings"
                        name="minimum_active_listings"
                        form={form}
                        set={set}
                        type="number"
                      />
                      <Check
                        label="Pin indexable despite low inventory"
                        name="pinned_indexable"
                        form={form}
                        set={set}
                      />
                      <Check
                        label="Add FAQs from current inventory statistics"
                        name="auto_stats_faqs"
                        form={form}
                        set={set}
                      />
                    </>
                  )}
                  <label className="seo-field">
                    Additional JSON-LD (JSON object)
                    <TextArea
                      className="seo-code"
                      value={schema}
                      onChange={(e) => setSchema(e.target.value)}
                    />
                  </label>
                  <details>
                    <summary>Section SEO overrides</summary>
                    <label className="seo-field">
                      Preserved section settings (JSON)
                      <TextArea
                        className="seo-code"
                        value={sections}
                        onChange={(e) => setSections(e.target.value)}
                      />
                    </label>
                  </details>
                </section>
              )}
            </>
          )}
          {technical && (
            <>
              <section className="seo-panel">
                <h3>Crawler access</h3>
                <label className="seo-field">
                  robots.txt
                  <TextArea
                    className="seo-code"
                    rows={16}
                    value={form.settings?.robots_txt || ""}
                    onChange={(e) => setting("robots_txt", e.target.value)}
                  />
                  <small>Keep public pages crawlable. Every user agent group must block /admin and /api.</small>
                </label>
                <label className="seo-field">
                  llms.txt override
                  <TextArea
                    className="seo-code"
                    rows={10}
                    value={form.settings?.llms_txt || ""}
                    onChange={(e) => setting("llms_txt", e.target.value)}
                  />
                  <small>Leave empty to generate from current inventory.</small>
                </label>
              </section>
              <section className="seo-panel">
                <h3>Organization & local business</h3>
                {[
                  "name",
                  "telephone",
                  "streetAddress",
                  "addressLocality",
                  "addressRegion",
                  "postalCode",
                  "addressCountry",
                  "latitude",
                  "longitude",
                ].map((key) => (
                  <label className="seo-field" key={key}>
                    {key}
                    <TextField.Root
                      value={form.settings?.organization?.[key] || ""}
                      onChange={(e) =>
                        setting("organization", {
                          ...form.settings?.organization,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </label>
                ))}
              </section>
            </>
          )}
          <SeoReview initial={initialConfig} current={form} onRestored={() => { onSaved(); onClose(); }} />
          {error && (
            <p className="seo-error" role="alert">
              {error}
            </p>
          )}
          <div className="seo-form-actions">
            <Button
              variant="soft"
              color="red"
              className="seo-button seo-secondary seo-danger"
              type="button"
              onClick={onClose}
              disabled={locked}
            >
              Cancel
            </Button>
            <Button type="submit" className="seo-button" disabled={locked}>
              {busy ? "Saving…" : "Save SEO changes"}
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function SeoWorkspace({
  module,
  initialId,
}: {
  module: "project" | "property" | "listing" | "page" | "technical";
  initialId?: string;
}) {
  const [options, setOptions] = useState<Row>({}),
    [items, setItems] = useState<Row[]>([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [tab, setTab] = useState("inventory"),
    [filters, setFilters] = useState<Row>({
      search: "",
      type: "",
      intent: "",
      locality: "",
      seo: "",
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [editor, setEditor] = useState<Row | null>(null),
    [revision, setRevision] = useState(0),
    [preview, setPreview] = useState(""),
    [showFilters, setShowFilters] = useState(false),
    [redirectForm, setRedirectForm] = useState({
      source_path: "",
      destination_path: "",
    });
  useEffect(() => {
    if (
      !initialId ||
      !/^[1-9]\d*$/.test(initialId) ||
      !["project", "property"].includes(module)
    )
      return;
    let live = true;
    seoApi(`inventory/${module}/${initialId}`)
      .then((value) => {
        if (live) setEditor(value);
      })
      .catch((error) => {
        if (live) setError(error.message);
      });
    return () => {
      live = false;
    };
  }, [module, initialId]);
  const inventory = module === "property" || module === "project";
  useEffect(() => {
    seoApi("options")
      .then(setOptions)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    const timeout = setTimeout(async () => {
      try {
        let data;
        if (tab === "templates") {
          data = await seoApi("configs?scope=template");
          data = data.filter((r: Row) => r.settings?.scope === module);
        } else if (inventory)
          data = await seoApi(
            "inventory/" +
              module +
              "?" +
              new URLSearchParams({ ...filters, page: String(page) }),
          );
        else if (module === "listing") data = await seoApi("listing-pages");
        else if (module === "page") data = await seoApi("configs?scope=page");
        else data = await seoApi("redirects");
        if (live) {
          setItems(Array.isArray(data) ? data : data.items);
          setTotal(Array.isArray(data) ? data.length : data.total);
        }
      } catch (e) {
        if (live) setError((e as Error).message);
      } finally {
        if (live) setLoading(false);
      }
    }, 200);
    return () => {
      live = false;
      clearTimeout(timeout);
    };
  }, [module, inventory, filters, page, revision, tab]);
  const refresh = async (saved?: Row) => {
    setRevision((n) => n + 1);
    const path = saved?.public_path;
    if (!path) { setSuccess("SEO changes saved."); return; }
    setSuccess("SEO changes saved. Checking the public page…");
    try {
      const response = await fetch('/api/seo-verify?path=' + encodeURIComponent(path), { cache: 'no-store' });
      const check = await response.json();
      if (!response.ok) throw new Error(check.message || 'Verification unavailable');
      setSuccess(`SEO saved. Public page: HTTP ${check.status}. Canonical: ${check.canonical || 'missing'}. Robots: ${check.robots || 'not specified'}.`);
    } catch { setSuccess("SEO changes saved. Public verification is unavailable; use Verify saved public page to retry."); }
  };
  const titles = {
    project: "Projects SEO",
    property: "Properties SEO",
    listing: "Sub-locality listing pages",
    page: "Core & service pages",
    technical: "Technical SEO & AI search",
  };
  async function open(row: Row) {
    setError("");
    try {
      setEditor(
        inventory && tab !== "templates"
          ? await seoApi(`inventory/${module}/${row.id}`)
          : row,
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function filter(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }
  return (
    <>
      <div className="seo-page-toolbar">
        <div className="seo-heading">
          <div>
            <Heading as="h1" size="6">
              {titles[module]}
            </Heading>
            <p className="seo-page-description">
              {module === "project"
                ? "Manage search appearance for your live projects."
                : module === "property"
                  ? "Manage search appearance for your live properties."
                  : module === "listing"
                    ? "Match search pages to inventory and manage locality SEO."
                    : module === "page"
                      ? "Manage SEO for your core website and service pages."
                      : "Manage redirects, crawler access and sitemap settings."}
            </p>
          </div>
          {module === "listing" && (
            <Button
              className="seo-button"
              onClick={() =>
                setEditor({
                  isListing: true,
                  scope: "listing",
                  inventory_kind: "property",
                  transaction_intent: "buy",
                  show_live_market_snapshot: true,
                  city_id: options.cities?.find(
                    (c: Row) => c.name === "Coimbatore",
                  )?.id,
                  robots_index: 1,
                  robots_follow: 1,
                  auto_stats_faqs: true,
                  thin_content_guard_enabled: true,
                  minimum_active_listings: 2,
                  pinned_indexable: false,
                  revision: 0,
                })
              }
            >
              Create listing rule
            </Button>
          )}
        </div>
        {(inventory || module === "listing") && (
          <Tabs.Root
            value={tab}
            onValueChange={(next) => {
              setTab(next);
              setPage(1);
            }}
          >
            <Tabs.List aria-label="Inventory views">
              <Tabs.Trigger value="inventory">
                {inventory ? "Live inventory" : "Listing rules"}
              </Tabs.Trigger>
              <Tabs.Trigger value="templates">Auto SEO templates</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        )}
      </div>
      {success && (
        <p className="seo-success" role="status">
          {success}
        </p>
      )}
      {error && (
        <div className="seo-error" role="alert">
          {error}{" "}
          <Button onClick={() => setRevision((n) => n + 1)}>Retry</Button>
        </div>
      )}
      {inventory && tab === "inventory" && (
        <div className="seo-filters">
          <TextField.Root
            className="seo-filter-search"
            aria-label="Search inventory"
            placeholder="Search by name or city"
            value={filters.search}
            onChange={(event) => filter("search", event.target.value)}
          >
            <TextField.Slot>
              <Search size={16} />
            </TextField.Slot>
          </TextField.Root>
          <Button
            type="button"
            variant="soft"
            color="gray"
            className="seo-button seo-secondary seo-filter-toggle"
            aria-expanded={showFilters}
            aria-controls="seo-inventory-filters"
            onClick={() => setShowFilters((value) => !value)}
          >
            <SlidersHorizontal size={13} aria-hidden="true" />
            Filters
            {Object.entries(filters).filter(
              ([key, value]) => key !== "search" && value,
            ).length
              ? ` (${Object.entries(filters).filter(([key, value]) => key !== "search" && value).length})`
              : ""}
          </Button>
          {showFilters && (
            <div className="seo-filter-options" id="seo-inventory-filters">
              <AdminSelect
                aria-label="Property type"
                value={filters.type}
                onChange={(e) => filter("type", e.target.value)}
              >
                <option value="">All types</option>
                {Object.entries(labels)
                  .filter(
                    ([v]) =>
                      v !== "independent_house" &&
                      (module !== "project" ||
                        ["apartment", "villa", "plot"].includes(v)),
                  )
                  .map(([v, l]) => (
                    <option value={v} key={v}>
                      {l}
                    </option>
                  ))}
              </AdminSelect>
              {module === "property" && (
                <AdminSelect
                  aria-label="Transaction intent"
                  value={filters.intent}
                  onChange={(e) => filter("intent", e.target.value)}
                >
                  <option value="">All transactions</option>
                  {intents.map(([v, l]) => (
                    <option value={v} key={v}>
                      {l}
                    </option>
                  ))}
                </AdminSelect>
              )}
              <AdminSelect
                aria-label="Sub-locality"
                value={filters.locality}
                onChange={(e) => filter("locality", e.target.value)}
              >
                <option value="">All localities</option>
                {options.sublocations?.map((l: Row) => (
                  <option value={l.id} key={l.id}>
                    {l.name}
                  </option>
                ))}
              </AdminSelect>
              <AdminSelect
                aria-label="SEO status"
                value={filters.seo}
                onChange={(e) => filter("seo", e.target.value)}
              >
                <option value="">All SEO</option>
                <option value="auto">Auto template</option>
                <option value="custom">Custom override</option>
              </AdminSelect>
            </div>
          )}
          {Object.values(filters).some(Boolean) && (
            <Button
              className="seo-row-action seo-clear-filters"
              type="button"
              onClick={() => {
                setFilters({
                  search: "",
                  type: "",
                  intent: "",
                  locality: "",
                  seo: "",
                });
                setPage(1);
              }}
            >
              <X size={12} aria-hidden="true" />
              Clear
            </Button>
          )}
        </div>
      )}
      {module === "technical" && (
        <>
          <div className="seo-card-grid">
            <section className="seo-panel seo-card">
              <h2>Crawlers & AI search</h2>
              <p>Edit robots.txt, llms.txt and your local business identity.</p>
              <Button
                variant="soft"
                color="gray"
                className="seo-button seo-secondary"
                onClick={async () => {
                  try {
                    setEditor(await seoApi("technical"));
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Edit technical settings
              </Button>
              <a href="/llms.txt" target="_blank" rel="noreferrer">
                Preview llms.txt ↗
              </a>
              <a href="/robots.txt" target="_blank" rel="noreferrer">
                Preview robots.txt ↗
              </a>
            </section>
            <section className="seo-panel seo-card">
              <h2>Dynamic XML sitemaps</h2>
              <p>
                Only canonical, indexable pages with eligible inventory are
                included.
              </p>
              {[
                "projects",
                "properties-buy",
                "properties-rent",
                "localities",
                "pages",
              ].map((g) => (
                <Button
                  variant="soft"
                  color="gray"
                  className="seo-button seo-secondary"
                  key={g}
                  onClick={async () => {
                    setPreview("Loading sitemap…");
                    try {
                      setPreview(await seoApi("sitemap/" + g));
                    } catch (e) {
                      setPreview("");
                      setError((e as Error).message);
                    }
                  }}
                >
                  Preview sitemap-{g}.xml
                </Button>
              ))}
            </section>
          </div>
          {preview && (
            <div className="seo-panel">
              <pre className="seo-code">{preview}</pre>
              <Button
                variant="soft"
                color="gray"
                className="seo-button seo-secondary"
                onClick={() => setPreview("")}
              >
                Close preview
              </Button>
            </div>
          )}
          <section className="seo-panel">
            <h2>301 redirects</h2>
            <form
              className="seo-filters"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await seoApi("redirects", redirectForm);
                  setRedirectForm({ source_path: "", destination_path: "" });
                  refresh();
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <TextField.Root
                aria-label="Old URL path"
                placeholder="/old-property-url"
                value={redirectForm.source_path}
                onChange={(e) =>
                  setRedirectForm((f) => ({
                    ...f,
                    source_path: e.target.value,
                  }))
                }
                required
              />
              <TextField.Root
                aria-label="New URL path"
                placeholder="/new-destination"
                value={redirectForm.destination_path}
                onChange={(e) =>
                  setRedirectForm((f) => ({
                    ...f,
                    destination_path: e.target.value,
                  }))
                }
                required
              />
              <Button type="submit">Save redirect</Button>
            </form>
          </section>
        </>
      )}
      <section className="seo-data-section">
        {loading ? (
          <div className="seo-loading" role="status">
            <Skeleton height="40px" />
            <Skeleton height="56px" />
            <Skeleton height="56px" />
            <Skeleton height="56px" />
            Loading{" "}
            {tab === "templates"
              ? "SEO templates"
              : module === "technical"
                ? "redirects"
                : "live data"}
            …
          </div>
        ) : items.length === 0 ? (
          <div className="seo-empty">
            <h3>
              {module === "listing"
                ? "No listing rules."
                : module === "technical"
                  ? "No redirects yet."
                  : "No matching records."}
            </h3>
            <p>
              {module === "listing"
                ? "Create a rule to connect a search page to live inventory."
                : "Adjust your filters or add settings above."}
            </p>
          </div>
        ) : (
          <div className="seo-table-wrap">
            <Table.Root
              size="2"
              variant="surface"
              className={`seo-table${inventory && tab === "inventory" ? " seo-inventory-table" : ""}`}
              aria-label={
                tab === "templates" ? "SEO templates" : titles[module]
              }
            >
              <caption className="seo-visually-hidden">
                {tab === "templates" ? "SEO templates" : titles[module]}
              </caption>
              <Table.Header>
                <Table.Row>
                  {inventory && tab === "inventory" && (
                    <Table.ColumnHeaderCell
                      scope="col"
                      className="seo-ref-cell"
                    >
                      Ref.
                    </Table.ColumnHeaderCell>
                  )}
                  <Table.ColumnHeaderCell scope="col">
                    {tab === "templates"
                      ? "Template"
                      : inventory
                        ? module === "project"
                          ? "Project"
                          : "Property"
                        : module === "technical"
                          ? "Old URL"
                          : "Page URL"}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell
                    scope="col"
                    className={
                      inventory && tab === "inventory"
                        ? "seo-city-cell"
                        : undefined
                    }
                  >
                    {inventory && tab !== "templates"
                      ? "City"
                      : module === "technical"
                        ? "Destination"
                        : "Search title"}
                  </Table.ColumnHeaderCell>
                  {inventory && tab === "inventory" && (
                    <Table.ColumnHeaderCell
                      scope="col"
                      className="seo-type-cell"
                    >
                      Type
                    </Table.ColumnHeaderCell>
                  )}
                  {inventory && tab === "inventory" && (
                    <Table.ColumnHeaderCell
                      scope="col"
                      className="seo-price-cell"
                    >
                      Price
                    </Table.ColumnHeaderCell>
                  )}
                  <Table.ColumnHeaderCell
                    scope="col"
                    className="seo-status-cell"
                  >
                    {module === "technical" ? "Rule" : "SEO"}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell
                    scope="col"
                    className="seo-actions-cell"
                  >
                    <span className="seo-muted">Action</span>
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {items.map((row) => (
                  <Table.Row key={row.config_key || row.id}>
                    {inventory && tab === "inventory" && (
                      <Table.Cell className="seo-ref-cell">
                        #{row.id}
                      </Table.Cell>
                    )}
                    <Table.Cell className="seo-record-cell">
                      {inventory &&
                      tab === "inventory" &&
                      row.canonical_slug ? (
                        <a
                          className="seo-record-name"
                          href={"/" + row.canonical_slug}
                          title={"/" + row.canonical_slug}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {row.thumbnail_url && (
                            <Avatar
                              size="3"
                              radius="medium"
                              src={row.thumbnail_url}
                              fallback={String(row.name || "M").slice(0, 1)}
                              color="gray"
                            />
                          )}
                          <span>{row.name}</span>
                        </a>
                      ) : (
                        <span
                          className="seo-record-name"
                          title={
                            row.name ||
                            row.public_path ||
                            row.source_path ||
                            row.config_key
                          }
                        >
                          {tab === "templates"
                            ? templateName(row)
                            : row.name ||
                              row.public_path ||
                              row.source_path ||
                              row.config_key}
                        </span>
                      )}
                      {tab === "templates" ? (
                        <span className="seo-record-detail">
                          {row.settings?.scope === "listing"
                            ? "Listing page"
                            : row.settings?.scope === "project"
                              ? "Project"
                              : "Property"}
                        </span>
                      ) : row.transaction_intent ? (
                        <span className="seo-record-detail">
                          {row.transaction_intent === "rent" ? "Rent" : "Sale"}
                        </span>
                      ) : null}
                    </Table.Cell>
                    <Table.Cell
                      className={
                        inventory && tab === "inventory"
                          ? "seo-city-cell"
                          : undefined
                      }
                    >
                      {inventory && tab === "inventory" ? (
                        row.city
                      ) : (
                        <span
                          className="seo-secondary-value"
                          title={row.destination_path || row.meta_title || ""}
                        >
                          {row.destination_path ||
                            row.meta_title ||
                            "Automatic fallback"}
                        </span>
                      )}
                    </Table.Cell>
                    {inventory && tab === "inventory" && (
                      <Table.Cell
                        className="seo-type-cell"
                        title={[
                          labels[row.type],
                          row.configurations
                            ? row.configurations + " BHK"
                            : row.listing_type === "Rent"
                              ? "Rent"
                              : "Sale",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      >
                        <span>{labels[row.type]}</span>
                        <small className="seo-inline-fact">
                          {module === "project" && row.configurations
                            ? row.configurations + " BHK"
                            : row.listing_type === "Rent"
                              ? "Rent"
                              : "Sale"}
                        </small>
                      </Table.Cell>
                    )}
                    {inventory && tab === "inventory" && (
                      <Table.Cell className="seo-price-cell">
                        <span>
                          {amount(
                            module === "project" ? row.min_price : row.price,
                          )}
                          {module === "project" &&
                          Number(row.max_price) > Number(row.min_price)
                            ? ` – ${amount(row.max_price)}`
                            : ""}
                        </span>
                        {row.listing_type === "Rent" && (
                          <small className="seo-inline-fact">/ mo</small>
                        )}
                      </Table.Cell>
                    )}
                    <Table.Cell className="seo-status-cell">
                      <Badge
                        variant="soft"
                        color={
                          module === "technical"
                            ? "amber"
                            : row.seo_id
                              ? "blue"
                              : "gray"
                        }
                        className={
                          "seo-badge " +
                          (module === "technical"
                            ? "seo-redirect-badge "
                            : "") +
                          (row.seo_id || !inventory || tab === "templates"
                            ? "custom"
                            : "")
                        }
                      >
                        {module === "technical"
                          ? "301 redirect"
                          : row.seo_id || !inventory || tab === "templates"
                            ? tab === "templates"
                              ? "Template"
                              : "Custom"
                            : "Auto"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell
                      className={`seo-actions-cell${module === "listing" && tab !== "templates" ? " seo-actions-multiple" : ""}`}
                    >
                      {module === "technical" ? (
                        <Button
                          variant="soft"
                          color="red"
                          className="seo-row-action seo-danger"
                          onClick={async () => {
                            try {
                              await seoApi(
                                "redirects/" + row.id,
                                undefined,
                                "DELETE",
                              );
                              refresh();
                            } catch (e) {
                              setError((e as Error).message);
                            }
                          }}
                        >
                          <Trash2 size={12} aria-hidden="true" /> Remove
                        </Button>
                      ) : (
                        <Button
                          variant="soft"
                          className="seo-row-action seo-edit-action"
                          onClick={() => open(row)}
                          aria-label={`Edit SEO for ${row.name || row.public_path || (tab === "templates" ? templateName(row) : row.config_key)}`}
                        >
                          <Pencil size={12} aria-hidden="true" /> Edit
                        </Button>
                      )}
                      {module === "listing" && tab !== "templates" && (
                        <Button
                          variant="soft"
                          color="red"
                          className="seo-row-action seo-danger"
                          onClick={async () => {
                            try {
                              await seoApi(
                                "listing-pages/" + row.listing_id,
                                undefined,
                                "DELETE",
                              );
                              refresh();
                            } catch (e) {
                              setError((e as Error).message);
                            }
                          }}
                        >
                          <Trash2 size={12} aria-hidden="true" /> Remove rule
                        </Button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>
        )}
        <div className="seo-pagination">
          <span className="seo-muted">
            {inventory && tab === "inventory" && total > 0
              ? `${((page - 1) * 30 + 1).toLocaleString("en-IN")}–${Math.min(page * 30, total).toLocaleString("en-IN")} of `
              : ""}
            {total.toLocaleString("en-IN")}{" "}
            {tab === "templates"
              ? "templates"
              : module === "technical"
                ? "redirects"
                : "records"}
            {inventory && tab === "inventory" ? ` · Page ${page}` : ""}
          </span>
          {inventory && tab === "inventory" && (
            <div>
              <Button
                variant="soft"
                color="gray"
                className="seo-button seo-secondary"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="soft"
                color="gray"
                className="seo-button seo-secondary"
                disabled={page * 30 >= total || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
      {editor &&
        (inventory &&
        tab === "inventory" &&
        ["project", "property"].includes(
          editor.config?.scope || editor.scope,
        ) ? (
          <AdvancedSeoEditor
            initial={editor}
            onClose={() => setEditor(null)}
            onSaved={refresh}
          />
        ) : (
          <Editor
            initial={editor}
            options={options}
            onClose={() => setEditor(null)}
            onSaved={refresh}
          />
        ))}
    </>
  );
}
