import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function ContactInfo() {
  return (
    <div className="w-full! lg:w-1/2! space-y-8!">
      <div>
        <h2 className="text-3xl! md:text-4xl! font-bold! text-[#161e2d]! mb-4!">
          Get In Touch
        </h2>
        <p className="text-gray-600! text-lg! leading-relaxed! mb-8!">
          We are here to answer any questions you may have about our properties or services. Reach out to us and we'll respond as soon as we can.
        </p>
      </div>

      <div className="grid! grid-cols-1! sm:grid-cols-2! gap-6!">
        {/* Office Address */}
        <div className="bg-white! p-6! rounded-2xl! shadow-sm! border! border-[#27427f]/10! hover:shadow-md! transition-shadow!">
          <div className="w-12! h-12! rounded-full! bg-[#27427f]/5! flex! items-center! justify-center! mb-4!">
            <MapPin className="w-6! h-6! text-[#27427f]!" />
          </div>
          <h3 className="text-lg! font-bold! text-[#161e2d]! mb-2!">Head Office</h3>
          <p className="text-gray-600! leading-relaxed!">
            47/1 Aandal Street, Lakshmipuram Main Rd, Hope College, Coimbatore, Tamil Nadu 641004
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-white! p-6! rounded-2xl! shadow-sm! border! border-[#27427f]/10! hover:shadow-md! transition-shadow!">
          <div className="w-12! h-12! rounded-full! bg-[#27427f]/5! flex! items-center! justify-center! mb-4!">
            <Phone className="w-6! h-6! text-[#27427f]!" />
          </div>
          <h3 className="text-lg! font-bold! text-[#161e2d]! mb-2!">Contact Details</h3>
          <p className="text-gray-600! leading-relaxed! mb-2!">
            <strong className="text-[#161e2d]!">Phone:</strong> <br /> +91 90929 65556
          </p>
          <p className="text-gray-600! leading-relaxed!">
            <strong className="text-[#161e2d]!">Email:</strong> <br /> info@majestanrealty.com
          </p>
        </div>

        {/* Working Hours */}
        <div className="bg-white! p-6! rounded-2xl! shadow-sm! border! border-[#27427f]/10! hover:shadow-md! transition-shadow! sm:col-span-2!">
          <div className="flex! items-start! gap-4!">
            <div className="w-12! h-12! rounded-full! bg-[#27427f]/5! flex! shrink-0! items-center! justify-center!">
              <Clock className="w-6! h-6! text-[#27427f]!" />
            </div>
            <div>
              <h3 className="text-lg! font-bold! text-[#161e2d]! mb-2!">Working Hours</h3>
              <p className="text-gray-600! leading-relaxed!">
                Monday - Saturday: 9:00 AM - 6:00 PM<br />
                Sunday: Closed (Available for scheduled viewings)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className="w-full! h-[300px]! rounded-2xl! overflow-hidden! shadow-sm! border! border-[#27427f]/10!">
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          scrolling="no" 
          marginHeight={0} 
          marginWidth={0} 
          src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=47/1%20Aandal%20Street,%20Lakshmipuram%20Main%20Rd,%20Hope%20College,%20Coimbatore,%20Tamil%20Nadu%20641004+(Majestan%20Realty)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
          className="border-0! w-full! h-full!"
        />
      </div>
    </div>
  );
}
