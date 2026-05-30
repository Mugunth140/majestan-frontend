import { Building2, MapPin, Briefcase, ShieldCheck, HeartHandshake } from "lucide-react";

const VALUES = [
  {
    icon: Building2,
    title: "Wide Range of Properties",
    description: "From residential villas to industrial spaces and farmlands, we cater to all property needs."
  },
  {
    icon: MapPin,
    title: "Prime Locations",
    description: "Properties in Coimbatore's urban, industrial & rural zones with great potential for growth."
  },
  {
    icon: Briefcase,
    title: "Comprehensive Services",
    description: "Expertise in property management, liaisoning, and industrial and farmland transactions."
  },
  {
    icon: ShieldCheck,
    title: "Transparency and Integrity",
    description: "Ethical practices, clear processes, and full legal compliance."
  },
  {
    icon: HeartHandshake,
    title: "Customer-Centric Solutions",
    description: "Tailored services designed to meet the specific needs of property buyers, sellers, and investors."
  }
];

export function AboutValues() {
  return (
    <section className="py-20! bg-[#f8f9fa]!">
      <div className="container! mx-auto! px-4!">
        <div className="text-center! max-w-2xl! mx-auto! mb-16!">
          <h2 className="text-sm! font-bold! text-[#27427f]! uppercase! tracking-widest! mb-2!">Why Choose Us?</h2>
          <h3 className="text-3xl! md:text-4xl! font-bold! text-[#161e2d]! mb-4!">Here's why homeowners are choosing Majestan Realty</h3>
          <p className="text-gray-600!">
            The principles that guide our everyday interactions and shape our long-term vision.
          </p>
        </div>

        <div className="grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-3! gap-8!">
          {VALUES.map((value, index) => {
            const Icon = value.icon;
            return (
              <div 
                key={index} 
                className="bg-white! p-8! rounded-2xl! shadow-sm! hover:shadow-xl! transition-all! duration-300! group! hover:-translate-y-1! border! border-transparent! hover:border-[#27427f]/10!"
              >
                <div className="w-14! h-14! bg-[#27427f]/5! rounded-xl! flex! items-center! justify-center! mb-6! group-hover:bg-[#27427f]! transition-colors! duration-300!">
                  <Icon className="w-7! h-7! text-[#27427f]! group-hover:text-white! transition-colors! duration-300!" />
                </div>
                <h4 className="text-xl! font-bold! text-[#161e2d]! mb-3!">{value.title}</h4>
                <p className="text-gray-600! leading-relaxed!">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
