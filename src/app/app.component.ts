import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { NotificationService } from './services/notification.service';
import { AuthState } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatSidenavModule, MatListModule, MatBadgeModule, MatTooltipModule],
  template: `
    @if (auth.isAuthenticated) {
      <mat-toolbar color="primary" class="app-toolbar">
        <mat-icon>science</mat-icon>
        <span class="app-title">SurtiBolivia · QA Suite</span>
        <span class="env-badge">{{ environment }}</span>
        <span class="spacer"></span>

        <button mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" matTooltip="Dashboard">
          <mat-icon>dashboard</mat-icon> Dashboard
        </button>
        <button mat-button routerLink="/history" routerLinkActive="active-link" matTooltip="Historial">
          <mat-icon>history</mat-icon> Historial
        </button>
        <button mat-button [matMenuTriggerFor]="testsMenu" matTooltip="Tests por App">
          <mat-icon>science</mat-icon> Tests
        </button>
        <mat-menu #testsMenu="matMenu">
          <button mat-menu-item routerLink="/tests/ecommerce"><mat-icon>storefront</mat-icon> E-Commerce</button>
          <button mat-menu-item routerLink="/tests/inventory"><mat-icon>inventory_2</mat-icon> Inventario</button>
        </mat-menu>
        @if (auth.user?.role === 'admin') {
          <button mat-button routerLink="/admin" routerLinkActive="active-link" matTooltip="Admin">
            <mat-icon>admin_panel_settings</mat-icon> Admin
          </button>
        }

        <button mat-icon-button (click)="toggleDarkMode()" [matTooltip]="isDark ? 'Modo claro' : 'Modo oscuro'">
          <mat-icon>{{ isDark ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <button mat-icon-button routerLink="/notifications" [matBadge]="unreadCount > 0 ? unreadCount : null" matBadgeColor="warn" matTooltip="Notificaciones">
          <mat-icon>notifications</mat-icon>
        </button>

        <button mat-icon-button [matMenuTriggerFor]="userMenu" matTooltip="Mi cuenta">
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
          <button mat-menu-item routerLink="/profile"><mat-icon>person</mat-icon> Mi Perfil</button>
          <button mat-menu-item routerLink="/settings"><mat-icon>settings</mat-icon> Configuración</button>
          <button mat-menu-item routerLink="/activity"><mat-icon>timeline</mat-icon> Actividad</button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon> Cerrar Sesión</button>
        </mat-menu>

        <span class="clock">{{ clock }}</span>
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
                <span matListItemTitle>Usuarios</span>
              </a>
              <a mat-list-item routerLink="/admin/suites" routerLinkActive="active-nav">
                <mat-icon matListItemIcon>folder_open</mat-icon>
                <span matListItemTitle>Test Suites</span>
              </a>
              <a mat-list-item routerLink="/admin/reports" routerLinkActive="active-nav">
                <mat-icon matListItemIcon>assessment</mat-icon>
                <span matListItemTitle>Reportes</span>
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

      <!-- Keyboard shortcuts help -->
      @if (showShortcuts) {
        <div class="shortcuts-overlay" (click)="showShortcuts = false">
          <div class="shortcuts-modal" (click)="$event.stopPropagation()">
            <h3>Atajos de Teclado</h3>
            <div class="shortcut-row"><kbd>Ctrl+D</kbd> Dashboard</div>
            <div class="shortcut-row"><kbd>Ctrl+H</kbd> Historial</div>
            <div class="shortcut-row"><kbd>Ctrl+N</kbd> Notificaciones</div>
            <div class="shortcut-row"><kbd>Ctrl+,</kbd> Configuración</div>
            <div class="shortcut-row"><kbd>Ctrl+Shift+D</kbd> Modo oscuro</div>
            <div class="shortcut-row"><kbd>?</kbd> Mostrar atajos</div>
            <button mat-button (click)="showShortcuts = false">Cerrar</button>
          </div>
        </div>
      }
    } @else {
      <router-outlet />
    }
  `,
  styles: [`
    .app-toolbar { position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .app-title { margin-left: 8px; font-weight: 700; font-size: 1.1rem; letter-spacing: -0.01em; }
    .env-badge { margin-left: 8px; padding: 2px 8px; background: rgba(255,255,255,0.15); border-radius: 6px; font-size: 0.7rem; text-transform: uppercase; font-weight: 600; }
    .spacer { flex: 1; }
    .active-link { background: rgba(255,255,255,0.12); border-radius: 8px; }
    .clock { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; margin-left: 8px; opacity: 0.7; }
    .menu-header { padding: 12px 16px; }
    .menu-header strong { display: block; }
    .menu-header small { color: #6b7280; }
    .role-badge { display: inline-block; margin-top: 4px; padding: 2px 8px; background: #ede9fe; color: #5b4fc7; border-radius: 12px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; }
    .admin-container { height: calc(100vh - 64px); }
    .admin-sidenav { width: 240px; background: #fff; border-right: 1px solid #e5e7eb; }
    .active-nav { background: #ede9fe !important; color: #5b4fc7 !important; border-radius: 8px; }
    .shortcuts-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
    .shortcuts-modal { background: white; border-radius: 16px; padding: 24px; min-width: 300px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .shortcuts-modal h3 { margin: 0 0 16px; color: #5b4fc7; }
    .shortcut-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
    kbd { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 2px 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
  `]
})
export class AppComponent implements OnInit {
  auth: { isAuthenticated: boolean; user: any } = { isAuthenticated: false, user: null };
  isAdminRoute = false;
  isDark = false;
  unreadCount = 0;
  showShortcuts = false;
  clock = '';
  environment = 'PROD';

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(state => {
      this.auth = { isAuthenticated: state.isAuthenticated, user: state.user };
    });
    this.router.events.subscribe(() => {
      this.isAdminRoute = this.router.url.startsWith('/admin');
    });
    this.themeService.getSettings().subscribe(s => {
      this.isDark = s.darkMode;
      this.environment = s.environment.toUpperCase().slice(0, 4);
    });
    this.notifService.getNotifications().subscribe(n => {
      this.unreadCount = n.filter(x => !x.read).length;
    });
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  @HostListener('window:keydown', ['$event'])
  handleShortcut(e: KeyboardEvent): void {
    if (e.key === '?' && !e.ctrlKey) { this.showShortcuts = true; return; }
    if (!e.ctrlKey) return;
    switch (e.key) {
      case 'd': e.preventDefault(); this.router.navigate(['/']); break;
      case 'h': e.preventDefault(); this.router.navigate(['/history']); break;
      case 'n': e.preventDefault(); this.router.navigate(['/notifications']); break;
      case ',': e.preventDefault(); this.router.navigate(['/settings']); break;
      case 'D': if (e.shiftKey) { e.preventDefault(); this.toggleDarkMode(); } break;
    }
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private updateClock(): void {
    const now = new Date();
    this.clock = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  }
}
