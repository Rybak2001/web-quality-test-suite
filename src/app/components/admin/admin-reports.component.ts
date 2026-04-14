import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ReportService } from '../../services/report.service';
import { TestReport } from '../../models/test.models';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="admin-content">
      <div class="page-header">
        <h1>Report History</h1>
        <div class="header-actions">
          <span class="report-count">{{ reports.length }} reports</span>
          <button mat-raised-button color="accent" (click)="exportCSV()" [disabled]="reports.length === 0">
            <mat-icon>download</mat-icon> Export CSV
          </button>
        </div>
      </div>

      @if (reports.length === 0) {
        <mat-card class="empty-card">
          <mat-card-content>
            <mat-icon class="empty-icon">assignment</mat-icon>
            <p>No reports yet. Run some test suites to generate reports.</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card>
          <mat-card-content>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Suite</th>
                  <th>Total</th>
                  <th>Passed</th>
                  <th>Failed</th>
                  <th>Skipped</th>
                  <th>Duration</th>
                  <th>Pass Rate</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                @for (report of reports; track report.id) {
                  <tr [class.row-fail]="report.failed > 0">
                    <td><strong>{{ report.suiteName }}</strong></td>
                    <td>{{ report.total }}</td>
                    <td class="text-green">{{ report.passed }}</td>
                    <td class="text-red">{{ report.failed }}</td>
                    <td class="text-gray">{{ report.skipped }}</td>
                    <td>{{ report.duration }}ms</td>
                    <td>
                      <span class="rate-badge" [class.good]="getRate(report) >= 80" [class.bad]="getRate(report) < 80">
                        {{ getRate(report) }}%
                      </span>
                    </td>
                    <td>{{ formatDate(report.timestamp) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>

        <div class="summary-row">
          <mat-card class="summary-card">
            <mat-card-content>
              <mat-icon class="summary-icon good">check_circle</mat-icon>
              <div>
                <span class="summary-value">{{ totalPassed }}</span>
                <span class="summary-label">Total Passed</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <mat-icon class="summary-icon bad">cancel</mat-icon>
              <div>
                <span class="summary-value">{{ totalFailed }}</span>
                <span class="summary-label">Total Failed</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <mat-icon class="summary-icon neutral">speed</mat-icon>
              <div>
                <span class="summary-value">{{ avgDuration }}ms</span>
                <span class="summary-label">Avg Duration</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <mat-icon class="summary-icon" [class.good]="overallRate >= 80" [class.bad]="overallRate < 80">percent</mat-icon>
              <div>
                <span class="summary-value">{{ overallRate }}%</span>
                <span class="summary-label">Overall Pass Rate</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-content { padding: 24px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .page-header h1 { color: #1a237e; margin: 0; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .report-count { background: #e8eaf6; color: #1a237e; padding: 4px 12px; border-radius: 16px; font-size: 0.85rem; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px; background: #e8eaf6; color: #1a237e; font-size: 0.85rem; }
    .data-table td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    .row-fail { background: #fff8f8; }
    .text-green { color: #2e7d32; font-weight: 600; }
    .text-red { color: #c62828; font-weight: 600; }
    .text-gray { color: #9e9e9e; }
    .rate-badge { padding: 2px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; }
    .rate-badge.good { background: #e8f5e9; color: #2e7d32; }
    .rate-badge.bad { background: #ffebee; color: #c62828; }
    .empty-card { text-align: center; padding: 48px; }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; }
    .empty-card p { color: #999; margin-top: 12px; }
    .summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px; }
    .summary-card mat-card-content { display: flex; align-items: center; gap: 16px; }
    .summary-icon { font-size: 36px; width: 36px; height: 36px; }
    .summary-icon.good { color: #2e7d32; }
    .summary-icon.bad { color: #c62828; }
    .summary-icon.neutral { color: #1565c0; }
    .summary-value { display: block; font-size: 1.5rem; font-weight: 700; color: #1a237e; }
    .summary-label { font-size: 0.8rem; color: #666; }
  `]
})
export class AdminReportsComponent implements OnInit {
  reports: TestReport[] = [];
  totalPassed = 0;
  totalFailed = 0;
  avgDuration = 0;
  overallRate = 0;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.getReports().subscribe(r => {
      this.reports = r;
      this.totalPassed = r.reduce((s, rep) => s + rep.passed, 0);
      this.totalFailed = r.reduce((s, rep) => s + rep.failed, 0);
      this.avgDuration = r.length ? Math.round(r.reduce((s, rep) => s + rep.duration, 0) / r.length) : 0;
      this.overallRate = this.reportService.getPassRate();
    });
  }

  getRate(report: TestReport): number {
    return report.total > 0 ? Math.round((report.passed / report.total) * 100) : 0;
  }

  exportCSV(): void {
    const csv = this.reportService.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-reports.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
