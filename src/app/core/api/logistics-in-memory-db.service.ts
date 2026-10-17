import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { InMemoryDbService } from 'angular-in-memory-web-api';

import { DEMO_ACCOUNTS, type DemoAccount } from '../auth/demo-accounts';
import { createDemoToken } from '../auth/token';
import { isCarrier, isPlace } from '../models/shipment-options';
import { isRecord } from '../models/records';
import {
  DATE_PATTERN,
  TRACKING_PATTERN,
  isShipmentStatus,
  type Shipment,
  type ShipmentDraft,
  type ShipmentStatus,
  type ShipmentSummary,
  type StatusEvent,
} from '../models/shipment.model';
import type { User } from '../models/user.model';
import { SEED_SHIPMENTS } from './seed';
import { parseShipmentListQuery, queryShipments } from './shipment-query';

interface LogisticsDatabase {
  shipments: Shipment[];
  users: DemoAccount[];
  auth: never[];
}

interface MemoryRequest {
  url: string;
  req: { headers?: { get(name: string): string | null } };
  collectionName: string;
  id: unknown;
  query: Map<string, string[]>;
  utils: {
    createResponse$: (factory: () => { status?: number; body?: unknown }) => Observable<unknown>;
    getJsonBody: (req: unknown) => unknown;
    getDb: () => object;
  };
}

@Injectable()
export class LogisticsInMemoryDbService implements InMemoryDbService {
  createDb(): LogisticsDatabase {
    return {
      shipments: structuredClone(SEED_SHIPMENTS) as Shipment[],
      users: DEMO_ACCOUNTS.map(account => ({ ...account })),
      auth: [],
    };
  }

  get(reqInfo: MemoryRequest): Observable<unknown> | undefined {
    if (reqInfo.collectionName !== 'shipments') {
      return this.respond(reqInfo, 404, { message: 'Not found' });
    }
    if (!this.authorized(reqInfo)) {
      return this.respond(reqInfo, 401, { message: 'Unauthorized' });
    }
    const database = this.database(reqInfo);
    if (!reqInfo.id && first(reqInfo.query, 'view') === 'summary') {
      return this.respond(reqInfo, 200, summary(database.shipments));
    }
    if (!reqInfo.id) {
      const page = queryShipments(
        database.shipments,
        parseShipmentListQuery({
          page: first(reqInfo.query, 'page'),
          pageSize: first(reqInfo.query, 'pageSize'),
          sort: first(reqInfo.query, 'sort'),
          order: first(reqInfo.query, 'order'),
          search: first(reqInfo.query, 'search'),
          status: first(reqInfo.query, 'status'),
        }),
      );
      return this.respond(reqInfo, 200, { ...page, items: structuredClone(page.items) });
    }
    const found = database.shipments.find(item => item.id === String(reqInfo.id));
    if (!found) {
      return this.respond(reqInfo, 404, { message: 'Not found' });
    }
    return this.respond(reqInfo, 200, structuredClone(found));
  }

  post(reqInfo: MemoryRequest): Observable<unknown> | undefined {
    if (reqInfo.collectionName === 'auth') {
      return this.login(reqInfo);
    }
    if (reqInfo.collectionName !== 'shipments') {
      return this.respond(reqInfo, 404, { message: 'Not found' });
    }
    if (!this.authorized(reqInfo)) {
      return this.respond(reqInfo, 401, { message: 'Unauthorized' });
    }
    if (reqInfo.url.includes('/events')) {
      return this.addEvent(reqInfo);
    }
    if (!reqInfo.id) {
      return this.createShipment(reqInfo);
    }
    return this.respond(reqInfo, 404, { message: 'Not found' });
  }

  put(reqInfo: MemoryRequest): Observable<unknown> {
    return this.respond(reqInfo, 404, { message: 'Not found' });
  }

  delete(reqInfo: MemoryRequest): Observable<unknown> {
    return this.respond(reqInfo, 404, { message: 'Not found' });
  }

