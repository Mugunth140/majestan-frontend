"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

export function CopyArticleLink({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("error");
    }
  }
  return (
    <span className="blog-copy-control">
      <button className="blog-copy-link" type="button" onClick={copy}>
        {state === "copied" ? (
          <Check size={14} aria-hidden="true" />
        ) : (
          <Link2 size={14} aria-hidden="true" />
        )}
        {state === "copied" ? "Copied" : "Copy link"}
      </button>
      <span className="blog-copy-feedback" role="status">
        {state === "error"
          ? "Could not copy. Copy the address from your browser."
          : ""}
      </span>
    </span>
  );
}
