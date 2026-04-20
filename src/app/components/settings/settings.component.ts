import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService, AppSettings } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatSelectModule, MatDividerModule],
  template: `
    <div class="settings-page">
      <h1><mat-icon>settings</mat-icon> Configuración</h1>
      <div class="settings-grid">
        <mat-card>
          <mat-card-header><mat-card-title>Apariencia</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="setting-row">
              <div><strong>Modo Oscuro</strong><p>Tema oscuro para la interfaz</p></div>
              <mat-slide-toggle [checked]="settings.darkMode" (change)="toggle('darkMode')"></mat-slide-toggle>
            </div>
            <div class="setting-row">
              <div><strong>Vista Compacta</strong><p>Reduce el espaciado entre elementos</p></div>
              <mat-slide-toggle [checked]="settings.compactView" (change)="toggle('compactView')"></mat-slide-toggle>
            </div>
            <div class="setting-row">
              <div><strong>Mostrar Duraciones</strong><p>Muestra tiempos en cada test</p></div>
              <mat-slide-toggle [checked]="settings.showTestDurations" (change)="toggle('showTestDurations')"></mat-slide-toggle>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Ejecución de Tests</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Timeout por defecto (ms)</mat-label>
              <input matInput type="number" [(ngModel)]="settings.defaultTimeout" (change)="save()">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Max ejecuciones paralelas</mat-label>
              <input matInput type="number" [(ngModel)]="settings.maxParallel" min="1" max="10" (change)="save()">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Entorno</mat-label>
              <mat-select [(ngModel)]="settings.environment" (selectionChange)="save()">
                <mat-option value="production">Producción</mat-option>
                <mat-option value="staging">Staging</mat-option>
                <mat-option value="development">Desarrollo</mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Notificaciones</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="setting-row">
              <div><strong>Notificaciones</strong><p>Recibir alertas de resultados</p></div>
              <mat-slide-toggle [checked]="settings.notificationsEnabled" (change)="toggle('notificationsEnabled')"></mat-slide-toggle>
            </div>
            <div class="setting-row">
              <div><strong>Auto-Refresh</strong><p>Actualizar dashboard automáticamente</p></div>
              <mat-slide-toggle [checked]="settings.autoRefresh" (change)="toggle('autoRefresh')"></mat-slide-toggle>
            </div>
            @if (settings.autoRefresh) {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Intervalo de refresh (seg)</mat-label>
                <input matInput type="number" [(ngModel)]="settings.refreshInterval" min="5" max="300" (change)="save()">
              </mat-form-field>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Datos</mat-card-title></mat-card-header>
          <mat-card-content>
            <p class="text-muted">Los reportes e historial se guardan en localStorage.</p>
            <div class="btn-row">
              <button mat-stroked-button color="warn" (click)="clearHistory()">
                <mat-icon>delete_sweep</mat-icon> Limpiar Historial
              </button>
              <button mat-stroked-button (click)="exportSettings()">
                <mat-icon>download</mat-icon> Exportar Configuración
              </button>
            </div>
            @if (cleared) {
              <div class="success-msg">Historial limpiado</div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { padding: 24px; max-width: 900px; margin: 0 auto; }
    .settings-page h1 { display: flex; align-items: center; gap: 8px; color: #1a237e; margin-bottom: 24px; }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
    .setting-row p { margin: 2px 0 0; font-size: 0.85rem; color: #666; }
    .full-width { width: 100%; margin-top: 8px; }
    .text-muted { color: #666; font-size: 0.9rem; }
    .btn-row { display: flex; gap: 8px; margin-top: 12px; }
    .success-msg { color: #2e7d32; background: #e8f5e9; padding: 8px 12px; border-radius: 6px; margin-top: 12px; }
  `]
})
export class SettingsComponent implements OnInit {
  settings!: AppSettings;
  cleared = false;

  constructor(private theme: ThemeService) {}

  ngOnInit(): void {
    this.settings = { ...this.theme.current };
  }

  toggle(key: 'darkMode' | 'compactView' | 'showTestDurations' | 'notificationsEnabled' | 'autoRefresh'): void {
    (this.settings as any)[key] = !(this.settings as any)[key];
    this.save();
  }

  save(): void {
    this.theme.update(this.settings);
  }

  clearHistory(): void {
    localStorage.removeItem('wqts_history');
    this.cleared = true;
    setTimeout(() => this.cleared = false, 3000);
  }

  exportSettings(): void {
    const blob = new Blob([JSON.stringify(this.settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'wqts-settings.json'; a.click();
    URL.revokeObjectURL(url);
  }
}
