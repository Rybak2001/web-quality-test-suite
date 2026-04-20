import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { TestService } from '../../services/test.service';
import { TestSuite, TestCase } from '../../models/test.models';

@Component({
  selector: 'app-tests-inventory',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <div class="breadcrumb"><a routerLink="/">Dashboard</a> / Tests Inventario</div>
          <h1>Tests — SurtiBolivia Inventario</h1>
          <p class="subtitle">Suite completa de pruebas para la plataforma de inventario</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="runAll()" [disabled]="running">
            <mat-icon>play_arrow</mat-icon> Ejecutar Todos
          </button>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <mat-icon class="summary-icon">inventory_2</mat-icon>
          <div class="summary-value">{{ suites.length }}</div>
          <div class="summary-label">Suites</div>
        </div>
        <div class="summary-card">
          <mat-icon class="summary-icon">checklist</mat-icon>
          <div class="summary-value">{{ totalTests }}</div>
          <div class="summary-label">Tests Totales</div>
        </div>
        <div class="summary-card passed-card">
          <mat-icon class="summary-icon">check_circle</mat-icon>
          <div class="summary-value">{{ passedTests }}</div>
          <div class="summary-label">Pasados</div>
        </div>
        <div class="summary-card failed-card">
          <mat-icon class="summary-icon">cancel</mat-icon>
          <div class="summary-value">{{ failedTests }}</div>
          <div class="summary-label">Fallidos</div>
        </div>
      </div>

      @for (section of sections; track section.type) {
        <div class="type-section">
          <div class="section-header">
            <mat-icon>{{ section.icon }}</mat-icon>
            <h2>{{ section.label }}</h2>
            <span class="test-count">{{ section.tests.length }} tests</span>
          </div>

          @for (suite of section.suites; track suite.id) {
            <mat-card class="suite-card">
              <div class="suite-header">
                <div>
                  <h3>{{ suite.name }}</h3>
                  <p class="suite-desc">{{ suite.description }}</p>
                </div>
                <div class="suite-actions">
                  <button mat-stroked-button color="primary" (click)="runSuite(suite.id)" [disabled]="running">
                    <mat-icon>play_arrow</mat-icon> Ejecutar
                  </button>
                  <button mat-icon-button (click)="resetSuite(suite.id)" matTooltip="Resetear">
                    <mat-icon>refresh</mat-icon>
                  </button>
                </div>
              </div>

              @if (getSuiteStats(suite).total > 0) {
                <mat-progress-bar mode="determinate" [value]="getSuiteStats(suite).passRate" [color]="getSuiteStats(suite).failedCount > 0 ? 'warn' : 'primary'"></mat-progress-bar>
                <div class="stats-row">
                  <span class="stat passed">{{ getSuiteStats(suite).passedCount }} pasados</span>
                  <span class="stat failed">{{ getSuiteStats(suite).failedCount }} fallidos</span>
                  <span class="stat pending">{{ getSuiteStats(suite).pendingCount }} pendientes</span>
                  @if (suite.lastRun) {
                    <span class="stat last-run">Ultima: {{ suite.lastRun | date:'short' }}</span>
                  }
                </div>
              }

              <div class="tests-grid">
                @for (test of suite.tests; track test.id) {
                  <div class="test-item" [class]="test.status">
                    <mat-icon class="test-icon">
                      @switch (test.status) {
                        @case ('passed') { check_circle }
                        @case ('failed') { cancel }
                        @case ('running') { hourglass_top }
                        @default { radio_button_unchecked }
                      }
                    </mat-icon>
                    <div class="test-info">
                      <span class="test-name">{{ test.name }}</span>
                      <div class="test-meta">
                        <mat-chip-set>
                          <mat-chip class="type-chip">{{ test.type }}</mat-chip>
                        </mat-chip-set>
                        @if (test.duration) {
                          <span class="test-duration">{{ test.duration }}ms</span>
                        }
                      </div>
                      @if (test.error) {
                        <div class="test-error" [matTooltip]="test.error">{{ test.error }}</div>
                      }
                    </div>
                  </div>
                }
              </div>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .breadcrumb { font-size: 0.85rem; color: #6b7280; margin-bottom: 4px; }
    .breadcrumb a { color: #5b4fc7; text-decoration: none; }
    h1 { margin: 0; font-size: 1.75rem; color: #1e1e2e; }
    .subtitle { margin: 4px 0 0; color: #6b7280; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .summary-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; }
    .summary-icon { color: #0d9488; font-size: 28px; width: 28px; height: 28px; }
    .summary-value { font-size: 2rem; font-weight: 700; color: #1e1e2e; }
    .summary-label { font-size: 0.85rem; color: #6b7280; }
    .passed-card .summary-value { color: #16a34a; }
    .passed-card .summary-icon { color: #16a34a; }
    .failed-card .summary-value { color: #dc2626; }
    .failed-card .summary-icon { color: #dc2626; }
    .type-section { margin-bottom: 32px; }
    .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #ccfbf1; }
    .section-header mat-icon { color: #0d9488; }
    .section-header h2 { margin: 0; font-size: 1.2rem; color: #1e1e2e; }
    .test-count { font-size: 0.85rem; color: #6b7280; margin-left: auto; }
    .suite-card { margin-bottom: 16px; padding: 20px !important; }
    .suite-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .suite-header h3 { margin: 0 0 4px; font-size: 1.05rem; }
    .suite-desc { margin: 0; font-size: 0.85rem; color: #6b7280; }
    .suite-actions { display: flex; gap: 4px; align-items: center; }
    .stats-row { display: flex; gap: 16px; margin: 8px 0 12px; font-size: 0.8rem; }
    .stat.passed { color: #16a34a; font-weight: 600; }
    .stat.failed { color: #dc2626; font-weight: 600; }
    .stat.pending { color: #6b7280; }
    .stat.last-run { color: #9ca3af; margin-left: auto; }
    .tests-grid { display: grid; gap: 6px; }
    .test-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; border-radius: 8px; border: 1px solid #f3f4f6; transition: background 0.15s; }
    .test-item:hover { background: #f9fafb; }
    .test-item.passed { border-left: 3px solid #16a34a; }
    .test-item.failed { border-left: 3px solid #dc2626; background: #fef2f2; }
    .test-item.running { border-left: 3px solid #f59e0b; background: #fffbeb; }
    .test-icon { font-size: 18px; width: 18px; height: 18px; margin-top: 2px; }
    .test-info { flex: 1; min-width: 0; }
    .test-name { font-size: 0.9rem; font-weight: 500; }
    .test-meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .type-chip { font-size: 0.7rem !important; min-height: 20px !important; padding: 0 8px !important; }
    .test-duration { font-size: 0.75rem; color: #6b7280; font-family: monospace; }
    .test-error { font-size: 0.75rem; color: #dc2626; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 500px; }
  `]
})
export class TestsInventoryComponent implements OnInit, OnDestroy {
  suites: TestSuite[] = [];
  running = false;
  sections: { type: string; label: string; icon: string; suites: TestSuite[]; tests: TestCase[] }[] = [];
  totalTests = 0;
  passedTests = 0;
  failedTests = 0;
  private sub!: Subscription;

  constructor(private testService: TestService) {}

  ngOnInit(): void {
    const inventoryIds = ['2', '8', '9', '10'];
    this.sub = this.testService.getSuites().subscribe(all => {
      this.suites = all.filter(s => inventoryIds.includes(s.id));
      this.buildSections();
      this.updateCounts();
    });
    this.testService.isRunning().subscribe(r => this.running = r);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  buildSections(): void {
    const map: Record<string, { label: string; icon: string; suites: TestSuite[]; tests: TestCase[] }> = {
      integration: { label: 'Tests de Integracion (API)', icon: 'api', suites: [], tests: [] },
      unit: { label: 'Tests Unitarios', icon: 'code', suites: [], tests: [] },
      e2e: { label: 'Tests End-to-End', icon: 'web', suites: [], tests: [] },
      performance: { label: 'Tests de Rendimiento', icon: 'speed', suites: [], tests: [] },
    };
    for (const suite of this.suites) {
      const types = [...new Set(suite.tests.map(t => t.type))];
      for (const type of types) {
        if (map[type]) {
          if (!map[type].suites.includes(suite)) map[type].suites.push(suite);
          map[type].tests.push(...suite.tests.filter(t => t.type === type));
        }
      }
    }
    this.sections = Object.entries(map)
      .filter(([, v]) => v.tests.length > 0)
      .map(([type, v]) => ({ type, ...v }));
  }

  updateCounts(): void {
    const tests = this.suites.flatMap(s => s.tests);
    this.totalTests = tests.length;
    this.passedTests = tests.filter(t => t.status === 'passed').length;
    this.failedTests = tests.filter(t => t.status === 'failed').length;
  }

  getSuiteStats(suite: TestSuite) {
    const total = suite.tests.length;
    const passedCount = suite.tests.filter(t => t.status === 'passed').length;
    const failedCount = suite.tests.filter(t => t.status === 'failed').length;
    const pendingCount = suite.tests.filter(t => t.status === 'pending').length;
    return { total, passedCount, failedCount, pendingCount, passRate: total > 0 ? (passedCount / total) * 100 : 0 };
  }

  async runSuite(id: string): Promise<void> { await this.testService.runSuite(id); }
  resetSuite(id: string): void { this.testService.resetSuite(id); }

  async runAll(): Promise<void> {
    for (const suite of this.suites) {
      await this.testService.runSuite(suite.id);
    }
  }
}
