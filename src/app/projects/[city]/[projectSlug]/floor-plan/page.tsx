import { getPropertyBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export async function generateMetadata({ params }: { params: Promise<{ city: string; projectSlug: string }> }) {
  const property = await getPropertyBySlug((await params).projectSlug).catch(() => null);
  if (!property) return { title: 'Not Found' };
  
  return {
    title: `Floor Plans for ${property.title} in ${property.city}`,
    description: `View 1BHK, 2BHK, and 3BHK floor plans and master plans for ${property.title}.`,
  };
}

export default async function ProjectFloorPlanPage({ params }: { params: Promise<{ city: string; projectSlug: string }> }) {
  const property = await getPropertyBySlug((await params).projectSlug).catch(() => null);
  
  if (!property) {
    notFound();
  }

  return (
    <section className="bg-white! p-6! rounded-xl! shadow-sm!">
      <h2 className="text-2xl! font-bold! text-gray-900! mb-6!">Floor Plans & Configurations</h2>
      {property.propertyUnits && property.propertyUnits.length > 0 ? (
        <div className="grid! grid-cols-1! md:grid-cols-2! gap-6!">
          {property.propertyUnits.map((unit: any) => (
            <div key={unit.id} className="border! border-gray-200! rounded-xl! overflow-hidden! hover:shadow-lg! transition-shadow!">
              <div className="aspect-[4/3]! bg-gray-100! relative! flex! items-center! justify-center!">
                {unit.floorPlanImageUrl ? (
                  <Image src={unit.floorPlanImageUrl} alt={unit.title} fill className="object-cover!" />
                ) : (
                  <span className="text-gray-400! font-medium!">No Plan Image Available</span>
                )}
              </div>
              <div className="p-4! border-t! border-gray-200!">
                <div className="flex! justify-between! items-start!">
                  <div>
                    <h3 className="text-lg! font-bold! text-gray-900!">{unit.title}</h3>
                    <p className="text-gray-500! text-sm!">{unit.unitType}</p>
                  </div>
                  {unit.price && (
                    <div className="text-right!">
                      <p className="text-sm! text-gray-500!">Starting from</p>
                      <p className="font-bold! text-blue-600!">₹ {unit.price}</p>
                    </div>
                  )}
                </div>
                {unit.sizeSqft && (
                  <div className="mt-4! flex! items-center! text-sm! text-gray-600!">
                    <svg className="w-4! h-4! mr-2!" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                    {unit.sizeSqft} sq.ft
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500!">No floor plans available for this property yet.</p>
      )}
    </section>
  );
}
