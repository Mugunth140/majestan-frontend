# Property Anchor Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single-page property types render all sections stacked on `/:slug` with the sticky top bar scrolling to anchors instead of navigating to subpages.

**Architecture:** Branch by a shared `SINGLE_PAGE_TYPES` set: nav gains an `"anchors"` mode with scroll-spy (copied from the proven `ProjectNavigation`), section components gain an `embedded` prop that hides their own CTA, `PropertyDetailsView` stacks full sections with ids for single types, and `[...section]` sub-URLs 301 to `/:slug#section`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, vitest + testing-library.

## Global Constraints

- Visual polish only — no layout moves, sidebar and enquiry actions untouched, no new dependencies.
- Multi-page types (`apartment`, `villa`, `individual_portion`) keep all 5 URLs byte-identical.
- `permanentRedirect` destination preserves `#hash` (verified in `redirect-error.js`: digest keeps destination verbatim; browsers honor fragments in `Location`).
- Sticky offset uses `scroll-mt-40!` (matches project sections; covers 64px header + nav).
- Section id for floor plans is `floor-plan` (singular, matches property sub-URL).
- TDD: failing test first, then minimal implementation, then commit per task.

---

### Task 1: SINGLE_PAGE_TYPES config

**Files:**
- Modify: `src/lib/seo-urls.ts` (append after `PSEO_BEDROOM_OPTIONS`)
- Test: `src/lib/seo-urls.test.ts` (create)

**Interfaces:**
- Consumes: nothing new.
- Produces: `SINGLE_PAGE_TYPES: ReadonlySet<string>` (DB apiValues), `isSinglePageType(propertyType: string): boolean` used by Tasks 3–5.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/seo-urls.test.ts
import { describe, expect, it } from "vitest";
import { isSinglePageType, SINGLE_PAGE_TYPES } from "./seo-urls";

