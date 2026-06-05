import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPropertyBySlug } from '@/lib/api';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ city: string; projectSlug: string }>;
}) {
  let property;
  try {
    property = await getPropertyBySlug((await params).projectSlug);
  } catch (error) {
    notFound();
  }

  const baseUrl = `/projects/${(await params).city}/${(await params).projectSlug}`;

  return (
    <div className="min-h-screen bg-gray-50!">
      {/* Property Header */}
      <div className="bg-white! border-b! border-gray-200! pt-8! pb-4!">
        <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
          <h1 className="text-3xl! font-bold! text-gray-900! mb-2!">{property.title}</h1>
          <p className="text-gray-600! text-lg!">{property.city}, {property.state}</p>
          <div className="mt-4! flex! items-center! space-x-4!">
            <span className="bg-blue-100! text-blue-800! px-3! py-1! rounded-full! text-sm! font-semibold!">
              {property.propertyType.toUpperCase()}
            </span>
            <span className="text-2xl! font-bold! text-gray-900!">
              ₹ {property.price}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Hub */}
      <div className="bg-white! shadow-sm! sticky! top-0! z-50!">
        <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
          <div className="flex! space-x-8! overflow-x-auto!">
            <Link href={baseUrl} className="border-b-2! border-transparent! hover:border-blue-600! text-gray-600! hover:text-blue-600! whitespace-nowrap! py-4! px-1! font-medium! text-sm!">
              Overview
            </Link>
            <Link href={`${baseUrl}/amenities`} className="border-b-2! border-transparent! hover:border-blue-600! text-gray-600! hover:text-blue-600! whitespace-nowrap! py-4! px-1! font-medium! text-sm!">
              Amenities
            </Link>
            <Link href={`${baseUrl}/floor-plan`} className="border-b-2! border-transparent! hover:border-blue-600! text-gray-600! hover:text-blue-600! whitespace-nowrap! py-4! px-1! font-medium! text-sm!">
              Floor Plans
            </Link>
            <Link href={`${baseUrl}/photos`} className="border-b-2! border-transparent! hover:border-blue-600! text-gray-600! hover:text-blue-600! whitespace-nowrap! py-4! px-1! font-medium! text-sm!">
              Photos
            </Link>
            <Link href={`${baseUrl}/map`} className="border-b-2! border-transparent! hover:border-blue-600! text-gray-600! hover:text-blue-600! whitespace-nowrap! py-4! px-1! font-medium! text-sm!">
              Map Location
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! py-8!">
        {children}
      </main>
    </div>
  );
}
