import { buildRealEstateSchema } from '@/lib/schema-builder';
import { jsonLd } from '@/lib/seo-engine';
export function SeoEditorial({record, locality = false, footer = false}: {record: Record<string, any>; locality?: boolean; footer?: boolean}) {
 const seo=record.seoEngine || {}, settings=seo.settings || {};
 if(locality) {
  const legacy=record.seo?.seoData?.locality || {};
  const copy=['content_overview','content_connectivity','content_education','content_healthcare','content_shopping'].map(k=>legacy[k]).filter(Boolean);
  const landmarks=settings.nearby_landmarks || [];
  if(!copy.length && !landmarks.length) return null;
  return <section aria-label="Locality guide">{copy.map((t:string,i:number)=><p className="whitespace-pre-line!" key={i}>{t}</p>)}<ul>{landmarks.map((l:any,i:number)=><li key={i}>{l.name}{l.category ? ` · ${l.category}` : ''}{l.distance_km != null ? ` — ${l.distance_km} km` : ''}</li>)}</ul></section>;
 }
 if(footer) return settings.bottom_content ? <details><summary>More about this property</summary><div className="whitespace-pre-line!">{settings.bottom_content}</div></details> : null;
 const highlights=seo.highlights || [];
 return <>{settings.intro_content && <p className="whitespace-pre-line!">{settings.intro_content}</p>}{(settings.ai_summary || highlights.length>0) && <section aria-label="Key Highlights & Summary"><h2>Key Highlights &amp; Summary</h2>{settings.ai_summary && <p>{settings.ai_summary}</p>}<ul>{highlights.map((h:string,i:number)=><li key={i}>{h}</li>)}</ul></section>}</>;
}
export function RealEstateJsonLd({record,section=''}:{record:Record<string,any>;section?:string}) {return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(buildRealEstateSchema(record,record.seoEngine,section))}}/>;}
