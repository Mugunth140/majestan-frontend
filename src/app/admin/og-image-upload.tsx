"use client";

import { useId, useState } from "react";
import { Button } from "@radix-ui/themes";

export function OgImageUpload({ value, onChange, disabled, onUploadingChange }: {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File) {
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG or WebP image.");
      return;
    }
    if (!file.size || file.size > 5 * 1024 * 1024) {
      setError("Choose an image up to 5 MB.");
      return;
    }
    setUploading(true);
    onUploadingChange(true);
    try {
      const response = await fetch("/api/seo-admin/media/opengraph", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Image upload failed. Please retry.");
      const url = (result.data ?? result).url;
      if (typeof url !== "string" || !url) throw new Error("Image upload did not return a URL. Please retry.");
      onChange(url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed. Please retry.");
    } finally {
      setUploading(false);
      onUploadingChange(false);
    }
  }
  return (
    <div className="seo-field">
      <label htmlFor={id}>OpenGraph image</label>
      {value && <img src={value} alt="OpenGraph image preview" width={300} height={158} style={{ objectFit: "contain", maxWidth: "100%" }} />}
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || uploading}
        aria-describedby={`${id}-hint`} onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) void upload(file);
        }} />
      <small id={`${id}-hint`}>JPEG, PNG or WebP, up to 5 MB. Recommended size: 1200 × 630 pixels. Save SEO changes to use the uploaded image.</small>
      {value && <Button type="button" variant="soft" color="gray" disabled={disabled || uploading} onClick={() => { setError(""); onChange(""); }}>Remove image</Button>}
      {uploading && <p role="status">Uploading image…</p>}
      {error && <p className="seo-error" role="alert">{error}</p>}
    </div>
  );
}
