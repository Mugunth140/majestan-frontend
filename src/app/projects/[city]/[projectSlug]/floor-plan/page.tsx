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

  const legacyUnits = (property.propertyUnits || []).filter((u: any) => !!u.floorPlanImageUrl);
  const newFloorPlanImages = property.propertyDetails?.floorPlanImages || [];

  const floorPlansToDisplay = newFloorPlanImages.length > 0 
    ? newFloorPlanImages 
    : legacyUnits.map((u: any) => ({ title: u.title, imageUrl: u.floorPlanImageUrl, imageKey: u.floorPlanImageKey }));

  return (
    <section className="bg-white! p-6! rounded-xl! shadow-sm!">
      <h2 className="text-2xl! font-bold! text-gray-900! mb-6!">Floor Plans</h2>
      {floorPlansToDisplay.length > 0 ? (
        <div className="grid! grid-cols-1! gap-8!">
          {floorPlansToDisplay.map((unit: any, index: number) => (
            <div key={index} className="border! border-gray-200! rounded-xl! overflow-hidden! hover:shadow-lg! transition-shadow!">
              <div className="w-full! h-[60vh]! bg-gray-50! relative! flex! items-center! justify-center!">
                {unit.imageUrl ? (
                  <Image src={unit.imageUrl} alt={unit.title || 'Floor Plan'} fill className="object-contain!" />
                ) : (
                  <span className="text-gray-400! font-medium!">No Plan Image Available</span>
                )}
              </div>
              {unit.title && (
                <div className="p-4! border-t! border-gray-200!">
                  <div className="flex! justify-between! items-start!">
                    <div>
                      <h3 className="text-xl! font-bold! text-gray-900!">{unit.title}</h3>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500!">No floor plans available for this property yet.</p>
      )}
    </section>
  );
}
