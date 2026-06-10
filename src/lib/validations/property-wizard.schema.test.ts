import { describe, test, expect } from 'vitest';
import { basicInfoSchema, pricingSchema } from './property-wizard.schema';

describe('Property Wizard Schemas', () => {
  describe('basicInfoSchema', () => {
    test('validates valid data', () => {
      const data = {
        title: 'Luxury 3BHK Villa in Mumbai',
        description: 'Beautiful villa with modern amenities and sea view.',
        propertyType: 'villa',
        listingType: 'Sell',
        status: 'AVAILABLE',
        propertyCondition: 'New',
        ownershipType: 'Freehold',
      };
      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('rejects short title', () => {
      const data = {
        title: 'Short',
        description: 'Beautiful villa with modern amenities.',
        propertyType: 'villa',
        listingType: 'Sell',
        status: 'AVAILABLE',
        propertyCondition: 'New',
        ownershipType: 'Freehold',
      };
      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Title must be at least');
      }
    });
  });

  describe('pricingSchema', () => {
    test('validates valid pricing', () => {
      const data = {
        price: '15000000',
        negotiable: true,
      };
      const result = pricingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('rejects negative price', () => {
      const data = {
        price: '-500',
        negotiable: true,
      };
      const result = pricingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
