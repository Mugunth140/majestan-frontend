export type Sublocation = {
  id: number;
  sublocation: string;
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:4000/api/v1";

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
