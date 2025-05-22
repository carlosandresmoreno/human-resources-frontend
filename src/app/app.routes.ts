import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'persons', pathMatch: 'full' },
      {
        path: 'persons',
        loadChildren: () => import('./persons/persons.routes').then(r => r.PERSON_ROUTES)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.routes').then(r => r.DASHBOARD_ROUTES)
      }
    ]
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./auth/auth.routes').then(r => r.AUTH_ROUTES) }
    ]
  },
  { path: '**', redirectTo: '' }
];