import { z } from 'zod';

const schema = z.object({
  propertyType: z.enum(['apartment', 'villa']),
});

console.log(schema.safeParse({ propertyType: "" }));
