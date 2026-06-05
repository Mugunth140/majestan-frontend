import { getPropertyBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export async function generateMetadata({ params }: { params: Promise<{ city: string; projectSlug: string }> }) {
  const property = await getPropertyBySlug((await params).projectSlug).catch(() => null);
  if (!property) return { title: 'Not Found' };
  
  return {
    title: `Photos & Gallery for ${property.title} in ${property.city}`,
    description: `Browse high-quality interior and exterior photos of ${property.title}.`,
  };
}

export default async function ProjectPhotosPage({ params }: { params: Promise<{ city: string; projectSlug: string }> }) {
  const property = await getPropertyBySlug((await params).projectSlug).catch(() => null);
  
  if (!property) {
    notFound();
  }

  return (
    <section className="bg-white! p-6! rounded-xl! shadow-sm!">
      <h2 className="text-2xl! font-bold! text-gray-900! mb-6!">Photo Gallery</h2>
      {property.propertyImages && property.propertyImages.length > 0 ? (
        <div className="grid! grid-cols-2! md:grid-cols-3! lg:grid-cols-4! gap-4!">
          {property.propertyImages.map((image: any) => (
            <div key={image.id} className="aspect-square! bg-gray-100! rounded-lg! overflow-hidden! relative! group!">
              <Image 
                src={image.imageUrl} 
                alt={`${property.title} Photo`} 
                fill 
                className="object-cover! group-hover:scale-110! transition-transform! duration-300!" 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center! py-12!">
          <div className="text-6xl! mb-4!">📸</div>
          <h3 className="text-lg! font-medium! text-gray-900!">No Photos Available</h3>
          <p className="text-gray-500!">Check back soon for high-quality images of this property.</p>
        </div>
      )}
    </section>
  );
}