describe("isSinglePageType", () => {
  it.each(["plot", "farmland", "commercial", "industrial", "coworking", "other"])(
    "treats %s as single-page",
    (t) => expect(isSinglePageType(t)).toBe(true)
  );
  it.each(["apartment", "villa", "individual_portion"])(
    "treats %s as multi-page",
    (t) => expect(isSinglePageType(t)).toBe(false)
  );
  it("has exactly the six single-page apiValues", () => {
    expect([...SINGLE_PAGE_TYPES].sort()).toEqual(
      ["commercial", "coworking", "farmland", "industrial", "other", "plot"]
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/seo-urls.test.ts` (in `site/majestan-frontend`)
Expected: FAIL with "Failed to resolve import" / "isSinglePageType is not exported"

- [ ] **Step 3: Write minimal implementation** — append to `src/lib/seo-urls.ts`:

```ts
// Property types rendered as ONE anchored page (/:slug with #sections).
// Multi-page types (apartment, villa, individual_portion) keep separate
// subpage URLs. Values are DB apiValues (property.entity.ts).
export const SINGLE_PAGE_TYPES: ReadonlySet<string> = new Set([
  "plot",
  "farmland",
  "commercial",
  "industrial",
  "coworking",
  "other",
]);

export function isSinglePageType(propertyType: string): boolean {
  return SINGLE_PAGE_TYPES.has(propertyType);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/seo-urls.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo-urls.ts src/lib/seo-urls.test.ts
git commit -m "feat: add single-page property type config"
```

---

### Task 2: Anchor mode in PropertyNavigation

**Files:**
- Modify: `src/components/site/property/property-navigation.tsx`
- Test: `src/components/site/property/property-navigation.test.tsx` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: `PropertyNavigation({ slug, activeSection, mode }: { slug: string; activeSection?: string; mode?: "pages" | "anchors" })` used by Task 5. Anchor ids: `overview, amenities, floor-plan, locality, photos`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/site/property/property-navigation.test.tsx
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyNavigation } from "./property-navigation";

afterEach(() => vi.restoreAllMocks());

vi.mock("next/navigation", () => ({ usePathname: () => "/some-slug" }));

describe("PropertyNavigation anchors mode", () => {
  it("renders scroll buttons (not links) for the five sections", () => {
    render(<PropertyNavigation slug="some-slug" mode="anchors" />);
    for (const label of ["Overview", "Amenities", "Floor Plan", "Locality", "Photos"]) {
      expect(screen.getByRole("button", { name: new RegExp(label) })).toBeDefined();
    }
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("scrolls to the section on click", () => {
    const scrollIntoView = vi.fn();
    vi.spyOn(document, "getElementById").mockReturnValue(
      { scrollIntoView } as unknown as HTMLElement
    );
    render(<PropertyNavigation slug="some-slug" mode="anchors" />);
    screen.getByRole("button", { name: /Photos/ }).click();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("keeps link mode as default", () => {
    render(<PropertyNavigation slug="some-slug" />);
    expect(screen.getByRole("link", { name: /Overview/ }).getAttribute("href")).toBe("/some-slug");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/components/site/property/property-navigation.test.tsx`
Expected: FAIL (`mode` prop does not exist; buttons not found)

- [ ] **Step 3: Write minimal implementation** — in `property-navigation.tsx`:
  1. Import `useEffect, useState` from react.
  2. Add `mode?: "pages" | "anchors"` to props, default `"pages"`.
  3. When `mode === "anchors"`, render the anchor nav (same classes as page links, buttons + scroll-spy copied from `ProjectNavigation`: `useState("overview")`, `IntersectionObserver` with `rootMargin: "-40% 0px -55% 0px"` observing the 5 ids, `scrollTo` via `getElementById().scrollIntoView({ behavior: "smooth", block: "start" })`). Keep the outer sticky wrapper div identical.
  4. Pages mode: current code untouched.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bunx vitest run src/components/site/property/property-navigation.test.tsx src/components/site/property/PropertyDetailsView.test.tsx`
Expected: PASS (anchors tests + all existing detail tests unchanged)

- [ ] **Step 5: Commit**

```bash
git add src/components/site/property/property-navigation.tsx src/components/site/property/property-navigation.test.tsx
git commit -m "feat: add anchors scroll-spy mode to property navigation"
```

---

### Task 3: Embedded mode for section components

**Files:**
- Modify: `src/components/site/property/sections/AmenitiesSection.tsx`, `FloorPlanSection.tsx`, `LocalitySection.tsx`, `PhotosSection.tsx`
- Test: extend existing `FloorPlanSection.test.tsx` + `FaqSection.test.tsx` untouched; add one case in `PropertyDetailsView.test.tsx` (Task 4) asserting a single CTA.

**Interfaces:**
- Consumes: nothing.
- Produces: `embedded?: boolean` prop (default `false`) on all four sections; when `true`, the trailing `<NeedMoreDetails />` is skipped. Used by Task 4.

- [ ] **Step 1: Write the failing test** (add to `src/components/site/property/sections/FloorPlanSection.test.tsx` — read file first for its fixture style):

```tsx
it("hides the contact CTA in embedded mode", () => {
  render(<FloorPlanSection property={baseProperty} embedded />);
  expect(screen.queryByText("Need more details?")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/components/site/property/sections/FloorPlanSection.test.tsx`
Expected: FAIL (`embedded` prop type error / CTA still rendered)

- [ ] **Step 3: Write minimal implementation** — in each of the 4 files: add `embedded?: boolean` to props type, destructure it, and guard the CTA: `{!embedded && <NeedMoreDetails />}`. For `PhotosSection.tsx` there are two CTA sites (empty state + bottom) — guard both. Nothing else changes.

- [ ] **Step 4: Run tests**

Run: `bunx vitest run src/components/site/property/sections/`
Expected: PASS (all section tests including existing ones)

- [ ] **Step 5: Commit**

```bash
git add src/components/site/property/sections/
git commit -m "feat: add embedded mode to property sections"
```

---

### Task 4: Stacked anchored sections in PropertyDetailsView

**Files:**
- Modify: `src/components/site/property/PropertyDetailsView.tsx`
- Test: extend `src/components/site/property/PropertyDetailsView.test.tsx`

**Interfaces:**
- Consumes: `isSinglePageType` (Task 1), `embedded` sections (Task 3).
- Produces: single-type pages render `<section id="overview|amenities|floor-plan|locality|photos" class="scroll-mt-40!">` with full sections + per-section FAQs + exactly one CTA. Multi-type output unchanged.

- [ ] **Step 1: Write the failing tests** (append a describe block):

```tsx
describe("PropertyDetailsView single-page types", () => {
  const plot = { ...baseProperty, propertyType: "plot" };
  it("stacks full sections with anchor ids", () => {
    const { container } = render(<PropertyDetailsView property={plot} />);
    for (const id of ["overview", "amenities", "floor-plan", "locality", "photos"]) {
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });
  it("renders exactly one contact CTA", () => {
    render(<PropertyDetailsView property={plot} />);
    expect(screen.getAllByText("Need more details?")).toHaveLength(1);
  });
  it("shows no subpage View All links", () => {
    render(<PropertyDetailsView property={plot} />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs.filter((h) => h?.includes("/amenities") || h?.includes("/floor-plan") || h?.includes("/photos"))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bunx vitest run src/components/site/property/PropertyDetailsView.test.tsx`
Expected: FAIL (no anchor ids for plot)

- [ ] **Step 3: Write minimal implementation** — in `PropertyDetailsView.tsx`:
  1. Import `isSinglePageType`, the 4 full sections, keep teaser imports for multi mode.
  2. `const isSingle = isSinglePageType(property.propertyType);`
  3. Wrap hero+overview-stats+about in `<section id="overview" className="scroll-mt-40!">` equivalent (keep existing card classes; add id + scroll-mt to the column container segments — simplest: add `id` + `scroll-mt-40!` classes to the existing overview card, about card start, and new section wrappers).
  4. Replace the teaser block (`LocalityTeaser` + Key Amenities preview + `FloorPlanTeaser` + `PhotosTeaser`) with full sections when `isSingle`, each in `<section id="…" className="scroll-mt-40!">` with `embedded` + its FAQ subset (`faqs.filter(f => f.section === key)`); keep teasers when multi.
  5. FAQs: overview subset stays where it is; per-section subsets render under their section only in single mode. Final `<NeedMoreDetails />` stays (exactly one, since embedded sections skip theirs).

- [ ] **Step 4: Run tests**

Run: `bunx vitest run src/components/site/property/`
Expected: PASS (all existing + 3 new)

- [ ] **Step 5: Commit**

```bash
git add src/components/site/property/PropertyDetailsView.tsx src/components/site/property/PropertyDetailsView.test.tsx
git commit -m "feat: stack anchored sections for single-page property types"
```

---

### Task 5: Branch [slug] page + widen FAQ JSON-LD

**Files:**
- Modify: `src/app/[slug]/page.tsx`

**Interfaces:**
- Consumes: `PropertyNavigation mode` (Task 2), stacked view (Task 4).
- Produces: single types get anchors nav + all-FAQs JSON-LD; multi types unchanged.

- [ ] **Step 1: Write the failing test** — server component, verified by inspection + existing suite (no new unit test; add e2e note). Manual check: `bunx tsc --noEmit` passes.
- [ ] **Step 2: Implement**: import `isSinglePageType`; compute `const isSingle = isSinglePageType(property.propertyType)`; nav becomes `<PropertyNavigation slug mode={isSingle ? "anchors" : "pages"} activeSection="" />`; FAQ JSON-LD input becomes `isSingle ? (property.faqs || []) : (property.faqs || []).filter((f) => f.section === "overview")`.
- [ ] **Step 3: Typecheck** — Run: `bunx tsc --noEmit`. Expected: no errors.
- [ ] **Step 4: Commit**

```bash
git add src/app/[slug]/page.tsx
git commit -m "feat: anchor nav and full FAQ markup for single-page properties"
```

---

### Task 6: Redirect [...section] sub-URLs to anchors

**Files:**
- Modify: `src/app/[slug]/[...section]/page.tsx`

**Interfaces:**
- Consumes: `isSinglePageType` (Task 1).
- Produces: `/:slug/:section` → `301 /:canonicalSlug#sectionKey` for single types; multi types unchanged.

- [ ] **Step 1: Implement** — after the `property.shouldRedirect` block, insert:

```ts
if (isSinglePageType(property.propertyType)) {
  permanentRedirect(`/${property.canonicalSlug}/${sectionKey}`.replace(/\/([^/]+)$/, "#$1"));
}
```

Simpler explicit form (preferred, no regex):

```ts
if (isSinglePageType(property.propertyType)) {
  permanentRedirect(`/${property.canonicalSlug}#${sectionKey}`);
}
```

- [ ] **Step 2: Typecheck** — Run: `bunx tsc --noEmit`. Expected: no errors.
- [ ] **Step 3: Verify redirect preserves hash** — Run dev server, `curl -sI http://localhost:3000/<single-slug>/photos | grep -i location`. Expected: `Location: /<canonical>#photos`. (Needs backend reachable or accept 404 path; alternative: Playwright check if configured.)
- [ ] **Step 4: Commit**

```bash
git add src/app/[slug]/[...section]/page.tsx
git commit -m "feat: redirect single-page sub-URLs to anchors"
```

---

### Task 7: Full verification

- [ ] **Step 1: Run the whole property + lib suite** — Run: `bunx vitest run src/components/site/property/ src/lib/ src/app/ 2>&1 | tail -5`. Expected: all green.
- [ ] **Step 2: Lint changed files** — Run: `bunx eslint src/lib/seo-urls.ts src/components/site/property/property-navigation.tsx src/components/site/property/sections/ src/components/site/property/PropertyDetailsView.tsx src/app/[slug]/`. Expected: no errors.
- [ ] **Step 3: Manual smoke** (dev server): one multi slug keeps 5 URLs; one plot slug shows 5 anchor sections, nav highlights on scroll, `/photos` lands on `/#photos`.
