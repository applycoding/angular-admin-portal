import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, tap, withLatestFrom } from 'rxjs';

import { apiErrorCode } from '../../../core/api/api-error';
import { ShipmentService } from '../shipment.service';
import { shipmentActions } from './shipment.actions';
import { selectQuery } from './shipment.reducer';

@Injectable()
export class ShipmentsEffects {
  private readonly actions$ = inject(Actions);
  private readonly shipments = inject(ShipmentService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly queryChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(shipmentActions.queryChanged),
      map(() => shipmentActions.loadPage()),
    ),
  );

  readonly loadPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(shipmentActions.loadPage),
      withLatestFrom(this.store.select(selectQuery)),
      switchMap(([, query]) =>
        this.shipments.getPage(query).pipe(
          map(result => shipmentActions.loadPageSuccess({ result })),
          catchError((error: unknown) =>
            of(shipmentActions.loadPageFailure({ error: apiErrorCode(error, 'load_failed') })),
          ),
        ),
      ),
    ),
  );

  readonly loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(shipmentActions.loadOne),
      switchMap(({ id }) =>
        this.shipments.getById(id).pipe(
          map(shipment => shipmentActions.loadOneSuccess({ shipment })),
          catchError((error: unknown) =>
            of(shipmentActions.loadOneFailure({ error: apiErrorCode(error, 'load_failed') })),
          ),
        ),
      ),
    ),
  );

  readonly createShipment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(shipmentActions.createShipment),
      exhaustMap(({ draft }) =>
        this.shipments.create(draft).pipe(
          map(shipment => shipmentActions.createShipmentSuccess({ shipment })),
          catchError((error: unknown) =>
            of(shipmentActions.createShipmentFailure({ error: apiErrorCode(error, 'save_failed') })),
          ),
        ),
      ),
    ),
  );

  readonly addEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(shipmentActions.addEvent),
      exhaustMap(({ id, event }) =>
        this.shipments.addEvent(id, event).pipe(
          map(shipment => shipmentActions.addEventSuccess({ shipment })),
          catchError((error: unknown) =>
            of(shipmentActions.addEventFailure({ error: apiErrorCode(error, 'save_failed') })),
          ),
        ),
      ),
    ),
  );

  readonly navigateAfterCreate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(shipmentActions.createShipmentSuccess),
        tap(({ shipment }) => {
          void this.router.navigate(['/shipments', shipment.id]);
        }),
      ),
    { dispatch: false },
  );
}
