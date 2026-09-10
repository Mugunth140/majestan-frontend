import type { ReactNode } from "react";

export type ListingPageData<TItem> = { items: TItem[]; total: number; limit: number };

export interface ListingAdapter<TFilters extends Record<string, string>, TItem> {
  limit: number;
  sortOptions: { value: string; label: string }[];
  fetchItems: (args: { filters: TFilters; sort: string; page: number }) => Promise<ListingPageData<TItem>>;
  getItemKey: (item: TItem) => string | number;
  renderCard: (item: TItem) => ReactNode;
  renderFilters: (props: { values: TFilters; onChange: (v: TFilters) => void; onReset: () => void }) => ReactNode;
  renderActiveChips: (filters: TFilters, onChange: (v: TFilters) => void) => ReactNode | null;
  /** Optional right-rail content rendered beside the card feed on wide screens */
  renderRightRail?: (filters: TFilters) => ReactNode;
  buildTitle: (filters: TFilters) => string;
  buildBreadcrumbs: (filters: TFilters) => { label: string; href?: string }[];
  mapCity: (filters: TFilters) => string;
  mapLocality?: (filters: TFilters) => string | undefined;
  emptyTitle: string;
  emptyHint: (filters: TFilters) => string;
  resetFilters: TFilters;
  syncUrl: (args: { filters: TFilters; sort: string; pathname: string; searchParams: URLSearchParams }) => string;
  filtersFromParams: (searchParams: URLSearchParams) => Partial<TFilters>;
}
