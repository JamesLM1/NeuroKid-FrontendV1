import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { DashboardMetricsDTO } from '../../../models/dashboard-metrics.dto';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  // Variable para saber qué pestaña está activa
  activeTab: string = 'inicio';

  // Métricas del sistema (datos reales desde backend)
  metrics: DashboardMetricsDTO | null = null;
  
  // Métricas legacy (mantenidas para compatibilidad si se usan en otros lugares)
  totalUsuarios: number = 0;
  asignacionesActivas: number = 0;
  recursosTotal: number = 0;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.cargarMetricas();
  }

  // Función para cambiar la pestaña activa
  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  // Cargar métricas del sistema desde el backend
  cargarMetricas(): void {
    this.adminService.getDashboardMetrics().subscribe({
      next: (data: DashboardMetricsDTO) => {
        this.metrics = data;
        console.log('📊 Métricas del sistema cargadas:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar métricas:', err);
        // En caso de error, mantener valores por defecto
        this.metrics = {
          ingresosEstimados: 0,
          calidadPromedio: 0,
          totalCitas: 0,
          totalPacientes: 0
        };
      }
    });
  }
}