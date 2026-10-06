type NeedMoreDetailsProps = {
  /** DB property type — workspace types get fitting copy, everything else the home copy. */
  propertyType?: string;
};

function getCopy(propertyType?: string): string {
  switch (propertyType) {
    case "commercial":
      return "Get the complete specifications and confirm availability with the property manager.";
    case "industrial":
      return "Get the complete site specifications and confirm availability with the site manager.";
    case "coworking":
      return "Get the complete facilities list and confirm seat availability with our team.";
    default:
      return "Get the complete list of amenities and confirm availability with the property owner.";
  }
}

/**
 * Shared contact call-to-action closing every property page (overview and
 * all sub-pages). One identical section everywhere — copy varies by
 * property type, design and the (currently inert) Contact Us button don't.
 */
export function NeedMoreDetails({ propertyType }: NeedMoreDetailsProps) {
  return (
    <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
      <div className="flex! flex-col! md:flex-row! items-start! md:items-center! justify-between! gap-6!">
        <div>
          <h3 className="font-manrope! text-lg! md:text-xl! font-medium! mb-2! text-gray-900! tracking-normal!">
            Need more details?
          </h3>
          <p className="text-gray-500! text-base! font-normal! leading-relaxed!">
            {getCopy(propertyType)}
          </p>
        </div>
        <button className="w-full! md:w-auto! px-8! py-3! bg-[#27427f]! text-white! font-normal! text-base! rounded-xl! hover:bg-[#1e3366]! transition-all! shrink-0! cursor-pointer!">
          Contact Us
        </button>
      </div>
    </div>
  );
}
