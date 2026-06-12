import { API_BASE_URL } from "@/lib/api";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export type SeoPropertyDetails = {
  bedrooms: number;
  bathrooms: number;
  areaSqft: string;
  parking: number;
  furnished: boolean;
} | null;

export type SeoPropertyImage = {
  id: number;
  imageUrl: string;
  imageKey: string;
  isPrimary: boolean;
  createdAt: string;
};

type SeoPageData = {
  title?: string;
  description?: string;
  h1?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  robots?: string;
};

export type SeoProperty = {
  id: number;
  propertyCode: string | null;
  slug: string | null;
  title: string;
  description: string;
  price: string;
  propertyType: string;
  listingType: string;
  status: string;
  brokerageType?: string;
  brokerageValue?: string;
  ownerId: number;
  city: string;
  state: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  details: SeoPropertyDetails;
  images: SeoPropertyImage[];
  requestedSlug: string;
  canonicalSlug: string;
  shouldRedirect: boolean;
  seo?: {
    id: number;
    seoData: {
      overview?: SeoPageData;
      amenities?: SeoPageData;
      floor_plan?: SeoPageData;
      locality?: SeoPageData & {
        content_overview?: string;
        content_connectivity?: string;
        content_education?: string;
        content_healthcare?: string;
        content_shopping?: string;
      };
      photos?: SeoPageData;
    };
    verificationStatus?: string;
    approvalStatus?: string;
  } | null;
};

const unwrapPayload = async <T>(response: Response): Promise<T> => {
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
};

export async function getPropertyBySeoSlug(slug: string): Promise<SeoProperty | null> {
  const response = await fetch(`${API_BASE_URL}/properties/by-slug/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 }, // Fallback revalidation, though we use on-demand ISR primarily
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Property lookup failed: ${response.status} ${response.statusText}`);
  }

  const data = await unwrapPayload<any>(response);
  
  if (data) {
    // Map backend response fields to the frontend expected fields
    data.images = data.images || data.propertyImages || data.__propertyImages__ || [];
    data.details = data.details || data.propertyDetails || data.__propertyDetails__ || null;
    data.locations = data.locations || data.propertyLocations || data.__propertyLocations__ || [];
  }
  
  return data as SeoProperty;
}

