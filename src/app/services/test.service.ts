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
        id: '1', name: 'NovaTech Tienda — E-Commerce', description: 'Tests para smb-commerce-platform.vercel.app: autenticación, productos, checkout',
        createdAt: new Date(),
        tests: [
          { id: '1-1', name: 'Login con admin@novatech.bo', type: 'e2e', status: 'pending' },
          { id: '1-2', name: 'Catálogo de productos carga correctamente', type: 'e2e', status: 'pending' },
          { id: '1-3', name: 'Agregar producto al carrito', type: 'e2e', status: 'pending' },
          { id: '1-4', name: 'Checkout con Stripe (Bs.)', type: 'integration', status: 'pending' },
          { id: '1-5', name: 'Panel admin: gestión de pedidos', type: 'e2e', status: 'pending' }
        ]
      },
      {
        id: '2', name: 'NovaTech Inventario — Stock', description: 'Tests para retail-inventory-platform: productos, movimientos, reportes',
        createdAt: new Date(),
        tests: [
          { id: '2-1', name: 'Login con roles (admin/gestor/empleado)', type: 'e2e', status: 'pending' },
          { id: '2-2', name: 'CRUD de productos con SKU', type: 'integration', status: 'pending' },
          { id: '2-3', name: 'Registro de movimientos de inventario', type: 'e2e', status: 'pending' },
          { id: '2-4', name: 'Reporte de stock bajo', type: 'e2e', status: 'pending' },
          { id: '2-5', name: 'Exportar reporte de inventario', type: 'integration', status: 'pending' }
        ]
      },
      {
        id: '3', name: 'NovaTech Docs — Documentos', description: 'Tests para saas-auth-service.vercel.app: CRUD documentos, categorías, búsqueda',
        createdAt: new Date(),
        tests: [
          { id: '3-1', name: 'JWT login y refresh token', type: 'integration', status: 'pending' },
          { id: '3-2', name: 'Crear documento con categoría', type: 'e2e', status: 'pending' },
          { id: '3-3', name: 'Buscar documentos por texto', type: 'e2e', status: 'pending' },
          { id: '3-4', name: 'Fijar/desfijar documento', type: 'e2e', status: 'pending' },
          { id: '3-5', name: 'Auditoría de acciones registrada', type: 'integration', status: 'pending' }
        ]
      },
      {
        id: '4', name: 'NovaTech Ops — Monitoreo', description: 'Tests para realtime-ops-dashboard.vercel.app: métricas, alertas, exportación',
        createdAt: new Date(),
        tests: [
          { id: '4-1', name: 'Dashboard carga métricas en tiempo real', type: 'e2e', status: 'pending' },
          { id: '4-2', name: 'API GET /api/metrics responde 200', type: 'integration', status: 'pending' },
          { id: '4-3', name: 'Exportar métricas CSV/JSON', type: 'integration', status: 'pending' },
          { id: '4-4', name: 'Filtrar alertas por severidad', type: 'e2e', status: 'pending' }
        ]
      },
      {
        id: '5', name: 'Performance — Todos los Proyectos', description: 'Core Web Vitals y tiempos de carga para todos los servicios NovaTech',
        createdAt: new Date(),
        tests: [
          { id: '5-1', name: 'FCP < 1.8s en NovaTech Tienda', type: 'performance', status: 'pending' },
          { id: '5-2', name: 'LCP < 2.5s en NovaTech Inventario', type: 'performance', status: 'pending' },
          { id: '5-3', name: 'CLS < 0.1 en NovaTech Docs', type: 'performance', status: 'pending' },
          { id: '5-4', name: 'TBT < 200ms en NovaTech Ops', type: 'performance', status: 'pending' },
          { id: '5-5', name: 'TTI < 3s en KPI Observability', type: 'performance', status: 'pending' }
        ]
      },
      {
        id: '6', name: 'Accesibilidad — WCAG 2.1 AA', description: 'Auditoría de accesibilidad para todos los proyectos NovaTech',
        createdAt: new Date(),
        tests: [
          { id: '6-1', name: 'Contraste de color en tema indigo', type: 'accessibility', status: 'pending' },
          { id: '6-2', name: 'Navegación por teclado completa', type: 'accessibility', status: 'pending' },
          { id: '6-3', name: 'Labels para lectores de pantalla', type: 'accessibility', status: 'pending' },
          { id: '6-4', name: 'Indicadores de foco visibles', type: 'accessibility', status: 'pending' },
          { id: '6-5', name: 'Textos alternativos en imágenes', type: 'accessibility', status: 'pending' }
        ]
      }
    ];
  }
}
