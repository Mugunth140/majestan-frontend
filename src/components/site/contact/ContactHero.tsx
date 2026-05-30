import Image from "next/image";

export function ContactHero() {
  return (
    <section className="relative! w-full! h-[60vh]! min-h-[500px]! flex! items-center! justify-center! overflow-hidden!">
      {/* Background Image & Overlay */}
      <div className="absolute! inset-0! z-0!">
        <Image
          src="https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&q=80"
          alt="Contact Majestan Realty"
          fill
          unoptimized
          className="object-cover!"
          priority
        />
        <div className="absolute! inset-0! bg-[#161e2d]/70!" />
      </div>

      {/* Content */}
      <div className="relative! z-10! container! mx-auto! px-4! text-center!">
        <span className="inline-block! px-4! py-1.5! rounded-full! bg-white/10! backdrop-blur-md! text-[#ffc900]! font-semibold! text-sm! tracking-widest! uppercase! mb-6!">
          Contact Us
        </span>
        <h1 className="text-4xl! md:text-6xl! lg:text-7xl! font-bold! text-white! mb-6! leading-tight!">
          Let's Get in <span className="text-[#ffc900]!">Touch</span>
        </h1>
        <p className="text-lg! md:text-xl! text-white/80! max-w-2xl! mx-auto!">
          Whether you're looking to buy, sell, or rent a property, our team of experts is ready to assist you. Reach out to us today.
        </p>
      </div>
    </section>
  );
}
