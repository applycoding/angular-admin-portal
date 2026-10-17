import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type {
  ApiErrorCode,
  PagedShipments,
  Shipment,
  ShipmentDraft,
  ShipmentListQuery,
  StatusEventDraft,
} from '../../../core/models/shipment.model';

export const shipmentActions = createActionGroup({
  source: 'Shipments',
  events: {
    'Query Changed': props<{ query: Partial<ShipmentListQuery> }>(),
    'Load Page': emptyProps(),
    'Load Page Success': props<{ result: PagedShipments }>(),
    'Load Page Failure': props<{ error: ApiErrorCode }>(),
    'Load One': props<{ id: string }>(),
    'Load One Success': props<{ shipment: Shipment }>(),
    'Load One Failure': props<{ error: ApiErrorCode }>(),
    'Create Shipment': props<{ draft: ShipmentDraft }>(),
    'Create Shipment Success': props<{ shipment: Shipment }>(),
    'Create Shipment Failure': props<{ error: ApiErrorCode }>(),
    'Add Event': props<{ id: string; event: StatusEventDraft }>(),
    'Add Event Success': props<{ shipment: Shipment }>(),
    'Add Event Failure': props<{ error: ApiErrorCode }>(),
    'Clear Save State': emptyProps(),
  },
});
