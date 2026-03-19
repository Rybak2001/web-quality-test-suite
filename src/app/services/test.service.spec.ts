import { TestService } from './test.service';

describe('TestService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  test('should return sample suites', (done) => {
    service.getSuites().subscribe(suites => {
      expect(suites.length).toBeGreaterThan(0);
      expect(suites[0].name).toBeDefined();
      expect(suites[0].tests.length).toBeGreaterThan(0);
      done();
    });
  });

  test('should initially not be running', (done) => {
    service.isRunning().subscribe(running => {
      expect(running).toBe(false);
      done();
    });
  });

  test('should run a suite and return report', async () => {
    const report = await service.runSuite('1');
    expect(report).toBeDefined();
    expect(report.suiteId).toBe('1');
    expect(report.total).toBeGreaterThan(0);
    expect(report.passed + report.failed + report.skipped).toBe(report.total);
  });

  test('should throw for unknown suite', async () => {
    await expect(service.runSuite('nonexistent')).rejects.toThrow('Suite not found');
  });
});
