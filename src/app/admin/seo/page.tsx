"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, FileSearch, AlertCircle, Edit, Plus, MapPin, Wand2, ExternalLink } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/components/ui/toast-store";

interface ListingPageSeoItem {
  id: number;
  pageKey: string;
  metaTitle: string | null;
  metaDescription: string | null;
  robotsIndex: number;
  robotsFollow: number;
  updatedAt: string;
}

interface Sublocation {
  id: number;
  sublocation: string;
  city: string;
}

interface City {
  id: number;
  city: string;
}

function toSlug(value: string): string {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const PROPERTY_TYPES: Array<{ slug: string; label: string; hasBhk: boolean }> = [
  { slug: "apartments", label: "Apartments", hasBhk: true },
  { slug: "villas", label: "Villas", hasBhk: true },
  { slug: "independent-houses", label: "Independent Houses", hasBhk: true },
  { slug: "plots", label: "Plots", hasBhk: false },
  { slug: "farmlands", label: "Farmlands", hasBhk: false },
  { slug: "commercial-spaces", label: "Commercial", hasBhk: false },
  { slug: "industrial-spaces", label: "Industrial", hasBhk: false },
  { slug: "coworking", label: "Coworking", hasBhk: false },
];

const LISTING_TYPES: Array<{ slug: string; label: string }> = [
  { slug: "for-sale", label: "For Sale" },
  { slug: "for-rent", label: "For Rent" },
];

function RobotsBadge({ index, follow }: { index: number; follow: number }) {
  if (index && follow) return <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-green-500/20 !text-green-400">index, follow</span>;
  if (!index) return <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-red-500/20 !text-red-400">noindex</span>;
  return <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-yellow-500/20 !text-yellow-400">index, nofollow</span>;
}

function SkeletonRow() {
  return (
    <tr className="!border-b !border-gray-200 dark:!border-[#262730]">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="!px-6 !py-4"><div className="!h-4 !rounded-md !bg-[#262730] !animate-pulse !w-3/4" /></td>
      ))}
    </tr>
  );
}

type MatrixRow = {
  pageKey: string;
  label: string;
  propertyType: string;
  bhk: number | null;
};

