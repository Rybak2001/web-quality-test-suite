import { TestService } from './test.service';

jest.setTimeout(30000);

describe('TestService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  test('should return 6 sample suites', (done) => {
    service.getSuites().subscribe(suites => {
      expect(suites.length).toBe(6);
      expect(suites[0].name).toContain('E-Commerce');
      expect(suites[1].name).toContain('Inventario');
      expect(suites[4].name).toContain('Unit Tests — E-Commerce');
      expect(suites[5].name).toContain('Unit Tests — Inventario');
      done();
    });
  });

  test('should have 8 tests in ecommerce suite', (done) => {
    service.getSuites().subscribe(suites => {
      expect(suites[0].tests.length).toBe(8);
      expect(suites[0].tests[0].type).toBe('integration');
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
    const report = await service.runSuite('5');
    expect(report).toBeDefined();
    expect(report.suiteId).toBe('5');
    expect(report.total).toBe(10);
    expect(report.passed + report.failed + report.skipped).toBe(report.total);
  }, 120000);

  test('should throw for unknown suite', async () => {
    await expect(service.runSuite('nonexistent')).rejects.toThrow('Suite not found');
  });
});
