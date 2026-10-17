import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';

import { apiErrorMessageKey } from '../../core/i18n/labels';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { CARRIERS, PLACES } from '../../core/models/shipment-options';
import { DATE_PATTERN, TRACKING_PATTERN } from '../../core/models/shipment.model';
import { shipmentActions } from './state/shipment.actions';
import { selectSaveError, selectSaving } from './state/shipment.reducer';

function differentPlaces(control: AbstractControl): ValidationErrors | null {
  const origin = control.get('origin')?.value;
  const destination = control.get('destination')?.value;
  if (typeof origin === 'string' && origin && origin === destination) {
    return { sameRoute: true };
  }
  return null;
}

@Component({
  selector: 'app-shipment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, TranslatePipe],
  templateUrl: './shipment-form.component.html',
})
export class ShipmentFormComponent {
  private readonly store = inject(Store);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly places = PLACES;
  protected readonly carriers = CARRIERS;
  protected readonly saving = this.store.selectSignal(selectSaving);
  protected readonly saveError = this.store.selectSignal(selectSaveError);
  protected readonly apiErrorMessageKey = apiErrorMessageKey;
  readonly form = this.formBuilder.group(
    {
      trackingNumber: this.formBuilder.nonNullable.control('', [
        Validators.required,
        Validators.pattern(TRACKING_PATTERN),
      ]),
      customer: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(80)]),
      origin: this.formBuilder.nonNullable.control('', Validators.required),
      destination: this.formBuilder.nonNullable.control('', Validators.required),
      carrier: this.formBuilder.nonNullable.control('', Validators.required),
      weightKg: this.formBuilder.control<number | null>(null, [
        Validators.required,
        Validators.min(0.1),
        Validators.max(30000),
      ]),
      eta: this.formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(DATE_PATTERN)]),
    },
    { validators: differentPlaces },
  );

  constructor() {
    this.store.dispatch(shipmentActions.clearSaveState());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    if (raw.weightKg === null) {
      return;
    }
    this.store.dispatch(
      shipmentActions.createShipment({
        draft: {
          trackingNumber: raw.trackingNumber.trim(),
          customer: raw.customer.trim(),
          origin: raw.origin,
          destination: raw.destination,
          carrier: raw.carrier,
          weightKg: raw.weightKg,
          eta: raw.eta,
        },
      }),
    );
  }
}
