import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import type { Routes } from '@angular/router';

import { roleGuard } from '../../core/auth/role.guard';
import { ShipmentsEffects } from './state/shipment.effects';
import { shipmentsFeature } from './state/shipment.reducer';

export const SHIPMENT_ROUTES: Routes = [
  {
    path: '',
    providers: [provideState(shipmentsFeature), provideEffects(ShipmentsEffects)],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./shipments-table.component').then(module => module.ShipmentsTableComponent),
        data: { titleKey: 'nav.shipments' },
      },
      {
        path: 'new',
        canActivate: [roleGuard(['admin', 'dispatcher'])],
        loadComponent: () =>
          import('./shipment-form.component').then(module => module.ShipmentFormComponent),
        data: { titleKey: 'nav.newShipment' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./shipment-detail.component').then(module => module.ShipmentDetailComponent),
        data: { titleKey: 'shipment.detailTitle' },
      },
    ],
  },
];
