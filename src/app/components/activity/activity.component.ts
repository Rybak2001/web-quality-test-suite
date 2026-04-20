import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { NotificationService, ActivityEntry } from '../../services/notification.service';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="activity-page">
      <h1><mat-icon>timeline</mat-icon> Registro de Actividad</h1>
      @if (entries.length === 0) {
        <mat-card class="empty">
          <mat-card-content>
            <mat-icon>event_note</mat-icon>
            <p>No hay actividad registrada en esta sesión</p>
          </mat-card-content>
        </mat-card>
      }
      <div class="timeline">
        @for (entry of entries; track entry.id) {
          <div class="timeline-item">
            <div class="timeline-dot" [class]="getActionClass(entry.action)"></div>
            <mat-card class="timeline-card">
              <mat-card-content>
                <div class="entry-header">
                  <strong>{{ entry.action }}</strong>
                  <span class="entry-time">{{ entry.timestamp | date:'medium' }}</span>
                </div>
                <p>{{ entry.details }}</p>
                <span class="entry-user">{{ entry.userName }}</span>
              </mat-card-content>
            </mat-card>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .activity-page { padding: 24px; max-width: 800px; margin: 0 auto; }
    .activity-page h1 { display: flex; align-items: center; gap: 8px; color: #1a237e; margin-bottom: 24px; }
    .timeline { position: relative; padding-left: 24px; }
    .timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: #e0e0e0; }
    .timeline-item { position: relative; margin-bottom: 12px; }
    .timeline-dot { position: absolute; left: -20px; top: 16px; width: 12px; height: 12px; border-radius: 50%; background: #9e9e9e; border: 2px solid white; }
    .timeline-dot.run { background: #1565c0; }
    .timeline-dot.login { background: #2e7d32; }
    .timeline-dot.setting { background: #e65100; }
    .timeline-card { margin-left: 8px; }
    .entry-header { display: flex; justify-content: space-between; align-items: center; }
    .entry-time { font-size: 0.8rem; color: #999; }
    .entry-header strong { text-transform: capitalize; }
    p { margin: 4px 0; color: #555; font-size: 0.9rem; }
    .entry-user { font-size: 0.8rem; color: #1a237e; font-weight: 500; }
    .empty { text-align: center; padding: 40px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
  `]
})
export class ActivityComponent implements OnInit {
  entries: ActivityEntry[] = [];

  constructor(private notifService: NotificationService) {}

  ngOnInit(): void {
    this.notifService.getActivity().subscribe(a => this.entries = a);
  }

  getActionClass(action: string): string {
    if (action.includes('run') || action.includes('test')) return 'run';
    if (action.includes('login')) return 'login';
    if (action.includes('setting') || action.includes('config')) return 'setting';
    return '';
  }
}
