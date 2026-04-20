import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationService, AppNotification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatBadgeModule],
  template: `
    <div class="notif-page">
      <div class="page-header">
        <h1><mat-icon>notifications</mat-icon> Notificaciones</h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="markAllRead()" [disabled]="unread === 0">
            <mat-icon>done_all</mat-icon> Marcar todo leído
          </button>
          <button mat-stroked-button color="warn" (click)="clearAll()" [disabled]="notifications.length === 0">
            <mat-icon>delete_sweep</mat-icon> Limpiar
          </button>
        </div>
      </div>

      <div class="badge-bar">
        <mat-chip-set>
          <mat-chip>Total: {{ notifications.length }}</mat-chip>
          <mat-chip class="chip-unread">Sin leer: {{ unread }}</mat-chip>
        </mat-chip-set>
      </div>

      @for (n of notifications; track n.id) {
        <mat-card class="notif-card" [class.unread]="!n.read" [class]="'type-' + n.type" (click)="markRead(n.id)">
          <mat-card-content>
            <mat-icon class="notif-icon">{{ getIcon(n.type) }}</mat-icon>
            <div class="notif-body">
              <strong>{{ n.title }}</strong>
              <p>{{ n.message }}</p>
              <span class="notif-time">{{ n.timestamp | date:'short' }}</span>
            </div>
            @if (!n.read) {
              <span class="unread-dot"></span>
            }
          </mat-card-content>
        </mat-card>
      }
      @if (notifications.length === 0) {
        <mat-card class="empty">
          <mat-card-content>
            <mat-icon>notifications_off</mat-icon>
            <p>No hay notificaciones</p>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .notif-page { padding: 24px; max-width: 800px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h1 { display: flex; align-items: center; gap: 8px; color: #1a237e; margin: 0; }
    .header-actions { display: flex; gap: 8px; }
    .badge-bar { margin-bottom: 16px; }
    .chip-unread { background: #e3f2fd !important; color: #1565c0 !important; }
    .notif-card { margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
    .notif-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .notif-card.unread { border-left: 4px solid #1565c0; background: #f8f9ff; }
    .notif-card mat-card-content { display: flex; align-items: flex-start; gap: 12px; }
    .notif-icon { margin-top: 2px; }
    .type-success .notif-icon { color: #2e7d32; }
    .type-error .notif-icon { color: #c62828; }
    .type-warning .notif-icon { color: #e65100; }
    .type-info .notif-icon { color: #1565c0; }
    .notif-body { flex: 1; }
    .notif-body p { margin: 4px 0; color: #555; font-size: 0.9rem; }
    .notif-time { font-size: 0.8rem; color: #999; }
    .unread-dot { width: 10px; height: 10px; border-radius: 50%; background: #1565c0; flex-shrink: 0; margin-top: 6px; }
    .empty { text-align: center; padding: 40px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: AppNotification[] = [];
  unread = 0;

  constructor(private notifService: NotificationService) {}

  ngOnInit(): void {
    this.notifService.getNotifications().subscribe(n => {
      this.notifications = n;
      this.unread = n.filter(x => !x.read).length;
    });
  }

  getIcon(type: string): string {
    return { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' }[type] || 'info';
  }

  markRead(id: string): void { this.notifService.markRead(id); }
  markAllRead(): void { this.notifService.markAllRead(); }
  clearAll(): void { this.notifService.clearAll(); }
}
