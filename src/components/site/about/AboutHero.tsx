import Image from "next/image";

export function AboutHero() {
  return (
    <section className="relative! w-full! h-[60vh]! min-h-[500px]! flex! items-center! justify-center! overflow-hidden!">
      {/* Background Image & Overlay */}
      <div className="absolute! inset-0! z-0!">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"
          alt="Modern property"
          fill
          unoptimized
          className="object-cover!"
          priority
        />
        <div className="absolute! inset-0! bg-[#161e2d]/70!" />
      </div>

      {/* Content */}
      <div className="relative! z-10! container! mx-auto! px-4! text-center!">
        <h1 className="text-4xl! md:text-6xl! lg:text-7xl! font-bold! text-white! mb-6! leading-tight!">
          Welcome to <br className="hidden! md:block!" />
          <span className="text-[#ffc900]!">Majestan Realty</span>
        </h1>
        <p className="text-lg! md:text-xl! text-white/80! max-w-3xl! mx-auto!">
          Your trusted partner for comprehensive real estate services, property management, liaisoning, and specialized expertise in industrial properties and farm lands in Coimbatore.
        </p>
      </div>
    </section>
  );
}
