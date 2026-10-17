import { HttpErrorResponse } from '@angular/common/http';

import type { ApiErrorCode } from '../models/shipment.model';

export function apiErrorCode(error: unknown, fallback: ApiErrorCode): ApiErrorCode {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 404) {
      return 'not_found';
    }
    if (error.status === 409) {
      return 'conflict';
    }
  }
  return fallback;
}
