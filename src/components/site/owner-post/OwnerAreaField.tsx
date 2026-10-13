"use client";

import {
  AREA_UNITS,
  convertAreaAmount,
  normalizeAreaUnit,
} from "./owner-post-model";
import { OwnerPostSelect } from "./owner-post-controls";
import styles from "./OwnerAreaField.module.css";

type Props = {
  amount?: string | boolean;
  unit?: string | boolean;
  error?: string;
  required?: boolean;
  onChange: (key: "areaSqft" | "areaUnit", value: string) => void;
};

/** Shared land-area entry. The amount stays in the selected unit in the draft. */
export function OwnerAreaField({
  amount,
  unit,
  error,
  required = false,
  onChange,
}: Props) {
  const amountId = "owner-areaSqft";
  const unitId = "owner-areaUnit";
  const hintId = "owner-area-hint";
  const errorId = "owner-area-error";
  const describedBy = [hintId, error ? errorId : undefined]
    .filter(Boolean)
    .join(" ");
  const currentUnit = normalizeAreaUnit(unit);

  function changeUnit(nextUnit: string) {
    const currentAmount = String(amount ?? "");
    if (currentAmount.trim())
      onChange(
        "areaSqft",
        convertAreaAmount(currentAmount, currentUnit, nextUnit),
      );
    onChange("areaUnit", nextUnit);
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={amountId}>
        Total land area
        {required ? (
          <span className={styles.required}> *</span>
        ) : (
          <span className={styles.optional}> Optional</span>
        )}
      </label>
      <div className={styles.controls}>
        <input
          id={amountId}
          name="areaSqft"
          type="number"
          inputMode="decimal"
          min="0.00000001"
          step="any"
          value={String(amount ?? "")}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(event) => onChange("areaSqft", event.target.value)}
          placeholder="e.g. 1200"
        />
        <label className={styles.unitLabel} htmlFor={unitId}>
          <span className={styles.visuallyHidden}>Area unit</span>
          <OwnerPostSelect
            id={unitId}
            name="areaUnit"
            value={currentUnit}
            options={[...AREA_UNITS]}
            placeholder="Area unit"
            invalid={!!error}
            describedBy={describedBy}
            onChange={changeUnit}
          />
        </label>
      </div>
      <p className={styles.hint} id={hintId}>
        Changing the unit keeps the same total area.
      </p>
      {error && (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
