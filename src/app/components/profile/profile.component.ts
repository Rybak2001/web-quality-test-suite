import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="profile-page">
      <h1><mat-icon>person</mat-icon> Mi Perfil</h1>
      <div class="profile-grid">
        <mat-card class="profile-card">
          <div class="avatar-section">
            <div class="avatar">{{ initials }}</div>
            <h2>{{ user?.name }}</h2>
            <mat-chip-set>
              <mat-chip [class]="'role-' + user?.role">{{ user?.role | uppercase }}</mat-chip>
            </mat-chip-set>
          </div>
          <mat-card-content>
            <div class="info-row"><mat-icon>email</mat-icon> {{ user?.email }}</div>
            <div class="info-row"><mat-icon>event</mat-icon> Registrado: {{ user?.createdAt | date:'medium' }}</div>
            <div class="info-row"><mat-icon>login</mat-icon> Último acceso: {{ user?.lastLogin ? (user?.lastLogin | date:'medium') : 'N/A' }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Actualizar Nombre</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre</mat-label>
              <input matInput [(ngModel)]="newName">
            </mat-form-field>
            @if (message) {
              <div class="success-msg">{{ message }}</div>
            }
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="updateName()" [disabled]="!newName">Guardar</button>
          </mat-card-actions>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Estadísticas de Sesión</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat"><span class="stat-value">{{ sessionDuration }}</span><span class="stat-label">Tiempo en sesión</span></div>
              <div class="stat"><span class="stat-value">{{ testsRun }}</span><span class="stat-label">Tests ejecutados</span></div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding: 24px; max-width: 900px; margin: 0 auto; }
    .profile-page h1 { display: flex; align-items: center; gap: 8px; color: #1a237e; margin-bottom: 24px; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .profile-card { grid-row: span 2; }
    .avatar-section { text-align: center; padding: 24px 0; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #1a237e, #3949ab); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; margin: 0 auto 12px; }
    .info-row { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid #eee; color: #555; }
    .full-width { width: 100%; }
    .success-msg { color: #2e7d32; background: #e8f5e9; padding: 8px 12px; border-radius: 6px; margin-top: 8px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .stat { text-align: center; }
    .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: #1a237e; }
    .stat-label { font-size: 0.85rem; color: #666; }
    .role-admin { background: #e8eaf6 !important; color: #1a237e !important; }
    .role-tester { background: #e0f2f1 !important; color: #004d40 !important; }
    .role-viewer { background: #fff3e0 !important; color: #e65100 !important; }
  `]
})
export class ProfileComponent implements OnInit {
  user: any;
  newName = '';
  message = '';
  initials = '';
  sessionDuration = '0m';
  testsRun = 0;
  private sessionStart = Date.now();

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.newName = this.user?.name || '';
    this.initials = (this.user?.name || '').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
    setInterval(() => {
      const mins = Math.floor((Date.now() - this.sessionStart) / 60000);
      this.sessionDuration = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
    }, 10000);
  }

  updateName(): void {
    if (this.newName && this.user) {
      this.message = 'Nombre actualizado (en esta sesión)';
      this.user.name = this.newName;
      this.initials = this.newName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
    }
  }
}
