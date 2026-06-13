import { z } from 'zod';
import { parseIndianCurrency } from '../utils/currency.util';

export const basicInfoSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(255),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  propertyType: z.enum([
    'apartment', 'villa', 'plot', 'commercial', 'coworking', 
    'farmland', 'industrial', 'individual_portion', 'other'
  ]),
  listingType: z.enum(['Sell', 'Rent']),
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'SOLD', 'RENTED']).optional().default('AVAILABLE'),
  propertyCondition: z.enum(['New', 'Under Construction', 'Resale']).or(z.literal('')).optional(),
  ownershipType: z.enum(['Freehold', 'Leasehold']).or(z.literal('')).optional(),
  reraNumber: z.string().optional(),
  builderName: z.string().optional(),
  projectName: z.string().optional(),
});

export const pricingSchema = z.object({
  price: z.string().refine((val) => {
    const parsed = parseIndianCurrency(val);
    return !isNaN(parsed) && parsed > 0;
  }, {
    message: 'Price must be a valid number or format (e.g. 1.5 Cr, 45 Lk)',
  }),
  negotiable: z.boolean().default(false),
  maintenanceCharges: z.string().optional().refine((val) => !val || (!isNaN(parseIndianCurrency(val)) && parseIndianCurrency(val) >= 0), 'Invalid format'),
  securityDeposit: z.string().optional().refine((val) => !val || (!isNaN(parseIndianCurrency(val)) && parseIndianCurrency(val) >= 0), 'Invalid format'),
  bookingAmount: z.string().optional().refine((val) => !val || (!isNaN(parseIndianCurrency(val)) && parseIndianCurrency(val) >= 0), 'Invalid format'),
});

export const specificationsSchema = z.object({
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  balconies: z.string().optional(),
  floorNumber: z.string().optional(),
  totalFloors: z.string().optional(),
  builtUpArea: z.string().optional(),
  carpetArea: z.string().optional(),
  superBuiltUpArea: z.string().optional(),
  plotArea: z.string().optional(),
  areaUnit: z.enum(['Sq Ft', 'Sq M', 'Acres', 'Cents']).default('Sq Ft'),
  propertyFacing: z.enum(['East', 'West', 'North', 'South', 'North East', 'North West', 'South East', 'South West'], { message: 'Please select an option' }),
  propertyAge: z.enum(['New', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'], { message: 'Please select an option' }),
  furnishing: z.enum(['Furnished', 'Semi Furnished', 'Unfurnished'], { message: 'Please select an option' }).default('Unfurnished'),
  possessionStatus: z.enum(['Ready To Move', 'Under Construction', 'Immediate', 'Future Date'], { message: 'Please select an option' }),
  parkingSpaces: z.string().optional(),
  waterSupply: z.string().optional(),
  powerBackup: z.string().optional(),
  roadWidth: z.string().optional(),
  openSides: z.string().optional(),
});

export const amenitiesSchema = z.object({
  amenityIds: z.array(z.number()).default([]),
});

export const mediaSchema = z.object({
  images: z.array(z.any()).default([]),
});

export const ownerInfoSchema = z.object({
  ownerName: z.string().min(2, 'Name must be at least 2 characters'),
  ownerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  ownerPhone: z.string().min(10, 'Valid phone number required'),
});

export const seoSchema = z.object({
  seoSlug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

export const availabilitySchema = z.object({
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  availabilityStatus: z.enum(['Available', 'Reserved', 'Sold', 'Rented']).default('Available'),
});

export const verificationSchema = z.object({
  verificationStatus: z.enum(['Pending', 'Verified', 'Rejected']).default('Pending'),
  approvalStatus: z.enum(['Pending', 'Approved', 'Rejected']).default('Pending'),
  publishImmediately: z.boolean().default(false),
});
