import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import type { User } from '../../core/models/user.model';
import { sampleShipment } from '../../testing/shipment.fixture';
import { shipmentActions } from './state/shipment.actions';
import { shipmentsInitialState, shipmentsReducer } from './state/shipment.reducer';
import { ShipmentDetailComponent } from './shipment-detail.component';

describe('ShipmentDetailComponent', () => {
  const shipment = sampleShipment();
  const session: { user: User } = {
    user: {
      id: 'usr-dispatch',
      name: 'Harborline Dispatch',
      email: 'dispatch@harborline.example',
      role: 'dispatcher',
    },
  };

  function setup(): void {
    const state = shipmentsReducer(
      shipmentsInitialState,
      shipmentActions.loadOneSuccess({ shipment }),
    );
    TestBed.configureTestingModule({
      imports: [ShipmentDetailComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideMockStore({ initialState: { shipments: state } }),
        { provide: AuthService, useValue: { user: () => session.user } },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: shipment.id })) },
        },
      ],
    });
  }

  it('renders the status timeline', async () => {
    setup();
    const fixture = TestBed.createComponent(ShipmentDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Booking confirmed with the warehouse.');
    expect(fixture.nativeElement.textContent).toContain('Vessel departed on the scheduled rotation.');
    expect(fixture.nativeElement.textContent).toContain('Add a status event');
  });

  it('hides the update form from a viewer', async () => {
    session.user = { ...session.user, role: 'viewer' };
    setup();
    const fixture = TestBed.createComponent(ShipmentDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Add a status event');
    session.user = { ...session.user, role: 'dispatcher' };
  });
});
