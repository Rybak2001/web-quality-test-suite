import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TestService } from '../../services/test.service';
import { ReportService } from '../../services/report.service';
import { TestSuite, TestReport } from '../../models/test.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Web Quality Test Suite</h1>
        <div class="metrics">
          <mat-card class="metric-card">
            <mat-card-content>
              <span class="metric-value">{{ suites.length }}</span>
              <span class="metric-label">Test Suites</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="metric-card">
            <mat-card-content>
              <span class="metric-value">{{ totalTests }}</span>
              <span class="metric-label">Total Tests</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="metric-card pass">
            <mat-card-content>
              <span class="metric-value">{{ passRate }}%</span>
              <span class="metric-label">Pass Rate</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="metric-card">
            <mat-card-content>
              <span class="metric-value">{{ reports.length }}</span>
              <span class="metric-label">Runs</span>
            </mat-card-content>
          </mat-card>
        </div>
      </header>

      <section class="suites">
        <h2>Test Suites</h2>
        <div class="suite-grid">
          @for (suite of suites; track suite.id) {
            <mat-card class="suite-card">
              <mat-card-header>
                <mat-card-title>{{ suite.name }}</mat-card-title>
                <mat-card-subtitle>{{ suite.description }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="test-list">
                  @for (test of suite.tests; track test.id) {
                    <div class="test-item" [class]="test.status">
                      <mat-icon>{{ getStatusIcon(test.status) }}</mat-icon>
                      <span>{{ test.name }}</span>
                      <mat-chip-set>
                        <mat-chip>{{ test.type }}</mat-chip>
                      </mat-chip-set>
                    </div>
                  }
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" (click)="runSuite(suite)" [disabled]="isRunning">
                  <mat-icon>play_arrow</mat-icon> Run Suite
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      </section>

      @if (reports.length > 0) {
        <section class="recent-reports">
          <h2>Recent Reports</h2>
          @for (report of reports; track report.id) {
            <mat-card class="report-card">
              <mat-card-content>
                <strong>{{ report.suiteName }}</strong>
                <span class="report-stats">
                  ✅ {{ report.passed }} | ❌ {{ report.failed }} | ⏭ {{ report.skipped }}
                </span>
                <span class="report-time">{{ report.duration }}ms</span>
              </mat-card-content>
            </mat-card>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .dashboard-header h1 { color: #1a237e; margin-bottom: 16px; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .metric-card { text-align: center; }
    .metric-card.pass { background: #e8f5e9; }
    .metric-value { display: block; font-size: 2rem; font-weight: 700; color: #1a237e; }
    .metric-label { color: #666; font-size: 0.9rem; }
    .suite-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px; }
    .suite-card { margin-bottom: 8px; }
    .test-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #eee; }
    .test-item.passed { color: #2e7d32; }
    .test-item.failed { color: #c62828; }
    .test-item.running { color: #f57f17; }
    .recent-reports { margin-top: 32px; }
    .report-card { margin-bottom: 8px; }
    .report-card mat-card-content { display: flex; justify-content: space-between; align-items: center; }
    .report-stats { font-family: monospace; }
    .report-time { color: #666; }
  `]
})
export class DashboardComponent implements OnInit {
  suites: TestSuite[] = [];
  reports: TestReport[] = [];
  isRunning = false;
  totalTests = 0;
  passRate = 0;

  constructor(
    private testService: TestService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.testService.getSuites().subscribe(s => {
      this.suites = s;
      this.totalTests = s.reduce((sum, suite) => sum + suite.tests.length, 0);
    });
    this.reportService.getReports().subscribe(r => this.reports = r);
    this.testService.isRunning().subscribe(r => this.isRunning = r);
  }

  async runSuite(suite: TestSuite): Promise<void> {
    const report = await this.testService.runSuite(suite.id);
    this.reportService.addReport(report);
    this.passRate = this.reportService.getPassRate();
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'hourglass_empty', running: 'sync', passed: 'check_circle', failed: 'cancel', skipped: 'skip_next'
    };
    return icons[status] || 'help';
  }
}
