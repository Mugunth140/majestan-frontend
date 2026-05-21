import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getProperties = async () => {
  const { data } = await api.get("/properties");
  return data;
};

export const getPropertyBySlug = async (slug: string) => {
  const { data } = await api.get(`/properties/by-slug/${encodeURIComponent(slug)}`);
  return data;
};

export const getLocalities = async () => {
  const { data } = await api.get("/localities");
  return data;
};

export const submitEnquiry = async (enquiryData: any) => {
  const { data } = await api.post("/leads/enquiry", enquiryData);
  return data;
};