export default function AdminListingPageSeoPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [sublocations, setSublocations] = useState<Sublocation[]>([]);
  const [selectedCity, setSelectedCity] = useState("Coimbatore");
  const [selectedLocality, setSelectedLocality] = useState<string>("__all__");
  const [activeListingTab, setActiveListingTab] = useState("for-sale");
  const [matrixSearch, setMatrixSearch] = useState("");

  const [items, setItems] = useState<ListingPageSeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetch(`${API_BASE_URL}/metadata/cities`).then(r => r.json()).then(d => {
      const arr = d?.data ?? d ?? [];
      if (Array.isArray(arr) && arr.length) setCities(arr);
    }).catch(() => {});
    fetch(`${API_BASE_URL}/metadata/sublocations`).then(r => r.json()).then(d => {
      const arr = d?.data ?? d?.items ?? d ?? [];
      if (Array.isArray(arr)) setSublocations(arr.map((x: any) => ({ id: x.id, sublocation: x.sublocation ?? x.localityName ?? x.name ?? "", city: x.city ?? x.cityName ?? "" })));
    }).catch(() => {});
  }, []);

  const citySublocations = useMemo(() => {
    return sublocations.filter(s => s.city.toLowerCase() === selectedCity.toLowerCase());
  }, [sublocations, selectedCity]);

  const fetchData = async (page: number, q: string) => {
    setLoading(true);
    setError(false);
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
      if (q.trim()) params.set("search", q.trim());
      else if (selectedLocality !== "__all__") params.set("search", selectedLocality.toLowerCase());
      const res = await fetch(`${API_BASE_URL}/admin/seo/listing-pages?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr: ListingPageSeoItem[] = json.data?.items ?? json.items ?? json.data ?? json ?? [];
      setItems(Array.isArray(arr) ? arr : []);
      setTotal(json.data?.total ?? json.total ?? arr.length);
    } catch {
      setError(true);
      toast.error("Failed to load listing page SEO data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => { setCurrentPage(1); fetchData(1, search); }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => { fetchData(currentPage, search); }, [currentPage, selectedLocality]);

  useEffect(() => { setSelectedLocality("__all__"); }, [selectedCity]);

  const seoMap = useMemo(() => {
    const m = new Map<string, ListingPageSeoItem>();
    for (const it of items) m.set(it.pageKey, it);
    return m;
  }, [items]);

  const fetchAllForLocality = async (localitySlug: string) => {
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/seo/listing-pages?search=${encodeURIComponent(localitySlug)}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      const arr: ListingPageSeoItem[] = json.data?.items ?? json.items ?? json.data ?? [];
      const m = new Map<string, ListingPageSeoItem>();
      for (const it of arr) m.set(it.pageKey, it);
      setItems(arr);
    } catch {}
  };

  useEffect(() => {
    if (selectedLocality !== "__all__") {
      fetchAllForLocality(toSlug(selectedLocality));
    }
  }, [selectedLocality]);

  const matrixRows: MatrixRow[] = useMemo(() => {
    if (selectedLocality === "__all__") return [];
    const citySlug = toSlug(selectedCity);
    const localitySlug = toSlug(selectedLocality);
    const rows: MatrixRow[] = [];
    for (const pt of PROPERTY_TYPES) {
      if (pt.hasBhk) {
        const base = `${activeListingTab}/${pt.slug}/${citySlug}/${localitySlug}`;
        rows.push({ pageKey: base, label: pt.label, propertyType: pt.slug, bhk: null });
        for (const bhk of [1, 2, 3, 4]) {
          rows.push({ pageKey: `${base}/${bhk}-bhk`, label: `${pt.label} — ${bhk} BHK`, propertyType: pt.slug, bhk });
        }
      } else {
        rows.push({ pageKey: `${activeListingTab}/${pt.slug}/${citySlug}/${localitySlug}`, label: pt.label, propertyType: pt.slug, bhk: null });
      }
    }
    if (matrixSearch.trim()) {
      const q = matrixSearch.toLowerCase();
      return rows.filter(r => r.pageKey.includes(q) || r.label.toLowerCase().includes(q));
    }
    return rows;
  }, [selectedLocality, selectedCity, activeListingTab, matrixSearch]);

  const localityStats = useMemo(() => {
    if (selectedLocality === "__all__") return null;
    let custom = 0;
    for (const r of matrixRows) if (seoMap.has(r.pageKey)) custom++;
    return { total: matrixRows.length, custom, auto: matrixRows.length - custom };
  }, [matrixRows, seoMap]);

  return (
    <div className="!w-full !space-y-6">
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
        <div className="!ml-2.5">
          <h2 className="!text-2xl !font-medium !text-gray-900 dark:!text-white !tracking-tight">Listing Page SEO</h2>
          <p className="!text-[14px] !text-gray-500 dark:!text-gray-400 !mt-1">Manage SEO overrides per locality — one locality has many listing pages (Sale/Rent × type × BHK). Auto SEO is used when no override exists.</p>
        </div>
        <Link href="/admin/seo/new" className="!inline-flex !items-center !gap-2 !px-4 !py-2 !text-[14px] !font-medium !rounded-xl !bg-[#27427f] !text-white hover:!bg-[#1d3162] !transition-colors !shrink-0">
          <Plus size={16} /> Add Page SEO
        </Link>
      </div>

      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !overflow-hidden">
        <div className="!p-5 !border-b !border-gray-200 dark:!border-[#262730] !space-y-4">
          <div className="!flex !flex-col lg:!flex-row !gap-4 !items-start lg:!items-center">
            <div className="!flex !items-center !gap-2 !text-[13px] !font-medium !text-gray-600 dark:!text-gray-300 !shrink-0">
              <MapPin size={16} className="!text-[#27427f]" /> Manage by locality
            </div>
            <div className="!flex !flex-wrap !gap-3 !flex-1">
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="!bg-white dark:!bg-[#0f1117] !border !border-gray-200 dark:!border-[#262730] !text-gray-900 dark:!text-white !text-[14px] !rounded-xl !px-3 !py-2.5 !outline-none focus:!ring-2 focus:!ring-[#27427f]/30 !min-w-[160px]">
                {cities.length ? cities.map(c => <option key={c.id} value={c.city}>{c.city}</option>) : <option value="Coimbatore">Coimbatore</option>}
              </select>
              <select value={selectedLocality} onChange={e => setSelectedLocality(e.target.value)} className="!bg-white dark:!bg-[#0f1117] !border !border-gray-200 dark:!border-[#262730] !text-gray-900 dark:!text-white !text-[14px] !rounded-xl !px-3 !py-2.5 !outline-none focus:!ring-2 focus:!ring-[#27427f]/30 !min-w-[200px] !flex-1">
                <option value="__all__">— All localities (flat list) —</option>
                {citySublocations.map(s => <option key={s.id} value={s.sublocation}>{s.sublocation}</option>)}
              </select>
            </div>
            {localityStats && (
              <div className="!flex !gap-2 !text-[12px] !shrink-0">
                <span className="!px-2.5 !py-1 !rounded-full !bg-green-500/15 !text-green-600 dark:!text-green-400 !font-medium">{localityStats.custom} custom</span>
                <span className="!px-2.5 !py-1 !rounded-full !bg-gray-100 dark:!bg-[#262730] !text-gray-600 dark:!text-gray-400 !font-medium">{localityStats.auto} auto</span>
              </div>
            )}
          </div>

          {selectedLocality !== "__all__" && (
            <div className="!flex !flex-col sm:!flex-row !gap-3 !items-start sm:!items-center !justify-between !pt-2">
              <div className="!flex !p-1 !rounded-xl !bg-gray-100 dark:!bg-[#0f1117] !gap-1">
                {LISTING_TYPES.map(lt => (
                  <button key={lt.slug} onClick={() => setActiveListingTab(lt.slug)} className={`!px-4 !py-1.5 !rounded-lg !text-[13px] !font-medium !transition-colors ${activeListingTab === lt.slug ? "!bg-[#27427f] !text-white !shadow-sm" : "!text-gray-600 dark:!text-gray-400 hover:!text-gray-900 dark:hover:!text-white"}`}>{lt.label}</button>
                ))}
              </div>
              <div className="!relative !w-full sm:!w-64">
                <Search size={14} className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !text-gray-400" />
                <input value={matrixSearch} onChange={e => setMatrixSearch(e.target.value)} placeholder="Filter types..." className="!w-full !pl-9 !pr-3 !py-2 !text-[13px] !rounded-xl !border !border-gray-200 dark:!border-[#262730] !bg-white dark:!bg-[#0f1117] !text-gray-900 dark:!text-white !outline-none focus:!ring-2 focus:!ring-[#27427f]/20 !placeholder-gray-400" />
              </div>
            </div>
          )}
        </div>

        {selectedLocality !== "__all__" ? (
          <div className="!overflow-x-auto">
            <table className="!w-full !text-[13px] !text-left">
              <thead className="!text-[11px] !uppercase !tracking-wider !text-gray-500 !bg-gray-50 dark:!bg-[#0f1117]/60">
                <tr>
                  <th className="!px-5 !py-3 !font-medium">Listing Page</th>
                  <th className="!px-5 !py-3 !font-medium">Path</th>
                  <th className="!px-5 !py-3 !font-medium !text-center">SEO</th>
                  <th className="!px-5 !py-3 !font-medium !text-center">Action</th>
                </tr>
              </thead>
              <tbody className="!divide-y !divide-gray-100 dark:!divide-[#262730]">
                {matrixRows.map(row => {
                  const existing = seoMap.get(row.pageKey);
                  const isCustom = !!existing;
                  return (
                    <tr key={row.pageKey} className={`!transition-colors ${isCustom ? "!bg-green-50/40 dark:!bg-green-950/10" : "!bg-white dark:!bg-[#1a1f2e]"} hover:!bg-gray-50 dark:hover:!bg-[#1e2436]`}>
                      <td className="!px-5 !py-3 !align-middle">
                        <div className="!font-medium !text-gray-900 dark:!text-white !text-[13px]">{row.label}</div>
                        <div className="!text-[11px] !text-gray-500 !flex !items-center !gap-1.5 !mt-0.5">
                          {row.bhk ? <span className="!px-1.5 !py-0.5 !rounded !bg-[#ffc900]/20 !text-[#7a5c00] dark:!text-[#ffc900] !font-medium">{row.bhk} BHK</span> : null}
                          <span className="!capitalize">{row.propertyType.replace("-", " ")}</span>
                        </div>
                      </td>
                      <td className="!px-5 !py-3 !align-middle !font-mono !text-[12px] !text-gray-500 dark:!text-gray-400">/{row.pageKey}</td>
                      <td className="!px-5 !py-3 !align-middle !text-center">
                        {isCustom ? (
                          <span className="!inline-flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !text-[11px] !font-semibold !bg-green-500/15 !text-green-700 dark:!text-green-400"><Wand2 size={11} /> Custom</span>
                        ) : (
                          <span className="!inline-flex !px-2.5 !py-1 !rounded-full !text-[11px] !font-medium !bg-gray-100 dark:!bg-[#262730] !text-gray-500">Auto</span>
                        )}
                      </td>
                      <td className="!px-5 !py-3 !align-middle !text-center">
                        <div className="!flex !items-center !justify-center !gap-1.5">
                          {isCustom ? (
                            <Link href={`/admin/seo/${existing!.id}`} className="!inline-flex !items-center !gap-1 !px-3 !py-1.5 !text-[12px] !font-medium !rounded-lg !bg-[#27427f] !text-white hover:!bg-[#1d3162] !transition-colors"><Edit size={12} /> Edit</Link>
                          ) : (
                            <Link href={`/admin/seo/new?path=${encodeURIComponent(row.pageKey)}`} className="!inline-flex !items-center !gap-1 !px-3 !py-1.5 !text-[12px] !font-medium !rounded-lg !border !border-[#27427f]/30 !text-[#27427f] dark:!text-[#6b93d6] hover:!bg-[#27427f]/10 !transition-colors"><Plus size={12} /> Create</Link>
                          )}
                          <a href={`/${row.pageKey}`} target="_blank" rel="noopener noreferrer" className="!p-1.5 !rounded-lg !text-gray-400 hover:!text-gray-700 dark:hover:!text-white hover:!bg-gray-100 dark:hover:!bg-[#262730] !transition-colors" title="View page"><ExternalLink size={14} /></a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="!p-5 !border-b !border-gray-200 dark:!border-[#262730] !flex !flex-col sm:!flex-row !gap-4 !items-center !justify-between">
              <div className="!relative !w-full sm:!w-96">
                <div className="!absolute !inset-y-0 !left-0 !flex !items-center !pl-3 !pointer-events-none"><Search size={18} className="!text-gray-500 dark:!text-gray-400" /></div>
                <input type="text" className="!bg-white dark:!bg-[#0f1117] !border !border-gray-200 dark:!border-[#262730] !text-gray-900 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-[#27427f]/40 focus:!border-[#27427f] !shadow-sm !block !w-full !pl-10 !p-2.5 !outline-none !transition-all !placeholder-gray-500" placeholder="Search by page path..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <span className="!text-[13px] !text-gray-500 dark:!text-gray-400 !shrink-0">{total} {total === 1 ? "entry" : "entries"}</span>
            </div>
            <div className="!overflow-x-auto">
              <table className="!w-full !text-[14px] !text-left !text-gray-500 dark:!text-gray-400">
                <thead className="!text-[12px] !text-gray-500 !uppercase !bg-gray-50 dark:!bg-[#0f1117]/60">
                  <tr>
                    <th scope="col" className="!px-6 !py-4 !font-medium">Page Path</th>
                    <th scope="col" className="!px-6 !py-4 !font-medium">Meta Title</th>
                    <th scope="col" className="!px-6 !py-4 !font-medium !text-center">Robots</th>
                    <th scope="col" className="!px-6 !py-4 !font-medium !text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="!divide-y !divide-gray-100 dark:!divide-[#262730]">
                  {loading ? <><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></> : error ? (
                    <tr><td colSpan={4} className="!px-6 !py-12 !text-center"><div className="!flex !flex-col !items-center !gap-3 !text-gray-500"><AlertCircle size={32} className="!text-red-400" /><span className="!text-[14px]">Failed to load data. Please try again.</span></div></td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={4} className="!px-6 !py-12 !text-center"><div className="!flex !flex-col !items-center !gap-3 !text-gray-500"><FileSearch size={32} className="!opacity-40" /><span className="!text-[14px]">No listing page SEO entries found</span><p className="!text-[13px] !text-gray-400">Select a locality above to manage its pages, or add one manually.</p></div></td></tr>
                  ) : items.map(item => (
                    <tr key={item.id} className="!bg-white dark:!bg-[#1a1f2e] hover:!bg-gray-50 dark:hover:!bg-[#1e2436] !transition-colors group">
                      <td className="!px-6 !py-4 !align-middle"><div className="!font-mono !text-[13px] !text-gray-800 dark:!text-gray-200 group-hover:!text-[#27427f] !transition-colors">/{item.pageKey}</div></td>
                      <td className="!px-6 !py-4 !align-middle"><div className="!text-[14px] !text-gray-600 dark:!text-gray-300 !truncate !max-w-xs">{item.metaTitle || <span className="!text-gray-400 !italic">Not set</span>}</div></td>
                      <td className="!px-6 !py-4 !align-middle !text-center"><RobotsBadge index={item.robotsIndex} follow={item.robotsFollow} /></td>
                      <td className="!px-6 !py-4 !align-middle !text-center"><Link href={`/admin/seo/${item.id}`} className="!inline-flex !items-center !gap-1.5 !px-3 !py-1.5 !text-[13px] !font-medium !rounded-lg !bg-[#27427f]/20 !text-[#6b93d6] hover:!bg-[#27427f]/40 hover:!text-gray-900 dark:!text-white !transition-all"><Edit size={14} /> Edit</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && !error && total > itemsPerPage && (
              <div className="!p-5 !border-t !border-gray-200 dark:!border-[#262730] !flex !items-center !justify-between">
                <span className="!text-[14px] !text-gray-500 dark:!text-gray-400">Page <span className="!font-medium !text-gray-800 dark:!text-white">{currentPage}</span> of <span className="!font-medium !text-gray-800 dark:!text-white">{Math.ceil(total / itemsPerPage)}</span></span>
                <div className="!flex !gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="!px-4 !py-2 !text-[14px] !font-medium !text-gray-500 dark:!text-gray-400 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-lg hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] disabled:!opacity-50 disabled:!cursor-not-allowed !transition-colors">Previous</button>
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * itemsPerPage >= total} className="!px-4 !py-2 !text-[14px] !font-medium !text-gray-500 dark:!text-gray-400 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-lg hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] disabled:!opacity-50 disabled:!cursor-not-allowed !transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedLocality !== "__all__" && localityStats && (
        <div className="!bg-amber-50 dark:!bg-amber-950/20 !border !border-amber-200 dark:!border-amber-900/40 !rounded-2xl !p-4 !flex !gap-3">
          <div className="!shrink-0 !w-8 !h-8 !rounded-full !bg-amber-100 dark:!bg-amber-900/30 !flex !items-center !justify-center"><Wand2 size={16} className="!text-amber-600 dark:!text-amber-400" /></div>
          <div>
            <div className="!text-[13px] !font-semibold !text-amber-800 dark:!text-amber-200">How it works</div>
            <div className="!text-[13px] !text-amber-700/80 dark:!text-amber-300/70 !mt-1 !leading-relaxed">
              Each locality has <strong>{matrixRows.length}</strong> listing pages for <strong>{activeListingTab}</strong> (8 property types × BHK variants). Pages with <span className="!px-1.5 !py-0.5 !rounded !bg-green-500/15 !text-green-700 !text-[11px] !font-semibold">Custom</span> use your override. Others auto-generate SEO from the URL (e.g. “3 BHK Apartments for Sale in {selectedLocality}, {selectedCity}”). Click <strong>Create</strong> to add a custom override — it will be used immediately on the live page.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
