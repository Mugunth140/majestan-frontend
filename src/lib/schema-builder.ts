import { SEO_SITE } from './seo-engine';
type Data = Record<string, any>;
export function buildRealEstateSchema(record: Data, seo: Data = record.seoEngine || {}, section = '') {
  const entity = seo.entity || seo.settings?.entity || {};
  const name = record.name || record.title;
  const parent = SEO_SITE + '/' + record.canonicalSlug;
  const url = parent + (section ? '/' + section : '');
  const locality = entity.sub_locality_override || record.sublocation || record.locations?.[0]?.sublocation?.localityName;
  const city = record.city;
  const crumbs = [{name:'Home',item:SEO_SITE}, ...(city ? [{name:city,item:SEO_SITE+'/projects'}] : []), ...(locality ? [{name:locality,item:parent+'/locality'}] : []), {name,item:parent}, ...(section ? [{name:section.replaceAll('-',' '),item:url}] : [])];
  const latitude = entity.latitude ?? record.latitude ?? record.locations?.[0]?.latitude, longitude = entity.longitude ?? record.longitude ?? record.locations?.[0]?.longitude;
  const address = {'@type':'PostalAddress',addressLocality:locality || city,addressRegion:city,postalCode:entity.pincode,addressCountry:'IN'};
  const geo = latitude != null && longitude != null ? {'@type':'GeoCoordinates',latitude:Number(latitude),longitude:Number(longitude)} : undefined;
  const sold = seo.off_market || seo.settings?.expired_redirect_policy === 'keep_live_sold_banner' && ['sold','rented','expired','inactive'].includes(String(record.status).toLowerCase());
  const prices = (record.units || []).map((u:Data)=>Number(u.price)).filter((p:number)=>p>0);
  const low = Number(entity.low_price ?? record.ranges?.minPrice ?? (prices.length ? Math.min(...prices) : 0));
  const high = Number(entity.high_price ?? record.ranges?.maxPrice ?? (prices.length ? Math.max(...prices) : low));
  const price = Number(entity.price_override ?? record.price);
  const availability = 'https://schema.org/' + (sold ? 'SoldOut' : 'InStock');
  const homeId = parent+'#residence';
  const home: Data = {'@id':homeId,'@type':record.projectType ? 'ApartmentComplex' : record.propertyType === 'apartment' ? 'Apartment' : 'Residence',name,url:parent,address,...(geo ? {geo} : {}),...(entity.rera_number || record.reraNumber ? {identifier:entity.rera_number || record.reraNumber} : {})};
  const rooms = Number(entity.bhk_config || record.details?.bedrooms || record.bedrooms);
  const area = Number(entity.builtup_area_sqft || record.details?.builtupAreaSqft);
  if (rooms>0) home.numberOfRooms=rooms;
  if (area>0) home.floorSize={'@type':'QuantitativeValue',value:area,unitCode:'FTK'};
  const graph: Data[] = [{'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,...c}))},home];
  graph.push(record.projectType ? {'@type':'Product',name,url:parent,isRelatedTo:{'@id':homeId},...(low>0 ? {offers:{'@type':'AggregateOffer',lowPrice:low,highPrice:high,priceCurrency:'INR',availability}} : {})} : {'@type':'RealEstateListing',name,url:parent,mainEntity:{'@id':homeId},...(price>0 ? {offers:{'@type':'Offer',price,priceCurrency:'INR',availability,itemOffered:{'@id':homeId}}} : {})});
  let custom = seo.schema_overrides;
  if(typeof custom==='string') {try {custom=JSON.parse(custom);} catch {custom=null;}}
  if(custom && typeof custom==='object') graph.push(...(Array.isArray(custom['@graph']) ? custom['@graph'] : Array.isArray(custom) ? custom : Object.keys(custom).length ? [custom] : []));
  return {'@context':'https://schema.org','@graph':graph};
}
