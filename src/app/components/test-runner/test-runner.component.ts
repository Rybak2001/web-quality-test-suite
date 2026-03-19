import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TestSuite } from '../../models/test.models';

@Component({
  selector: 'app-test-runner',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule],
  template: `
    <mat-card *ngIf="suite" class="runner">
      <mat-card-header>
        <mat-card-title>Running: {{ suite.name }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-progress-bar mode="determinate" [value]="progress"></mat-progress-bar>
        <p class="progress-text">{{ completedTests }} / {{ suite.tests.length }} tests complete</p>
        <div class="running-tests">
          @for (test of suite.tests; track test.id) {
            <div class="test-row" [class]="test.status">
              <span class="status-dot"></span>
              <span>{{ test.name }}</span>
              <span class="duration" *ngIf="test.duration">{{ test.duration }}ms</span>
            </div>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .runner { margin: 16px 0; }
    .progress-text { margin: 12px 0; color: #666; text-align: center; }
    .test-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #ccc; }
    .test-row.passed .status-dot { background: #4caf50; }
    .test-row.failed .status-dot { background: #f44336; }
    .test-row.running .status-dot { background: #ff9800; animation: pulse 1s infinite; }
    .duration { margin-left: auto; color: #999; font-size: 0.85rem; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  `]
})
export class TestRunnerComponent {
  @Input() suite: TestSuite | null = null;

  get progress(): number {
    if (!this.suite) return 0;
    const done = this.suite.tests.filter(t => t.status === 'passed' || t.status === 'failed' || t.status === 'skipped').length;
    return (done / this.suite.tests.length) * 100;
  }

  get completedTests(): number {
    if (!this.suite) return 0;
    return this.suite.tests.filter(t => t.status !== 'pending' && t.status !== 'running').length;
  }
}
