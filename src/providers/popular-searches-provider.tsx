"use client";

import { createContext, useContext } from "react";
import type { InventoryCount } from "@/lib/popular-searches";

/*
 * Live inventory counts for the footer's Popular Searches. The root layout
 * fetches them once on the server; a context (rather than a fetch inside the
 * footer) lets the footer render from both server pages and client pages
 * such as the home page and the error boundary.
 */

const PopularSearchesContext = createContext<InventoryCount[]>([]);

export function PopularSearchesProvider({
  counts,
  children,
}: {
  counts: InventoryCount[];
  children: React.ReactNode;
}) {
  return <PopularSearchesContext.Provider value={counts}>{children}</PopularSearchesContext.Provider>;
}

export const useInventoryCounts = () => useContext(PopularSearchesContext);
