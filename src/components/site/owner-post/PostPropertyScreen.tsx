"use client";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/layout/site-header";
import { OwnerPostWizard } from "./OwnerPostWizard";
import { ownerApi } from "./owner-post-api";
import type { FormData } from "./owner-post-model";
import styles from "./owner-post.module.css";

export function PostPropertyScreen() {
  const [data, setData] = useState<FormData | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    ownerApi
      .formData(controller.signal)
      .then((result) => {
        if (
          !Array.isArray(result.cities) ||
          !Array.isArray(result.sublocations)
        )
          throw new Error("Invalid form data");
        setData({
          ...result,
          amenities: result.amenities ?? [],
          furnishings: result.furnishings ?? [],
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [attempt]);
  return (
    <div className={styles.root}>
      <a className={styles.skip} href="#property-posting">
        Skip to property form
      </a>
      <SiteHeader />
      <main id="property-posting" className={styles.frame}>
        {data ? (
          <OwnerPostWizard data={data} />
        ) : (
          <div className={styles.loadState}>
            {error ? (
              <div role="alert">
                <h1>We could not load the property form</h1>
                <p className={styles.quietNote}>
                  Please check your connection and try again. Your saved draft
                  will be kept.
                </p>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => {
                    setError(false);
                    setAttempt((n) => n + 1);
                  }}
                >
                  Try again
                </button>
              </div>
            ) : (
              <div
                className={styles.skeleton}
                role="status"
                aria-label="Loading property form"
              >
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
