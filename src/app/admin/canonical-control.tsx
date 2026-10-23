import { Button, TextField } from "@radix-ui/themes";
import { AdminSelect, AdminCheckbox } from "./admin-controls";
import { resolveCanonicalUrl } from "@/lib/seo-engine";
export function countEditorialWords(values: unknown[]): number {
  return values
    .filter((v) => typeof v === "string")
    .join(" ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*#_`~>|]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}
export function CanonicalControl({
  value,
  onChange,
  path,
  parent,
  words,
  readOnly = false,
}: {
  value: Record<string, any>;
  onChange: (key: string, value: any) => void;
  path: string;
  parent?: string;
  words: number;
  readOnly?: boolean;
}) {
  const type = readOnly
    ? "self"
    : value.canonical_type || (value.canonical_url ? "custom" : "self");
  return (
    <section className="seo-field">
      <span>Canonical URL</span>
      {!readOnly && (
        <AdminSelect
          aria-label="Canonical type"
          value={type}
          onChange={(e) => onChange("canonical_type", e.target.value)}
        >
          <option value="self">Self-Referencing (Default)</option>
          {parent && (
            <option value="parent">Point to Parent Project/Property</option>
          )}
          <option value="custom">Manual Override</option>
        </AdminSelect>
      )}
      {type === "custom" && !readOnly ? (
        <TextField.Root
          aria-label="Custom canonical URL"
          value={value.canonical_url || ""}
          onChange={(e) => onChange("canonical_url", e.target.value)}
        />
      ) : (
        <TextField.Root
          aria-label="Canonical URL"
          readOnly
          value={resolveCanonicalUrl({
            canonicalType: type,
            currentPath: path,
            parentPath: parent,
          })}
        />
      )}
      {words < 250 && type === "self" && (
        <small className="seo-width-warning" role="status">
          Thin content detected ({words} / 250 words). Add descriptive copy
          {parent && !readOnly
            ? " or point the canonical to the parent page."
            : "."}
          {parent && !readOnly && (
            <Button
              type="button"
              className="seo-button seo-secondary"
              onClick={() => onChange("canonical_type", "parent")}
            >
              Set Canonical to Parent
            </Button>
          )}
        </small>
      )}
      <small>
        Word count covers editorial copy only; it is not an automatic indexing
        rule.
      </small>
    </section>
  );
}
