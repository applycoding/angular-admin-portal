import { DEFAULT_QUERY } from '../models/shipment.model';
import { sampleShipment } from '../../testing/shipment.fixture';
import { parseShipmentListQuery, queryShipments } from './shipment-query';

describe('queryShipments', () => {
  const rows = [
    sampleShipment({
      id: 'shp-1',
      customer: 'Northwind Retail',
      status: 'created',
      createdAt: '2026-10-01T00:00:00.000Z',
    }),
    sampleShipment({
      id: 'shp-2',
      customer: 'Keel & Co.',
      status: 'in_transit',
      createdAt: '2026-10-03T00:00:00.000Z',
    }),
    sampleShipment({
      id: 'shp-3',
      customer: 'Northwind Parts',
      status: 'delivered',
      createdAt: '2026-10-02T00:00:00.000Z',
    }),
  ];

  it('filters by status and reports the filtered total', () => {
    const page = queryShipments(rows, { ...DEFAULT_QUERY, status: 'created' });
    expect(page.total).toBe(1);
    expect(page.items.map(item => item.id)).toEqual(['shp-1']);
  });

  it('searches customer names without regard to case', () => {
    const page = queryShipments(rows, { ...DEFAULT_QUERY, search: 'northwind' });
    expect(page.items.map(item => item.id)).toEqual(['shp-3', 'shp-1']);
    expect(page.total).toBe(2);
  });

  it('sorts newest bookings first and clamps an out-of-range page', () => {
    const page = queryShipments(rows, { ...DEFAULT_QUERY, sort: 'createdAt', order: 'desc' });
    expect(page.items.map(item => item.id)).toEqual(['shp-2', 'shp-3', 'shp-1']);
    const clamped = queryShipments(rows, { ...DEFAULT_QUERY, page: 9 });
    expect(clamped.page).toBe(0);
    expect(clamped.items).toHaveLength(3);
    expect(clamped.total).toBe(3);
  });

  it('rejects unknown sort and page size values', () => {
    expect(
      parseShipmentListQuery({
        page: '-3',
        pageSize: '100',
        sort: 'weight',
        order: 'sideways',
        status: 'lost',
      }),
    ).toEqual(DEFAULT_QUERY);
  });
});
