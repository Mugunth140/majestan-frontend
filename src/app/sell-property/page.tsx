import { getSeo,seoMetadata } from '@/lib/seo-engine';
import { OwnerServicePage } from '@/components/seo/owner-service-page';
export async function generateMetadata(){return seoMetadata(await getSeo('/sell-property'),{title:'Sell Your Property in Coimbatore | Majestan Realty',description:'Get local support with property pricing, buyer enquiries and viewings in Coimbatore. Contact Majestan Realty to discuss your sale.'});}
export default function SellProperty(){return <OwnerServicePage/>;}
