import type { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(module => module.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(module => module.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(module => module.DashboardComponent),
        data: { titleKey: 'nav.dashboard' },
      },
      {
        path: 'shipments',
        loadChildren: () => import('./features/shipments/shipments.routes').then(module => module.SHIPMENT_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
