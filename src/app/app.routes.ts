import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', loadComponent: () => import('./components/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./components/admin/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'suites', loadComponent: () => import('./components/admin/admin-suites.component').then(m => m.AdminSuitesComponent) },
      { path: 'reports', loadComponent: () => import('./components/admin/admin-reports.component').then(m => m.AdminReportsComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
