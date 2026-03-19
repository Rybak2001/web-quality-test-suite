import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TestReport } from '../models/test.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private reports$ = new BehaviorSubject<TestReport[]>([]);

  getReports(): Observable<TestReport[]> {
    return this.reports$.asObservable();
  }

  addReport(report: TestReport): void {
    const current = this.reports$.getValue();
    this.reports$.next([report, ...current]);
  }

  getReport(id: string): TestReport | undefined {
    return this.reports$.getValue().find(r => r.id === id);
  }

  getPassRate(): number {
    const reports = this.reports$.getValue();
    if (reports.length === 0) return 0;
    const totalPassed = reports.reduce((sum, r) => sum + r.passed, 0);
    const totalTests = reports.reduce((sum, r) => sum + r.total, 0);
    return totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  }

  exportCSV(): string {
    const reports = this.reports$.getValue();
    const header = 'Suite,Total,Passed,Failed,Skipped,Duration(ms),Date\n';
    const rows = reports.map(r =>
      `${r.suiteName},${r.total},${r.passed},${r.failed},${r.skipped},${r.duration},${r.timestamp}`
    ).join('\n');
    return header + rows;
  }
}
