import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TestReport } from '../../models/test.models';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card *ngIf="report" class="report">
      <mat-card-header>
        <mat-card-title>{{ report.suiteName }} — Report</mat-card-title>
        <mat-card-subtitle>{{ report.timestamp | date:'medium' }} · {{ report.duration }}ms</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="summary">
          <div class="stat pass"><mat-icon class="inline-icon">check_circle</mat-icon> {{ report.passed }} passed</div>
          <div class="stat fail"><mat-icon class="inline-icon">cancel</mat-icon> {{ report.failed }} failed</div>
          <div class="stat skip"><mat-icon class="inline-icon">skip_next</mat-icon> {{ report.skipped }} skipped</div>
        </div>
        <table mat-table [dataSource]="report.results" class="results-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Test</th>
            <td mat-cell *matCellDef="let r">{{ r.testName }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r" [class]="r.status">{{ r.status }}</td>
          </ng-container>
          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef>Duration</th>
            <td mat-cell *matCellDef="let r">{{ r.duration }}ms</td>
          </ng-container>
          <ng-container matColumnDef="error">
            <th mat-header-cell *matHeaderCellDef>Error</th>
            <td mat-cell *matCellDef="let r">{{ r.error || '—' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button (click)="exportCSV()">Export CSV</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .summary { display: flex; gap: 24px; margin: 16px 0; font-size: 1.1rem; }
    .stat.pass { color: #2e7d32; }
    .stat.fail { color: #c62828; }
    .stat.skip { color: #f57f17; }
    .results-table { width: 100%; }
    td.passed { color: #2e7d32; font-weight: 500; }
    td.failed { color: #c62828; font-weight: 500; }
  `]
})
export class ReportViewerComponent {
  @Input() report: TestReport | null = null;
  displayedColumns = ['name', 'status', 'duration', 'error'];

  constructor(private reportService: ReportService) {}

  exportCSV(): void {
    const csv = this.reportService.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
