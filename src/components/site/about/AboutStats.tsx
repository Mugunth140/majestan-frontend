import Link from "next/link";
import { Building2, Smile, Award, TrendingUp } from "lucide-react";

const STATS = [
  { icon: Building2, label: "Premium Properties", value: "1,500+" },
  { icon: Smile, label: "Happy Clients", value: "10,000+" },
  { icon: Award, label: "Years Experience", value: "15+" },
  { icon: TrendingUp, label: "Properties Sold", value: "5,000+" },
];

export function AboutStats() {
  return (
    <section className="py-20! relative! overflow-hidden! bg-[#27427f]!">
      {/* Background patterns */}
      <div className="absolute! top-0! left-0! w-full! h-full! opacity-10!">
        <div className="absolute! w-[500px]! h-[500px]! rounded-full! border! border-white! top-[-250px]! left-[-100px]!" />
        <div className="absolute! w-[300px]! h-[300px]! rounded-full! border! border-white! bottom-[-100px]! right-[-50px]!" />
      </div>

      <div className="container! mx-auto! px-4! relative! z-10!">
        <div className="grid! grid-cols-2! md:grid-cols-4! gap-8! mb-16!">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="text-center! text-white!">
                <div className="flex! justify-center! mb-4!">
                  <Icon className="w-10! h-10! text-[#ffc900]!" strokeWidth={1.5} />
                </div>
                <div className="text-4xl! md:text-5xl! font-bold! mb-2!">{stat.value}</div>
                <div className="text-white/80! font-medium! uppercase! tracking-wide! text-sm!">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner inside Stats Section */}
        <div className="bg-white! rounded-3xl! p-8! md:p-12! flex! flex-col! md:flex-row! items-center! justify-between! gap-8! shadow-2xl!">
          <div className="max-w-xl!">
            <h3 className="text-3xl! font-bold! text-[#161e2d]! mb-3!">Ready to find your dream home?</h3>
            <p className="text-gray-600! text-lg!">
              Explore our hand-picked premium listings and discover the perfect place for you and your family.
            </p>
          </div>
          <div className="flex! shrink-0! gap-4!">
            <Link 
              href="/search" 
              className="px-8! py-4! bg-[#27427f]! text-white! font-bold! rounded-xl! hover:bg-[#1e3366]! transition-colors!"
            >
              Browse Properties
            </Link>
            <Link 
              href="/contact-us" 
              className="px-8! py-4! bg-gray-100! text-[#161e2d]! font-bold! rounded-xl! hover:bg-gray-200! transition-colors!"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
