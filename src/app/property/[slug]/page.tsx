import { Metadata } from "next";
import { getPropertyBySlug } from "@/lib/api/client";
import { PropertyNavigation } from "@/components/site/property/property-navigation";

export const revalidate = 3600; // ISR for main page

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  // TODO: Fetch real metadata
  return {
    title: `Property Overview - ${resolvedParams.slug} | Majestan Realty`,
    description: `Detailed overview of ${resolvedParams.slug}.`,
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PropertyNavigation slug={resolvedParams.slug} />
      
      <main>
        <h1 className="text-4xl font-bold mb-4">Property Overview</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to the main property page for <strong>{resolvedParams.slug}</strong>.
        </p>
        
        {/* Dynamic content will be loaded here */}
      </main>
    </div>
  );
}
