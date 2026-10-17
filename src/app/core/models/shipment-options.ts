export const PLACES = [
  'Rotterdam',
  'Hamburg',
  'Felixstowe',
  'Newark',
  'Los Angeles',
  'Santos',
  'Singapore',
  'Shanghai',
  'Busan',
  'Jebel Ali',
] as const;

export type Place = (typeof PLACES)[number];

export const CARRIERS = ['Meridian Freight', 'Northline', 'Harborline Air', 'Coast Road'] as const;

export type Carrier = (typeof CARRIERS)[number];

export function isPlace(value: string): value is Place {
  return (PLACES as readonly string[]).includes(value);
}

export function isCarrier(value: string): value is Carrier {
  return (CARRIERS as readonly string[]).includes(value);
}
