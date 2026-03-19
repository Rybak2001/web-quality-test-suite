import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { TestSuite, TestCase, TestReport, TestResult } from '../models/test.models';

@Injectable({ providedIn: 'root' })
export class TestService {
  private suites$ = new BehaviorSubject<TestSuite[]>(this.getSampleSuites());
  private running$ = new BehaviorSubject<boolean>(false);

  getSuites(): Observable<TestSuite[]> {
    return this.suites$.asObservable();
  }

  isRunning(): Observable<boolean> {
    return this.running$.asObservable();
  }

  async runSuite(suiteId: string): Promise<TestReport> {
    this.running$.next(true);
    const suites = this.suites$.getValue();
    const suite = suites.find(s => s.id === suiteId);
    if (!suite) throw new Error('Suite not found');

    const results: TestResult[] = [];
    const startTime = Date.now();

    for (const test of suite.tests) {
      test.status = 'running';
      this.suites$.next([...suites]);

      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

      const passed = Math.random() > 0.2;
      const duration = Math.floor(100 + Math.random() * 2000);

      test.status = passed ? 'passed' : 'failed';
      test.duration = duration;
      if (!passed) test.error = `Assertion failed: expected true but got false`;

      results.push({
        testId: test.id,
        testName: test.name,
        status: test.status,
        duration,
        error: test.error
      });
    }

    suite.lastRun = new Date();
    this.suites$.next([...suites]);
    this.running$.next(false);

    return {
      id: crypto.randomUUID(),
      suiteId: suite.id,
      suiteName: suite.name,
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      duration: Date.now() - startTime,
      timestamp: new Date(),
      results
    };
  }

  private getSampleSuites(): TestSuite[] {
    return [
      {
        id: '1', name: 'Authentication Tests', description: 'Login, registration, and session management',
        createdAt: new Date(),
        tests: [
          { id: '1-1', name: 'Login with valid credentials', type: 'e2e', status: 'pending' },
          { id: '1-2', name: 'Login with invalid password', type: 'e2e', status: 'pending' },
          { id: '1-3', name: 'Session timeout', type: 'integration', status: 'pending' },
          { id: '1-4', name: 'Password reset flow', type: 'e2e', status: 'pending' }
        ]
      },
      {
        id: '2', name: 'Accessibility Audit', description: 'WCAG 2.1 AA compliance checks',
        createdAt: new Date(),
        tests: [
          { id: '2-1', name: 'Color contrast ratio', type: 'accessibility', status: 'pending' },
          { id: '2-2', name: 'Keyboard navigation', type: 'accessibility', status: 'pending' },
          { id: '2-3', name: 'Screen reader labels', type: 'accessibility', status: 'pending' },
          { id: '2-4', name: 'Focus indicators', type: 'accessibility', status: 'pending' },
          { id: '2-5', name: 'Alt text on images', type: 'accessibility', status: 'pending' }
        ]
      },
      {
        id: '3', name: 'Performance Suite', description: 'Core Web Vitals and load time tests',
        createdAt: new Date(),
        tests: [
          { id: '3-1', name: 'First Contentful Paint < 1.8s', type: 'performance', status: 'pending' },
          { id: '3-2', name: 'Largest Contentful Paint < 2.5s', type: 'performance', status: 'pending' },
          { id: '3-3', name: 'Cumulative Layout Shift < 0.1', type: 'performance', status: 'pending' },
          { id: '3-4', name: 'Total Blocking Time < 200ms', type: 'performance', status: 'pending' }
        ]
      },
      {
        id: '4', name: 'API Integration', description: 'REST API endpoint validation',
        createdAt: new Date(),
        tests: [
          { id: '4-1', name: 'GET /api/users returns 200', type: 'integration', status: 'pending' },
          { id: '4-2', name: 'POST /api/users validates input', type: 'integration', status: 'pending' },
          { id: '4-3', name: 'DELETE requires authentication', type: 'integration', status: 'pending' }
        ]
      }
    ];
  }
}