  private login(reqInfo: MemoryRequest): Observable<unknown> {
    const body = reqInfo.utils.getJsonBody(reqInfo.req);
    const email = isRecord(body) && typeof body['email'] === 'string' ? body['email'].trim().toLowerCase() : '';
    const password = isRecord(body) && typeof body['password'] === 'string' ? body['password'] : '';
    const account = this.database(reqInfo).users.find(
      user => user.email === email && user.password === password,
    );
    if (!account) {
      return this.respond(reqInfo, 401, { message: 'Invalid email or password.' });
    }
    const user: User = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    };
    return this.respond(reqInfo, 200, { token: createDemoToken(user), user });
  }

  private createShipment(reqInfo: MemoryRequest): Observable<unknown> {
    const draft = readDraft(reqInfo.utils.getJsonBody(reqInfo.req));
    if (!draft) {
      return this.respond(reqInfo, 400, { message: 'Invalid shipment' });
    }
    const database = this.database(reqInfo);
    if (database.shipments.some(item => item.trackingNumber === draft.trackingNumber)) {
      return this.respond(reqInfo, 409, { message: 'Conflict' });
    }
    const now = new Date().toISOString();
    const shipment: Shipment = {
      ...draft,
      id: nextShipmentId(database.shipments),
      status: 'created',
      createdAt: now,
      events: [
        {
          status: 'created',
          at: now,
          location: draft.origin,
          note: 'Booking confirmed.',
        },
      ],
    };
    database.shipments.push(shipment);
    return this.respond(reqInfo, 201, structuredClone(shipment));
  }

  private addEvent(reqInfo: MemoryRequest): Observable<unknown> {
    const match = /shipments\/([^/?#]+)\/events/.exec(reqInfo.url);
    const id = match?.[1] ? decodeURIComponent(match[1]) : '';
    const database = this.database(reqInfo);
    const index = database.shipments.findIndex(item => item.id === id);
    const current = database.shipments[index];
    if (!current) {
      return this.respond(reqInfo, 404, { message: 'Not found' });
    }
    const event = readEvent(reqInfo.utils.getJsonBody(reqInfo.req), new Date().toISOString());
    if (!event) {
      return this.respond(reqInfo, 400, { message: 'Invalid event' });
    }
    const updated: Shipment = {
      ...current,
      status: event.status,
      events: [...current.events, event],
    };
    database.shipments[index] = updated;
    return this.respond(reqInfo, 200, structuredClone(updated));
  }

  private authorized(reqInfo: MemoryRequest): boolean {
    const request = reqInfo.req as HttpRequest<unknown>;
    const header = request.headers.get('Authorization');
    return typeof header === 'string' && header.startsWith('Bearer ') && header.length > 'Bearer '.length;
  }

  private database(reqInfo: MemoryRequest): LogisticsDatabase {
    return reqInfo.utils.getDb() as LogisticsDatabase;
  }

  private respond(reqInfo: MemoryRequest, status: number, body: unknown): Observable<unknown> {
    return reqInfo.utils.createResponse$(() => ({ status, body }));
  }
}

function first(query: Map<string, string[]>, key: string): string {
  return query.get(key)?.[0] ?? '';
}

function summary(shipments: readonly Shipment[]): ShipmentSummary {
  const byStatus = emptyCounts();
  for (const shipment of shipments) {
    byStatus[shipment.status] += 1;
  }
  return { total: shipments.length, byStatus };
}

function emptyCounts(): Record<ShipmentStatus, number> {
  return {
    created: 0,
    picked_up: 0,
    in_transit: 0,
    out_for_delivery: 0,
    delivered: 0,
    exception: 0,
  };
}

function nextShipmentId(shipments: readonly Shipment[]): string {
  const highest = shipments.reduce((max, shipment) => {
    const value = Number(shipment.id.slice('shp-'.length));
    return Number.isInteger(value) ? Math.max(max, value) : max;
  }, 1000);
  return `shp-${highest + 1}`;
}

function readDraft(value: unknown): ShipmentDraft | null {
  if (!isRecord(value)) {
    return null;
  }
  const trackingNumber = stringField(value, 'trackingNumber');
  const customer = stringField(value, 'customer');
  const origin = stringField(value, 'origin');
  const destination = stringField(value, 'destination');
  const carrier = stringField(value, 'carrier');
  const eta = stringField(value, 'eta');
  const weight = value['weightKg'];
  const weightKg = typeof weight === 'number' ? weight : Number.NaN;
  if (!TRACKING_PATTERN.test(trackingNumber) || customer.length === 0 || customer.length > 80) {
    return null;
  }
  if (!isPlace(origin) || !isPlace(destination) || origin === destination || !isCarrier(carrier)) {
    return null;
  }
  if (!DATE_PATTERN.test(eta) || !Number.isFinite(weightKg) || weightKg < 0.1 || weightKg > 30000) {
    return null;
  }
  return { trackingNumber, customer, origin, destination, carrier, eta, weightKg };
}

function readEvent(value: unknown, at: string): StatusEvent | null {
  if (!isRecord(value)) {
    return null;
  }
  const status = value['status'];
  const location = stringField(value, 'location');
  const note = stringField(value, 'note');
  if (typeof status !== 'string' || !isShipmentStatus(status)) {
    return null;
  }
  if (location.length === 0 || location.length > 80 || note.length === 0 || note.length > 240) {
    return null;
  }
  return { status, location, note, at };
}

function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}
