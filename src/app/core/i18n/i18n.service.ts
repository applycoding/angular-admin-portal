import { Injectable, signal } from '@angular/core';

import { TRANSLATIONS, type LocaleId, type MessageKey } from './translations';

export const LOCALE_STORAGE_KEY = 'harborline.demo.locale';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<LocaleId>(readLocale());

  t(key: MessageKey, params?: Record<string, string | number>): string {
    const template = TRANSLATIONS[this.locale()][key];
    if (!params) {
      return template;
    }
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (full, name: string) => {
      const value = params[name];
      return value === undefined ? full : String(value);
    });
  }

  setLocale(locale: LocaleId): void {
    this.locale.set(locale);
    storage()?.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

function readLocale(): LocaleId {
  return storage()?.getItem(LOCALE_STORAGE_KEY) === 'es' ? 'es' : 'en';
}

function storage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}
