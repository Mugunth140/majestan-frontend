/** Missing or implausible measurements remain unknown; never infer the original unit. */
export function usableArea(value: unknown, type: string): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n >= (['apartment', 'villa', 'individual_portion'].includes(type) ? 100 : 1) ? n : null;
}

export function sanitizePublicAreas<T extends { propertyType?: string; details?: Record<string, unknown>; propertyDetails?: Record<string, unknown> }>(record: T): T {
  const type = record.propertyType || "";
  if (!['apartment', 'villa', 'individual_portion'].includes(type)) return record;
  const clean = (details: Record<string, unknown>) => details && Object.fromEntries(Object.entries(details).map(([key, value]) => [key,
    ['areaSqft', 'builtUpArea', 'carpetArea', 'superBuiltUpArea'].includes(key) && value != null && usableArea(value, type) === null ? null : value
  ]));
  const lazy = Reflect.get(record, '__propertyDetails__');
  const legacyAreas = Object.fromEntries(['sq_ft','build_up_area','buildup_area'].filter(key => key in record && usableArea(Reflect.get(record, key), type) === null).map(key => [key, null]));
  return { ...record, ...legacyAreas,
    ...(lazy && typeof lazy === 'object' && !Array.isArray(lazy) ? { __propertyDetails__: clean(lazy as Record<string, unknown>) } : {}),
    ...(record.details ? { details: clean(record.details) } : {}),
    ...(record.propertyDetails ? { propertyDetails: clean(record.propertyDetails) } : {}) };

}
