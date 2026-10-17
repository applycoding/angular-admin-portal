import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { sampleShipment } from '../../testing/shipment.fixture';
import { shipmentActions } from './state/shipment.actions';
import { shipmentsInitialState, shipmentsReducer } from './state/shipment.reducer';
import { ShipmentsTableComponent } from './shipments-table.component';

describe('ShipmentsTableComponent', () => {
  const shipment = sampleShipment();

  beforeEach(async () => {
    const state = shipmentsReducer(
      shipmentsInitialState,
      shipmentActions.loadPageSuccess({
        result: { items: [shipment], total: 18, page: 0, pageSize: 8 },
      }),
    );
    await TestBed.configureTestingModule({
      imports: [ShipmentsTableComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideMockStore({ initialState: { shipments: state } }),
      ],
    }).compileComponents();
  });

  it('renders the tracking number from the store page', async () => {
    const fixture = TestBed.createComponent(ShipmentsTableComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(shipment.trackingNumber);
    expect(fixture.nativeElement.textContent).toContain('Northwind Retail');
  });

  it('asks the store for another page', () => {
    const fixture = TestBed.createComponent(ShipmentsTableComponent);
    const dispatch = jest.spyOn(TestBed.inject(MockStore), 'dispatch');
    fixture.componentInstance.onPage({ pageIndex: 1, pageSize: 16, length: 18 });
    expect(dispatch).toHaveBeenCalledWith(
      shipmentActions.queryChanged({ query: { page: 1, pageSize: 16 } }),
    );
  });
});
