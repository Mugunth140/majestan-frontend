export type Sublocation = {
  id: number;
  sublocation: string;
  cityId: number;
  city: string;
  state: string;
  postalCode: string | null;
};

export type City = {
  id: number;
  city: string;
  state: string;
  country: string;
};

export type UnitType = {
  id: number;
  unittype: string;
};

export type HomeBanner = {
  id: number;
  image: string;
  href: string | null;
};

export type FeaturedProperty = {
  id: number;
  propertyType: "apartment" | "villa";
  detailPath: string;
  slugUrl: string | null;
  propertyName: string | null;
  sublocation: string | null;
  photo: string | null;
  postType: string | null;
  expectedSalePrice: string | number | null;
  monthlyRent: string | number | null;
  pricePerSqft: string | number | null;
};

export type HomePageData = {
  filters: {
    sublocations: Sublocation[];
    unitTypes: UnitType[];
  };
  banners: HomeBanner[];
  featuredApartments: FeaturedProperty[];
  featuredVillas: FeaturedProperty[];
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

const DEFAULT_API_BASE_URL = "http://localhost:5000/api/v1";
const SERVER_API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

const BROWSER_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 
  ? process.env.NEXT_PUBLIC_API_BASE_URL 
  : (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1` : DEFAULT_API_BASE_URL);

export const API_BASE_URL =
  typeof window === "undefined" ? SERVER_API_BASE_URL : BROWSER_API_BASE_URL;

export async function fetchApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    next: init?.cache === "no-store" ? undefined : { revalidate: 60 },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("majestan_access_token");
      window.localStorage.removeItem("majestan_user");
      window.location.href = "/login";
    }
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T> | T;

  if (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

export async function getHomePageData(): Promise<HomePageData> {
  return fetchApi<HomePageData>("/home");
}

export async function getCities(): Promise<City[]> {
  return fetchApi<City[]>("/metadata/cities", { cache: "no-store" });
}

export async function createEnquiry(payload: {
  name: string;
  email?: string;
  phone: string;
  propertyType?: string;
  listingType?: string;
  message?: string;
}) {
  return fetchApi<{ id: number; submitted: boolean }>("/leads/enquiry", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}

/* ── Property Search ───────────────────────────────────────── */

export type PropertySearchParams = {
  propertyType?: string;
  listingType?: string;
  location?: string;
  city?: string;
  propertyName?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  bedrooms?: string;
  facing?: string;
  furnishing?: string;
  propertyAge?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type PropertySearchItem = {
  id: number;
  propertyType: string;
  legacyPropertyType: string;
  propertyname?: string;
  sublocation?: string;
  address?: string;
  posttype?: string;
  expectedsaleprice?: string;
  monthly_rent?: string;
  photo1?: string;
  photo2?: string;
  slug_url?: string;
  unittype?: string;
  configuration?: string;
  build_up_area?: string;
  buildup_area?: string;
  carpet_area?: string;
  super_build_up_area?: string;
  plot_area?: string;
  totalarea?: string;
  unitsize?: string;
  project_area?: string;
  facing?: string;
  facing_direction?: string;
  floor?: string;
  total_floors?: string;
  furnishing_status?: string;
  property_age?: string;
  ageofproperty?: string;
  age_of_property?: string;
  parking1?: string;
  parking2?: string;
  parking?: string;
  amenities?: string;
  key_highlight?: string;
  apartment_code?: string;
  villa_code?: string;
  [key: string]: unknown;
};

export type PropertySearchResponse = {
  items: PropertySearchItem[];
  total: number;
  page: number;
  limit: number;
};

/** Map frontend form values to backend PropertyType enum values */
const PROPERTY_TYPE_MAP: Record<string, string> = {
  apartment: "apartment",
  villa: "villa",
  independenthouse: "independent-house",
  plot: "plot",
  commercialspace: "commercial-space",
  industrialspace: "industrial-space",
  farmlands: "farmland",
  coworking: "coworking",
};

export async function searchProperties(
  params: PropertySearchParams,
): Promise<PropertySearchResponse> {
  const query = new URLSearchParams();

  if (params.propertyType) {
    const mapped = PROPERTY_TYPE_MAP[params.propertyType] ?? params.propertyType;
    query.set("propertyType", mapped);
  }
  if (params.listingType) query.set("listingType", params.listingType);
  if (params.location) query.set("location", params.location);
  if (params.city) query.set("city", params.city);
  if (params.propertyName) query.set("propertyName", params.propertyName);
  if (params.minPrice) query.set("minPrice", params.minPrice);
  if (params.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params.minArea) query.set("minArea", params.minArea);
  if (params.maxArea) query.set("maxArea", params.maxArea);
  if (params.bedrooms) query.set("bedrooms", params.bedrooms);
  if (params.facing) query.set("facing", params.facing);
  if (params.furnishing) query.set("furnishing", params.furnishing);
  if (params.propertyAge) query.set("propertyAge", params.propertyAge);
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetchApi<PropertySearchResponse>(`/properties?${query.toString()}`, {
    cache: "no-store",
  });

  if (res && Array.isArray(res.items)) {
    res.items = res.items.map((item: any) => {
      // Skip if already mapped
      if (item.propertyname !== undefined && item.propertyname === item.title) return item;
      
      const images = item.propertyImages || item.images || item.__propertyImages__ || [];
      const primaryImage = images.find((i: any) => i.isPrimary) || images[0];
      const details = item.propertyDetails || item.details || item.__propertyDetails__ || {};
      const locations = item.propertyLocations || item.locations || item.__propertyLocations__ || [];
      
      return {
        ...item,
        propertyname: item.title,
        sublocation: locations[0]?.name || item.city,
        address: item.city ? `${item.city}, ${item.state || ''}`.replace(/,\s*$/, '') : '',
        posttype: item.listingType || (item.status === 'rented' || item.status?.toLowerCase().includes('rent') ? 'Rent' : 'Sell'),
        expectedsaleprice: item.price,
        monthly_rent: item.price,
        photo1: primaryImage?.imageUrl || null,
        slug_url: item.slug || item.propertyCode,
        sq_ft: details.areaSqft?.toString() || "0",
        build_up_area: details.areaSqft?.toString() || "0",
        unittype: details.bedrooms ? `${details.bedrooms} BHK` : null,
        facing: details.facing || null,
      };
    });
  }

  return res;
}

export async function getPropertyBySlug(slug: string): Promise<any> {
  return fetchApi<any>(`/properties/by-slug/${slug}`, {
    cache: "no-store",
  });
}
