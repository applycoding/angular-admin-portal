import {
  DEFAULT_QUERY,
  isPageSize,
  isShipmentSortField,
  isShipmentStatus,
  type PagedShipments,
  type Shipment,
  type ShipmentListQuery,
  type ShipmentSortField,
} from '../models/shipment.model';

export function parseShipmentListQuery(raw: {
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
  search?: string;
  status?: string;
}): ShipmentListQuery {
  const page = Number(raw.page);
  const pageSize = Number(raw.pageSize);
  return {
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: isPageSize(pageSize) ? pageSize : DEFAULT_QUERY.pageSize,
    sort: raw.sort && isShipmentSortField(raw.sort) ? raw.sort : DEFAULT_QUERY.sort,
    order: raw.order === 'asc' || raw.order === 'desc' ? raw.order : DEFAULT_QUERY.order,
    search: (raw.search ?? '').slice(0, 80),
    status: raw.status && isShipmentStatus(raw.status) ? raw.status : '',
  };
}

export function queryShipments(
  shipments: readonly Shipment[],
  query: ShipmentListQuery,
): PagedShipments {
  const search = query.search.trim().toLowerCase();
  const filtered = shipments.filter(shipment => {
    if (query.status && shipment.status !== query.status) {
      return false;
    }
    if (!search) {
      return true;
    }
    return [shipment.trackingNumber, shipment.customer, shipment.origin, shipment.destination, shipment.carrier]
      .join(' ')
      .toLowerCase()
      .includes(search);
  });

  const sorted = filtered.slice().sort((left, right) => {
    const result = fieldValue(left, query.sort).localeCompare(fieldValue(right, query.sort), 'en', {
      numeric: true,
      sensitivity: 'base',
    });
    return query.order === 'asc' ? result : -result;
  });

  const pageCount = Math.max(1, Math.ceil(sorted.length / query.pageSize));
  const page = Math.min(query.page, pageCount - 1);
  const start = page * query.pageSize;
  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    page,
    pageSize: query.pageSize,
  };
}

function fieldValue(shipment: Shipment, sort: ShipmentSortField): string {
  switch (sort) {
    case 'trackingNumber':
      return shipment.trackingNumber;
    case 'customer':
      return shipment.customer;
    case 'origin':
      return shipment.origin;
    case 'destination':
      return shipment.destination;
    case 'status':
      return shipment.status;
    case 'eta':
      return shipment.eta;
    case 'createdAt':
      return shipment.createdAt;
    default: {
      const unknown: never = sort;
      return unknown;
    }
  }
}
