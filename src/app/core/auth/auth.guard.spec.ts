import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import type { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

@Component({ selector: 'app-blank', template: '' })
class BlankComponent {}

describe('route guards', () => {
  const session: { user: User | null; signedIn: boolean } = { user: null, signedIn: false };

  beforeEach(() => {
    session.user = null;
    session.signedIn = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: BlankComponent },
          { path: 'dashboard', canActivate: [authGuard], component: BlankComponent },
          { path: 'shipments', component: BlankComponent },
          {
            path: 'shipments/new',
            canActivate: [roleGuard(['admin', 'dispatcher'])],
            component: BlankComponent,
          },
        ]),
        provideLocationMocks(),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => session.signedIn,
            user: () => session.user,
          },
        },
      ],
    });
  });

  it('sends anonymous visitors to login', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/dashboard');
    expect(router.url).toBe('/login');
  });

  it('allows an authenticated session into the console', async () => {
    session.signedIn = true;
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/dashboard');
    expect(router.url).toBe('/dashboard');
  });

  it('keeps viewers off the create route', async () => {
    session.user = {
      id: 'usr-viewer',
      name: 'Harborline Viewer',
      email: 'viewer@harborline.example',
      role: 'viewer',
    };
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/shipments/new');
    expect(router.url).toBe('/shipments');
  });

  it('lets an admin open the create route', async () => {
    session.user = {
      id: 'usr-admin',
      name: 'Harborline Admin',
      email: 'admin@harborline.example',
      role: 'admin',
    };
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/shipments/new');
    expect(router.url).toBe('/shipments/new');
  });
});
