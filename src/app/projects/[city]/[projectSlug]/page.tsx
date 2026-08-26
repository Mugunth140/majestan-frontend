import { getPropertyBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ city: string; projectSlug: string }> }) {
  const property = await getPropertyBySlug((await params).projectSlug).catch(() => null);
  if (!property) return { title: 'Not Found' };
  
  return {
    title: `${property.title} in ${property.city} | Overview`,
    description: property.description.replace(/<[^>]*>/g, "").trim().slice(0, 160),
    alternates: {
      canonical: `/${property.canonicalSlug}`
    }
  };
}

export default async function ProjectOverviewPage({ params }: { params: Promise<{ city: string; projectSlug: string }> }) {
  const property = await getPropertyBySlug((await params).projectSlug).catch(() => null);
  
  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-8!">
      <section className="bg-white! p-6! rounded-xl! shadow-sm!">
        <h2 className="text-2xl! font-bold! text-gray-900! mb-4!">About {property.title}</h2>
        <div className="prose! max-w-none! text-gray-600!">
          {property.description}
        </div>
      </section>

      {property.details && (
        <section className="bg-white! p-6! rounded-xl! shadow-sm!">
          <h2 className="text-2xl! font-bold! text-gray-900! mb-4!">Property Details</h2>
          <div className="grid! grid-cols-2! md:grid-cols-4! gap-6!">
            {property.details.bedrooms && (
              <div>
                <p className="text-sm! text-gray-500!">Bedrooms</p>
                <p className="font-semibold! text-gray-900!">{property.details.bedrooms} BHK</p>
              </div>
            )}
            {property.details.bathrooms && (
              <div>
                <p className="text-sm! text-gray-500!">Bathrooms</p>
                <p className="font-semibold! text-gray-900!">{property.details.bathrooms}</p>
              </div>
            )}
            {property.details.areaSqft && (
              <div>
                <p className="text-sm! text-gray-500!">Area</p>
                <p className="font-semibold! text-gray-900!">{property.details.areaSqft} sq.ft</p>
              </div>
            )}
            {property.details.furnished !== undefined && (
              <div>
                <p className="text-sm! text-gray-500!">Furnished</p>
                <p className="font-semibold! text-gray-900!">{property.details.furnished ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
