import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { statusMessageKey } from '../../core/i18n/labels';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { SHIPMENT_STATUSES, type ShipmentSummary } from '../../core/models/shipment.model';
import { ShipmentService } from '../shipments/shipment.service';

type SummaryView =
  | { kind: 'loading'; summary: null }
  | { kind: 'error'; summary: null }
  | { kind: 'ready'; summary: ShipmentSummary };

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly shipments = inject(ShipmentService);
  private readonly attempt = signal(0);

  protected readonly userName = this.auth.user;
  protected readonly statuses = SHIPMENT_STATUSES;
  protected readonly statusMessageKey = statusMessageKey;
  protected readonly summaryState = toSignal(
    toObservable(this.attempt).pipe(
      switchMap(() =>
        this.shipments.summary().pipe(
          map(summary => ({ kind: 'ready', summary }) as const),
          catchError(() => of({ kind: 'error', summary: null } as const)),
          startWith({ kind: 'loading', summary: null } as const),
        ),
      ),
    ),
    { initialValue: { kind: 'loading', summary: null } satisfies SummaryView },
  );

  protected retry(): void {
    this.attempt.update(value => value + 1);
  }
}
