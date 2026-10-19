import { getSeo,seoMetadata } from '@/lib/seo-engine';
import { OwnerServicePage } from '@/components/seo/owner-service-page';
export async function generateMetadata(){return seoMetadata(await getSeo('/rent-property'),{title:'Rent Out Your Property in Coimbatore | Majestan Realty',description:'Get help with rental pricing, tenant enquiries and property viewings in Coimbatore. Contact Majestan Realty to discuss your property.'});}
export default function RentProperty(){return <OwnerServicePage rent/>;}
