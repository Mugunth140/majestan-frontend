import { z } from 'zod';

export const basicInfoSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(255),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  propertyType: z.enum([
    'apartment', 'villa', 'plot', 'commercial', 'coworking', 
    'farmland', 'industrial', 'independent_portion', 'other'
  ]),
  listingType: z.enum(['Sell', 'Rent']),
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'SOLD', 'RENTED']),
  propertyCondition: z.enum(['New', 'Under Construction', 'Resale']).optional(),
  ownershipType: z.enum(['Freehold', 'Leasehold']).optional(),
  reraNumber: z.string().optional(),
  builderName: z.string().optional(),
  projectName: z.string().optional(),
});

export const pricingSchema = z.object({
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Price must be a valid positive number',
  }),
  negotiable: z.boolean().default(false),
  maintenanceCharges: z.string().optional(),
  securityDeposit: z.string().optional(),
  bookingAmount: z.string().optional(),
});
