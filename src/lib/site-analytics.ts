import { analyticsAbort } from "./analytics-abort";
/** First-party telemetry. Never pass form contents, account IDs, URLs with queries, or error messages. */
export type AnalyticsEventName =
  | "phone_click"
  | "email_click"
  | "whatsapp_click"
  | "outbound_click"
  | "download_click"
  | "search"
  | "wishlist_add"
  | "wishlist_remove"
  | "enquiry_submitted"
  | "site_visit_requested"
  | "owner_submission"
  | "javascript_error"
  | "unhandled_rejection"
  | "api_error";
type Kind =
  | "pageview"
  | "engagement"
  | "web_vital"
  | "interaction"
  | "conversion"
  | "error";
export type SiteEvent = {
  id: string;
  sessionId: string;
  pageId: string;
  kind: Kind;
  name: string;
  timestamp: number;
  path: string;
  hostname: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  language?: string;
  timezone?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
  durationMs?: number;
  scrollPercent?: number;
  value?: number;
  rating?: string;
  metricId?: string;
  targetHost?: string;
  entityId?: number;
  entityKind?: "property" | "project";
  statusCode?: number;
};
const CONVERSIONS = new Set([
  "enquiry_submitted",
  "site_visit_requested",
  "owner_submission",
]);
const ERRORS = new Set([
  "javascript_error",
  "unhandled_rejection",
  "api_error",
]);
const NAMES = new Set([
  "phone_click",
  "email_click",
  "whatsapp_click",
  "outbound_click",
  "download_click",
  "search",
  "wishlist_add",
  "wishlist_remove",
  ...CONVERSIONS,
  ...ERRORS,
]);
const SESSION_KEY = "majestan_analytics_session";
const IDLE = 30 * 60_000;
const token = (v: string | null) =>
  v && v.length <= 80 && /^[\w .+:/-]+$/.test(v) && !/\d{10,}/.test(v)
    ? v
    : undefined;
