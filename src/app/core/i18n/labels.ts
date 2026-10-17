import type { ApiErrorCode, ShipmentStatus } from '../models/shipment.model';
import type { Role } from '../models/user.model';
import type { MessageKey } from './translations';

export function statusMessageKey(status: ShipmentStatus): MessageKey {
  switch (status) {
    case 'created':
      return 'status.created';
    case 'picked_up':
      return 'status.picked_up';
    case 'in_transit':
      return 'status.in_transit';
    case 'out_for_delivery':
      return 'status.out_for_delivery';
    case 'delivered':
      return 'status.delivered';
    case 'exception':
      return 'status.exception';
    default: {
      const unknown: never = status;
      return unknown;
    }
  }
}

export function roleMessageKey(role: Role): MessageKey {
  switch (role) {
    case 'admin':
      return 'auth.roleAdmin';
    case 'dispatcher':
      return 'auth.roleDispatcher';
    case 'viewer':
      return 'auth.roleViewer';
    default: {
      const unknown: never = role;
      return unknown;
    }
  }
}

export function apiErrorMessageKey(code: ApiErrorCode): MessageKey {
  switch (code) {
    case 'load_failed':
      return 'errors.loadFailed';
    case 'not_found':
      return 'errors.notFound';
    case 'save_failed':
      return 'errors.saveFailed';
    case 'conflict':
      return 'errors.conflict';
    default: {
      const unknown: never = code;
      return unknown;
    }
  }
}
