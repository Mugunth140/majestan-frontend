"use client";

import type { Field, FieldValue } from "./owner-post-model";
import styles from "./owner-post-controls.module.css";
import {
  CatalogChoices as CatalogChoiceControl,
  OwnerPostSelect,
  PriceAmountInput,
  StableCheckbox,
} from "./owner-post-controls";

const WORDS_CURRENCY_FIELDS = new Set([
  "price",
  "bookingAmount",
  "securityDeposit",
  "maintenanceCharges",
  "rentPerSeat",
]);

export function FormField({
  field,
  value,
  error,
  onChange,
}: {
  field: Field;
  value?: FieldValue;
  error?: string;
  onChange: (value: FieldValue) => void;
}) {
  const id = `owner-${field.key}`;
  const hint = ["areaSqft", "reraNumber"].includes(field.key)
    ? field.hint
    : undefined;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId]
    .filter(Boolean)
    .join(" ");
  const isCurrency = WORDS_CURRENCY_FIELDS.has(field.key);

  if (field.kind === "checkbox")
    return (
      <StableCheckbox
        id={id}
        name={field.key}
        label={field.label}
        checked={value === true}
        invalid={!!error}
        describedBy={describedBy || undefined}
        error={error}
        errorId={error ? errorId : undefined}
        onChange={onChange}
      />
    );

  return (
    <div
      className={`${styles.field} ${field.kind === "textarea" ? styles.wide : ""}`}
    >
      <label className={styles.label} htmlFor={id}>
        {field.label}
        {field.required ? (
          <span className={styles.required}> *</span>
        ) : (
          <span className={styles.optional}> Optional</span>
        )}
      </label>
      {field.kind === "select" ? (
        <OwnerPostSelect
          id={id}
          name={field.key}
          value={String(value ?? "")}
          options={field.options ?? []}
          placeholder="Choose an option"
          invalid={!!error}
          describedBy={describedBy || undefined}
          onChange={onChange}
        />
      ) : field.kind === "textarea" ? (
        <textarea
          className={styles.textarea}
          id={id}
          name={field.key}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          rows={4}
          value={String(value ?? "")}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : isCurrency ? (
        <PriceAmountInput
          id={id}
          name={field.key}
          value={String(value ?? "")}
          min={field.min}
          max={field.max}
          required={field.required}
          invalid={!!error}
          describedBy={describedBy || undefined}
          placeholder={field.placeholder ?? "Enter amount in rupees"}
          onChange={onChange}
        />
      ) : (
        <input
          className={styles.input}
          id={id}
          name={field.key}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          type={
            field.kind === "number"
              ? "number"
              : field.kind === "date"
                ? "date"
                : "text"
          }
          inputMode={
            field.kind === "number" || field.key === "pincode"
              ? "decimal"
              : undefined
          }
          min={field.min}
          max={field.max ?? (field.kind === "number" ? 9999999999 : undefined)}
          step={
            field.integer
              ? 1
              : field.kind === "number"
                ? field.scope === "top"
                  ? "0.01"
                  : "any"
                : undefined
          }
          value={String(value ?? "")}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <p className={styles.hint} id={hintId}>{hint}</p>}
      {error && <p className={styles.fieldError} id={errorId}>{error}</p>}
    </div>
  );
}

export function CatalogChoices({
  title,
  items,
  selected,
  onChange,
}: {
  title: string;
  items: {
    id: number;
    name: string;
    iconKey?: string | null;
    icon?: string | null;
  }[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  return (
    <CatalogChoiceControl
      title={title}
      items={items}
      selected={selected}
      onChange={onChange}
    />
  );
}
