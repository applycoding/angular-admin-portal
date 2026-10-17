import { effect, inject, Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { I18nService } from '../../core/i18n/i18n.service';

@Injectable()
export class HarborlinePaginatorIntl extends MatPaginatorIntl {
  private readonly i18n = inject(I18nService);

  constructor() {
    super();
    this.applyLabels();
    effect(() => {
      this.i18n.locale();
      this.applyLabels();
    });
  }

  private applyLabels(): void {
    this.itemsPerPageLabel = this.i18n.t('paginator.itemsPerPage');
    this.nextPageLabel = this.i18n.t('paginator.next');
    this.previousPageLabel = this.i18n.t('paginator.previous');
    this.firstPageLabel = this.i18n.t('paginator.first');
    this.lastPageLabel = this.i18n.t('paginator.last');
    this.getRangeLabel = (page, pageSize, length) => {
      if (length === 0 || pageSize === 0) {
        return this.i18n.t('paginator.rangeEmpty', { length });
      }
      const start = page * pageSize + 1;
      const end = Math.min((page + 1) * pageSize, length);
      return this.i18n.t('paginator.range', { start, end, length });
    };
    this.changes.next();
  }
}
