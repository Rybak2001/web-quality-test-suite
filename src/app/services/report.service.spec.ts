import { ReportService } from './report.service';
import { TestReport } from '../models/test.models';

describe('ReportService', () => {
  let service: ReportService;

  const mockReport: TestReport = {
    id: 'r-1',
    suiteId: '1',
    suiteName: 'Auth Tests',
    total: 4,
    passed: 3,
    failed: 1,
    skipped: 0,
    duration: 1500,
    timestamp: new Date(),
    results: [
      { testId: '1', testName: 'Login', status: 'passed', duration: 400 },
      { testId: '2', testName: 'Register', status: 'passed', duration: 350 },
      { testId: '3', testName: 'Logout', status: 'passed', duration: 200 },
      { testId: '4', testName: 'Reset', status: 'failed', duration: 550, error: 'Timeout' }
    ]
  };

  beforeEach(() => {
    service = new ReportService();
  });

  test('should start with empty reports', (done) => {
    service.getReports().subscribe(reports => {
      expect(reports).toEqual([]);
      done();
    });
  });

  test('should add a report', (done) => {
    service.addReport(mockReport);
    service.getReports().subscribe(reports => {
      expect(reports.length).toBe(1);
      expect(reports[0].suiteName).toBe('Auth Tests');
      done();
    });
  });

  test('should calculate pass rate', () => {
    service.addReport(mockReport);
    expect(service.getPassRate()).toBe(75);
  });

  test('should export CSV', () => {
    service.addReport(mockReport);
    const csv = service.exportCSV();
    expect(csv).toContain('Suite,Total');
    expect(csv).toContain('Auth Tests,4,3,1,0');
  });
});
