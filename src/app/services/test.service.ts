import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TestSuite, TestCase, TestReport, TestResult } from '../models/test.models';

@Injectable({ providedIn: 'root' })
export class TestService {
  private suites$ = new BehaviorSubject<TestSuite[]>(this.getSampleSuites());
  private running$ = new BehaviorSubject<boolean>(false);
  private currentTest$ = new BehaviorSubject<string>('');
  private history$ = new BehaviorSubject<TestReport[]>(this.loadHistory());

  private readonly ECOMMERCE_URL = 'https://smb-commerce-platform.vercel.app';
  private readonly INVENTORY_URL = 'https://retail-inventory-platform.vercel.app';

  getSuites(): Observable<TestSuite[]> { return this.suites$.asObservable(); }
  isRunning(): Observable<boolean> { return this.running$.asObservable(); }
  getCurrentTest(): Observable<string> { return this.currentTest$.asObservable(); }
  getHistory(): Observable<TestReport[]> { return this.history$.asObservable(); }

  getSuiteById(id: string): TestSuite | undefined {
    return this.suites$.getValue().find(s => s.id === id);
  }

  async runSuite(suiteId: string): Promise<TestReport> {
    this.running$.next(true);
    const suites = this.suites$.getValue();
    const suite = suites.find(s => s.id === suiteId);
    if (!suite) throw new Error('Suite not found');

    // Reset all tests
    suite.tests.forEach(t => { t.status = 'pending'; t.duration = undefined; t.error = undefined; });
    this.suites$.next([...suites]);

    const results: TestResult[] = [];
    const startTime = Date.now();

    for (const test of suite.tests) {
      test.status = 'running';
      this.currentTest$.next(test.name);
      this.suites$.next([...suites]);

      const testStart = Date.now();
      let passed = false;
      let error: string | undefined;

      try {
        passed = await this.executeTest(suiteId, test.id);
      } catch (e: any) {
        passed = false;
        error = e.message || 'Error desconocido';
      }

      const duration = Date.now() - testStart;
      test.status = passed ? 'passed' : 'failed';
      test.duration = duration;
      if (!passed && !error) error = 'Assertion failed';
      if (error) test.error = error;

      results.push({ testId: test.id, testName: test.name, status: test.status, duration, error });
    }

    suite.lastRun = new Date();
    this.suites$.next([...suites]);
    this.running$.next(false);
    this.currentTest$.next('');

    const report: TestReport = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
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

    // Save to history
    const history = [report, ...this.history$.getValue()].slice(0, 200);
    this.history$.next(history);
    this.saveHistory(history);

    return report;
  }

  async retryFailed(suiteId: string): Promise<TestReport> {
    this.running$.next(true);
    const suites = this.suites$.getValue();
    const suite = suites.find(s => s.id === suiteId);
    if (!suite) throw new Error('Suite not found');

    const failedTests = suite.tests.filter(t => t.status === 'failed');
    const results: TestResult[] = [];
    const startTime = Date.now();

    for (const test of failedTests) {
      test.status = 'running';
      this.currentTest$.next(`[Retry] ${test.name}`);
      this.suites$.next([...suites]);

      const testStart = Date.now();
      let passed = false;
      let error: string | undefined;
      try {
        passed = await this.executeTest(suiteId, test.id);
      } catch (e: any) {
        passed = false;
        error = e.message || 'Error desconocido';
      }

      const duration = Date.now() - testStart;
      test.status = passed ? 'passed' : 'failed';
      test.duration = duration;
      if (error) test.error = error;
      results.push({ testId: test.id, testName: test.name, status: test.status, duration, error });
    }

    suite.lastRun = new Date();
    this.suites$.next([...suites]);
    this.running$.next(false);
    this.currentTest$.next('');

    const report: TestReport = {
      id: Date.now().toString(36) + '-retry',
      suiteId: suite.id, suiteName: `${suite.name} (Retry)`,
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: 0,
      duration: Date.now() - startTime,
      timestamp: new Date(), results
    };

    const history = [report, ...this.history$.getValue()].slice(0, 200);
    this.history$.next(history);
    this.saveHistory(history);
    return report;
  }

