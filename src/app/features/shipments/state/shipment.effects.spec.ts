import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, of, throwError } from 'rxjs';

import { DEFAULT_QUERY } from '../../../core/models/shipment.model';
import { sampleShipment } from '../../../testing/shipment.fixture';
import { ShipmentService } from '../shipment.service';
import { shipmentActions } from './shipment.actions';
import { ShipmentsEffects } from './shipment.effects';
import { selectQuery, shipmentsInitialState } from './shipment.reducer';

describe('ShipmentsEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: ShipmentsEffects;
  const shipment = sampleShipment();
  const api = {
    getPage: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    addEvent: jest.fn(),
    summary: jest.fn(),
  };
  const router = { navigate: jest.fn().mockResolvedValue(true) };

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    api.getPage.mockReset();
    TestBed.configureTestingModule({
      providers: [
        ShipmentsEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: { shipments: shipmentsInitialState },
          selectors: [{ selector: selectQuery, value: DEFAULT_QUERY }],
        }),
        { provide: ShipmentService, useValue: api },
        { provide: Router, useValue: router },
      ],
    });
    effects = TestBed.inject(ShipmentsEffects);
  });

  it('loads a page from the shipment service', () => {
    const result = { items: [shipment], total: 1, page: 0, pageSize: 8 };
    api.getPage.mockReturnValue(of(result));
    const received: Action[] = [];
    effects.loadPage$.subscribe(action => received.push(action));
    actions$.next(shipmentActions.loadPage());
    expect(api.getPage).toHaveBeenCalledWith(DEFAULT_QUERY);
    expect(received).toEqual([shipmentActions.loadPageSuccess({ result })]);
  });

  it('maps an HTTP failure to a load error', () => {
    api.getPage.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const received: Action[] = [];
    effects.loadPage$.subscribe(action => received.push(action));
    actions$.next(shipmentActions.loadPage());
    expect(received).toEqual([shipmentActions.loadPageFailure({ error: 'not_found' })]);
  });

  it('creates a shipment and navigates to it', () => {
    const draft = {
      trackingNumber: shipment.trackingNumber,
      customer: shipment.customer,
      origin: shipment.origin,
      destination: shipment.destination,
      carrier: shipment.carrier,
      weightKg: shipment.weightKg,
      eta: shipment.eta,
    };
    api.create.mockReturnValue(of(shipment));
    const received: Action[] = [];
    effects.createShipment$.subscribe(action => received.push(action));
    effects.navigateAfterCreate$.subscribe();
    actions$.next(shipmentActions.createShipment({ draft }));
    expect(received).toEqual([shipmentActions.createShipmentSuccess({ shipment })]);
    actions$.next(shipmentActions.createShipmentSuccess({ shipment }));
    expect(router.navigate).toHaveBeenCalledWith(['/shipments', shipment.id]);
  });

  it('maps a rejected create to a save failure', () => {
    api.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    const received: Action[] = [];
    effects.createShipment$.subscribe(action => received.push(action));
    actions$.next(
      shipmentActions.createShipment({
        draft: {
          trackingNumber: 'HL-26121-010',
          customer: 'Northwind Retail',
          origin: 'Rotterdam',
          destination: 'Newark',
          carrier: 'Northline',
          weightKg: 10,
          eta: '2026-10-30',
        },
      }),
    );
    expect(received).toEqual([shipmentActions.createShipmentFailure({ error: 'conflict' })]);
  });
});
