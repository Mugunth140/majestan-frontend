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
  roomDimensions?: { name: string; dimensions: string }[];
  floorPlanImages?: { title: string; imageUrl: string; imageKey: string }[];
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

export type SeoPropertyAmenity = {
  id: number;
  amenity: {
    id: number;
    name: string;
    icon?: string;
  } | null;
};

export type SeoPropertyUnit = {
  id: number;
  title: string | null;
  unitType: string;
  sizeSqft?: string | null;
  price?: string | null;
  floorPlanImageUrl?: string | null;
  floorPlanImageKey?: string | null;
};

export type SeoPropertyFaq = {
  id: number;
  question: string;
  answer: string;
  section: string;
  sortOrder: number;
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
  amenities?: SeoPropertyAmenity[];
  units?: SeoPropertyUnit[];
  faqs?: SeoPropertyFaq[];
  locations?: { latitude?: string | number | null; longitude?: string | number | null; localityData?: any }[];
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
    next: { revalidate: 3600 }, // Fallback revalidation; on-demand ISR is primary
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Property lookup failed: ${response.status} ${response.statusText}`);
  }

  const data = await unwrapPayload<any>(response);

  if (data) {
    // Map backend response fields to frontend expected fields
    data.images = data.images || data.propertyImages || data.__propertyImages__ || [];
    data.details = data.details || data.propertyDetails || data.__propertyDetails__ || null;
    data.locations = data.locations || data.propertyLocations || data.__propertyLocations__ || [];
    data.faqs = data.faqs || data.propertyFaqs || data.__propertyFaqs__ || [];
    // Map amenities from the nested propertyAmenities structure
    const rawAmenities = data.propertyAmenities || data.__propertyAmenities__ || [];
    data.amenities = rawAmenities.map((pa: any) => ({
      id: pa.id,
      amenity: pa.amenity ?? null,
    }));
    // Map units (for floor plans)
    data.units = (data.propertyUnits || data.__propertyUnits__ || []).map((u: any) => ({
      id: u.id,
      title: u.title ?? null,
      unitType: u.unitType ?? 'other',
      sizeSqft: u.builtupAreaSqft ?? u.carpetAreaSqft ?? null,
      price: u.price ?? null,
      floorPlanImageUrl: u.floorPlanImageUrl ?? null,
      floorPlanImageKey: u.floorPlanImageKey ?? null,
    }));
  }

  return data as SeoProperty;
}
