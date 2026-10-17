import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { shipmentActions } from './state/shipment.actions';
import { shipmentsInitialState } from './state/shipment.reducer';
import { ShipmentFormComponent } from './shipment-form.component';

describe('ShipmentFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentFormComponent],
      providers: [
        provideNoopAnimations(),
        provideMockStore({ initialState: { shipments: shipmentsInitialState } }),
      ],
    }).compileComponents();
  });

  it('shows required errors and blocks matching origin and destination', async () => {
    const fixture = TestBed.createComponent(ShipmentFormComponent);
    fixture.componentInstance.submit();
    fixture.componentInstance.form.patchValue({ origin: 'Rotterdam', destination: 'Rotterdam' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('This field is required.');
    expect(fixture.componentInstance.form.hasError('sameRoute')).toBe(true);
  });

  it('dispatches a create action for a valid draft', () => {
    const fixture = TestBed.createComponent(ShipmentFormComponent);
    const store = TestBed.inject(MockStore);
    const dispatch = jest.spyOn(store, 'dispatch');
    fixture.componentInstance.form.setValue({
      trackingNumber: 'HL-26121-010',
      customer: 'Northwind Retail',
      origin: 'Rotterdam',
      destination: 'Newark',
      carrier: 'Northline',
      weightKg: 10,
      eta: '2026-10-30',
    });
    fixture.componentInstance.submit();
    expect(dispatch).toHaveBeenCalledWith(
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
  });
});
