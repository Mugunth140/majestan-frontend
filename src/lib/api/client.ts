import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:5000/api/v1";
const SERVER_API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

const BROWSER_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 
  ? process.env.NEXT_PUBLIC_API_BASE_URL 
  : (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1` : DEFAULT_API_BASE_URL);

const API_BASE_URL =
  typeof window === "undefined" ? SERVER_API_BASE_URL : BROWSER_API_BASE_URL;

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
