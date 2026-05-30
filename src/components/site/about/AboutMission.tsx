import Image from "next/image";

export function AboutMission() {
  return (
    <section className="py-20! bg-white!">
      <div className="container! mx-auto! px-4!">
        <div className="flex! flex-col! lg:flex-row! items-center! gap-16!">
          
          {/* Image Side */}
          <div className="w-full! lg:w-1/2! relative!">
            <div className="relative! h-[400px]! md:h-[500px]! w-full! rounded-2xl! overflow-hidden! shadow-2xl!">
              <Image 
                src="/assets/images/home/apartment-rent.png" 
                alt="Our Mission" 
                fill 
                className="object-cover!"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute! -bottom-6! -right-6! w-32! h-32! bg-[#ffc900]! rounded-2xl! -z-10!" />
            <div className="absolute! -top-6! -left-6! w-32! h-32! bg-[#27427f]/10! rounded-full! -z-10!" />
          </div>

          {/* Text Side */}
          <div className="w-full! lg:w-1/2! space-y-6!">
            <h2 className="text-sm! font-bold! text-[#27427f]! uppercase! tracking-widest!">Our Vision & Mission</h2>
            <h3 className="text-3xl! md:text-4xl! font-bold! text-[#161e2d]! leading-tight!">
              To be Coimbatore's leading real estate company
            </h3>
            <p className="text-gray-600! text-lg! leading-relaxed!">
              <strong className="text-[#161e2d]!">Our Vision:</strong> To provide innovative solutions across residential, commercial, industrial, and agricultural sectors while ensuring superior customer experiences.
            </p>
            <p className="text-gray-600! text-lg! leading-relaxed!">
              <strong className="text-[#161e2d]!">Our Mission:</strong> To offer seamless and comprehensive real estate services, including property transactions, management, and liaisoning, while addressing the diverse needs of urban, industrial, and rural property markets.
            </p>
            
            <div className="pt-4! flex! items-center! gap-6!">
              <div className="flex! -space-x-4!">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`w-12! h-12! rounded-full! border-2! border-white! bg-gray-200! flex! items-center! justify-center! overflow-hidden! z-${10-i}`}>
                    <img src={`/assets/images/avatar/avt-${i}.jpg`} alt="Agent" className="w-full! h-full! object-cover!" />
                  </div>
                ))}
              </div>
              <div className="text-sm!">
                <p className="font-bold! text-[#161e2d]!">Trusted by</p>
                <p className="text-gray-500!">10,000+ happy clients</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
