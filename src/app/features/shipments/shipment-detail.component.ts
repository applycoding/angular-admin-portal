import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessageKey, statusMessageKey } from '../../core/i18n/labels';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { SHIPMENT_STATUSES, type ShipmentStatus } from '../../core/models/shipment.model';
import { shipmentActions } from './state/shipment.actions';
import {
  selectError,
  selectSaveError,
  selectSaving,
  selectSelectedShipment,
} from './state/shipment.reducer';

@Component({
  selector: 'app-shipment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
  ],
  templateUrl: './shipment-detail.component.html',
})
export class ShipmentDetailComponent {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private sawSaving = false;

  protected readonly shipmentId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id') ?? '')),
    { initialValue: '' },
  );
  protected readonly shipment = this.store.selectSignal(selectSelectedShipment);
  protected readonly error = this.store.selectSignal(selectError);
  protected readonly saving = this.store.selectSignal(selectSaving);
  protected readonly saveError = this.store.selectSignal(selectSaveError);
  protected readonly saved = signal(false);
  protected readonly statuses = SHIPMENT_STATUSES;
  protected readonly statusMessageKey = statusMessageKey;
  protected readonly apiErrorMessageKey = apiErrorMessageKey;
  protected readonly canUpdate = computed(() => {
    const role = this.auth.user()?.role;
    return role === 'admin' || role === 'dispatcher';
  });
  protected readonly eventForm = this.formBuilder.group({
    status: this.formBuilder.nonNullable.control<ShipmentStatus>('in_transit', Validators.required),
    location: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(80)]),
    note: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(240)]),
  });

  constructor() {
    effect(() => {
      const id = this.shipmentId();
      if (id) {
        this.store.dispatch(shipmentActions.loadOne({ id }));
      }
    });

    effect(() => {
      const saving = this.saving();
      const saveError = this.saveError();
      if (this.sawSaving && !saving && saveError === null) {
        this.saved.set(true);
        this.eventForm.patchValue({ location: '', note: '' });
        this.eventForm.markAsPristine();
        this.eventForm.markAsUntouched();
      }
      if (saving) {
        this.saved.set(false);
      }
      this.sawSaving = saving;
    });

    this.eventForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.saved.set(false));
  }

  protected submitEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }
    const id = this.shipmentId();
    if (!id) {
      return;
    }
    const { status, location, note } = this.eventForm.getRawValue();
    this.store.dispatch(shipmentActions.addEvent({ id, event: { status, location, note } }));
  }
}
