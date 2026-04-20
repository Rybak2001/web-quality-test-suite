import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { TestService } from '../../services/test.service';
import { ReportService } from '../../services/report.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { TestSuite, TestReport } from '../../models/test.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule, MatBadgeModule],
  template: `
    <div class="dashboard-header">
      <div class="header-left">
        <h1><mat-icon class="header-icon">science</mat-icon> SurtiBolivia · QA Dashboard</h1>
        <p class="subtitle">Plataforma de testing para el ecosistema SurtiBolivia</p>
      </div>
      <div class="header-actions">
        <button mat-raised-button color="primary" (click)="runAllSuites()" [disabled]="isRunning">
          <mat-icon>play_circle</mat-icon> Ejecutar Todo
        </button>
        <button mat-raised-button (click)="retryAllFailed()" [disabled]="isRunning || failedCount === 0" matTooltip="Reintentar tests fallidos">
          <mat-icon>replay</mat-icon> Reintentar Fallidos
        </button>
        <button mat-button (click)="resetAll()" [disabled]="isRunning" matTooltip="Resetear todos los tests">
          <mat-icon>restart_alt</mat-icon>
        </button>
        <button mat-button (click)="exportCSV()" [disabled]="reports.length === 0" matTooltip="Exportar CSV">
          <mat-icon>download</mat-icon>
        </button>
      </div>
    </div>

    @if (isRunning) {
      <div class="running-bar">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <span class="running-label">Ejecutando: {{ currentTest }}</span>
      </div>
    }

    <div class="dashboard">
      <!-- KPI Metrics -->
      <div class="metrics">
        <mat-card class="metric-card">
          <mat-card-content>
            <mat-icon class="metric-icon">folder_open</mat-icon>
            <span class="metric-value">{{ suites.length }}</span>
            <span class="metric-label">Test Suites</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <mat-icon class="metric-icon">checklist</mat-icon>
            <span class="metric-value">{{ totalTests }}</span>
            <span class="metric-label">Total Tests</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card" [class.pass]="passRate >= 80" [class.warn]="passRate > 0 && passRate < 80">
          <mat-card-content>
            <mat-icon class="metric-icon">{{ passRate >= 80 ? 'thumb_up' : 'thumb_down' }}</mat-icon>
            <span class="metric-value">{{ passRate }}%</span>
            <span class="metric-label">Pass Rate</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <mat-icon class="metric-icon">assessment</mat-icon>
            <span class="metric-value">{{ reports.length }}</span>
            <span class="metric-label">Ejecuciones</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <mat-icon class="metric-icon text-green">check_circle</mat-icon>
            <span class="metric-value text-green">{{ passedCount }}</span>
            <span class="metric-label">Passed</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <mat-icon class="metric-icon text-red">cancel</mat-icon>
            <span class="metric-value text-red">{{ failedCount }}</span>
            <span class="metric-label">Failed</span>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <a routerLink="/history" mat-stroked-button><mat-icon>history</mat-icon> Ver Historial</a>
        <a routerLink="/notifications" mat-stroked-button><mat-icon>notifications</mat-icon> Notificaciones</a>
        <a routerLink="/settings" mat-stroked-button><mat-icon>settings</mat-icon> Configuración</a>
        <span class="uptime-badge" matTooltip="Tiempo en sesión">⏱ {{ sessionTime }}</span>
      </div>

      <!-- Filters -->
      <div class="filters">
        <mat-form-field appearance="outline" class="filter-input">
          <mat-label>Buscar suite...</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterSuites()">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select [(ngModel)]="typeFilter" (selectionChange)="filterSuites()">
            <mat-option value="all">Todos</mat-option>
            <mat-option value="integration">Integration</mat-option>
            <mat-option value="e2e">E2E</mat-option>
            <mat-option value="unit">Unit</mat-option>
            <mat-option value="performance">Performance</mat-option>
            <mat-option value="accessibility">Accessibility</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="filterSuites()">
            <mat-option value="all">Todos</mat-option>
            <mat-option value="pending">Pendientes</mat-option>
            <mat-option value="passed">Pasados</mat-option>
            <mat-option value="failed">Fallidos</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-icon-button (click)="showFavoritesOnly = !showFavoritesOnly; filterSuites()" [color]="showFavoritesOnly ? 'warn' : ''">
          <mat-icon>{{ showFavoritesOnly ? 'star' : 'star_border' }}</mat-icon>
        </button>
      </div>

      <!-- Test Suites -->
      <section class="suites">
        <h2>Test Suites ({{ filteredSuites.length }})</h2>
        <div class="suite-grid">
          @for (suite of filteredSuites; track suite.id) {
            <mat-card class="suite-card" [class.suite-fav]="isFavorite(suite.id)">
              <mat-card-header>
                <mat-card-title>
                  <button mat-icon-button class="fav-btn" (click)="toggleFavorite(suite.id)" [matTooltip]="isFavorite(suite.id) ? 'Quitar favorito' : 'Agregar favorito'">
                    <mat-icon>{{ isFavorite(suite.id) ? 'star' : 'star_border' }}</mat-icon>
                  </button>
                  {{ suite.name }}
                </mat-card-title>
                <mat-card-subtitle>{{ suite.description }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="suite-stats">
                  <span class="stat-item pass"><mat-icon class="inline-icon">check_circle</mat-icon> {{ getSuitePassed(suite) }}</span>
                  <span class="stat-item fail"><mat-icon class="inline-icon">cancel</mat-icon> {{ getSuiteFailed(suite) }}</span>
                  <span class="stat-item pending"><mat-icon class="inline-icon">hourglass_empty</mat-icon> {{ getSuitePending(suite) }}</span>
                  <span class="stat-item total"><mat-icon class="inline-icon">assignment</mat-icon> {{ suite.tests.length }}</span>
                </div>
                <mat-progress-bar mode="determinate" [value]="getSuiteProgress(suite)" [color]="getSuiteProgress(suite) === 100 && getSuiteFailed(suite) === 0 ? 'primary' : 'warn'"></mat-progress-bar>
                <span class="progress-label">{{ getSuitePassed(suite) }}/{{ suite.tests.length }} passed</span>

                <div class="test-list">
                  @for (test of suite.tests; track test.id) {
                    <div class="test-item" [class]="test.status">
                      <mat-icon class="test-status-icon">{{ getStatusIcon(test.status) }}</mat-icon>
                      <span class="test-name">{{ test.name }}</span>
                      <mat-chip class="type-chip">{{ test.type }}</mat-chip>
                      @if (test.duration) {
                        <span class="test-duration">{{ test.duration }}ms</span>
                      }
                      @if (test.error) {
                        <mat-icon class="error-icon" [matTooltip]="test.error">info</mat-icon>
                      }
                    </div>
                  }
                </div>

                @if (suite.lastRun) {
                  <div class="last-run">Último run: {{ suite.lastRun | date:'short' }}</div>
                }
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" (click)="runSuite(suite)" [disabled]="isRunning">
                  <mat-icon>play_arrow</mat-icon> Ejecutar
                </button>
                <button mat-button (click)="retryFailed(suite)" [disabled]="isRunning || getSuiteFailed(suite) === 0" matTooltip="Reintentar fallidos">
                  <mat-icon>replay</mat-icon> Retry
                </button>
                <button mat-button (click)="resetSuite(suite)" [disabled]="isRunning" matTooltip="Resetear">
                  <mat-icon>restart_alt</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      </section>

      <!-- Recent Reports -->
      @if (reports.length > 0) {
        <section class="recent-reports">
          <div class="section-header">
            <h2>Últimos Reportes</h2>
            <a routerLink="/history" mat-button>Ver todo →</a>
          </div>
          @for (report of reports.slice(0, 8); track report.id) {
            <mat-card class="report-card" [class.report-fail]="report.failed > 0">
              <mat-card-content>
                <strong>{{ report.suiteName }}</strong>
                <span class="report-stats"><mat-icon class="inline-icon">check_circle</mat-icon> {{ report.passed }} | <mat-icon class="inline-icon">cancel</mat-icon> {{ report.failed }} | <mat-icon class="inline-icon">skip_next</mat-icon> {{ report.skipped }}</span>
                <span class="report-time">{{ report.duration }}ms</span>
                <span class="report-date">{{ report.timestamp | date:'short' }}</span>
              </mat-card-content>
            </mat-card>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .dashboard-header { padding: 20px 24px 0; display: flex; justify-content: space-between; align-items: flex-start; max-width: 1200px; margin: 0 auto; }
    .header-left h1 { margin: 0; color: #1a237e; font-size: 1.6rem; }
    .subtitle { margin: 4px 0 0; color: #666; font-size: 0.9rem; }
    .header-actions { display: flex; gap: 8px; align-items: center; }
    .running-bar { padding: 0 24px; max-width: 1200px; margin: 0 auto; }
    .running-label { font-size: 0.85rem; color: #1a237e; font-weight: 500; display: block; margin-top: 4px; }
    .dashboard { padding: 16px 24px; max-width: 1200px; margin: 0 auto; }
    .metrics { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 16px; }
    .metric-card { text-align: center; }
    .metric-card mat-card-content { padding: 12px 8px; }
    .metric-card.pass { background: #e8f5e9; }
    .metric-card.warn { background: #fff3e0; }
    .metric-icon { font-size: 28px; width: 28px; height: 28px; color: #1a237e; display: block; margin: 0 auto 4px; }
    .metric-icon.text-green { color: #2e7d32; }
    .metric-icon.text-red { color: #c62828; }
    .metric-value { display: block; font-size: 1.8rem; font-weight: 700; color: #1a237e; }
    .metric-value.text-green { color: #2e7d32; }
    .metric-value.text-red { color: #c62828; }
    .metric-label { color: #666; font-size: 0.8rem; }
    .quick-links { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }
    .uptime-badge { margin-left: auto; font-family: monospace; font-size: 0.85rem; color: #666; background: #f5f5f5; padding: 6px 12px; border-radius: 8px; }
    .filters { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
    .filter-input { flex: 1; }
    .suite-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); gap: 16px; }
    .suite-card { margin-bottom: 4px; transition: box-shadow 0.2s; }
    .suite-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .suite-card.suite-fav { border-left: 4px solid #ff9800; }
    .fav-btn { width: 32px; height: 32px; }
    .fav-btn mat-icon { font-size: 18px; }
    .suite-stats { display: flex; gap: 12px; margin-bottom: 8px; font-size: 0.85rem; }
    .stat-item.pass { color: #2e7d32; }
    .stat-item.fail { color: #c62828; }
    .stat-item.pending { color: #f57f17; }
    .progress-label { font-size: 0.8rem; color: #666; margin-top: 4px; display: block; }
    .test-list { max-height: 250px; overflow-y: auto; margin-top: 8px; }
    .test-item { display: flex; align-items: center; gap: 6px; padding: 5px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.85rem; }
    .test-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .test-status-icon { font-size: 18px; width: 18px; height: 18px; }
    .type-chip { font-size: 0.7rem !important; min-height: 22px !important; padding: 0 8px !important; }
    .test-duration { font-size: 0.75rem; color: #999; font-family: monospace; }
    .error-icon { font-size: 16px; width: 16px; height: 16px; color: #c62828; cursor: help; }
    .test-item.passed { color: #2e7d32; }
    .test-item.failed { color: #c62828; }
    .test-item.running { color: #f57f17; }
    .last-run { font-size: 0.8rem; color: #999; margin-top: 8px; }
    h2 { color: #1a237e; margin: 16px 0 12px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; }
    .recent-reports { margin-top: 24px; }
    .report-card { margin-bottom: 6px; border-left: 4px solid #4caf50; transition: transform 0.1s; }
    .report-card:hover { transform: translateX(2px); }
    .report-card.report-fail { border-left-color: #f44336; }
    .report-card mat-card-content { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .report-stats { font-family: monospace; font-size: 0.85rem; }
    .report-time { color: #666; font-family: monospace; font-size: 0.85rem; }
    .report-date { color: #999; font-size: 0.8rem; }
    @media (max-width: 768px) {
      .metrics { grid-template-columns: repeat(3, 1fr); }
      .suite-grid { grid-template-columns: 1fr; }
      .dashboard-header { flex-direction: column; gap: 12px; }
      .filters { flex-wrap: wrap; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  suites: TestSuite[] = [];
  filteredSuites: TestSuite[] = [];
  reports: TestReport[] = [];
  isRunning = false;
  currentTest = '';
  totalTests = 0;
  passRate = 0;
  passedCount = 0;
  failedCount = 0;
  searchTerm = '';
  typeFilter = 'all';
  statusFilter = 'all';
  showFavoritesOnly = false;
  sessionTime = '0m';
  private sessionStart = Date.now();

  constructor(
    private testService: TestService,
    private reportService: ReportService,
    private themeService: ThemeService,
    private notifService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.testService.getSuites().subscribe(s => {
      this.suites = s;
      this.totalTests = s.reduce((sum, suite) => sum + suite.tests.length, 0);
      const allTests = s.flatMap(x => x.tests);
      this.passedCount = allTests.filter(t => t.status === 'passed').length;
      this.failedCount = allTests.filter(t => t.status === 'failed').length;
      this.filterSuites();
    });
    this.reportService.getReports().subscribe(r => {
      this.reports = r;
      this.passRate = this.reportService.getPassRate();
    });
    this.testService.isRunning().subscribe(r => this.isRunning = r);
    this.testService.getCurrentTest().subscribe(t => this.currentTest = t);

    setInterval(() => {
      const mins = Math.floor((Date.now() - this.sessionStart) / 60000);
      this.sessionTime = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
    }, 10000);
  }

  filterSuites(): void {
    this.filteredSuites = this.suites.filter(s => {
      const matchSearch = !this.searchTerm || s.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchType = this.typeFilter === 'all' || s.tests.some(t => t.type === this.typeFilter);
      const matchStatus = this.statusFilter === 'all' || s.tests.some(t => t.status === this.statusFilter);
      const matchFav = !this.showFavoritesOnly || this.isFavorite(s.id);
      return matchSearch && matchType && matchStatus && matchFav;
    });
  }

  async runSuite(suite: TestSuite): Promise<void> {
    const user = this.authService.getCurrentUser();
    this.notifService.logActivity(user?.id || '', user?.name || '', 'run_suite', `Ejecutó suite: ${suite.name}`);
    const report = await this.testService.runSuite(suite.id);
    this.reportService.addReport(report);
    this.passRate = this.reportService.getPassRate();
    if (report.failed > 0) {
      this.notifService.notify('warning', 'Tests Fallidos', `${report.failed} tests fallaron en ${suite.name}`);
    } else {
      this.notifService.notify('success', 'Suite Completada', `${suite.name}: ${report.passed}/${report.total} pasaron`);
    }
  }

  async runAllSuites(): Promise<void> {
    for (const suite of this.filteredSuites) {
      await this.runSuite(suite);
    }
    this.notifService.notify('info', 'Ejecución Completa', `Todas las suites han sido ejecutadas`);
  }

  async retryFailed(suite: TestSuite): Promise<void> {
    const report = await this.testService.retryFailed(suite.id);
    this.reportService.addReport(report);
    this.passRate = this.reportService.getPassRate();
    this.notifService.notify('info', 'Retry Completado', `${suite.name}: ${report.passed}/${report.total} pasaron en retry`);
  }

  async retryAllFailed(): Promise<void> {
    for (const suite of this.suites) {
      if (suite.tests.some(t => t.status === 'failed')) {
        await this.retryFailed(suite);
      }
    }
  }

  resetSuite(suite: TestSuite): void {
    this.testService.resetSuite(suite.id);
  }

  resetAll(): void {
    this.suites.forEach(s => this.testService.resetSuite(s.id));
    this.passedCount = 0;
    this.failedCount = 0;
  }

  exportCSV(): void {
    const csv = this.reportService.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'surtibolivia-test-reports.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  isFavorite(id: string): boolean { return this.themeService.isFavorite(id); }
  toggleFavorite(id: string): void { this.themeService.toggleFavorite(id); }

  getSuiteProgress(suite: TestSuite): number {
    const done = suite.tests.filter(t => t.status === 'passed' || t.status === 'failed').length;
    return suite.tests.length > 0 ? (done / suite.tests.length) * 100 : 0;
  }
  getSuitePassed(suite: TestSuite): number { return suite.tests.filter(t => t.status === 'passed').length; }
  getSuiteFailed(suite: TestSuite): number { return suite.tests.filter(t => t.status === 'failed').length; }
  getSuitePending(suite: TestSuite): number { return suite.tests.filter(t => t.status === 'pending').length; }

  getStatusIcon(status: string): string {
    return { pending: 'hourglass_empty', running: 'sync', passed: 'check_circle', failed: 'cancel', skipped: 'skip_next' }[status] || 'help';
  }
}
