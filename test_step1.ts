import { basicInfoSchema } from './src/lib/validations/property-wizard.schema';

const data = {
  title: "Luxury 3BHK Villa",
  description: "Detailed description of the property...",
  propertyType: "apartment",
  listingType: "Sell"
};

const res = basicInfoSchema.safeParse(data);
if (!res.success) {
    console.log("Errors:");
    for (const err of res.error.issues) {
        console.log(err.path, err.message);
    }
} else {
    console.log("Success!");
}
