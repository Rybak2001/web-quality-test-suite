import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from './services/auth.service';
import { AuthState } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatSidenavModule, MatListModule],
  template: `
    @if (auth.isAuthenticated) {
      <mat-toolbar color="primary" class="app-toolbar">
        <mat-icon>science</mat-icon>
        <span class="app-title">Web Quality Test Suite</span>
        <span class="spacer"></span>
        <button mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
          <mat-icon>dashboard</mat-icon> Dashboard
        </button>
        @if (auth.user?.role === 'admin') {
          <button mat-button routerLink="/admin" routerLinkActive="active-link">
            <mat-icon>admin_panel_settings</mat-icon> Admin
          </button>
        }
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="menu-header">
            <strong>{{ auth.user?.name }}</strong>
            <small>{{ auth.user?.email }}</small>
            <div class="menu-role">
              <span class="role-badge">{{ auth.user?.role }}</span>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon> Sign Out
          </button>
        </mat-menu>
      </mat-toolbar>

      @if (isAdminRoute) {
        <mat-sidenav-container class="admin-container">
          <mat-sidenav mode="side" opened class="admin-sidenav">
            <mat-nav-list>
              <a mat-list-item routerLink="/admin" routerLinkActive="active-nav" [routerLinkActiveOptions]="{exact: true}">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/admin/users" routerLinkActive="active-nav">
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>Users</span>
              </a>
              <a mat-list-item routerLink="/admin/suites" routerLinkActive="active-nav">
                <mat-icon matListItemIcon>folder_open</mat-icon>
                <span matListItemTitle>Test Suites</span>
              </a>
              <a mat-list-item routerLink="/admin/reports" routerLinkActive="active-nav">
                <mat-icon matListItemIcon>assessment</mat-icon>
                <span matListItemTitle>Reports</span>
              </a>
            </mat-nav-list>
          </mat-sidenav>
          <mat-sidenav-content>
            <router-outlet />
          </mat-sidenav-content>
        </mat-sidenav-container>
      } @else {
        <router-outlet />
      }
    } @else {
      <router-outlet />
    }
  `,
  styles: [`
    .app-toolbar { position: sticky; top: 0; z-index: 100; }
    .app-title { margin-left: 8px; font-weight: 700; }
    .spacer { flex: 1; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 8px; }
    .menu-header { padding: 12px 16px; }
    .menu-header strong { display: block; }
    .menu-header small { color: #666; }
    .role-badge { display: inline-block; margin-top: 4px; padding: 2px 8px; background: #e8eaf6; color: #1a237e; border-radius: 12px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; }
    .admin-container { height: calc(100vh - 64px); }
    .admin-sidenav { width: 240px; background: #f5f5f5; border-right: 1px solid #e0e0e0; }
    .active-nav { background: #e8eaf6 !important; color: #1a237e !important; }
  `]
})
export class AppComponent implements OnInit {
  auth: { isAuthenticated: boolean; user: any } = { isAuthenticated: false, user: null };
  isAdminRoute = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(state => {
      this.auth = { isAuthenticated: state.isAuthenticated, user: state.user };
    });
    this.router.events.subscribe(() => {
      this.isAdminRoute = this.router.url.startsWith('/admin');
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
