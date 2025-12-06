import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ADMINPadreDTO } from '../models/admin-padre.dto';
import { ADMINPsicologoDTO } from '../models/admin-psicologo.dto';
import { ADMINAsignacionDTO } from '../models/admin-asignacion.dto';
import { ADMINRecursoEducativoDTO } from '../models/admin-recurso-educativo.dto';
import { ADMINCitaListDTO } from '../models/admin-cita-list.dto';
import { ADMINEvaluacionListDTO } from '../models/admin-evaluacion-list.dto';
import { DashboardMetricsDTO } from '../models/dashboard-metrics.dto';
import { PADREMenorDTO } from '../models/padre-menor.dto';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  ruta_servidor: string = "https://neurokid-api-v2.onrender.com/api/admin";

  constructor(private http: HttpClient) { }

  // --- GESTIÓN DE PADRES (ADMIN) ---
  getAllPadres(): Observable<ADMINPadreDTO[]> {
    return this.http.get<ADMINPadreDTO[]>(`${this.ruta_servidor}/padres`);
  }
  getPadreById(id: number): Observable<ADMINPadreDTO> {
    return this.http.get<ADMINPadreDTO>(`${this.ruta_servidor}/padres/${id}`);
  }
  newPadre(data: ADMINPadreDTO): Observable<ADMINPadreDTO> {
    return this.http.post<ADMINPadreDTO>(`${this.ruta_servidor}/padres`, data);
  }
  editPadre(id: number, data: ADMINPadreDTO): Observable<ADMINPadreDTO> {
    return this.http.put<ADMINPadreDTO>(`${this.ruta_servidor}/padres/${id}`, data);
  }
  deletePadre(id: number): Observable<ADMINPadreDTO> {
    return this.http.delete<ADMINPadreDTO>(`${this.ruta_servidor}/padres/${id}`);
  }

  // --- GESTIÓN DE PSICÓLOGOS (ADMIN) ---
  getAllPsicologos(): Observable<ADMINPsicologoDTO[]> {
    return this.http.get<ADMINPsicologoDTO[]>(`${this.ruta_servidor}/psicologos`);
  }
  getPsicologoById(id: number): Observable<ADMINPsicologoDTO> {
    return this.http.get<ADMINPsicologoDTO>(`${this.ruta_servidor}/psicologos/${id}`);
  }
  newPsicologo(data: ADMINPsicologoDTO): Observable<ADMINPsicologoDTO> {
    return this.http.post<ADMINPsicologoDTO>(`${this.ruta_servidor}/psicologos`, data);
  }
  editPsicologo(id: number, data: ADMINPsicologoDTO): Observable<ADMINPsicologoDTO> {
    return this.http.put<ADMINPsicologoDTO>(`${this.ruta_servidor}/psicologos/${id}`, data);
  }
  deletePsicologo(id: number): Observable<ADMINPsicologoDTO> {
    return this.http.delete<ADMINPsicologoDTO>(`${this.ruta_servidor}/psicologos/${id}`);
  }

  // --- GESTIÓN DE ASIGNACIONES (ADMIN) ---
  getAllAsignaciones(): Observable<ADMINAsignacionDTO[]> {
    return this.http.get<ADMINAsignacionDTO[]>(`${this.ruta_servidor}/asignaciones`);
  }
  newAsignacion(data: ADMINAsignacionDTO): Observable<ADMINAsignacionDTO> {
    return this.http.post<ADMINAsignacionDTO>(`${this.ruta_servidor}/asignaciones`, data);
  }
  editAsignacion(id: number, data: ADMINAsignacionDTO): Observable<ADMINAsignacionDTO> {
    return this.http.put<ADMINAsignacionDTO>(`${this.ruta_servidor}/asignaciones/${id}`, data);
  }
  // Finalizar Asignación (Archivado - Preserva historial clínico)
  finalizarAsignacion(id: number): Observable<ADMINAsignacionDTO> {
    return this.http.patch<ADMINAsignacionDTO>(`${this.ruta_servidor}/asignaciones/${id}/finalizar`, {});
  }

  /**
   * @deprecated Este método ha sido reemplazado por finalizarAsignacion.
   * Use finalizarAsignacion() en su lugar para preservar el historial clínico.
   */
  deleteAsignacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.ruta_servidor}/asignaciones/${id}`);
  }

  // --- GESTIÓN DE RECURSOS (ADMIN) ---
  getAllRecursos(): Observable<ADMINRecursoEducativoDTO[]> {
    return this.http.get<ADMINRecursoEducativoDTO[]>(`${this.ruta_servidor}/recursos`);
  }
  newRecurso(data: ADMINRecursoEducativoDTO): Observable<ADMINRecursoEducativoDTO> {
    return this.http.post<ADMINRecursoEducativoDTO>(`${this.ruta_servidor}/recursos`, data);
  }
  getRecursoById(id: number): Observable<ADMINRecursoEducativoDTO> {
    return this.http.get<ADMINRecursoEducativoDTO>(`${this.ruta_servidor}/recursos/${id}`);
  }
  editRecurso(id: number, data: ADMINRecursoEducativoDTO): Observable<ADMINRecursoEducativoDTO> {
    return this.http.put<ADMINRecursoEducativoDTO>(`${this.ruta_servidor}/recursos/${id}`, data);
  }
  deleteRecurso(id: number): Observable<any> {
    return this.http.delete<any>(`${this.ruta_servidor}/recursos/${id}`);
  }

  // --- OBTENER MENORES POR PADRE ID (PARA ASIGNACIONES) ---
  getMenoresByPadreId(padreId: number): Observable<PADREMenorDTO[]> {
    return this.http.get<PADREMenorDTO[]>(`${this.ruta_servidor}/padres/${padreId}/menores`);
  }

  // --- MONITOREO DE CITAS (ADMIN) ---
  getAllCitas(): Observable<ADMINCitaListDTO[]> {
    return this.http.get<ADMINCitaListDTO[]>(`${this.ruta_servidor}/citas`);
  }

  // Cancelar cita (Admin - Emergencias)
  cancelarCita(id: number): Observable<ADMINCitaListDTO> {
    return this.http.patch<ADMINCitaListDTO>(`${this.ruta_servidor}/citas/${id}/cancelar`, {});
  }

  // --- MÉTRICAS DEL DASHBOARD (ADMIN) ---
  getDashboardMetrics(): Observable<DashboardMetricsDTO> {
    return this.http.get<DashboardMetricsDTO>(`${this.ruta_servidor}/metrics`);
  }

  // --- GESTIÓN DE EVALUACIONES (ADMIN) ---
  getAllEvaluaciones(): Observable<ADMINEvaluacionListDTO[]> {
    return this.http.get<ADMINEvaluacionListDTO[]>(`${this.ruta_servidor}/evaluaciones`);
  }

  deleteEvaluacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.ruta_servidor}/evaluaciones/${id}`);
  }
}
