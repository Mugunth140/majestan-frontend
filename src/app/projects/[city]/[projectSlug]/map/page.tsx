import { getPropertyBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ city: string; projectSlug: string }> }) {
  const property = await getPropertyBySlug((await params).projectSlug).catch(() => null);
  if (!property) return { title: 'Not Found' };
  
  return {
    title: `Location & Map for ${property.title} in ${property.city}`,
    description: `Check out the map location, nearby landmarks, and neighbourhood for ${property.title}.`,
  };
}

export default async function ProjectMapPage({ params }: { params: Promise<{ city: string; projectSlug: string }> }) {
  const property = await getPropertyBySlug((await params).projectSlug).catch(() => null);
  
  if (!property) {
    notFound();
  }

  const loc = property.propertyLocations && property.propertyLocations.length > 0 ? property.propertyLocations[0] : null;

  return (
    <section className="bg-white! p-6! rounded-xl! shadow-sm!">
      <h2 className="text-2xl! font-bold! text-gray-900! mb-6!">Location & Map</h2>
      
      {loc ? (
        <div className="space-y-6!">
          <div className="flex! items-start! space-x-4! p-4! bg-blue-50! rounded-lg!">
            <div className="text-blue-600! mt-1!">
              <svg className="w-6! h-6!" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <div>
              <h3 className="font-semibold! text-gray-900!">Address</h3>
              <p className="text-gray-600! mt-1!">{loc.address}</p>
              {loc.landmark && <p className="text-gray-500! text-sm! mt-1!">Landmark: {loc.landmark}</p>}
            </div>
          </div>

          <div className="aspect-[21/9]! bg-gray-200! rounded-lg! overflow-hidden! relative!">
            {loc.mapUrl ? (
              <iframe 
                src={loc.mapUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              <div className="absolute! inset-0! flex! items-center! justify-center! text-gray-500!">
                Interactive Map Not Available
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center! py-12!">
          <div className="text-4xl! mb-4!">🗺️</div>
          <p className="text-gray-500!">No specific location details available for this property.</p>
        </div>
      )}
    </section>
  );
}
