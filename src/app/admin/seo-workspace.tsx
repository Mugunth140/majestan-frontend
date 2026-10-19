"use client";
import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X, Pencil, Trash2 } from "lucide-react";
import { seoApi } from "./seo-admin-shell";
import { AdvancedSeoEditor } from "./advanced-seo-editor";

type Row = Record<string, any>;
const labels: Record<string, string> = {
  apartment: "Apartment",
  villa: "Villa",
  individual_portion: "Independent house",
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
        <textarea
          value={form[name] ?? ""}
          onChange={(e) => set(name, e.target.value)}
          maxLength={max}
        />
      ) : (
        <input
          type={type}
          value={form[name] ?? ""}
          onChange={(e) => set(name, e.target.value)}
          maxLength={max}
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
      <input
        type="checkbox"
        checked={Boolean(form[name])}
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
            <input
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
            <textarea
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
          <button
            className="seo-button seo-secondary seo-danger"
            type="button"
            onClick={() => onChange(items.filter((_, j) => i !== j))}
          >
            Remove question
          </button>
        </div>
      ))}
      <button
        type="button"
        className="seo-button seo-secondary"
        onClick={() => onChange([...items, { question: "", answer: "" }])}
      >
        Add question
      </button>
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
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Row>(initial.config || initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [schema, setSchema] = useState(
    JSON.stringify((initial.config || initial).schema_overrides || {}, null, 2),
  );
  const [sections, setSections] = useState(
    JSON.stringify((initial.config || initial).section_seo || {}, null, 2),
  );
  const ref = useRef<HTMLDivElement>(null);
  const listing = Boolean(initial.isListing || form.listing_id),
    technical = form.scope === "technical",
    template = form.scope === "template";
  const set = (key: string, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setting = (key: string, value: any) =>
    setForm((f) => ({ ...f, settings: { ...f.settings, [key]: value } }));
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
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = {
        ...form,
        schema_overrides: JSON.parse(schema),
        section_seo: JSON.parse(sections),
      };
      if (listing) await seoApi("listing-pages", body);
      else
        await seoApi(
          "configs/" + encodeURIComponent(form.config_key),
          body,
          "PUT",
        );
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
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
        aria-labelledby="seo-editor-title"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !busy) onClose();
          if (e.key === "Tab") {
            const focusable = ref.current?.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input,select,textarea,a[href]",
            );
            if (!focusable?.length) return;
            const first = focusable[0],
              last = focusable[focusable.length - 1];
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
            <div className="seo-eyebrow">
              {template
                ? "GLOBAL SEO TEMPLATE"
                : technical
                  ? "TECHNICAL SETTINGS"
                  : "SEO EDITOR"}
            </div>
            <h2 id="seo-editor-title">
              {initial.target?.name ||
                initial.target?.title ||
                form.public_path ||
                form.config_key ||
                "Create listing page"}
            </h2>
          </div>
          <button
            className="seo-button seo-secondary"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            Close
          </button>
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
                  <select
                    value={form.inventory_kind || "property"}
                    onChange={(e) => {
                      set("inventory_kind", e.target.value);
                      if (e.target.value === "project")
                        set("transaction_intent", "buy");
                    }}
                  >
                    <option value="property">Individual properties</option>
                    <option value="project">Projects</option>
                  </select>
                </label>
                <label className="seo-field">
                  Transaction intent
                  <select
                    value={form.transaction_intent || "buy"}
                    onChange={(e) => set("transaction_intent", e.target.value)}
                  >
                    {intents
                      .filter(
                        ([v]) =>
                          form.inventory_kind !== "project" ||
                          ["buy"].includes(v),
                      )
                      .map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="seo-field">
                  {form.inventory_kind === "project"
                    ? "Project type"
                    : "Property type"}
                  <select
                    value={
                      form.inventory_kind === "project"
                        ? form.project_type || ""
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
                      .filter(
                        ([v]) =>
                          form.inventory_kind !== "project" ||
                          ["apartment", "villa", "plot"].includes(v),
                      )
                      .map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="seo-field">
                  City
                  <select
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
                  </select>
                </label>
                <label className="seo-field">
                  Sub-locality
                  <select
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
                  </select>
                </label>
                <Field
                  label="Bedrooms (optional)"
                  name="bedrooms"
                  type="number"
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
                      "{BHK}, {SqFt}, {Property_Type}, {Transaction_Type}, {Sub_Locality}, {Location}, {City}, {Price}, {Project_Name}, {Builder}"
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
                  label="Meta title"
                  name="meta_title"
                  form={form}
                  set={set}
                  max={255}
                  hint="Aim for about 50–60 characters."
                />
                <Field
                  label="Meta description"
                  name="meta_description"
                  form={form}
                  set={set}
                  area
                  max={320}
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
                    name="h1"
                    form={form}
                    set={set}
                    max={255}
                  />
                  <Field
                    label="H2 subheading"
                    name="h2"
                    form={form}
                    set={set}
                    max={255}
                  />
                </div>
                <label className="seo-field">
                  AI summary / key highlights
                  <textarea
                    value={(form.highlights || []).join("\n")}
                    onChange={(e) =>
                      set("highlights", e.target.value.split("\n"))
                    }
                  />
                  <small>One factual highlight per line.</small>
                </label>
                {listing && (
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
                      <input
                        value={form.settings?.rera_id || ""}
                        placeholder={initial.target?.rera_number || ""}
                        onChange={(e) => setting("rera_id", e.target.value)}
                      />
                    </label>
                    <label className="seo-field">
                      Builder entity override
                      <input
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
                      <input
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
                  <Field
                    label="Canonical URL"
                    name="canonical_url"
                    form={form}
                    set={set}
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
                  <Field
                    label="OpenGraph image URL"
                    name="og_image_url"
                    form={form}
                    set={set}
                  />
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
                      <input
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
                    <textarea
                      className="seo-code"
                      value={schema}
                      onChange={(e) => setSchema(e.target.value)}
                    />
                  </label>
                  <details>
                    <summary>Section SEO overrides</summary>
                    <label className="seo-field">
                      Preserved section settings (JSON)
                      <textarea
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
                  <textarea
                    className="seo-code"
                    rows={16}
                    value={form.settings?.robots_txt || ""}
                    onChange={(e) => setting("robots_txt", e.target.value)}
                  />
                  <small>Keep /admin and /api blocked.</small>
                </label>
                <label className="seo-field">
                  llms.txt override
                  <textarea
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
                    <input
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
          {error && (
            <p className="seo-error" role="alert">
              {error}
            </p>
          )}
          <div className="seo-form-actions">
            <button
              className="seo-button seo-secondary"
              type="button"
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

export function SeoWorkspace({
  module,
}: {
  module: "project" | "property" | "listing" | "page" | "technical";
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
  const refresh = () => {
    setRevision((n) => n + 1);
    setSuccess("SEO changes saved. The live page now uses these settings.");
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
            <h1>{titles[module]}</h1>
          </div>
          {module === "listing" && (
            <button
              className="seo-button"
              onClick={() =>
                setEditor({
                  isListing: true,
                  scope: "listing",
                  inventory_kind: "property",
                  transaction_intent: "buy",
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
            </button>
          )}
        </div>
        {(inventory || module === "listing") && (
          <div className="seo-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === "inventory"}
              onClick={() => {
                setTab("inventory");
                setPage(1);
              }}
            >
              {" "}
              {inventory ? "Live inventory" : "Listing rules"}
            </button>
            <button
              role="tab"
              aria-selected={tab === "templates"}
              onClick={() => {
                setTab("templates");
                setPage(1);
              }}
            >
              Auto SEO templates
            </button>
          </div>
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
          <button onClick={() => setRevision((n) => n + 1)}>Retry</button>
        </div>
      )}
      {inventory && tab === "inventory" && (
        <div className="seo-filters">
          <label className="seo-filter-search">
            <Search size={14} aria-hidden="true" />
            <input
              aria-label="Search inventory"
              placeholder="Search name or city…"
              value={filters.search}
              onChange={(e) => filter("search", e.target.value)}
            />
          </label>
          <button
            type="button"
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
          </button>
          {showFilters && (
            <div className="seo-filter-options" id="seo-inventory-filters">
              <select
                aria-label="Property type"
                value={filters.type}
                onChange={(e) => filter("type", e.target.value)}
              >
                <option value="">All types</option>
                {Object.entries(labels)
                  .filter(
                    ([v]) =>
                      module !== "project" ||
                      ["apartment", "villa", "plot"].includes(v),
                  )
                  .map(([v, l]) => (
                    <option value={v} key={v}>
                      {l}
                    </option>
                  ))}
              </select>
              {module === "property" && (
                <select
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
                </select>
              )}
              <select
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
              </select>
              <select
                aria-label="SEO status"
                value={filters.seo}
                onChange={(e) => filter("seo", e.target.value)}
              >
                <option value="">All SEO</option>
                <option value="auto">Auto template</option>
                <option value="custom">Custom override</option>
              </select>
            </div>
          )}
          {Object.values(filters).some(Boolean) && (
            <button
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
            </button>
          )}
        </div>
      )}
      {module === "technical" && (
        <>
          <div className="seo-card-grid">
            <section className="seo-panel seo-card">
              <h2>Crawlers & AI search</h2>
              <p>Edit robots.txt, llms.txt and your local business identity.</p>
              <button
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
              </button>
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
                <button
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
                </button>
              ))}
            </section>
          </div>
          {preview && (
            <div className="seo-panel">
              <pre className="seo-code">{preview}</pre>
              <button
                className="seo-button seo-secondary"
                onClick={() => setPreview("")}
              >
                Close preview
              </button>
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
              <input
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
              <input
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
              <button className="seo-button">Save redirect</button>
            </form>
          </section>
        </>
      )}
      <section className="seo-data-section">
        {loading ? (
          <div className="seo-loading" role="status">
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
            <table
              className={`seo-table${inventory && tab === "inventory" ? " seo-inventory-table" : ""}`}
              aria-label={
                tab === "templates" ? "SEO templates" : titles[module]
              }
            >
              <thead>
                <tr>
                  {inventory && tab === "inventory" && (
                    <th scope="col" className="seo-ref-cell">
                      Ref.
                    </th>
                  )}
                  <th scope="col">
                    {tab === "templates"
                      ? "Template"
                      : inventory
                        ? module === "project"
                          ? "Project"
                          : "Property"
                        : module === "technical"
                          ? "Old URL"
                          : "Page URL"}
                  </th>
                  <th
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
                  </th>
                  {inventory && tab === "inventory" && (
                    <th scope="col" className="seo-type-cell">
                      Type
                    </th>
                  )}
                  {inventory && tab === "inventory" && (
                    <th scope="col" className="seo-price-cell">
                      Price
                    </th>
                  )}
                  <th scope="col" className="seo-status-cell">
                    {module === "technical" ? "Rule" : "SEO"}
                  </th>
                  <th scope="col" className="seo-actions-cell">
                    <span className="seo-muted">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.config_key || row.id}>
                    {inventory && tab === "inventory" && (
                      <td className="seo-ref-cell">#{row.id}</td>
                    )}
                    <td className="seo-record-cell">
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
                          {row.name}
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
                    </td>
                    <td
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
                    </td>
                    {inventory && tab === "inventory" && (
                      <td
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
                      </td>
                    )}
                    {inventory && tab === "inventory" && (
                      <td className="seo-price-cell">
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
                      </td>
                    )}
                    <td className="seo-status-cell">
                      <span
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
                      </span>
                    </td>
                    <td
                      className={`seo-actions-cell${module === "listing" && tab !== "templates" ? " seo-actions-multiple" : ""}`}
                    >
                      {module === "technical" ? (
                        <button
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
                        </button>
                      ) : (
                        <button
                          className="seo-row-action seo-edit-action"
                          onClick={() => open(row)}
                          aria-label={`Edit SEO for ${row.name || row.public_path || (tab === "templates" ? templateName(row) : row.config_key)}`}
                        >
                          <Pencil size={12} aria-hidden="true" /> Edit
                        </button>
                      )}
                      {module === "listing" && tab !== "templates" && (
                        <button
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
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <button
                className="seo-button seo-secondary"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="seo-button seo-secondary"
                disabled={page * 30 >= total || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
      {editor &&
        (inventory &&
        tab === "inventory" &&
        ["project", "property"].includes(editor.scope) ? (
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
