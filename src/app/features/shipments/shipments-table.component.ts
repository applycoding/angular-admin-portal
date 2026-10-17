import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, type PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, type Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { debounceTime, Subject } from 'rxjs';

import { apiErrorMessageKey, statusMessageKey } from '../../core/i18n/labels';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import {
  PAGE_SIZE_OPTIONS,
  SHIPMENT_STATUSES,
  isShipmentSortField,
  isShipmentStatus,
  type ShipmentListQuery,
} from '../../core/models/shipment.model';
import { HarborlinePaginatorIntl } from './paginator-intl';
import { shipmentActions } from './state/shipment.actions';
import {
  selectError,
  selectLoading,
  selectPageItems,
  selectQuery,
  selectTotal,
} from './state/shipment.reducer';

@Component({
  selector: 'app-shipments-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    TranslatePipe,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: HarborlinePaginatorIntl }],
  templateUrl: './shipments-table.component.html',
})
export class ShipmentsTableComponent {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$ = new Subject<string>();

  protected readonly rows = this.store.selectSignal(selectPageItems);
  protected readonly total = this.store.selectSignal(selectTotal);
  protected readonly loading = this.store.selectSignal(selectLoading);
  protected readonly error = this.store.selectSignal(selectError);
  protected readonly query = this.store.selectSignal(selectQuery);
  protected readonly statuses = SHIPMENT_STATUSES;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly columns = ['trackingNumber', 'customer', 'origin', 'destination', 'status', 'eta', 'view'];
  protected readonly statusMessageKey = statusMessageKey;
  protected readonly apiErrorMessageKey = apiErrorMessageKey;

  constructor() {
    this.search$.pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef)).subscribe(search => {
      this.store.dispatch(shipmentActions.queryChanged({ query: { search, page: 0 } }));
    });
    this.store.dispatch(shipmentActions.loadPage());
  }

  protected onSearch(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.search$.next(target.value);
  }

  protected onStatus(value: string): void {
    if (value !== '' && !isShipmentStatus(value)) {
      return;
    }
    const status: ShipmentListQuery['status'] = value === '' ? '' : value;
    this.store.dispatch(shipmentActions.queryChanged({ query: { status, page: 0 } }));
  }

  protected onSort(sort: Sort): void {
    if (!isShipmentSortField(sort.active)) {
      return;
    }
    const order = sort.direction === 'asc' ? 'asc' : 'desc';
    this.store.dispatch(
      shipmentActions.queryChanged({ query: { sort: sort.active, order, page: 0 } }),
    );
  }

  onPage(event: PageEvent): void {
    const pageSize = PAGE_SIZE_OPTIONS.find(option => option === event.pageSize) ?? this.query().pageSize;
    this.store.dispatch(
      shipmentActions.queryChanged({ query: { page: event.pageIndex, pageSize } }),
    );
  }

  protected retry(): void {
    this.store.dispatch(shipmentActions.loadPage());
  }
}
