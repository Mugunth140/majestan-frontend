import { AboutView } from "@/components/site/views/AboutView";
import { ApartmentDetailsView } from "@/components/site/views/ApartmentDetailsView";
import { ApartmentView } from "@/components/site/views/ApartmentView";
import { Apartment1View } from "@/components/site/views/Apartment1View";
import { BlogDetailsView } from "@/components/site/views/BlogDetailsView";
import { BlogsView } from "@/components/site/views/BlogsView";
import { Blogs1View } from "@/components/site/views/Blogs1View";
import { BuyRentView } from "@/components/site/views/BuyRentView";
import { Buyrent1View } from "@/components/site/views/Buyrent1View";
import { CommercialDetailsView } from "@/components/site/views/CommercialDetailsView";
import { CommercialView } from "@/components/site/views/CommercialView";
import { Commercial1View } from "@/components/site/views/Commercial1View";
import { ContactView } from "@/components/site/views/ContactView";
import { CoworkersDetailsView } from "@/components/site/views/CoworkersDetailsView";
import { CoworkersView } from "@/components/site/views/CoworkersView";
import { Coworkers1View } from "@/components/site/views/Coworkers1View";
import { CoworkersViewsView } from "@/components/site/views/CoworkersViewsView";
import { FarmlandDetailsView } from "@/components/site/views/FarmlandDetailsView";
import { FarmlandView } from "@/components/site/views/FarmlandView";
import { Farmland1View } from "@/components/site/views/Farmland1View";
import { FinancialAssistanceView } from "@/components/site/views/FinancialAssistanceView";
import { FooterpropertyView } from "@/components/site/views/FooterpropertyView";
import { Footerproperty1View } from "@/components/site/views/Footerproperty1View";
import { HeaderInnerView } from "@/components/site/views/HeaderInnerView";
import { IndependentHouseDetailsView } from "@/components/site/views/IndependentHouseDetailsView";
import { IndependentHouseView } from "@/components/site/views/IndependentHouseView";
import { IndependentHouse1View } from "@/components/site/views/IndependentHouse1View";
import { IndexView } from "@/components/site/views/IndexView";
import { IndustrialDetailsView } from "@/components/site/views/IndustrialDetailsView";
import { IndustrialView } from "@/components/site/views/IndustrialView";
import { Industrial1View } from "@/components/site/views/Industrial1View";
import { LaxuryView } from "@/components/site/views/LaxuryView";
import { LiaisoningView } from "@/components/site/views/LiaisoningView";
import { NriView } from "@/components/site/views/NriView";
import { PlotDetailsView } from "@/components/site/views/PlotDetailsView";
import { PlotsView } from "@/components/site/views/PlotsView";
import { Plots1View } from "@/components/site/views/Plots1View";
import { PrivacyPolicyView } from "@/components/site/views/PrivacyPolicyView";
import { ProfessionalBrokerageServiceView } from "@/components/site/views/ProfessionalBrokerageServiceView";
import { ProjectsView } from "@/components/site/views/ProjectsView";
import { PropertyView } from "@/components/site/views/PropertyView";
import { Property1View } from "@/components/site/views/Property1View";
import { PropertyManagementView } from "@/components/site/views/PropertyManagementView";
import { RentView } from "@/components/site/views/RentView";
import { Rent1View } from "@/components/site/views/Rent1View";
import { RentSellPropertyView } from "@/components/site/views/RentSellPropertyView";
import { ResidentailView } from "@/components/site/views/ResidentailView";
import { TestimonialsView } from "@/components/site/views/TestimonialsView";
import { VillaDetailsView } from "@/components/site/views/VillaDetailsView";
import { VillaView } from "@/components/site/views/VillaView";
import { Villa1View } from "@/components/site/views/Villa1View";
import { WishlistView } from "@/components/site/views/WishlistView";

export const VIEW_COMPONENTS = {
  "about.php": AboutView,
  "apartment-details.php": ApartmentDetailsView,
  "apartment.php": ApartmentView,
  "apartment1.php": Apartment1View,
  "blog_details.php": BlogDetailsView,
  "blogs.php": BlogsView,
  "blogs1.php": Blogs1View,
  "buy_rent.php": BuyRentView,
  "buyrent1.php": Buyrent1View,
  "commercial-details.php": CommercialDetailsView,
  "commercial.php": CommercialView,
  "commercial1.php": Commercial1View,
  "contact.php": ContactView,
  "coworkers-details.php": CoworkersDetailsView,
  "coworkers.php": CoworkersView,
  "coworkers1.php": Coworkers1View,
  "coworkers_views.php": CoworkersViewsView,
  "farmland-details.php": FarmlandDetailsView,
  "farmland.php": FarmlandView,
  "farmland1.php": Farmland1View,
  "financial_assistance.php": FinancialAssistanceView,
  "footerproperty.php": FooterpropertyView,
  "footerproperty1.php": Footerproperty1View,
  "header-inner.php": HeaderInnerView,
  "independent-house-details.php": IndependentHouseDetailsView,
  "independent_house.php": IndependentHouseView,
  "independent_house1.php": IndependentHouse1View,
  "index.php": IndexView,
  "industrial-details.php": IndustrialDetailsView,
  "industrial.php": IndustrialView,
  "industrial1.php": Industrial1View,
  "laxury.php": LaxuryView,
  "liaisoning.php": LiaisoningView,
  "nri.php": NriView,
  "plot-details.php": PlotDetailsView,
  "plots.php": PlotsView,
  "plots1.php": Plots1View,
  "privacy_policy.php": PrivacyPolicyView,
  "professional_brokerage_service.php": ProfessionalBrokerageServiceView,
  "projects.php": ProjectsView,
  "property.php": PropertyView,
  "property1.php": Property1View,
  "property_management.php": PropertyManagementView,
  "rent.php": RentView,
  "rent1.php": Rent1View,
  "rent_sell_property.php": RentSellPropertyView,
  "residentail.php": ResidentailView,
  "testimonials.php": TestimonialsView,
  "villa-details.php": VillaDetailsView,
  "villa.php": VillaView,
  "villa1.php": Villa1View,
  "wishlist.php": WishlistView,
} as const;

export type LegacyViewName = keyof typeof VIEW_COMPONENTS;
