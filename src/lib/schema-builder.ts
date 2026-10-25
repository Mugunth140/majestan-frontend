import { inventoryAvailability } from "./inventory-availability";
import { SEO_SITE } from './seo-engine';
import { usableArea } from './seo-quality';
import { sectionSeo } from './seo-section-data';
// Inventory payloads differ by property type and are normalized by the API.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Data = Record<string, any>;

export function realEstateType(type: string, project = false): string {
  if (type === 'apartment') return project ? 'ApartmentComplex' : 'Apartment';
  if (type === 'villa') return project ? 'GatedResidenceCommunity' : 'SingleFamilyResidence';
  if (type === 'individual_portion') return 'House';
  if (['plot', 'farmland'].includes(type)) return 'Landform';
  if (type === 'coworking') return 'Place';
  return 'Place';
}

export function buildRealEstateSchema(record: Data, seo: Data = record.seoEngine || {}, section = '') {
  const entity = seo.entity || seo.settings?.entity || {};
  const name = record.name || record.title;
  const parent = SEO_SITE + '/' + record.canonicalSlug;
  const url = parent + (section ? '/' + section : '');
  const type = record.projectType || record.propertyType;
  const locality = entity.sub_locality_override || record.sublocation || record.locations?.[0]?.sublocation?.localityName;
  const city = record.city;
  const crumbs = [{name:'Home',item:SEO_SITE}, ...(city ? [{name:city,item:SEO_SITE+'/projects'}] : []), {name,item:parent}, ...(section ? [{name:section.replaceAll('-',' '),item:url}] : [])];
  const lat = entity.latitude ?? record.latitude ?? record.locations?.[0]?.latitude;
  const lng = entity.longitude ?? record.longitude ?? record.locations?.[0]?.longitude;
  const latitude = Number(lat), longitude = Number(lng);
  const validGeo = lat != null && lng != null && String(lat).trim() !== '' && String(lng).trim() !== '' && Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 && !(latitude === 0 && longitude === 0);
  const address = {'@type':'PostalAddress',addressLocality:city, ...(locality ? {streetAddress: record.address || locality} : {}), ...(record.state ? {addressRegion:record.state} : {}),postalCode:entity.pincode || record.pincode,addressCountry:record.country || 'IN'};
  const geo = validGeo ? {'@type':'GeoCoordinates',latitude,longitude} : undefined;
  const sold = Boolean(inventoryAvailability(record.status));
  const renting = record.listingType === 'Rent';
  const units = (record.units || []).filter((u: Data) => (!u.status || u.status === 'available') && (!u.listingMode || u.listingMode === (renting ? 'rent' : 'sale')));
  const prices = units.map((u:Data)=>Number(renting ? u.monthlyRent : u.price)).filter((p:number)=>p>0);
  const low = Number(record.ranges?.minPrice ?? (prices.length ? Math.min(...prices) : 0));
  const high = Number(record.ranges?.maxPrice ?? (prices.length ? Math.max(...prices) : low));
  const price = Number(record.price);
  const availability = 'https://schema.org/' + (sold ? 'SoldOut' : 'InStock');
  const homeId = parent+'#property';
  const home: Data = {'@id':homeId,'@type':realEstateType(type, Boolean(record.projectType)),name,url:parent,address,...(geo ? {geo} : {}),...(record.reraNumber && !/not applicable|^n\/?a$/i.test(record.reraNumber) ? {identifier:record.reraNumber} : {})};
  const rooms = Number(record.details?.bedrooms || record.bedrooms);
  const area = usableArea(record.details?.builtUpArea || record.details?.areaSqft, type);
  if (rooms>0 && ['apartment','villa','individual_portion'].includes(type)) home.numberOfRooms=rooms;
  if (area) home.floorSize={'@type':'QuantitativeValue',value:area,unitCode:'FTK'};
  const graph: Data[] = [{'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,...c}))},home];
  graph.push({'@type':'RealEstateListing',name,url:parent,mainEntity:{'@id':homeId},...(record.projectType ? (low>0 ? {offers:{'@type':'AggregateOffer',lowPrice:low,highPrice:high,priceCurrency:'INR',availability}} : {}) : price>0 ? {offers:{'@type':'Offer',price,priceCurrency:'INR',availability,itemOffered:{'@id':homeId}}} : {})});
  const pageSeo = section ? sectionSeo({ ...record, seoEngine: seo }, section) : seo;
  let custom = pageSeo.schema_overrides ?? pageSeo.custom_schema_json ?? pageSeo.json_ld ?? pageSeo.jsonLd;
  if(typeof custom==='string') {try {custom=JSON.parse(custom);} catch {custom=null;}}
  if(custom && typeof custom==='object') graph.push(...(Array.isArray(custom['@graph']) ? custom['@graph'] : Array.isArray(custom) ? custom : Object.keys(custom).length ? [custom] : []));
  return {'@context':'https://schema.org','@graph':graph};
}
