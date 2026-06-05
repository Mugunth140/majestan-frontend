import { getPropertyBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ city: string; projectSlug: string }> }) {
  const property = await getPropertyBySlug((await params).projectSlug).catch(() => null);
  if (!property) return { title: 'Not Found' };
  
  return {
    title: `Amenities at ${property.title} in ${property.city}`,
    description: `Explore the luxurious amenities offered at ${property.title}, including gym, pool, security and more.`,
  };
}

export default async function ProjectAmenitiesPage({ params }: { params: Promise<{ city: string; projectSlug: string }> }) {
  const property = await getPropertyBySlug((await params).projectSlug).catch(() => null);
  
  if (!property) {
    notFound();
  }

  return (
    <section className="bg-white! p-6! rounded-xl! shadow-sm!">
      <h2 className="text-2xl! font-bold! text-gray-900! mb-6!">Top Amenities</h2>
      {property.propertyAmenities && property.propertyAmenities.length > 0 ? (
        <div className="grid! grid-cols-2! md:grid-cols-3! lg:grid-cols-4! gap-6!">
          {property.propertyAmenities.map((amenity: any) => (
            <div key={amenity.id} className="flex! items-center! space-x-3! p-4! border! border-gray-100! rounded-lg! hover:shadow-md! transition-shadow!">
              <div className="w-10! h-10! bg-blue-50! rounded-full! flex! items-center! justify-center! text-blue-600!">
                ✨
              </div>
              <span className="font-medium! text-gray-900!">{amenity.details || `Amenity #${amenity.amenityId}`}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500!">No amenities listed for this property.</p>
      )}
    </section>
  );
}
