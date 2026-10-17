import type { Shipment } from '../core/models/shipment.model';

export function sampleShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 'shp-1001',
    trackingNumber: 'HL-26091-014',
    customer: 'Northwind Retail',
    origin: 'Rotterdam',
    destination: 'Newark',
    carrier: 'Meridian Freight',
    weightKg: 1840,
    status: 'in_transit',
    eta: '2026-10-22',
    createdAt: '2026-10-09T08:30:00.000Z',
    events: [
      {
        status: 'created',
        at: '2026-10-09T08:30:00.000Z',
        location: 'Rotterdam',
        note: 'Booking confirmed with the warehouse.',
      },
      {
        status: 'in_transit',
        at: '2026-10-12T06:45:00.000Z',
        location: 'North Atlantic',
        note: 'Vessel departed on the scheduled rotation.',
      },
    ],
    ...overrides,
  };
}
