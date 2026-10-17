import { sampleShipment } from '../../../testing/shipment.fixture';
import { shipmentActions } from './shipment.actions';
import { shipmentsInitialState, shipmentsReducer } from './shipment.reducer';

describe('shipmentsReducer', () => {
  const shipment = sampleShipment();

  it('stores the server page without dropping the query page size', () => {
    const loading = shipmentsReducer(shipmentsInitialState, shipmentActions.loadPage());
    expect(loading.loading).toBe(true);
    const loaded = shipmentsReducer(
      loading,
      shipmentActions.loadPageSuccess({
        result: { items: [shipment], total: 18, page: 0, pageSize: 8 },
      }),
    );
    expect(loaded.loading).toBe(false);
    expect(loaded.total).toBe(18);
    expect(loaded.pageIds).toEqual([shipment.id]);
    expect(loaded.entities[shipment.id]).toEqual(shipment);
    expect(loaded.query.pageSize).toBe(8);
  });

  it('merges a search into the query and keeps the page size', () => {
    const next = shipmentsReducer(
      shipmentsInitialState,
      shipmentActions.queryChanged({ query: { search: 'keel', page: 0 } }),
    );
    expect(next.query.search).toBe('keel');
    expect(next.query.pageSize).toBe(shipmentsInitialState.query.pageSize);
  });

  it('records a load failure and stops the loading flag', () => {
    const next = shipmentsReducer(
      { ...shipmentsInitialState, loading: true },
      shipmentActions.loadPageFailure({ error: 'load_failed' }),
    );
    expect(next.loading).toBe(false);
    expect(next.error).toBe('load_failed');
  });

  it('upserts a created shipment and clears the save error', () => {
    const saving = shipmentsReducer(
      shipmentsInitialState,
      shipmentActions.createShipment({
        draft: {
          trackingNumber: shipment.trackingNumber,
          customer: shipment.customer,
          origin: shipment.origin,
          destination: shipment.destination,
          carrier: shipment.carrier,
          weightKg: shipment.weightKg,
          eta: shipment.eta,
        },
      }),
    );
    expect(saving.saving).toBe(true);
    const saved = shipmentsReducer(saving, shipmentActions.createShipmentSuccess({ shipment }));
    expect(saved.saving).toBe(false);
    expect(saved.saveError).toBeNull();
    expect(saved.entities[shipment.id]?.trackingNumber).toBe(shipment.trackingNumber);
  });
});