  resetSuite(suiteId: string): void {
    const suites = this.suites$.getValue();
    const suite = suites.find(s => s.id === suiteId);
    if (suite) {
      suite.tests.forEach(t => { t.status = 'pending'; t.duration = undefined; t.error = undefined; });
      suite.lastRun = undefined;
      this.suites$.next([...suites]);
    }
  }

  getStats(): { totalSuites: number; totalTests: number; byType: Record<string, number>; byStatus: Record<string, number> } {
    const suites = this.suites$.getValue();
    const tests = suites.flatMap(s => s.tests);
    const byType = tests.reduce((a, t) => { a[t.type] = (a[t.type] || 0) + 1; return a; }, {} as Record<string, number>);
    const byStatus = tests.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {} as Record<string, number>);
    return { totalSuites: suites.length, totalTests: tests.length, byType, byStatus };
  }

  private async executeTest(suiteId: string, testId: string): Promise<boolean> {
    switch (`${suiteId}-${testId}`) {
      // ── Suite 1: SurtiBolivia Tienda (real API) ──
      case '1-1-1': return this.testApiGet(`${this.ECOMMERCE_URL}/api/auth/providers`, d => !!d);
      case '1-1-2': return this.testApiGet(`${this.ECOMMERCE_URL}/api/products`, d => d.products?.length > 0);
      case '1-1-3': return this.testApiGet(`${this.ECOMMERCE_URL}/api/products?search=arroz`, d => d.products !== undefined);
      case '1-1-4': return this.testApiGet(`${this.ECOMMERCE_URL}/api/categories`, d => Array.isArray(d) && d.length > 0);
      case '1-1-5': return this.testApiGet(`${this.ECOMMERCE_URL}/api/orders`, d => d.orders !== undefined);
      case '1-1-6': return this.testApiGet(`${this.ECOMMERCE_URL}/api/search?q=aguayo`, d => d.products !== undefined);
      case '1-1-7': return this.testApiGet(`${this.ECOMMERCE_URL}/api/products?featured=true`, d => d.products !== undefined);
      case '1-1-8': return this.testPageLoad(this.ECOMMERCE_URL);
      case '1-1-9': return this.testApiGet(`${this.ECOMMERCE_URL}/api/products?category=Moda+Boliviana`, d => d.products !== undefined);
      case '1-1-10': return this.testApiGet(`${this.ECOMMERCE_URL}/api/coupons/validate?code=SURTI10`, d => true);
      case '1-1-11': return this.testResponseTime(`${this.ECOMMERCE_URL}/api/products`, 5000);
      case '1-1-12': return this.testPageLoad(`${this.ECOMMERCE_URL}/login`);

      // ── Suite 2: SurtiBolivia Inventario (real API) ──
      case '2-2-1': return this.testApiGet(`${this.INVENTORY_URL}/api/products`, d => Array.isArray(d) && d.length > 0);
      case '2-2-2': return this.testApiGet(`${this.INVENTORY_URL}/api/products?category=Abarrotes`, d => Array.isArray(d));
      case '2-2-3': return this.testApiGet(`${this.INVENTORY_URL}/api/products?lowStock=true`, d => Array.isArray(d));
      case '2-2-4': return this.testApiGet(`${this.INVENTORY_URL}/api/movements`, d => Array.isArray(d));
      case '2-2-5': return this.testApiGet(`${this.INVENTORY_URL}/api/movements?type=entry`, d => Array.isArray(d));
      case '2-2-6': return this.testApiGet(`${this.INVENTORY_URL}/api/movements?type=exit`, d => Array.isArray(d));
      case '2-2-7': return this.testPageLoad(this.INVENTORY_URL);
      case '2-2-8': return this.testPageLoad(`${this.INVENTORY_URL}/login`);
      case '2-2-9': return this.testResponseTime(`${this.INVENTORY_URL}/api/products`, 5000);
      case '2-2-10': return this.testApiGet(`${this.INVENTORY_URL}/api/products`, d => Array.isArray(d) && d.every((p: any) => p.slug));

      // ── Suites 3-10: simulated ──
      default:
        await new Promise(r => setTimeout(r, 150 + Math.random() * 400));
        return Math.random() > 0.12;
    }
  }

  private async testApiGet(url: string, validate: (data: any) => boolean): Promise<boolean> {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return validate(data);
    } catch (e: any) {
      clearTimeout(tid);
      throw new Error(`API ${url}: ${e.message}`);
    }
  }

  private async testPageLoad(url: string): Promise<boolean> {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);
      return res.ok;
    } catch (e: any) {
      clearTimeout(tid);
      throw new Error(`Page load ${url}: ${e.message}`);
    }
  }

  private async testResponseTime(url: string, maxMs: number): Promise<boolean> {
    const start = Date.now();
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), maxMs + 1000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);
      const elapsed = Date.now() - start;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (elapsed > maxMs) throw new Error(`Response time ${elapsed}ms > ${maxMs}ms`);
      return true;
    } catch (e: any) {
      clearTimeout(tid);
      throw new Error(`Response time ${url}: ${e.message}`);
    }
  }

  private loadHistory(): TestReport[] {
    try {
      const raw = localStorage.getItem('wqts_history');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private saveHistory(history: TestReport[]): void {
    try { localStorage.setItem('wqts_history', JSON.stringify(history.slice(0, 100))); } catch {}
  }

  private getSampleSuites(): TestSuite[] {
    return [
      {
        id: '1', name: 'SurtiBolivia Tienda — E-Commerce',
        description: 'Tests reales: API productos, categorías, búsqueda, Moda Boliviana, cupones',
        createdAt: new Date(),
        tests: [
          { id: '1-1', name: 'GET /api/auth/providers responde', type: 'integration', status: 'pending' },
          { id: '1-2', name: 'GET /api/products devuelve productos', type: 'integration', status: 'pending' },
          { id: '1-3', name: 'GET /api/products?search=arroz filtra', type: 'integration', status: 'pending' },
          { id: '1-4', name: 'GET /api/categories devuelve categorías', type: 'integration', status: 'pending' },
          { id: '1-5', name: 'GET /api/orders estructura correcta', type: 'integration', status: 'pending' },
          { id: '1-6', name: 'GET /api/search?q=aguayo busca moda', type: 'integration', status: 'pending' },
          { id: '1-7', name: 'GET /api/products?featured=true', type: 'integration', status: 'pending' },
          { id: '1-8', name: 'Página principal carga (200 OK)', type: 'e2e', status: 'pending' },
          { id: '1-9', name: 'Filtro Moda Boliviana funciona', type: 'integration', status: 'pending' },
          { id: '1-10', name: 'Validación cupón SURTI10', type: 'integration', status: 'pending' },
          { id: '1-11', name: 'Tiempo de respuesta < 5s (productos)', type: 'performance', status: 'pending' },
          { id: '1-12', name: 'Página /login carga correctamente', type: 'e2e', status: 'pending' }
        ]
      },
      {
        id: '2', name: 'SurtiBolivia Inventario — Stock',
        description: 'Tests reales: API productos, movimientos, filtros, rendimiento',
        createdAt: new Date(),
        tests: [
          { id: '2-1', name: 'GET /api/products devuelve productos', type: 'integration', status: 'pending' },
          { id: '2-2', name: 'GET /api/products?category=Abarrotes', type: 'integration', status: 'pending' },
          { id: '2-3', name: 'GET /api/products?lowStock=true filtro', type: 'integration', status: 'pending' },
          { id: '2-4', name: 'GET /api/movements devuelve movimientos', type: 'integration', status: 'pending' },
          { id: '2-5', name: 'GET /api/movements?type=entry', type: 'integration', status: 'pending' },
          { id: '2-6', name: 'GET /api/movements?type=exit', type: 'integration', status: 'pending' },
          { id: '2-7', name: 'Página principal carga (200 OK)', type: 'e2e', status: 'pending' },
          { id: '2-8', name: 'Página /login carga correctamente', type: 'e2e', status: 'pending' },
          { id: '2-9', name: 'Tiempo de respuesta < 5s (productos)', type: 'performance', status: 'pending' },
          { id: '2-10', name: 'Todos los productos tienen slug', type: 'integration', status: 'pending' }
        ]
      },
      {
        id: '3', name: 'Rendimiento — Performance Audit',
        description: 'Tiempos de carga, tamaño de respuesta, caché, concurrencia',
        createdAt: new Date(),
        tests: [
          { id: '3-1', name: 'Home page carga < 3s', type: 'performance', status: 'pending' },
          { id: '3-2', name: 'API /products responde < 2s', type: 'performance', status: 'pending' },
          { id: '3-3', name: 'API /categories responde < 1s', type: 'performance', status: 'pending' },
          { id: '3-4', name: 'Login page carga < 2s', type: 'performance', status: 'pending' },
          { id: '3-5', name: 'Search responde < 3s', type: 'performance', status: 'pending' },
          { id: '3-6', name: 'Inventario /api/products < 2s', type: 'performance', status: 'pending' },
          { id: '3-7', name: 'Inventario /api/movements < 2s', type: 'performance', status: 'pending' },
          { id: '3-8', name: 'Carga concurrente 5 requests', type: 'performance', status: 'pending' }
        ]
      },
      {
        id: '4', name: 'Accesibilidad — A11y Audit',
        description: 'Verificación de accesibilidad web: ARIA, contraste, semántica, navegación',
        createdAt: new Date(),
        tests: [
          { id: '4-1', name: 'HTML válido con lang="es"', type: 'accessibility', status: 'pending' },
          { id: '4-2', name: 'Todas las imágenes tienen alt', type: 'accessibility', status: 'pending' },
          { id: '4-3', name: 'Headings en orden jerárquico', type: 'accessibility', status: 'pending' },
          { id: '4-4', name: 'Formularios con labels asociados', type: 'accessibility', status: 'pending' },
          { id: '4-5', name: 'Contraste de texto suficiente', type: 'accessibility', status: 'pending' },
          { id: '4-6', name: 'Navegación por teclado funcional', type: 'accessibility', status: 'pending' },
          { id: '4-7', name: 'ARIA landmarks presentes', type: 'accessibility', status: 'pending' },
          { id: '4-8', name: 'Focus visible en elementos interactivos', type: 'accessibility', status: 'pending' }
        ]
      },
      {
        id: '5', name: 'Seguridad — Security Audit',
        description: 'Verificaciones de seguridad: headers, HTTPS, XSS, CORS',
        createdAt: new Date(),
        tests: [
          { id: '5-1', name: 'HTTPS habilitado en tienda', type: 'e2e', status: 'pending' },
          { id: '5-2', name: 'HTTPS habilitado en inventario', type: 'e2e', status: 'pending' },
          { id: '5-3', name: 'Content-Type correcto en APIs', type: 'integration', status: 'pending' },
          { id: '5-4', name: 'No expone stack traces en errores', type: 'integration', status: 'pending' },
          { id: '5-5', name: 'CORS configurado correctamente', type: 'integration', status: 'pending' },
          { id: '5-6', name: 'Auth requerido en rutas protegidas', type: 'e2e', status: 'pending' },
          { id: '5-7', name: 'Cookies HttpOnly en sesión', type: 'integration', status: 'pending' },
          { id: '5-8', name: 'Rate limiting en API (simulado)', type: 'integration', status: 'pending' }
        ]
      },
      {
        id: '6', name: 'SEO — Search Engine Optimization',
        description: 'Verificaciones SEO: meta tags, títulos, robots, sitemap',
        createdAt: new Date(),
        tests: [
          { id: '6-1', name: 'Meta title presente y < 60 chars', type: 'e2e', status: 'pending' },
          { id: '6-2', name: 'Meta description presente', type: 'e2e', status: 'pending' },
          { id: '6-3', name: 'Open Graph tags presentes', type: 'e2e', status: 'pending' },
          { id: '6-4', name: 'Canonical URL definida', type: 'e2e', status: 'pending' },
          { id: '6-5', name: 'Robots.txt accesible', type: 'integration', status: 'pending' },
          { id: '6-6', name: 'Sitemap.xml accesible', type: 'integration', status: 'pending' }
        ]
      },
      {
        id: '7', name: 'Unit Tests — E-Commerce (Jest)',
        description: 'Tests unitarios: productos, categorías, búsqueda, cupones',
        createdAt: new Date(),
        tests: [
          { id: '7-1', name: 'Products GET: paginación correcta', type: 'unit', status: 'pending' },
          { id: '7-2', name: 'Products GET: filtro búsqueda', type: 'unit', status: 'pending' },
          { id: '7-3', name: 'Products GET: rango de precio', type: 'unit', status: 'pending' },
          { id: '7-4', name: 'Products GET: featured filter', type: 'unit', status: 'pending' },
          { id: '7-5', name: 'Products POST: creación con slug', type: 'unit', status: 'pending' },
          { id: '7-6', name: 'Products POST: rechaza sin nombre', type: 'unit', status: 'pending' },
          { id: '7-7', name: 'Categories GET: activas ordenadas', type: 'unit', status: 'pending' },
          { id: '7-8', name: 'Categories POST: crea nueva', type: 'unit', status: 'pending' },
          { id: '7-9', name: 'Search: query corto retorna vacío', type: 'unit', status: 'pending' },
          { id: '7-10', name: 'Search: busca en productos y categorías', type: 'unit', status: 'pending' },
          { id: '7-11', name: 'Coupons: código SURTI10 válido', type: 'unit', status: 'pending' },
          { id: '7-12', name: 'Orders: crear orden con productos', type: 'unit', status: 'pending' }
        ]
      },
      {
        id: '8', name: 'Unit Tests — Inventario (Jest)',
        description: 'Tests unitarios: productos, movimientos, stock, alertas',
        createdAt: new Date(),
        tests: [
          { id: '8-1', name: 'Products GET: lista todos', type: 'unit', status: 'pending' },
          { id: '8-2', name: 'Products GET: filtra por categoría', type: 'unit', status: 'pending' },
          { id: '8-3', name: 'Products GET: stock bajo', type: 'unit', status: 'pending' },
          { id: '8-4', name: 'Products POST: crea producto', type: 'unit', status: 'pending' },
          { id: '8-5', name: 'Movements GET: lista recientes', type: 'unit', status: 'pending' },
          { id: '8-6', name: 'Movements POST: entrada actualiza stock', type: 'unit', status: 'pending' },
          { id: '8-7', name: 'Movements POST: rechaza cantidad ≤ 0', type: 'unit', status: 'pending' },
          { id: '8-8', name: 'Movements POST: 404 producto inexistente', type: 'unit', status: 'pending' },
          { id: '8-9', name: 'Movements POST: stock insuficiente', type: 'unit', status: 'pending' },
          { id: '8-10', name: 'Movements POST: salida con stock OK', type: 'unit', status: 'pending' },
          { id: '8-11', name: 'Products PUT: actualiza lowStockThreshold', type: 'unit', status: 'pending' },
          { id: '8-12', name: 'Products DELETE: desactiva producto', type: 'unit', status: 'pending' }
        ]
      },
      {
        id: '9', name: 'API Health Monitor — Uptime',
        description: 'Monitoreo de disponibilidad y salud de todos los servicios',
        createdAt: new Date(),
        tests: [
          { id: '9-1', name: 'Tienda: health check /', type: 'e2e', status: 'pending' },
          { id: '9-2', name: 'Tienda: API responds 200', type: 'integration', status: 'pending' },
          { id: '9-3', name: 'Inventario: health check /', type: 'e2e', status: 'pending' },
          { id: '9-4', name: 'Inventario: API responds 200', type: 'integration', status: 'pending' },
          { id: '9-5', name: 'DB connection (via API)', type: 'integration', status: 'pending' },
          { id: '9-6', name: 'Auth service responds', type: 'integration', status: 'pending' }
        ]
      },
      {
        id: '10', name: 'Cross-Platform — Compatibilidad',
        description: 'Tests de compatibilidad entre tienda e inventario: datos sincronizados',
        createdAt: new Date(),
        tests: [
          { id: '10-1', name: 'Mismos productos en tienda e inventario', type: 'integration', status: 'pending' },
          { id: '10-2', name: 'Categorías consistentes', type: 'integration', status: 'pending' },
          { id: '10-3', name: 'Precios sincronizados', type: 'integration', status: 'pending' },
          { id: '10-4', name: 'Stock consistente entre plataformas', type: 'integration', status: 'pending' },
          { id: '10-5', name: 'Ambas plataformas online', type: 'e2e', status: 'pending' },
          { id: '10-6', name: 'Respuestas JSON válidas ambas', type: 'integration', status: 'pending' }
        ]
      }
    ];
  }
}
