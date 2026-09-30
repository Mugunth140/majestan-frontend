import { MessageCircle } from "lucide-react";

/**
 * Shared contact call-to-action closing every property page (overview and
 * all sub-pages). One identical section everywhere — copy, design and the
 * (currently inert) Contact Us button.
 */
export function NeedMoreDetails() {
  return (
    <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
      <div className="flex! flex-col! md:flex-row! items-start! md:items-center! justify-between! gap-6!">
        <div className="flex! items-start! gap-4!">
          <div className="w-12! h-12! rounded-xl! bg-[#27427f]/5! flex! items-center! justify-center! shrink-0!">
            <MessageCircle className="w-5! h-5! text-[#27427f]!" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-manrope! text-lg! md:text-xl! font-medium! mb-2! text-gray-900! tracking-normal!">
              Need more details?
            </h3>
            <p className="text-gray-500! text-base! font-normal! leading-relaxed!">
              Get the complete list of amenities and confirm availability with the property owner.
            </p>
          </div>
        </div>
        <button className="w-full! md:w-auto! px-8! py-3! bg-[#27427f]! text-white! font-normal! text-base! rounded-xl! hover:bg-[#1e3366]! transition-all! shrink-0! cursor-pointer!">
          Contact Us
        </button>
      </div>
    </div>
  );
}
