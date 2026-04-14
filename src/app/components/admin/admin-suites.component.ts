import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TestService } from '../../services/test.service';
import { ReportService } from '../../services/report.service';
import { TestSuite, TestReport } from '../../models/test.models';

@Component({
  selector: 'app-admin-suites',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div class="admin-content">
      <div class="page-header">
        <h1>Test Suite Management</h1>
        <button mat-raised-button color="primary" (click)="runAll()" [disabled]="isRunning">
          <mat-icon>play_arrow</mat-icon> Run All Suites
        </button>
      </div>
      @if (isRunning) {
        <mat-progress-bar mode="indeterminate" class="run-progress"></mat-progress-bar>
      }
      <div class="suite-list">
        @for (suite of suites; track suite.id) {
          <mat-card class="suite-card">
            <mat-card-header>
              <mat-card-title>{{ suite.name }}</mat-card-title>
              <mat-card-subtitle>{{ suite.description }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="suite-stats">
                <div class="stat">
                  <span class="stat-value">{{ suite.tests.length }}</span>
                  <span class="stat-label">Tests</span>
                </div>
                <div class="stat">
                  <span class="stat-value passed">{{ getPassed(suite) }}</span>
                  <span class="stat-label">Passed</span>
                </div>
                <div class="stat">
                  <span class="stat-value failed">{{ getFailed(suite) }}</span>
                  <span class="stat-label">Failed</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ getProgress(suite) }}%</span>
                  <span class="stat-label">Progress</span>
                </div>
              </div>
              <mat-progress-bar mode="determinate" [value]="getProgress(suite)" class="suite-progress"></mat-progress-bar>
              <div class="test-types">
                @for (type of getTestTypes(suite); track type) {
                  <mat-chip-set>
                    <mat-chip>{{ type }}</mat-chip>
                  </mat-chip-set>
                }
              </div>
              @if (suite.lastRun) {
                <div class="last-run">Last run: {{ formatDate(suite.lastRun) }}</div>
              }
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" (click)="runSuite(suite)" [disabled]="isRunning">
                <mat-icon>play_arrow</mat-icon> Run
              </button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-content { padding: 24px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .page-header h1 { color: #1a237e; margin: 0; }
    .run-progress { margin-bottom: 16px; }
    .suite-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
    .suite-card { border-left: 4px solid #1a237e; }
    .suite-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
    .stat { text-align: center; }
    .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: #1a237e; }
    .stat-value.passed { color: #2e7d32; }
    .stat-value.failed { color: #c62828; }
    .stat-label { font-size: 0.8rem; color: #666; }
    .suite-progress { margin-bottom: 12px; }
    .test-types { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .last-run { font-size: 0.8rem; color: #999; }
  `]
})
export class AdminSuitesComponent implements OnInit {
  suites: TestSuite[] = [];
  isRunning = false;

  constructor(private testService: TestService, private reportService: ReportService) {}

  ngOnInit(): void {
    this.testService.getSuites().subscribe(s => this.suites = s);
    this.testService.isRunning().subscribe(r => this.isRunning = r);
  }

  async runSuite(suite: TestSuite): Promise<void> {
    const report = await this.testService.runSuite(suite.id);
    this.reportService.addReport(report);
  }

  async runAll(): Promise<void> {
    for (const suite of this.suites) {
      await this.runSuite(suite);
    }
  }

  getPassed(suite: TestSuite): number { return suite.tests.filter(t => t.status === 'passed').length; }
  getFailed(suite: TestSuite): number { return suite.tests.filter(t => t.status === 'failed').length; }
  getProgress(suite: TestSuite): number {
    const done = suite.tests.filter(t => t.status === 'passed' || t.status === 'failed').length;
    return suite.tests.length ? Math.round((done / suite.tests.length) * 100) : 0;
  }
  getTestTypes(suite: TestSuite): string[] { return [...new Set(suite.tests.map(t => t.type))]; }
  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
