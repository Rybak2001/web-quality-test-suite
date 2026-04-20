import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { TestService } from '../../services/test.service';
import { TestReport } from '../../models/test.models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule],
  template: `
    <div class="history-page">
      <div class="page-header">
        <h1><mat-icon>history</mat-icon> Historial de Tests</h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="exportJSON()"><mat-icon>download</mat-icon> Export JSON</button>
          <button mat-stroked-button color="warn" (click)="clearAll()"><mat-icon>delete_sweep</mat-icon> Limpiar</button>
        </div>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Buscar suite</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filter()">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Resultado</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="filter()">
            <mat-option value="all">Todos</mat-option>
            <mat-option value="success">Sin fallos</mat-option>
            <mat-option value="failed">Con fallos</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="stats-bar">
        <div class="stat"><span class="val">{{ history.length }}</span> Total Runs</div>
        <div class="stat"><span class="val pass">{{ avgPassRate }}%</span> Pass Rate Promedio</div>
        <div class="stat"><span class="val">{{ avgDuration }}ms</span> Duración Promedio</div>
        <div class="stat"><span class="val fail">{{ totalFailed }}</span> Tests Fallidos Total</div>
      </div>

      <!-- Trend Chart (CSS) -->
      @if (filtered.length > 1) {
        <mat-card class="trend-card">
          <mat-card-header><mat-card-title>Tendencia de Pass Rate</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="trend-chart">
              @for (point of trendData; track point.idx) {
                <div class="trend-bar" [style.height.%]="point.rate" [class.good]="point.rate >= 80" [class.warn]="point.rate >= 50 && point.rate < 80" [class.bad]="point.rate < 50">
                  <span class="trend-label">{{ point.rate }}%</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      <div class="reports-list">
        @for (report of filtered; track report.id; let i = $index) {
          <mat-card class="report-item" [class.has-failures]="report.failed > 0">
            <mat-card-content>
              <div class="report-header">
                <div class="report-info">
                  <strong>{{ report.suiteName }}</strong>
                  <span class="report-date">{{ report.timestamp | date:'medium' }}</span>
                </div>
                <div class="report-badges">
                  <mat-chip class="chip-pass"><mat-icon class="inline-icon">check_circle</mat-icon> {{ report.passed }}</mat-chip>
                  <mat-chip class="chip-fail"><mat-icon class="inline-icon">cancel</mat-icon> {{ report.failed }}</mat-chip>
                  @if (report.skipped > 0) {
                    <mat-chip><mat-icon class="inline-icon">skip_next</mat-icon> {{ report.skipped }}</mat-chip>
                  }
                  <span class="duration">{{ report.duration }}ms</span>
                </div>
              </div>
              @if (expandedId === report.id) {
                <div class="report-details">
                  <table class="detail-table">
                    <thead><tr><th>Test</th><th>Estado</th><th>Duración</th><th>Error</th></tr></thead>
                    <tbody>
                      @for (r of report.results; track r.testId) {
                        <tr [class]="r.status">
                          <td>{{ r.testName }}</td>
                          <td><span class="status-badge" [class]="r.status">{{ r.status | uppercase }}</span></td>
                          <td class="mono">{{ r.duration }}ms</td>
                          <td class="error-cell">{{ r.error || '—' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </mat-card-content>
            <mat-card-actions>
              <button mat-button (click)="toggleExpand(report.id)">
                <mat-icon>{{ expandedId === report.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                {{ expandedId === report.id ? 'Ocultar' : 'Ver Detalles' }}
              </button>
            </mat-card-actions>
          </mat-card>
        }
        @if (filtered.length === 0) {
          <mat-card class="empty-state">
            <mat-card-content>
              <mat-icon>inbox</mat-icon>
              <p>No hay reportes en el historial</p>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .history-page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h1 { display: flex; align-items: center; gap: 8px; color: #1a237e; margin: 0; }
    .header-actions { display: flex; gap: 8px; }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; }
    .stats-bar { display: flex; gap: 16px; margin-bottom: 20px; padding: 16px; background: #f5f5f5; border-radius: 12px; }
    .stat { text-align: center; flex: 1; }
    .val { display: block; font-size: 1.5rem; font-weight: 700; color: #1a237e; }
    .val.pass { color: #2e7d32; }
    .val.fail { color: #c62828; }
    .trend-card { margin-bottom: 20px; }
    .trend-chart { display: flex; align-items: flex-end; gap: 4px; height: 120px; padding: 8px 0; }
    .trend-bar { min-width: 20px; flex: 1; border-radius: 4px 4px 0 0; position: relative; transition: height 0.3s; display: flex; align-items: flex-start; justify-content: center; }
    .trend-bar.good { background: #4caf50; }
    .trend-bar.warn { background: #ff9800; }
    .trend-bar.bad { background: #f44336; }
    .trend-label { font-size: 0.65rem; color: white; font-weight: 600; padding-top: 2px; }
    .report-item { margin-bottom: 8px; border-left: 4px solid #4caf50; }
    .report-item.has-failures { border-left-color: #f44336; }
    .report-header { display: flex; justify-content: space-between; align-items: center; }
    .report-info strong { display: block; }
    .report-date { font-size: 0.8rem; color: #888; }
    .report-badges { display: flex; align-items: center; gap: 6px; }
    .chip-pass { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-fail { background: #ffebee !important; color: #c62828 !important; }
    .duration { font-family: monospace; color: #666; font-size: 0.85rem; }
    .detail-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .detail-table th { text-align: left; padding: 8px; background: #f5f5f5; font-size: 0.85rem; }
    .detail-table td { padding: 8px; border-bottom: 1px solid #eee; font-size: 0.85rem; }
    .detail-table tr.passed { color: #2e7d32; }
    .detail-table tr.failed { color: #c62828; }
    .status-badge { padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.passed { background: #e8f5e9; color: #2e7d32; }
    .status-badge.failed { background: #ffebee; color: #c62828; }
    .mono { font-family: monospace; }
    .error-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .empty-state { text-align: center; padding: 40px; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .empty-state p { color: #999; }
  `]
})
export class HistoryComponent implements OnInit {
  history: TestReport[] = [];
  filtered: TestReport[] = [];
  searchTerm = '';
  statusFilter = 'all';
  expandedId = '';
  avgPassRate = 0;
  avgDuration = 0;
  totalFailed = 0;
  trendData: { idx: number; rate: number }[] = [];

