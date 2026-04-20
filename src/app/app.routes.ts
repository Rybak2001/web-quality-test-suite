import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },
  { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'settings', loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent), canActivate: [authGuard] },
  { path: 'history', loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent), canActivate: [authGuard] },
  { path: 'notifications', loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent), canActivate: [authGuard] },
  { path: 'activity', loadComponent: () => import('./components/activity/activity.component').then(m => m.ActivityComponent), canActivate: [authGuard] },
  { path: 'tests/ecommerce', loadComponent: () => import('./components/tests-ecommerce/tests-ecommerce.component').then(m => m.TestsEcommerceComponent), canActivate: [authGuard] },
  { path: 'tests/inventory', loadComponent: () => import('./components/tests-inventory/tests-inventory.component').then(m => m.TestsInventoryComponent), canActivate: [authGuard] },
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
