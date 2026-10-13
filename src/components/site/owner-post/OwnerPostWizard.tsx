"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useUserAuthStore } from "@/store/userAuthStore";
import { UserAuthModal } from "@/components/site/auth/user-auth-modal";
import { FormField, CatalogChoices } from "./owner-post-fields";
import { OwnerAreaField } from "./OwnerAreaField";
import { OwnerPostSelect, StableCheckbox } from "./owner-post-controls";
import {
  OwnerPhotoGallery,
  OwnerPhotoUploadProgress,
} from "./OwnerPhotoGallery";
import { ownerApi } from "./owner-post-api";
import { useOwnerDraft } from "./use-owner-draft";
import {
  CATEGORIES,
  STEPS,
  visibleFields,
  validateStep,
  buildPayload,
  money,
  normalizeAreaUnit,
  type Category,
  type FormData,
  type Photo,
} from "./owner-post-model";
import styles from "./owner-post.module.css";

type Props = { data: FormData };
export function OwnerPostWizard({ data }: Props) {
  const { token, user, isAuthenticated } = useUserAuthStore();
  const state = useOwnerDraft(isAuthenticated ? token : null, user?.id);
  const { draft, update, ready } = state;
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadCounts, setUploadCounts] = useState({ current: 0, total: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{
    id: number;
    propertyCode?: string;
  } | null>(null);
  const [agreed, setAgreed] = useState(false);
  const main = useRef<HTMLDivElement>(null);
  const formBody = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const session = useRef(token);
  useEffect(() => {
    session.current = token;
  }, [token]);
  const uploadBusy = useRef(false);
  const pendingFiles = useRef<File[]>([]);
  const previewUrls = useRef(new Set<string>());
  const authenticated = !!token && isAuthenticated;
  const currentStep = STEPS[step];
  const saveLabel =
    !ready && !state.conflict
      ? "Loading…"
      : state.conflict
        ? "Choose a draft"
        : state.status.includes("could not") ||
            state.status.includes("Could not")
          ? "Not synced"
          : state.status.includes("Saving")
            ? "Saving…"
            : state.status.includes("account")
              ? "Saved"
              : "Saved on this device";
  const category = CATEGORIES.find((c) => c.value === draft.category);
  const city = data.cities.find((c) => c.id === Number(draft.cityId));
  const locality = data.sublocations.find(
    (s) => s.id === Number(draft.sublocationId),
  );
  const localities = data.sublocations.filter(
    (s) => s.city_id === Number(draft.cityId),
  );
  const outdatedPhotos = draft.photos.filter(
    (photo) =>
      !/^(uploads|local)\/temp\/[0-9]+-owner-[0-9]+-[a-f0-9-]{36}-[A-Za-z0-9._-]+$/.test(
        photo.key,
      ),
  );
  const isLand = ["plot", "farmland"].includes(draft.category);

  useEffect(
    () => () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );
  const go = (next: number) => {
    setStep(next);
    setErrors({});
    setError("");
    requestAnimationFrame(() => {
      main.current?.focus();
      formBody.current?.scrollTo?.({ top: 0, behavior: "instant" });
    });
  };
  const focusError = () =>
    requestAnimationFrame(() => {
      const invalid = main.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      const details = invalid?.closest("details");
      if (details) details.open = true;
      invalid?.focus();
    });
  const setValue = (key: string, value: string | boolean) => {
    update((d) => ({ ...d, values: { ...d.values, [key]: value } }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  async function uploadFiles(files: File[]) {
    if (!token || uploadBusy.current) return;
    uploadBusy.current = true;
    setUploading(true);
    setError("");
    const failures: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        setUploadProgress(`Uploading photo ${index + 1} of ${files.length}`);
        setUploadCounts({ current: index + 1, total: files.length });
        try {
          const query = new URLSearchParams({
            fileName: file.name,
            fileType: file.type,
          });
          const signed = await ownerApi.request<{
            url: string;
            key: string;
            previewUrl: string;
          }>(`/media/presigned-url?${query}`, token);
          const local = signed.key.startsWith("local/");
          const response = await fetch(
            local
              ? `/site-api/owner/media/upload-temp?key=${encodeURIComponent(signed.key)}`
              : signed.url,
            {
              method: "PUT",
              headers: {
                "Content-Type": file.type,
                ...(local ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: file,
              signal: AbortSignal.timeout(60000),
            },
          );
          if (!response.ok) throw new Error("Upload failed");
          if (session.current !== token) throw new Error("Account changed");
          const previewUrl = URL.createObjectURL(file);
          previewUrls.current.add(previewUrl);
          const photo: Photo = {
            key: signed.key,
            name: file.name,
            previewUrl: signed.previewUrl,
            localPreviewUrl: previewUrl,
          };
          update((d) => ({ ...d, photos: [...d.photos, photo] }));
        } catch (err) {
          if (
            (err as { status?: number }).status === 403 ||
            (err as { status?: number }).status === 401
          )
            setAuthOpen(true);
          failures.push(file.name);
        }
      }
      if (failures.length)
        setError(
          `Could not upload ${failures.join(", ")}. Your other photos are kept. Please try those files again.`,
        );
    } finally {
      uploadBusy.current = false;
      setUploading(false);
      setUploadProgress("");
    }
  }
  // A visitor can select photos before signing in; resume the selected files
  // only after both account authentication and draft reconciliation complete.
  useEffect(() => {
    if (!authenticated || !ready || !pendingFiles.current.length) return;
    const files = pendingFiles.current;
    pendingFiles.current = [];
    setAuthOpen(false);
    const room = 20 - draft.photos.length;
    if (files.length > room) {
      setError("You can add up to 20 photos. Choose fewer photos.");
      return;
    }
    void uploadFiles(files);
    // Upload runs once for the queued selection, not after each draft change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, ready]);

  function selectPhotos(files: File[]) {
    if (!files.length) return;
    if (draft.photos.length + files.length > 20) {
      setError("You can add up to 20 photos.");
      return;
    }
    const bad = files.find(
      (f) =>
        !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
        f.size > 15 * 1024 * 1024 ||
        !f.size,
    );
    if (bad) {
      setError(`${bad.name}: choose a JPG, PNG or WebP photo under 15 MB.`);
      return;
    }
    if (!authenticated) {
      pendingFiles.current = files;
      setAuthOpen(true);
      return;
    }
    void uploadFiles(files);
  }
  async function continueStep(e: FormEvent) {
    e.preventDefault();
    if (!ready || uploading || submitting) return;
    const found = validateStep(draft, step);
    if (Object.keys(found).length) {
      setErrors(found);
      focusError();
      return;
    }
    if (step < 5) {
      setVisited((v) => Math.max(v, step + 1));
      go(step + 1);
      return;
    }
    for (let i = 0; i < 4; i++) {
      const validation = validateStep(draft, i);
      if (Object.keys(validation).length) {
        go(i);
        setErrors(validation);
        focusError();
        return;
      }
    }
    if (outdatedPhotos.length) {
      go(4);
      setError(
        "Some photos were uploaded with an earlier version. Remove those photos and upload them again before sending for review.",
      );
      return;
    }
    if (!agreed) {
      setErrors({
        agreed:
          "Confirm that these details are accurate and you can list this property.",
      });
      focusError();
      return;
    }
    if (!token || !authenticated || user?.isVerified === false) {
      setAuthOpen(true);
      return;
    }
    if (busy.current) return;
    busy.current = true;
    setSubmitting(true);
    setError("");
    try {
      await state.pause();
      const result = await ownerApi.request<{
        id: number;
        propertyCode?: string;
      }>(`/properties/${draft.category}`, token, {
        method: "POST",
        body: JSON.stringify(buildPayload(draft)),
      });
      if (!result?.id)
        throw new Error(
          "We could not confirm your submission. Please contact our team before trying again.",
        );
      state.complete();
      setReceipt(result);
    } catch (err) {
      state.resume();
      if ((err as { status?: number }).status === 401) {
        setAuthOpen(true);
        setError(
          "Your session expired. Sign in again to send your saved property.",
        );
      } else if ((err as { status?: number }).status === 403) {
        setAuthOpen(true);
        setError("Verify your phone with OTP login to send this property.");
      } else
        setError(
          err instanceof Error &&
            ["AbortError", "TimeoutError"].includes(err.name)
            ? "The request timed out. Your property may have been received. Contact our team before sending it again."
            : err instanceof Error
              ? err.message
              : "We could not submit your property. Please try again.",
        );
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  if (receipt)
    return (
      <section className={styles.receipt} aria-live="polite">
        <span className={styles.receiptMark} aria-hidden="true">
          ✓
        </span>
        <p className={styles.eyebrow}>Property received</p>
        <h1>Your listing is with our team</h1>
        <p>
          We will verify the details before your property appears on Majestan
          Realty. Our team may contact you on your registered phone.
        </p>
        <div className={styles.reference}>
          Reference <strong>{receipt.propertyCode || `#${receipt.id}`}</strong>
        </div>
        <Link href="/" className={styles.primary}>
          Back to Majestan
        </Link>
        <button
          type="button"
          onClick={() => window.location.assign("/post-property")}
          className={styles.textButton}
        >
          Post another property
        </button>
      </section>
    );

  const profileFields = visibleFields(draft, 2);
  const review = (index: number, label: string, children: React.ReactNode) => (
    <section className={styles.reviewSection}>
      <div className={styles.reviewHeading}>
        <h3>{label}</h3>
        <button
          type="button"
          className={styles.textButton}
          onClick={() => go(index)}
        >
          Edit {label.toLowerCase()}
        </button>
      </div>
      {children}
    </section>
  );

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <nav aria-label="Property posting steps">
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.label}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  disabled={i > visited || !ready || uploading || submitting}
                  aria-current={i === step ? "step" : undefined}
                  className={`${styles.stepButton} ${i === step ? styles.activeStep : ""}`}
                >
                  <span className={styles.stepNumber}>
                    {i < step ? "✓" : String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{s.label}</strong>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <Link className={styles.sidebarHelp} href="/contact-us">
          Need help? ↗
        </Link>
      </aside>
      <div ref={main} className={styles.main} tabIndex={-1}>
        <div className={styles.mobileProgress}>
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <progress
            max={STEPS.length}
            value={step + 1}
            aria-label="Posting progress"
          />
        </div>
        <div className={styles.formTop}>
          <button
            type="button"
            onClick={() => (step ? go(step - 1) : window.location.assign("/"))}
            disabled={submitting || uploading}
            className={styles.back}
          >
            ← <span>{step ? "Back" : "Back to home"}</span>
          </button>
          <span
            className={styles.saveStatus}
            role="status"
            title={state.status}
          >
            {saveLabel}
          </span>
        </div>
        <header className={styles.stepHeading}>
          <h1>{currentStep.label}</h1>
        </header>
        {state.conflict ? (
          <div className={styles.draftChoice}>
            <h3>You have two drafts</h3>
            <p>
              Continue the property you started here, or resume the one saved to
              your account.
            </p>
            <button
              type="button"
              className={styles.primary}
              onClick={() => state.choose("guest")}
            >
              Keep this property
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                pendingFiles.current = [];
                state.choose("account");
              }}
            >
              Resume account draft
            </button>
          </div>
        ) : !ready ? (
          <div
            className={styles.skeleton}
            aria-label="Loading your draft"
            role="status"
          >
            <span />
            <span />
            <span />
          </div>
        ) : (
          <form className={styles.form} onSubmit={continueStep} noValidate>
            <div ref={formBody} className={styles.formBody}>
              {state.status.includes("could not load") && (
                <div className={styles.error} role="alert">
                  {state.status}{" "}
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={state.reload}
                  >
                    Retry account draft
                  </button>
                </div>
              )}
              {error && step !== 5 && (
                <div className={styles.error} role="alert">
                  {error}
                </div>
              )}
              {step === 0 && (
                <>
                  <fieldset className={styles.choices}>
                    <legend>
                      I want to <span className={styles.required}>*</span>
                    </legend>
                    <div className={styles.purposeChoices}>
                      {(["Sell", "Rent"] as const).map((purpose) => (
                        <label
                          key={purpose}
                          className={`${styles.purpose} ${draft.listingType === purpose ? styles.selected : ""}`}
                        >
                          <input
                            type="radio"
                            name="listingType"
                            value={purpose}
                            checked={draft.listingType === purpose}
                            onChange={() => {
                              update((d) => ({
                                ...d,
                                listingType: purpose,
                                values:
                                  d.listingType === purpose
                                    ? d.values
                                    : { ...d.values, price: "" },
                              }));
                              setErrors({});
                            }}
                          />
                          <span>
                            <strong>
                              {purpose === "Sell"
                                ? "Sell my property"
                                : "Rent out my property"}
                            </strong>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset
                    className={styles.choices}
                    aria-describedby={
                      errors.category ? "category-error" : undefined
                    }
                  >
                    <legend>
                      Property category{" "}
                      <span className={styles.required}>*</span>
                    </legend>
                    <div className={styles.categoryChoices}>
                      {CATEGORIES.filter(
                        (c) =>
                          !(
                            draft.listingType === "Rent" &&
                            c.value === "farmland"
                          ),
                      ).map((c) => (
                        <label
                          key={c.value}
                          className={`${styles.category} ${draft.category === c.value ? styles.selected : ""}`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={c.value}
                            checked={draft.category === c.value}
                            onChange={() => {
                              update((d) => ({
                                ...d,
                                category: c.value as Category,
                              }));
                              setErrors({});
                            }}
                          />
                          <span>
                            <strong>{c.label}</strong>
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.category && (
                      <p id="category-error" className={styles.fieldError}>
                        {errors.category}
                      </p>
                    )}
                  </fieldset>
                </>
              )}
              {step === 1 && (
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label htmlFor="owner-cityId">
                      City <span className={styles.required}>*</span>
                    </label>
                    <OwnerPostSelect
                      id="owner-cityId"
                      name="cityId"
                      value={draft.cityId}
                      invalid={!!errors.cityId}
                      describedBy={errors.cityId ? "city-error" : undefined}
                      placeholder="Choose a city"
                      searchable
                      options={data.cities.map((c) => ({
                        value: String(c.id),
                        label: c.city_name,
                      }))}
                      onChange={(value) => {
                        update((d) => ({
                          ...d,
                          cityId: value,
                          sublocationId: "",
                          values: { ...d.values, pincode: "" },
                        }));
                        setErrors({});
                      }}
                    />
                    {errors.cityId && (
                      <p id="city-error" className={styles.fieldError}>
                        {errors.cityId}
                      </p>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="owner-sublocationId">
                      Locality <span className={styles.required}>*</span>
                    </label>
                    <OwnerPostSelect
                      id="owner-sublocationId"
                      name="sublocationId"
                      value={draft.sublocationId}
                      disabled={!draft.cityId}
                      invalid={!!errors.sublocationId}
                      describedBy={
                        errors.sublocationId ? "locality-error" : undefined
                      }
                      placeholder={
                        draft.cityId
                          ? "Choose a locality"
                          : "Choose a city first"
                      }
                      searchable
                      options={localities.map((l) => ({
                        value: String(l.id),
                        label: l.locality_name,
                      }))}
                      onChange={(value) => {
                        const chosen = localities.find(
                          (l) => l.id === Number(value),
                        );
                        update((d) => ({
                          ...d,
                          sublocationId: value,
                          values: {
                            ...d.values,
                            pincode: chosen?.postal_code || "",
                          },
                        }));
                        setErrors({});
                      }}
                    />
                    {draft.cityId && !localities.length && (
                      <p className={styles.hint}>
                        This city has no available localities. Contact our team
                        for help.
                      </p>
                    )}
                    {errors.sublocationId && (
                      <p id="locality-error" className={styles.fieldError}>
                        {errors.sublocationId}
                      </p>
                    )}
                  </div>
                  {visibleFields(draft, 1).map((f) => (
                    <FormField
                      key={f.key}
                      field={f}
                      value={draft.values[f.key]}
                      error={errors[f.key]}
                      onChange={(v) => setValue(f.key, v)}
                    />
                  ))}
                </div>
              )}
              {step === 2 && (
                <>
                  <div className={styles.fieldGrid}>
                    {profileFields
                      .filter(
                        (f) =>
                          f.kind !== "checkbox" &&
                          (f.required ||
                            [
                              "facing",
                              "furnishingStatus",
                              "propertyAge",
                              "propertyUse",
                              "landType",
                              "waterSources",
                            ].includes(f.key)),
                      )
                      .map((f) =>
                        isLand && f.key === "areaSqft" ? (
                          <OwnerAreaField
                            key={f.key}
                            amount={draft.values.areaSqft}
                            unit={draft.values.areaUnit}
                            required
                            error={errors.areaSqft}
                            onChange={setValue}
                          />
                        ) : (
                          <FormField
                            key={f.key}
                            field={f}
                            value={draft.values[f.key]}
                            error={errors[f.key]}
                            onChange={(v) => setValue(f.key, v)}
                          />
                        ),
                      )}
                  </div>
                  <details className={styles.optionalDetails}>
                    <summary>
                      More property details{" "}
                      <span>Optional measurements and specifications</span>
                    </summary>
                    <div className={styles.fieldGrid}>
                      {profileFields
                        .filter(
                          (f) =>
                            f.kind !== "checkbox" &&
                            !f.required &&
                            ![
                              "facing",
                              "furnishingStatus",
                              "propertyAge",
                              "propertyUse",
                              "landType",
                              "waterSources",
                            ].includes(f.key),
                        )
                        .map((f) => (
                          <FormField
                            key={f.key}
                            field={f}
                            value={draft.values[f.key]}
                            error={errors[f.key]}
                            onChange={(v) => setValue(f.key, v)}
                          />
                        ))}
                    </div>
                  </details>
                  <fieldset className={styles.catalog}>
                    <legend>
                      Property features{" "}
                      <span className={styles.optional}>Optional</span>
                    </legend>
                    <div className={styles.featureGrid}>
                      {profileFields
                        .filter((f) => f.kind === "checkbox")
                        .map((f) => (
                          <FormField
                            key={f.key}
                            field={f}
                            value={draft.values[f.key]}
                            onChange={(v) => setValue(f.key, v)}
                          />
                        ))}
                    </div>
                  </fieldset>
                  {!isLand && (
                    <CatalogChoices
                      title="Amenities"
                      items={data.amenities}
                      selected={draft.amenityIds}
                      onChange={(ids) =>
                        update((d) => ({ ...d, amenityIds: ids }))
                      }
                    />
                  )}
                  {["SEMI FURNISHED", "FULLY FURNISHED"].includes(
                    String(draft.values.furnishingStatus),
                  ) && (
                    <CatalogChoices
                      title="Included furnishings"
                      items={data.furnishings}
                      selected={draft.furnishingIds}
                      onChange={(ids) =>
                        update((d) => ({ ...d, furnishingIds: ids }))
                      }
                    />
                  )}
                </>
              )}
              {step === 3 && (
                <>
                  <div className={styles.fieldGrid}>
                    {visibleFields(draft, 3).map((f) => (
                      <FormField
                        key={f.key}
                        field={f}
                        value={draft.values[f.key]}
                        error={errors[f.key]}
                        onChange={(v) => setValue(f.key, v)}
                      />
                    ))}
                  </div>
                </>
              )}
              {step === 4 && (
                <>
                  <div className={styles.uploadBox}>
                    <span className={styles.uploadSymbol} aria-hidden="true">
                      ↑
                    </span>
                    <p>
                      JPG, PNG or WebP · Up to 15 MB each · Maximum 20 photos
                    </p>
                    <label className={styles.uploadLabel}>
                      <span>
                        {uploading ? uploadProgress : "Choose photos"}
                      </span>
                      <input
                        aria-label="Choose property photos"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={uploading || submitting}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          e.target.value = "";
                          selectPhotos(files);
                        }}
                      />
                    </label>
                    {!authenticated && (
                      <small>
                        Sign in or create an account to upload. Your property
                        details stay here.
                      </small>
                    )}
                  </div>
                  <OwnerPhotoUploadProgress
                    current={Math.max(0, uploadCounts.current - 1)}
                    total={uploadCounts.total}
                    message={
                      uploading
                        ? `${uploadProgress}. Keep this page open.`
                        : undefined
                    }
                    loading={uploading}
                  />
                  {outdatedPhotos.length > 0 && (
                    <p className={styles.fieldError} role="status">
                      Upload again:{" "}
                      {outdatedPhotos.map((photo) => photo.name).join(", ")}
                    </p>
                  )}
                  <OwnerPhotoGallery
                    photos={draft.photos}
                    disabled={uploading || submitting}
                    onReorder={(photos) => update((d) => ({ ...d, photos }))}
                    onRemove={(photo) => {
                      if (photo.localPreviewUrl) {
                        URL.revokeObjectURL(photo.localPreviewUrl);
                        previewUrls.current.delete(photo.localPreviewUrl);
                      }
                      update((d) => ({
                        ...d,
                        photos: d.photos.filter((p) => p.key !== photo.key),
                      }));
                    }}
                  />
                </>
              )}
              {step === 5 && (
                <>
                  <div className={styles.listingPreview}>
                    <span className={styles.previewTag}>
                      For {draft.listingType === "Sell" ? "sale" : "rent"} ·{" "}
                      {category?.label}
                    </span>
                    <h2>{String(draft.values.title)}</h2>
                    <p>
                      {locality?.locality_name}, {city?.city_name}
                    </p>
                    <strong>
                      {money(draft.values.price)}
                      {draft.listingType === "Rent" && <small> / month</small>}
                    </strong>
                  </div>
                  {review(
                    0,
                    "Basic details",
                    <p>
                      {category?.label} for{" "}
                      {draft.listingType === "Sell" ? "sale" : "rent"}
                    </p>,
                  )}
                  {review(
                    1,
                    "Location",
                    <>
                      <p>{String(draft.values.address)}</p>
                      <p>
                        {locality?.locality_name}, {city?.city_name}
                        {draft.values.pincode
                          ? ` · ${draft.values.pincode}`
                          : ""}
                      </p>
                      {draft.values.projectName && (
                        <p>{String(draft.values.projectName)}</p>
                      )}
                    </>,
                  )}
                  {review(
                    2,
                    "Property profile",
                    <>
                      <p className={styles.description}>
                        {String(draft.values.description)}
                      </p>
                      <dl className={styles.reviewDetails}>
                        {profileFields
                          .filter(
                            (f) =>
                              f.scope === "details" &&
                              draft.values[f.key] !== undefined &&
                              draft.values[f.key] !== "",
                          )
                          .map((f) => (
                            <div key={f.key}>
                              <dt>
                                {isLand && f.key === "areaSqft"
                                  ? "Total land area"
                                  : f.label}
                              </dt>
                              <dd>
                                {typeof draft.values[f.key] === "boolean"
                                  ? draft.values[f.key]
                                    ? "Yes"
                                    : "No"
                                  : String(draft.values[f.key]) +
                                    (isLand && f.key === "areaSqft"
                                      ? ` ${normalizeAreaUnit(draft.values.areaUnit)}`
                                      : "")}
                              </dd>
                            </div>
                          ))}
                      </dl>
                      {draft.amenityIds.length > 0 && (
                        <p>
                          Amenities:{" "}
                          {data.amenities
                            .filter((a) => draft.amenityIds.includes(a.id))
                            .map((a) => a.name)
                            .join(", ")}
                        </p>
                      )}
                      {draft.furnishingIds.length > 0 && (
                        <p>
                          Furnishings:{" "}
                          {data.furnishings
                            .filter((a) => draft.furnishingIds.includes(a.id))
                            .map((a) => a.name)
                            .join(", ")}
                        </p>
                      )}
                    </>,
                  )}
                  {review(
                    3,
                    "Pricing",
                    <dl className={styles.reviewDetails}>
                      {visibleFields(draft, 3)
                        .filter(
                          (f) =>
                            draft.values[f.key] !== undefined &&
                            draft.values[f.key] !== "",
                        )
                        .map((f) => (
                          <div key={f.key}>
                            <dt>{f.label}</dt>
                            <dd>
                              {f.kind === "number"
                                ? money(draft.values[f.key])
                                : typeof draft.values[f.key] === "boolean"
                                  ? draft.values[f.key]
                                    ? "Yes"
                                    : "No"
                                  : String(draft.values[f.key])}
                            </dd>
                          </div>
                        ))}
                    </dl>,
                  )}
                  {review(
                    4,
                    "Photos",
                    <p>
                      {draft.photos.length
                        ? `${draft.photos.length} photo${draft.photos.length === 1 ? "" : "s"} added. First photo is your cover.`
                        : "No photos added yet."}
                    </p>,
                  )}
                  <div className={styles.contactNote}>
                    <strong>
                      {authenticated
                        ? `Contact: ${user?.name}`
                        : "Finish with your account"}
                    </strong>
                    <p>
                      {authenticated
                        ? `Our team will contact you on ${user?.phone}.`
                        : "Use your mobile number to sign in or create an account. Your property details will be kept."}
                    </p>
                    {!authenticated && (
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => setAuthOpen(true)}
                      >
                        Sign in or create an account
                      </button>
                    )}
                  </div>
                  <StableCheckbox
                    id="owner-consent"
                    name="consent"
                    label="I confirm that the information is accurate and I own or am authorised to list this property. Majestan Realty may contact me to verify it."
                    checked={agreed}
                    invalid={!!errors.agreed}
                    describedBy={errors.agreed ? "consent-error" : undefined}
                    error={errors.agreed}
                    errorId="consent-error"
                    onChange={(checked) => {
                      setAgreed(checked);
                      setErrors({});
                    }}
                  />
                </>
              )}
            </div>
            {error && step === 5 && (
              <div className={styles.submitError} role="alert">
                {error}
              </div>
            )}
            <div className={styles.actions}>
              <p>
                {step === 4
                  ? "Photos are optional"
                  : step === 5
                    ? "Subject to review"
                    : "* Required"}
              </p>
              <button
                type="submit"
                className={styles.primary}
                disabled={uploading || submitting}
              >
                {submitting
                  ? "Sending for review…"
                  : step === 5
                    ? authenticated
                      ? "Send for review"
                      : "Sign in and send for review"
                    : step === 4 && !draft.photos.length
                      ? "Continue without photos"
                      : "Continue"}
                {!submitting && <span aria-hidden="true"> →</span>}
              </button>
            </div>
          </form>
        )}
      </div>

      <UserAuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          pendingFiles.current = [];
        }}
      />
    </div>
  );
}
