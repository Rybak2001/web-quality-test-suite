import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TestService } from '../../services/test.service';
import { ReportService } from '../../services/report.service';
import { AuthService } from '../../services/auth.service';
import { TestSuite, TestReport } from '../../models/test.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="admin-content">
      <h1>Admin Dashboard</h1>
      <div class="kpi-grid">
        <mat-card class="kpi-card">
          <mat-card-content>
            <mat-icon class="kpi-icon users">people</mat-icon>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalUsers }}</span>
              <span class="kpi-label">Users</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="kpi-card">
          <mat-card-content>
            <mat-icon class="kpi-icon suites">folder_open</mat-icon>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalSuites }}</span>
              <span class="kpi-label">Test Suites</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="kpi-card">
          <mat-card-content>
            <mat-icon class="kpi-icon tests">checklist</mat-icon>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalTests }}</span>
              <span class="kpi-label">Total Tests</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="kpi-card">
          <mat-card-content>
            <mat-icon class="kpi-icon reports">assessment</mat-icon>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalReports }}</span>
              <span class="kpi-label">Reports</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="kpi-card">
          <mat-card-content>
            <mat-icon class="kpi-icon rate" [class.good]="passRate >= 80" [class.bad]="passRate < 80 && passRate > 0">trending_up</mat-icon>
            <div class="kpi-info">
              <span class="kpi-value">{{ passRate }}%</span>
              <span class="kpi-label">Pass Rate</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="kpi-card">
          <mat-card-content>
            <mat-icon class="kpi-icon admins">admin_panel_settings</mat-icon>
            <div class="kpi-info">
              <span class="kpi-value">{{ adminCount }}</span>
              <span class="kpi-label">Admins</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="charts-row">
        <mat-card class="chart-card">
          <mat-card-header><mat-card-title>Tests by Type</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="bar-chart">
              @for (item of testsByType; track item.type) {
                <div class="bar-row">
                  <span class="bar-label">{{ item.type }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="item.percentage" [style.background]="item.color"></div>
                  </div>
                  <span class="bar-value">{{ item.count }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="chart-card">
          <mat-card-header><mat-card-title>Tests by Status</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="bar-chart">
              @for (item of testsByStatus; track item.status) {
                <div class="bar-row">
                  <span class="bar-label">{{ item.status }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="item.percentage" [style.background]="item.color"></div>
                  </div>
                  <span class="bar-value">{{ item.count }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      @if (recentReports.length > 0) {
        <mat-card class="recent-card">
          <mat-card-header><mat-card-title>Recent Reports</mat-card-title></mat-card-header>
          <mat-card-content>
            <table class="data-table">
              <thead>
                <tr><th>Suite</th><th>Total</th><th>Passed</th><th>Failed</th><th>Duration</th></tr>
              </thead>
              <tbody>
                @for (r of recentReports; track r.id) {
                  <tr>
                    <td>{{ r.suiteName }}</td>
                    <td>{{ r.total }}</td>
                    <td class="text-green">{{ r.passed }}</td>
                    <td class="text-red">{{ r.failed }}</td>
                    <td>{{ r.duration }}ms</td>
                  </tr>
                }
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .admin-content { padding: 24px; }
    h1 { color: #1a237e; margin-bottom: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card mat-card-content { display: flex; align-items: center; gap: 16px; }
    .kpi-icon { font-size: 40px; width: 40px; height: 40px; }
    .kpi-icon.users { color: #1565c0; }
    .kpi-icon.suites { color: #6a1b9a; }
    .kpi-icon.tests { color: #00838f; }
    .kpi-icon.reports { color: #e65100; }
    .kpi-icon.rate { color: #2e7d32; }
    .kpi-icon.rate.bad { color: #c62828; }
    .kpi-icon.admins { color: #ad1457; }
    .kpi-value { font-size: 1.8rem; font-weight: 700; color: #1a237e; display: block; }
    .kpi-label { font-size: 0.85rem; color: #666; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .bar-chart { padding: 8px 0; }
    .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .bar-label { width: 100px; font-size: 0.85rem; text-transform: capitalize; }
    .bar-track { flex: 1; height: 24px; background: #e0e0e0; border-radius: 12px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 12px; transition: width 0.5s ease; }
    .bar-value { width: 30px; text-align: right; font-weight: 600; font-size: 0.85rem; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 10px 12px; background: #e8eaf6; color: #1a237e; font-size: 0.85rem; }
    .data-table td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    .text-green { color: #2e7d32; font-weight: 600; }
    .text-red { color: #c62828; font-weight: 600; }
    .recent-card { margin-bottom: 24px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = 0;
  totalSuites = 0;
  totalTests = 0;
  totalReports = 0;
  passRate = 0;
  adminCount = 0;
  testsByType: { type: string; count: number; percentage: number; color: string }[] = [];
  testsByStatus: { status: string; count: number; percentage: number; color: string }[] = [];
  recentReports: TestReport[] = [];

  constructor(
    private testService: TestService,
    private reportService: ReportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const users = this.authService.getAllUsers();
    this.totalUsers = users.length;
    this.adminCount = users.filter(u => u.role === 'admin').length;

    this.testService.getSuites().subscribe(suites => {
      this.totalSuites = suites.length;
      const allTests = suites.flatMap(s => s.tests);
      this.totalTests = allTests.length;

      const typeColors: Record<string, string> = { unit: '#1565c0', integration: '#6a1b9a', e2e: '#00838f', accessibility: '#e65100', performance: '#2e7d32' };
      const typeCounts = allTests.reduce((acc, t) => { acc[t.type] = (acc[t.type] || 0) + 1; return acc; }, {} as Record<string, number>);
      const maxType = Math.max(...Object.values(typeCounts), 1);
      this.testsByType = Object.entries(typeCounts).map(([type, count]) => ({
        type, count, percentage: (count / maxType) * 100, color: typeColors[type] || '#666'
      }));

      const statusColors: Record<string, string> = { pending: '#9e9e9e', passed: '#2e7d32', failed: '#c62828', running: '#f57f17', skipped: '#616161' };
      const statusCounts = allTests.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {} as Record<string, number>);
      const maxStatus = Math.max(...Object.values(statusCounts), 1);
      this.testsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status, count, percentage: (count / maxStatus) * 100, color: statusColors[status] || '#666'
      }));
    });

    this.reportService.getReports().subscribe(r => {
      this.recentReports = r.slice(0, 10);
      this.totalReports = r.length;
      this.passRate = this.reportService.getPassRate();
    });
  }
}
