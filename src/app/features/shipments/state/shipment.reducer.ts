import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { createEntityAdapter, type EntityState } from '@ngrx/entity';

import {
  DEFAULT_QUERY,
  isPageSize,
  type ApiErrorCode,
  type Shipment,
  type ShipmentListQuery,
} from '../../../core/models/shipment.model';
import { shipmentActions } from './shipment.actions';

export interface ShipmentsState extends EntityState<Shipment> {
  query: ShipmentListQuery;
  pageIds: string[];
  total: number;
  loading: boolean;
  error: ApiErrorCode | null;
  selectedId: string | null;
  saving: boolean;
  saveError: ApiErrorCode | null;
}

const adapter = createEntityAdapter<Shipment>({
  selectId: shipment => shipment.id,
});

export const shipmentsInitialState: ShipmentsState = adapter.getInitialState({
  query: DEFAULT_QUERY,
  pageIds: [],
  total: 0,
  loading: false,
  error: null,
  selectedId: null,
  saving: false,
  saveError: null,
});

function mergeQuery(current: ShipmentListQuery, patch: Partial<ShipmentListQuery>): ShipmentListQuery {
  return {
    page: patch.page ?? current.page,
    pageSize: patch.pageSize ?? current.pageSize,
    sort: patch.sort ?? current.sort,
    order: patch.order ?? current.order,
    search: patch.search ?? current.search,
    status: patch.status ?? current.status,
  };
}

export const shipmentsFeature = createFeature({
  name: 'shipments',
  reducer: createReducer(
    shipmentsInitialState,
    on(shipmentActions.queryChanged, (state, { query }) => ({
      ...state,
      query: mergeQuery(state.query, query),
    })),
    on(shipmentActions.loadPage, state => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(shipmentActions.loadPageSuccess, (state, { result }) =>
      adapter.upsertMany(result.items, {
        ...state,
        pageIds: result.items.map(item => item.id),
        total: result.total,
        query: {
          ...state.query,
          page: result.page,
          pageSize: isPageSize(result.pageSize) ? result.pageSize : state.query.pageSize,
        },
        loading: false,
        error: null,
      }),
    ),
    on(shipmentActions.loadPageFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(shipmentActions.loadOne, (state, { id }) => ({
      ...state,
      selectedId: id,
      error: null,
    })),
    on(shipmentActions.loadOneSuccess, (state, { shipment }) =>
      adapter.upsertOne(shipment, {
        ...state,
        selectedId: shipment.id,
        error: null,
      }),
    ),
    on(shipmentActions.loadOneFailure, (state, { error }) => ({
      ...state,
      error,
    })),
    on(shipmentActions.createShipment, shipmentActions.addEvent, state => ({
      ...state,
      saving: true,
      saveError: null,
    })),
    on(shipmentActions.createShipmentSuccess, (state, { shipment }) =>
      adapter.upsertOne(shipment, {
        ...state,
        selectedId: shipment.id,
        saving: false,
        saveError: null,
      }),
    ),
    on(shipmentActions.addEventSuccess, (state, { shipment }) =>
      adapter.upsertOne(shipment, {
        ...state,
        selectedId: shipment.id,
        saving: false,
        saveError: null,
      }),
    ),
    on(shipmentActions.createShipmentFailure, shipmentActions.addEventFailure, (state, { error }) => ({
      ...state,
      saving: false,
      saveError: error,
    })),
    on(shipmentActions.clearSaveState, state => ({
      ...state,
      saving: false,
      saveError: null,
    })),
  ),
  extraSelectors: ({ selectPageIds, selectEntities, selectSelectedId }) => ({
    selectPageItems: createSelector(selectPageIds, selectEntities, (pageIds, entities): Shipment[] =>
      pageIds.map(id => entities[id]).filter((item): item is Shipment => item !== undefined),
    ),
    selectSelectedShipment: createSelector(
      selectSelectedId,
      selectEntities,
      (selectedId, entities): Shipment | null => (selectedId ? (entities[selectedId] ?? null) : null),
    ),
  }),
});

export const {
  name: shipmentsFeatureKey,
  reducer: shipmentsReducer,
  selectQuery,
  selectTotal,
  selectLoading,
  selectError,
  selectSaving,
  selectSaveError,
  selectPageItems,
  selectSelectedShipment,
} = shipmentsFeature;
