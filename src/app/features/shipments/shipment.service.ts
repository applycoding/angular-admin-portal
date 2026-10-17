import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type {
  PagedShipments,
  Shipment,
  ShipmentDraft,
  ShipmentListQuery,
  ShipmentSummary,
  StatusEventDraft,
} from '../../core/models/shipment.model';

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  private readonly http = inject(HttpClient);

  getPage(query: ShipmentListQuery): Observable<PagedShipments> {
    const params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize)
      .set('sort', query.sort)
      .set('order', query.order)
      .set('search', query.search)
      .set('status', query.status);
    return this.http.get<PagedShipments>('api/shipments', { params });
  }

  getById(id: string): Observable<Shipment> {
    return this.http.get<Shipment>(`api/shipments/${id}`);
  }

  create(draft: ShipmentDraft): Observable<Shipment> {
    return this.http.post<Shipment>('api/shipments', draft);
  }

  addEvent(id: string, event: StatusEventDraft): Observable<Shipment> {
    return this.http.post<Shipment>(`api/shipments/${id}/events`, event);
  }

  summary(): Observable<ShipmentSummary> {
    return this.http.get<ShipmentSummary>('api/shipments', {
      params: new HttpParams().set('view', 'summary'),
    });
  }
}