  constructor(private testService: TestService) {}

  ngOnInit(): void {
    this.testService.getHistory().subscribe(h => {
      this.history = h;
      this.filter();
      this.calcStats();
    });
  }

  filter(): void {
    this.filtered = this.history.filter(r => {
      const matchSearch = !this.searchTerm || r.suiteName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = this.statusFilter === 'all' || (this.statusFilter === 'success' ? r.failed === 0 : r.failed > 0);
      return matchSearch && matchStatus;
    });
    this.trendData = this.filtered.slice(0, 20).reverse().map((r, i) => ({
      idx: i,
      rate: r.total > 0 ? Math.round((r.passed / r.total) * 100) : 0
    }));
  }

  calcStats(): void {
    if (this.history.length === 0) return;
    const totalPassed = this.history.reduce((s, r) => s + r.passed, 0);
    const totalTests = this.history.reduce((s, r) => s + r.total, 0);
    this.avgPassRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    this.avgDuration = Math.round(this.history.reduce((s, r) => s + r.duration, 0) / this.history.length);
    this.totalFailed = this.history.reduce((s, r) => s + r.failed, 0);
  }

  toggleExpand(id: string): void {
    this.expandedId = this.expandedId === id ? '' : id;
  }

  exportJSON(): void {
    const blob = new Blob([JSON.stringify(this.history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'test-history.json'; a.click();
    URL.revokeObjectURL(url);
  }

  clearAll(): void {
    localStorage.removeItem('wqts_history');
    this.history = [];
    this.filtered = [];
    this.trendData = [];
  }
}
