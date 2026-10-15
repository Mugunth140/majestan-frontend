import { ListingHelpSection } from "@/components/site/project/overview/ProjectHelpSection";

type NeedMoreDetailsProps = { propertyType?: string };

function getCopy(propertyType?: string): string {
  switch (propertyType) {
    case "plot":
    case "farmland":
      return "Get the complete plot details (dimensions, zoning and approvals) and confirm availability with the property owner.";
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

export function NeedMoreDetails({ propertyType }: NeedMoreDetailsProps) {
  return <ListingHelpSection title="Need more details?" description={getCopy(propertyType)} contactLabel="Contact Us" />;
}