export function publicAnalyticsPath(input: string): string | null {
  try {
    const path =
      decodeURIComponent(input.split(/[?#]/)[0]).replace(/\/+$/, "") || "/";
    if (
      path.length > 512 ||
      !/^\/[a-zA-Z0-9/_.,~+-]*$/.test(path) ||
      path.startsWith("//") ||
      /\d{10,}/.test(path) ||
      /(?:^|\/)\.{1,2}(?:\/|$)/.test(path) ||
      /^\/(admin|api|site-api|login|register|reset-password|detail-render|detail-section|seo-route|seo-section)(\/|$)/i.test(
        path,
      )
    )
      return null;
    return path;
  } catch {
    return null;
  }
}

export function analyticsAllowed(allowLocal = false): boolean {
  try {
    if (
      typeof window === "undefined" ||
      typeof fetch !== "function" ||
      typeof crypto === "undefined" ||
      typeof crypto.randomUUID !== "function" ||
      typeof sessionStorage === "undefined"
    )
      return false;
    // Access itself can throw (sandbox/privacy settings), as can storage reads.
    sessionStorage.getItem(SESSION_KEY);
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (
      nav.doNotTrack === "1" ||
      nav.globalPrivacyControl ||
      /bot|crawler|spider|headless|lighthouse/i.test(nav.userAgent)
    )
      return false;
    try {
      if (localStorage.getItem("majestan_analytics_opt_out") === "1")
        return false;
    } catch {
      /* Storage is optional. */
    }
    return (
      ["majestanrealty.com", "www.majestanrealty.com"].includes(
        location.hostname,
      ) ||
      (allowLocal && ["localhost", "127.0.0.1"].includes(location.hostname))
    );
  } catch {
    return false;
  }
}

type Page = {
  id: string;
  sessionId: string;
  path: string;
  duration: number;
  scroll: number;
  tick: number;
  lastActivity: number;
  emittedDuration: number;
  emittedScroll: number;
};
export class SiteAnalyticsClient {
  private page: Page | null = null;
  private documentPage: Page | null = null;
  private queue: SiteEvent[] = [];
  private sending = false;
  private stopped = true;
  private timer?: ReturnType<typeof setInterval>;
  private scrollFrame?: number;
  private removeListeners: (() => void)[] = [];
  private session = { id: "", at: 0 };
  private errorCount = 0;
  private retryAfter = 0;
  private failedAttempts = 0;
  constructor(private readonly allowLocal = false) {}

  private allowed() {
    return !this.stopped && analyticsAllowed(this.allowLocal);
  }

  start() {
    if (!this.stopped) return;
    this.stopped = false;
    if (!this.allowed()) return;
    const listen = (
      target: Window | Document,
      type: string,
      fn: EventListener,
    ) => {
      target.addEventListener(type, fn, { passive: true });
      this.removeListeners.push(() => target.removeEventListener(type, fn));
    };
    listen(document, "visibilitychange", () => {
      this.engagement(document.hidden ? "leave" : "heartbeat");
      if (document.hidden) this.beacon();
      else {
        if (this.page) this.page.tick = Date.now();
        void this.flush();
      }
    });
    listen(window, "pagehide", () => {
      this.engagement("leave");
      this.beacon();
    });
    listen(window, "pageshow", (e) => {
      if ((e as PageTransitionEvent).persisted) {
        this.page = null;
        this.navigate();
        this.documentPage = this.page;
      }
    });
    listen(document, "pointerdown", () => this.activity());
    listen(document, "keydown", () => this.activity());
    listen(document, "scroll", () => {
      this.activity();
      if (!this.page || this.scrollFrame !== undefined) return;
      const page = this.page;
      this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = undefined;
        if (this.page !== page || !this.allowed()) return;
        const max = document.documentElement.scrollHeight - innerHeight;
        page.scroll = Math.max(
          page.scroll,
          max > 0 ? Math.min(100, Math.round((scrollY / max) * 100)) : 100,
        );
      });
    });
    listen(document, "click", (event) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.protocol === "tel:") this.track("phone_click");
      else if (url.protocol === "mailto:") this.track("email_click");
      else if (
        ["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname)
      )
        this.track("whatsapp_click");
      else if (
        anchor.hasAttribute("download") ||
        /\.(pdf|docx?|xlsx?|zip)$/i.test(url.pathname)
      )
        this.track("download_click");
      else if (
        ["https:", "http:"].includes(url.protocol) &&
        url.hostname !== location.hostname &&
        !["majestanrealty.com", "www.majestanrealty.com"].includes(url.hostname)
      )
        this.track("outbound_click", { targetHost: url.hostname });
    });
    // Only fixed categories; raw errors/reasons/stacks can contain PII or tokens.
    listen(window, "error", () => {
      if (this.errorCount++ < 5) this.track("javascript_error");
    });
    listen(window, "unhandledrejection", () => {
      if (this.errorCount++ < 5) this.track("unhandled_rejection");
    });
    this.timer = setInterval(() => {
      if (document.hidden) return;
      this.engagement("heartbeat");
      void this.flush();
    }, 15_000);
  }

  stop() {
    this.engagement("leave");
    this.beacon();
    this.stopped = true;
    this.removeListeners.splice(0).forEach((fn) => fn());
    if (this.timer) clearInterval(this.timer);
    if (this.scrollFrame !== undefined) cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = undefined;
  }

  private getSession(activity: boolean) {
    if (!this.session.id) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
        if (
          saved &&
          /^[a-f\d-]{36}$/i.test(saved.id) &&
          typeof saved.at === "number"
        )
          this.session = saved;
      } catch {
        /* Fall back to a memory-only session. */
      }
    }
    if (!this.session.id || Date.now() - this.session.at > IDLE)
      this.session = { id: crypto.randomUUID(), at: Date.now() };
    if (activity) this.session.at = Date.now();
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
    } catch {
      /* Optional. */
    }
    return this.session.id;
  }

  navigate() {
    if (!this.allowed()) {
      this.page = null;
      return;
    }
    const path = publicAnalyticsPath(location.pathname);
    if (!path) {
      this.engagement("leave");
      this.page = null;
      return;
    }
    if (this.page?.path === path && Date.now() - this.session.at <= IDLE)
      return;
    this.engagement("leave");
    const previous = this.page?.path;
    this.page = {
      id: crypto.randomUUID(),
      sessionId: this.getSession(true),
      path,
      duration: 0,
      scroll: 0,
      tick: Date.now(),
      lastActivity: Date.now(),
      emittedDuration: 0,
      emittedScroll: 0,
    };
    this.documentPage ??= this.page;
    const query = new URLSearchParams(location.search);
    let referrer: string | undefined;
    try {
      const host =
        !previous && document.referrer
          ? new URL(document.referrer).hostname
          : undefined;
      if (
        host &&
        ![
          "majestanrealty.com",
          "www.majestanrealty.com",
          location.hostname,
        ].includes(host)
      )
        referrer = host;
    } catch {}
    this.emit("pageview", "pageview", {
      referrer,
      utmSource: token(query.get("utm_source")),
      utmMedium: token(query.get("utm_medium")),
      utmCampaign: token(query.get("utm_campaign")),
    });
    void this.flush();
  }

  private activity() {
    if (!this.allowed() || !this.page) return;
    if (Date.now() - this.session.at > IDLE) {
      this.navigate();
    }
    if (this.page) this.page.lastActivity = Date.now();
    this.getSession(true);
  }

  context() { return this.allowed() && this.page ? {analyticsSessionId:this.page.sessionId,analyticsPageId:this.page.id} : {}; }
  private emit(
    kind: Kind,
    name: string,
    data: Partial<SiteEvent> = {},
    page = this.page,
  ) {
    if (!this.allowed() || !page || this.queue.length >= 100) return;
    let timezone: string | undefined;
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {}
    this.queue.push({
      id: crypto.randomUUID(),
      sessionId: page.sessionId,
      pageId: page.id,
      kind,
      name,
      timestamp: Date.now(),
      path: page.path,
      hostname: ["localhost", "127.0.0.1"].includes(location.hostname)
        ? "www.majestanrealty.com"
        : location.hostname,
      language: navigator.language,
      timezone,
      viewportWidth: innerWidth,
      viewportHeight: innerHeight,
      screenWidth: screen.width,
      screenHeight: screen.height,
      ...listingIdentity(),
      ...data,
    });
  }

  private engagement(name: "heartbeat" | "leave") {
    if (!this.page || !this.allowed()) return;
    const now = Date.now();
    // Count visible, recently active time only; don't count an unattended open tab.
    const end = Math.min(now, this.page.lastActivity + 30_000);
    this.page.duration = Math.min(
      1800_000,
      this.page.duration + Math.max(0, end - this.page.tick),
    );
    this.page.tick = now;
    if (
      name === "leave" ||
      this.page.duration !== this.page.emittedDuration ||
      this.page.scroll !== this.page.emittedScroll
    ) {
      this.emit("engagement", name, {
        durationMs: this.page.duration,
        scrollPercent: this.page.scroll,
      });
      this.page.emittedDuration = this.page.duration;
      this.page.emittedScroll = this.page.scroll;
    }
    if (document.hidden) this.page.lastActivity = 0;
  }

  track(
    name: AnalyticsEventName,
    data: { targetHost?: string; entityId?: number; entityKind?: "property" | "project"; statusCode?: number } = {},
  ) {
    if (!NAMES.has(name)) return;
    this.activity();
    // Explicit keys prevent accidental spread of form fields from callers.
    this.emit(
      CONVERSIONS.has(name)
        ? "conversion"
        : ERRORS.has(name)
          ? "error"
          : "interaction",
      name,
      {
        targetHost: data.targetHost,
        entityId: data.entityId,
        entityKind: data.entityKind,
        statusCode: data.statusCode,
      },
    );
    if (CONVERSIONS.has(name)) void this.flush();
  }

  vital(metric: { name: string; value: number; rating: string; id: string }) {
    if (!["CLS", "FCP", "FID", "INP", "LCP", "TTFB"].includes(metric.name))
      return;
    this.emit(
      "web_vital",
      metric.name,
      { value: metric.value, rating: metric.rating, metricId: metric.id },
      this.documentPage,
    );
    if (document.hidden) this.beacon();
  }

  private beacon() {
    if (!this.allowed() || typeof navigator.sendBeacon !== "function") return;
    // Keep IDs queued until an acknowledged fetch. Beacon acceptance != storage;
    // a later retry is deduplicated by the backend's event primary key.
    for (let i = 0; i < this.queue.length; i += 20) {
      const body = JSON.stringify({
        version: 1,
        events: this.queue.slice(i, i + 20),
      });
      try {
        if (
          !navigator.sendBeacon(
            "/api/analytics",
            new Blob([body], { type: "text/plain" }),
          )
        )
          break;
      } catch {
        break;
      }
    }
  }

  async flush() {
    if (!this.allowed()) {
      this.queue = [];
      return;
    }
    if (this.sending || !this.queue.length || Date.now() < this.retryAfter)
      return;
    this.sending = true;
    const batch = this.queue.slice(0, 20);
    let timeout: ReturnType<typeof analyticsAbort> | undefined;
    try {
      timeout = analyticsAbort(8000);
      const response = await fetch("/api/analytics", {
        method: "POST",
        body: JSON.stringify({ version: 1, events: batch }),
        headers: { "Content-Type": "text/plain" },
        keepalive: true,
        credentials: "omit",
        signal: timeout.signal,
      });
      if (response.ok || [400, 401, 403, 413].includes(response.status)) {
        const ids = new Set(batch.map((e) => e.id));
        this.queue = this.queue.filter((e) => !ids.has(e.id));
        this.failedAttempts = 0;
        this.retryAfter = 0;
      } else {
        this.failedAttempts++;
        this.retryAfter =
          Date.now() +
          Math.min(60_000, 5000 * 2 ** Math.min(this.failedAttempts, 4));
      }
    } catch {
      this.failedAttempts++;
      this.retryAfter = Date.now() + 30_000;
    } finally {
      timeout?.cancel();
      this.sending = false;
    }
  }
}

let active: SiteAnalyticsClient | null = null;
export function setAnalyticsClient(client: SiteAnalyticsClient | null) {
  active = client;
}
export function trackSiteEvent(
  name: AnalyticsEventName,
  data?: { entityId?: number; entityKind?: "property" | "project"; statusCode?: number },
) {
  // Telemetry can never break the customer action that triggered it.
  try {
    active?.track(name, data);
  } catch {}
}

function listingIdentity(): {entityKind?:"property"|"project";entityId?:number} {
  try{const marker=document.querySelector<HTMLElement>('[data-analytics-listing-kind][data-analytics-listing-id]');const kind=marker?.dataset.analyticsListingKind,id=Number(marker?.dataset.analyticsListingId);return (kind==='property'||kind==='project')&&Number.isSafeInteger(id)&&id>0?{entityKind:kind,entityId:id}:{};}catch{return {};}
}
export function siteAnalyticsContext():{analyticsSessionId?:string;analyticsPageId?:string} { try{return active?.context()||{};}catch{return {};} }
