import { Metadata } from "next";
import Link from "next/link";
import { PropertyNavigation } from "@/components/site/property/property-navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Locality & Neighborhood - ${resolvedParams.slug} | Majestan Realty`,
    description: `Learn about the neighborhood, connectivity, and locality advantages of ${resolvedParams.slug}.`,
  };
}

export default async function PropertyLocalityPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PropertyNavigation slug={resolvedParams.slug} />
      
      <main>
        <h1 className="text-4xl font-bold mb-4">Locality Overview</h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover the connectivity and neighborhood highlights surrounding <strong>{resolvedParams.slug}</strong>.
        </p>
        
        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <Link href={`/property/${resolvedParams.slug}`} className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition">
            View Full Property
          </Link>
        </div>
      </main>
    </div>
  );
}
