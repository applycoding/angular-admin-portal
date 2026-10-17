import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const auth = {
    token: jest.fn<string | null, []>(() => null),
    isAuthenticated: jest.fn(() => false),
    logout: jest.fn(),
  };

  beforeEach(() => {
    auth.token.mockReset();
    auth.isAuthenticated.mockReset();
    auth.logout.mockReset();
    auth.token.mockReturnValue(null);
    auth.isAuthenticated.mockReturnValue(false);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('adds a bearer token to API calls', () => {
    auth.token.mockReturnValue('header.payload.demo');
    TestBed.inject(HttpClient).get('api/shipments').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('api/shipments');
    expect(request.request.headers.get('Authorization')).toBe('Bearer header.payload.demo');
    request.flush([]);
  });

  it('leaves the request unchanged when there is no token', () => {
    TestBed.inject(HttpClient).get('api/shipments').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('api/shipments');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });

  it('does not attach a token to login', () => {
    auth.token.mockReturnValue('header.payload.demo');
    TestBed.inject(HttpClient).post('api/auth/login', {}).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('api/auth/login');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('logs out when a protected call returns 401', () => {
    auth.token.mockReturnValue('header.payload.demo');
    auth.isAuthenticated.mockReturnValue(true);
    TestBed.inject(HttpClient).get('api/shipments').subscribe({ error: () => undefined });
    const request = TestBed.inject(HttpTestingController).expectOne('api/shipments');
    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).toHaveBeenCalled();
  });
});
