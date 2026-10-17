export const SHIPMENT_STATUSES = [
  'created',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'exception',
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const SHIPMENT_SORT_FIELDS = [
  'trackingNumber',
  'customer',
  'origin',
  'destination',
  'status',
  'eta',
  'createdAt',
] as const;

export type ShipmentSortField = (typeof SHIPMENT_SORT_FIELDS)[number];

export const PAGE_SIZE_OPTIONS = [8, 16, 32] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export const TRACKING_PATTERN = /^HL-\d{5}-\d{3}$/;

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface StatusEvent {
  status: ShipmentStatus;
  at: string;
  location: string;
  note: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  customer: string;
  origin: string;
  destination: string;
  carrier: string;
  weightKg: number;
  status: ShipmentStatus;
  eta: string;
  createdAt: string;
  events: StatusEvent[];
}

export interface ShipmentDraft {
  trackingNumber: string;
  customer: string;
  origin: string;
  destination: string;
  carrier: string;
  weightKg: number;
  eta: string;
}

export interface StatusEventDraft {
  status: ShipmentStatus;
  location: string;
  note: string;
}

export interface ShipmentListQuery {
  page: number;
  pageSize: PageSizeOption;
  sort: ShipmentSortField;
  order: 'asc' | 'desc';
  search: string;
  status: ShipmentStatus | '';
}

export interface PagedShipments {
  items: Shipment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ShipmentSummary {
  total: number;
  byStatus: Record<ShipmentStatus, number>;
}

export type ApiErrorCode = 'load_failed' | 'not_found' | 'save_failed' | 'conflict';

export const DEFAULT_QUERY: ShipmentListQuery = {
  page: 0,
  pageSize: 8,
  sort: 'createdAt',
  order: 'desc',
  search: '',
  status: '',
};

export function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value);
}

export function isShipmentSortField(value: string): value is ShipmentSortField {
  return (SHIPMENT_SORT_FIELDS as readonly string[]).includes(value);
}

export function isPageSize(value: number): value is PageSizeOption {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(value);
}
