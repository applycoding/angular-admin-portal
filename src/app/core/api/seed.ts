import type { Carrier, Place } from '../models/shipment-options';
import type { Shipment, ShipmentStatus, StatusEvent } from '../models/shipment.model';

interface SeedInput {
  id: string;
  trackingNumber: string;
  customer: string;
  origin: Place;
  destination: Place;
  carrier: Carrier;
  weightKg: number;
  eta: string;
  createdAt: string;
  steps: ReadonlyArray<readonly [ShipmentStatus, string, string, string]>;
}

function timeline(steps: SeedInput['steps']): StatusEvent[] {
  return steps.map(([status, at, location, note]) => ({ status, at, location, note }));
}

function shipment(input: SeedInput): Shipment {
  const events = timeline(input.steps);
  const current = events[events.length - 1];
  if (!current) {
    throw new Error(`Shipment ${input.id} is missing events`);
  }
  return {
    id: input.id,
    trackingNumber: input.trackingNumber,
    customer: input.customer,
    origin: input.origin,
    destination: input.destination,
    carrier: input.carrier,
    weightKg: input.weightKg,
    eta: input.eta,
    createdAt: input.createdAt,
    status: current.status,
    events,
  };
}

export const SEED_SHIPMENTS: readonly Shipment[] = [
  shipment({
    id: 'shp-1001',
    trackingNumber: 'HL-26091-014',
    customer: 'Northwind Retail',
    origin: 'Rotterdam',
    destination: 'Newark',
    carrier: 'Meridian Freight',
    weightKg: 1840,
    eta: '2026-10-22',
    createdAt: '2026-10-09T08:30:00.000Z',
    steps: [
      ['created', '2026-10-09T08:30:00.000Z', 'Rotterdam', 'Booking confirmed with the warehouse.'],
      ['picked_up', '2026-10-10T14:10:00.000Z', 'Rotterdam', 'Container collected from the shipper.'],
      ['in_transit', '2026-10-12T06:45:00.000Z', 'North Atlantic', 'Vessel departed on the scheduled rotation.'],
    ],
  }),
  shipment({
    id: 'shp-1002',
    trackingNumber: 'HL-26094-221',
    customer: 'Keel & Co.',
    origin: 'Hamburg',
    destination: 'Singapore',
    carrier: 'Northline',
    weightKg: 960,
    eta: '2026-10-28',
    createdAt: '2026-10-14T11:05:00.000Z',
    steps: [
      ['created', '2026-10-14T11:05:00.000Z', 'Hamburg', 'Booking entered by dispatch.'],
      ['picked_up', '2026-10-15T09:20:00.000Z', 'Hamburg', 'Cargo received at the export terminal.'],
    ],
  }),
  shipment({
    id: 'shp-1003',
    trackingNumber: 'HL-26101-018',
    customer: 'Lumen Goods',
    origin: 'Shanghai',
    destination: 'Los Angeles',
    carrier: 'Harborline Air',
    weightKg: 220,
    eta: '2026-10-18',
    createdAt: '2026-10-11T02:15:00.000Z',
    steps: [
      ['created', '2026-10-11T02:15:00.000Z', 'Shanghai', 'Air waybill opened.'],
      ['picked_up', '2026-10-12T18:40:00.000Z', 'Shanghai', 'Freight accepted at the airline desk.'],
      ['in_transit', '2026-10-13T09:00:00.000Z', 'Pacific route', 'Flight departed.'],
      ['out_for_delivery', '2026-10-17T15:10:00.000Z', 'Los Angeles', 'Handed to the local cartage agent.'],
    ],
  }),
  shipment({
    id: 'shp-1004',
    trackingNumber: 'HL-26102-044',
    customer: 'Atlas Parts',
    origin: 'Busan',
    destination: 'Felixstowe',
    carrier: 'Meridian Freight',
    weightKg: 2400,
    eta: '2026-10-12',
    createdAt: '2026-09-28T07:00:00.000Z',
    steps: [
      ['created', '2026-09-28T07:00:00.000Z', 'Busan', 'Booking confirmed.'],
      ['picked_up', '2026-09-29T03:30:00.000Z', 'Busan', 'Container gated in.'],
      ['in_transit', '2026-10-02T12:00:00.000Z', 'Indian Ocean', 'Main-line vessel sailing.'],
      ['out_for_delivery', '2026-10-11T08:15:00.000Z', 'Felixstowe', 'Released from the port.'],
      ['delivered', '2026-10-12T16:40:00.000Z', 'Felixstowe', 'Receiver signed the delivery note.'],
    ],
  }),
  shipment({
    id: 'shp-1005',
    trackingNumber: 'HL-26105-007',
    customer: 'Sable Coffee',
    origin: 'Santos',
    destination: 'Hamburg',
    carrier: 'Coast Road',
    weightKg: 760,
    eta: '2026-10-19',
    createdAt: '2026-10-06T13:25:00.000Z',
    steps: [
      ['created', '2026-10-06T13:25:00.000Z', 'Santos', 'Booking confirmed.'],
      ['picked_up', '2026-10-07T10:00:00.000Z', 'Santos', 'Bags collected from the plant.'],
      ['exception', '2026-10-16T19:05:00.000Z', 'Santos', 'Hold for a missing export document.'],
    ],
  }),
  shipment({
    id: 'shp-1006',
    trackingNumber: 'HL-26108-330',
    customer: 'Marlowe Textiles',
    origin: 'Jebel Ali',
    destination: 'Newark',
    carrier: 'Northline',
    weightKg: 540,
    eta: '2026-10-25',
    createdAt: '2026-10-08T05:50:00.000Z',
    steps: [
      ['created', '2026-10-08T05:50:00.000Z', 'Jebel Ali', 'Booking confirmed.'],
      ['picked_up', '2026-10-09T16:30:00.000Z', 'Jebel Ali', 'Cartons received at the CFS.'],
      ['in_transit', '2026-10-14T01:20:00.000Z', 'Suez approach', 'Feeder connected to the main vessel.'],
    ],
  }),
  shipment({
    id: 'shp-1007',
    trackingNumber: 'HL-26109-112',
    customer: 'Bright Circuit',
    origin: 'Singapore',
    destination: 'Rotterdam',
    carrier: 'Harborline Air',
    weightKg: 86.4,
    eta: '2026-10-30',
    createdAt: '2026-10-16T09:40:00.000Z',
    steps: [['created', '2026-10-16T09:40:00.000Z', 'Singapore', 'Booking confirmed. Awaiting pickup.']],
  }),
  shipment({
    id: 'shp-1008',
    trackingNumber: 'HL-26110-090',
    customer: 'Campo Foods',
    origin: 'Newark',
    destination: 'Hamburg',
    carrier: 'Meridian Freight',
    weightKg: 3100,
    eta: '2026-10-21',
    createdAt: '2026-10-04T18:10:00.000Z',
    steps: [
      ['created', '2026-10-04T18:10:00.000Z', 'Newark', 'Reefer booking confirmed.'],
      ['picked_up', '2026-10-05T12:45:00.000Z', 'Newark', 'Pre-cooled container collected.'],
      ['in_transit', '2026-10-08T22:00:00.000Z', 'North Atlantic', 'Temperature log is on the vessel report.'],
    ],
  }),
  shipment({
    id: 'shp-1009',
    trackingNumber: 'HL-26111-015',
    customer: 'Paper Lantern',
    origin: 'Shanghai',
    destination: 'Felixstowe',
    carrier: 'Coast Road',
    weightKg: 430,
    eta: '2026-10-08',
    createdAt: '2026-09-22T04:20:00.000Z',
    steps: [
      ['created', '2026-09-22T04:20:00.000Z', 'Shanghai', 'Booking confirmed.'],
      ['picked_up', '2026-09-23T08:00:00.000Z', 'Shanghai', 'Cartons gated in.'],
      ['in_transit', '2026-09-28T11:30:00.000Z', 'Malacca Strait', 'Vessel departed.'],
      ['delivered', '2026-10-08T13:55:00.000Z', 'Felixstowe', 'Delivered to the consignee warehouse.'],
    ],
  }),
  shipment({
    id: 'shp-1010',
    trackingNumber: 'HL-26112-240',
    customer: 'Veldt Mining',
    origin: 'Santos',
    destination: 'Singapore',
    carrier: 'Northline',
    weightKg: 5200,
    eta: '2026-11-02',
    createdAt: '2026-10-15T15:00:00.000Z',
    steps: [
      ['created', '2026-10-15T15:00:00.000Z', 'Santos', 'Bulk booking confirmed.'],
      ['picked_up', '2026-10-16T07:25:00.000Z', 'Santos', 'Load received at the terminal.'],
    ],
  }),
  shipment({
    id: 'shp-1011',
    trackingNumber: 'HL-26113-061',
    customer: 'Oak & Iron',
    origin: 'Hamburg',
    destination: 'Los Angeles',
    carrier: 'Meridian Freight',
    weightKg: 1280,
    eta: '2026-10-27',
    createdAt: '2026-10-07T10:35:00.000Z',
    steps: [
      ['created', '2026-10-07T10:35:00.000Z', 'Hamburg', 'Booking confirmed.'],
      ['picked_up', '2026-10-08T09:10:00.000Z', 'Hamburg', 'Crates collected.'],
      ['in_transit', '2026-10-13T17:45:00.000Z', 'English Channel', 'Connected to the westbound string.'],
    ],
  }),
  shipment({
    id: 'shp-1012',
    trackingNumber: 'HL-26114-128',
    customer: 'Blue Crate',
    origin: 'Rotterdam',
    destination: 'Busan',
    carrier: 'Coast Road',
    weightKg: 640,
    eta: '2026-10-05',
    createdAt: '2026-09-18T06:15:00.000Z',
    steps: [
      ['created', '2026-09-18T06:15:00.000Z', 'Rotterdam', 'Booking confirmed.'],
      ['picked_up', '2026-09-19T13:40:00.000Z', 'Rotterdam', 'Picked up from the shipper.'],
      ['in_transit', '2026-09-24T08:00:00.000Z', 'Suez', 'Transit recorded.'],
      ['delivered', '2026-10-05T04:30:00.000Z', 'Busan', 'Empty return is still outstanding. Cargo was delivered.'],
    ],
  }),
  shipment({
    id: 'shp-1013',
    trackingNumber: 'HL-26115-073',
    customer: 'Helio Pharma',
    origin: 'Singapore',
    destination: 'Newark',
    carrier: 'Harborline Air',
    weightKg: 42.5,
    eta: '2026-10-17',
    createdAt: '2026-10-13T21:10:00.000Z',
    steps: [
      ['created', '2026-10-13T21:10:00.000Z', 'Singapore', 'Temperature-controlled air booking opened.'],
      ['picked_up', '2026-10-14T06:00:00.000Z', 'Singapore', 'Accepted with the data logger attached.'],
      ['in_transit', '2026-10-15T19:25:00.000Z', 'Anchorage', 'Transferred to the onward flight.'],
      ['out_for_delivery', '2026-10-17T12:05:00.000Z', 'Newark', 'With the pharma cartage agent.'],
    ],
  }),
  shipment({
    id: 'shp-1014',
    trackingNumber: 'HL-26116-256',
    customer: 'Kite Instruments',
    origin: 'Busan',
    destination: 'Los Angeles',
    carrier: 'Northline',
    weightKg: 310,
    eta: '2026-10-29',
    createdAt: '2026-10-16T01:55:00.000Z',
    steps: [['created', '2026-10-16T01:55:00.000Z', 'Busan', 'Booking confirmed. Pickup is tomorrow.']],
  }),
  shipment({
    id: 'shp-1015',
    trackingNumber: 'HL-26117-019',
    customer: 'Red Lantern Spice',
    origin: 'Jebel Ali',
    destination: 'Felixstowe',
    carrier: 'Meridian Freight',
    weightKg: 890,
    eta: '2026-10-20',
    createdAt: '2026-10-02T09:45:00.000Z',
    steps: [
      ['created', '2026-10-02T09:45:00.000Z', 'Jebel Ali', 'Booking confirmed.'],
      ['picked_up', '2026-10-03T14:20:00.000Z', 'Jebel Ali', 'Drums collected.'],
      ['exception', '2026-10-15T11:35:00.000Z', 'Jebel Ali', 'Customs query on the commercial invoice.'],
    ],
  }),
  shipment({
    id: 'shp-1016',
    trackingNumber: 'HL-26118-144',
    customer: 'Glass Harbor',
    origin: 'Los Angeles',
    destination: 'Shanghai',
    carrier: 'Harborline Air',
    weightKg: 150,
    eta: '2026-10-03',
    createdAt: '2026-09-20T16:00:00.000Z',
    steps: [
      ['created', '2026-09-20T16:00:00.000Z', 'Los Angeles', 'Booking confirmed.'],
      ['picked_up', '2026-09-21T18:30:00.000Z', 'Los Angeles', 'Crates accepted.'],
      ['in_transit', '2026-09-22T07:10:00.000Z', 'Pacific route', 'Flight departed.'],
      ['delivered', '2026-10-03T09:20:00.000Z', 'Shanghai', 'Delivered. One crate noted with scuffed wrapping.'],
    ],
  }),
  shipment({
    id: 'shp-1017',
    trackingNumber: 'HL-26119-088',
    customer: 'Metro Cold Chain',
    origin: 'Newark',
    destination: 'Rotterdam',
    carrier: 'Coast Road',
    weightKg: 2100,
    eta: '2026-10-24',
    createdAt: '2026-10-15T20:30:00.000Z',
    steps: [
      ['created', '2026-10-15T20:30:00.000Z', 'Newark', 'Reefer booking confirmed.'],
      ['picked_up', '2026-10-16T13:15:00.000Z', 'Newark', 'Set point checked at pickup.'],
    ],
  }),
  shipment({
    id: 'shp-1018',
    trackingNumber: 'HL-26120-003',
    customer: 'Pioneer Tools',
    origin: 'Felixstowe',
    destination: 'Santos',
    carrier: 'Northline',
    weightKg: 1750,
    eta: '2026-11-06',
    createdAt: '2026-10-17T08:05:00.000Z',
    steps: [['created', '2026-10-17T08:05:00.000Z', 'Felixstowe', 'Booking confirmed this morning.']],
  }),
];
