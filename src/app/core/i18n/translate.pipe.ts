import { inject, Pipe, type PipeTransform } from '@angular/core';

import { I18nService } from './i18n.service';
import type { MessageKey } from './translations';

@Pipe({
  name: 't',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: MessageKey, params?: Record<string, string | number>): string {
    this.i18n.locale();
    return this.i18n.t(key, params);
  }
}
