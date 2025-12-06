import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { ADMINPsicologoDTO } from '../models/admin-psicologo.dto';
import { ADMINAsignacionDTO } from '../models/admin-asignacion.dto';
import { PSICOLOGODisponibilidadDTO } from '../models/psicologo-disponibilidad.dto';
import { PSICOLOGOCitaResponseDTO } from '../models/psicologo-cita-response.dto';
import { PSICOLOGOInformeDTO } from '../models/psicologo-informe.dto';
import { PSICOLOGOProgresoMenorDTO } from '../models/psicologo-progreso-menor.dto';
import { PSICOLOGODashboardDTO } from '../models/psicologo-dashboard.dto';
import { PSICOLOGOEvaluacionDTO } from '../models/psicologo-evaluacion.dto';

@Injectable({
  providedIn: 'root'
})
export class PsicologoService {

  ruta_servidor: string = "https://neurokid-api-v2.onrender.com/api/psicologos";

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getPsicologoId(): number | null {
    return this.authService.getUserId();
  }

  // --- GESTIÓN DE DASHBOARD ---
  getDashboardMetrics(): Observable<PSICOLOGODashboardDTO> {
    const id = this.getPsicologoId();
    return this.http.get<PSICOLOGODashboardDTO>(`${this.ruta_servidor}/${id}/dashboard`);
  }

  // --- GESTIÓN DE PERFIL ---
  getMiPerfil(): Observable<ADMINPsicologoDTO> {
    const id = this.getPsicologoId();
    return this.http.get<ADMINPsicologoDTO>(`${this.ruta_servidor}/${id}/perfil`);
  }
  editMiPerfil(data: ADMINPsicologoDTO): Observable<ADMINPsicologoDTO> {
    const id = this.getPsicologoId();
    return this.http.put<ADMINPsicologoDTO>(`${this.ruta_servidor}/${id}/perfil`, data);
  }

  // --- GESTIÓN DE DISPONIBILIDAD ---
  getMiDisponibilidad(): Observable<PSICOLOGODisponibilidadDTO[]> {
    const id = this.getPsicologoId();
    return this.http.get<PSICOLOGODisponibilidadDTO[]>(`${this.ruta_servidor}/${id}/disponibilidad`);
  }
  newDisponibilidad(data: PSICOLOGODisponibilidadDTO): Observable<PSICOLOGODisponibilidadDTO> {
    const id = this.getPsicologoId();
    data.psicologoId = id!;
    return this.http.post<PSICOLOGODisponibilidadDTO>(`${this.ruta_servidor}/${id}/disponibilidad`, data);
  }
  updateDisponibilidad(disponibilidadId: number, data: PSICOLOGODisponibilidadDTO): Observable<PSICOLOGODisponibilidadDTO> {
    const id = this.getPsicologoId();
    data.psicologoId = id!;
    data.disponibilidadId = disponibilidadId;
    // El backend usa PUT para actualizar específicamente por ID
    return this.http.put<PSICOLOGODisponibilidadDTO>(`${this.ruta_servidor}/${id}/disponibilidad/${disponibilidadId}`, data);
  }
  deleteDisponibilidad(disponibilidadId: number): Observable<any> {
    const id = this.getPsicologoId();
    return this.http.delete<any>(`${this.ruta_servidor}/${id}/disponibilidad/${disponibilidadId}`);
  }

  // --- GESTIÓN DE CITAS ---
  getMisProximasCitas(): Observable<PSICOLOGOCitaResponseDTO[]> {
    const id = this.getPsicologoId();
    return this.http.get<PSICOLOGOCitaResponseDTO[]>(`${this.ruta_servidor}/${id}/citas/proximas`);
  }
  getMiHistorialCitas(): Observable<PSICOLOGOCitaResponseDTO[]> {
    const id = this.getPsicologoId();
    return this.http.get<PSICOLOGOCitaResponseDTO[]>(`${this.ruta_servidor}/${id}/citas/historial`);
  }
  cambiarEstadoCita(citaId: number, estado: string): Observable<PSICOLOGOCitaResponseDTO> {
    const id = this.getPsicologoId();
    return this.http.patch<PSICOLOGOCitaResponseDTO>(`${this.ruta_servidor}/${id}/citas/${citaId}/estado?estado=${estado}`, {});
  }
  finalizarCita(citaId: number, data: any): Observable<PSICOLOGOCitaResponseDTO> {
    const id = this.getPsicologoId();
    return this.http.patch<PSICOLOGOCitaResponseDTO>(`${this.ruta_servidor}/${id}/citas/${citaId}/finalizar`, data);
  }

  // --- GESTIÓN DE ASIGNACIONES ---
  getMisAsignaciones(): Observable<ADMINAsignacionDTO[]> {
    const id = this.getPsicologoId();
    return this.http.get<ADMINAsignacionDTO[]>(`${this.ruta_servidor}/${id}/asignaciones`);
  }

  // Dar de Alta Médica (Finalizar asignación)
  darDeAlta(asignacionId: number): Observable<ADMINAsignacionDTO> {
    const id = this.getPsicologoId();
    return this.http.patch<ADMINAsignacionDTO>(`${this.ruta_servidor}/${id}/asignaciones/${asignacionId}/alta`, {});
  }

  // --- GESTIÓN DE INFORMES Y PROGRESO ---
  crearInforme(asignacionId: number, data: PSICOLOGOInformeDTO): Observable<PSICOLOGOInformeDTO> {
    const id = this.getPsicologoId();
    data.asignacionId = asignacionId; // Asegurar que el ID de asignación esté en el DTO
    // Endpoint centralizado: POST /api/informes
    return this.http.post<PSICOLOGOInformeDTO>(`http://localhost:8080/api/informes`, data);
  }

  getInformesPorAsignacion(asignacionId: number): Observable<PSICOLOGOInformeDTO[]> {
    const id = this.getPsicologoId();
    // Endpoint centralizado: GET /api/informes/asignacion/{asignacionId}
    return this.http.get<PSICOLOGOInformeDTO[]>(`http://localhost:8080/api/informes/asignacion/${asignacionId}`);
  }

  getProgresoMenor(menorId: number): Observable<PSICOLOGOProgresoMenorDTO> {
    const id = this.getPsicologoId();
    return this.http.get<PSICOLOGOProgresoMenorDTO>(`${this.ruta_servidor}/${id}/menores/${menorId}/progreso`);
  }

  // Descargar PDF de informe
  descargarInformePdf(informeId: number): Observable<Blob> {
    // Endpoint centralizado: GET /api/informes/{id}/pdf
    return this.http.get(`http://localhost:8080/api/informes/${informeId}/pdf`, {
      responseType: 'blob'
    });
  }
  // --- GESTIÓN DE EVALUACIONES ---
  getMisEvaluaciones(): Observable<PSICOLOGOEvaluacionDTO[]> {
    const id = this.getPsicologoId();
    return this.http.get<PSICOLOGOEvaluacionDTO[]>(`${this.ruta_servidor}/${id}/evaluaciones`);
  }
}
