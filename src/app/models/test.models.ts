export interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestCase[];
  createdAt: Date;
  lastRun?: Date;
}

export interface TestCase {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'accessibility' | 'performance';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

export interface TestReport {
  id: string;
  suiteId: string;
  suiteName: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  timestamp: Date;
  results: TestResult[];
}

export interface TestResult {
  testId: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
}

export interface QualityMetrics {
  accessibility: number;
  performance: number;
  bestPractices: number;
  seo: number;
}
