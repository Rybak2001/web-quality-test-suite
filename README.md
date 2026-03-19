# Web Quality Test Suite

Angular 17 application for managing and executing web quality test suites with real-time reporting.

## Features

- **Test Dashboard** — Overview of test suites, pass/fail rates, and trends
- **Test Runner** — Execute test suites with real-time progress updates
- **Report Viewer** — Detailed test results with screenshots and logs
- **Accessibility Audits** — WCAG compliance checking
- **Performance Metrics** — Core Web Vitals tracking
- **E2E Tests** — Selenium WebDriver integration

## Tech Stack

- Angular 17 (standalone components)
- TypeScript 5.3
- Jest (unit testing)
- Selenium WebDriver (E2E)
- Chart.js (reporting graphs)
- Angular Material (UI components)

## Getting Started

```bash
npm install
npm start        # Dev server at http://localhost:4200
npm test         # Run unit tests (Jest)
npm run e2e      # Run E2E tests (Selenium)
npm run lint     # Lint with ESLint
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── dashboard/       # Test overview dashboard
│   │   ├── test-runner/     # Execute and monitor tests
│   │   └── report-viewer/   # View detailed results
│   ├── services/
│   │   ├── test.service.ts  # Test execution logic
│   │   └── report.service.ts# Report generation
│   └── models/
│       └── test.models.ts   # TypeScript interfaces
├── assets/
└── styles.css
e2e/
└── app.e2e-spec.ts          # Selenium E2E tests
```
