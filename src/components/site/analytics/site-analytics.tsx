"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { analyticsAbort } from "@/lib/analytics-abort";
import {
  SiteAnalyticsClient,
  analyticsAllowed,
  setAnalyticsClient,
} from "@/lib/site-analytics";

// Stable callback: Next replays previous metrics if the function changes.
let reporter: SiteAnalyticsClient | null = null;
type Vital = Parameters<SiteAnalyticsClient["vital"]>[0];
let pendingVitals: Vital[] = [];
const report: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  try {
    const safe = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    };
    if (reporter) reporter.vital(safe);
    else if (pendingVitals.length < 10) pendingVitals.push(safe);
  } catch {
    /* Analytics must not affect rendering. */
  }
};

export function SiteAnalytics() {
  const pathname = usePathname();
  const client = useRef<SiteAnalyticsClient | null>(null);
  useReportWebVitals(report);
  useEffect(() => {
    let timeout: ReturnType<typeof analyticsAbort> | undefined;
    const cleanup = () => {
      try {
        timeout?.abort();
        client.current?.stop();
      } catch {
        /* Analytics cleanup must never escape React's effect. */
      }
      reporter = null;
      setAnalyticsClient(null);
    };
    try {
      if (!analyticsAllowed(true)) {
        pendingVitals = [];
        return;
      }
      timeout = analyticsAbort(4000);
      const signal = timeout.signal;
      void fetch("/api/analytics", {
        cache: "no-store",
        credentials: "omit",
        signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((config) => {
          if (!config?.enabled || signal.aborted) {
            pendingVitals = [];
            return;
          }
          const instance = (client.current ??= new SiteAnalyticsClient(
            config.allowLocal === true,
          ));
          reporter = instance;
          setAnalyticsClient(instance);
          instance.start();
          instance.navigate();
          for (const metric of pendingVitals.splice(0)) instance.vital(metric);
        })
        .catch(() => {
          pendingVitals = [];
          cleanup();
        })
        .finally(() => timeout?.cancel());
    } catch {
      pendingVitals = [];
      cleanup();
    }
    return cleanup;
  }, []);
  useEffect(() => {
    try {
      client.current?.navigate();
    } catch {
      /* Optional telemetry. */
    }
  }, [pathname]);
  return null;
}
