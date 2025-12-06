import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { PADREMenorDTO } from '../models/padre-menor.dto';
import { PADRECitaRequestDTO } from '../models/padre-cita-request.dto';
import { PADRECitaResponseDTO } from '../models/padre-cita-response.dto';
import { PADRESolicitudCitaDTO } from '../models/padre-solicitud-cita.dto';
import { PADREPsicologoDTO } from '../models/padre-psicologo.dto';
import { DisponibilidadSlotDTO } from '../models/disponibilidad-slot.dto';
import { PADREInformeDTO } from '../models/padre-informe.dto';
import { PADREEvaluacionPsicologoDTO } from '../models/padre-evaluacion-psicologo.dto';
import { ADMINRecursoEducativoDTO } from '../models/admin-recurso-educativo.dto';
import { PADREFavoritoDTO } from '../models/padre-favorito.dto';
import { ADMINPadreDTO } from '../models/admin-padre.dto';
import { ADMINAsignacionDTO } from '../models/admin-asignacion.dto';

@Injectable({
  providedIn: 'root'
})
export class PadreService {

  ruta_servidor: string = "http://localhost:8080/api/padres";

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getPadreId(): number | null {
    return this.authService.getUserId();
  }

  // --- GESTIÓN DE PERFIL ---
  getMiPerfil(): Observable<ADMINPadreDTO> {
    const id = this.getPadreId();
    return this.http.get<ADMINPadreDTO>(`${this.ruta_servidor}/${id}/perfil`);
  }
  editMiPerfil(data: ADMINPadreDTO): Observable<ADMINPadreDTO> {
    const id = this.getPadreId();
    return this.http.put<ADMINPadreDTO>(`${this.ruta_servidor}/${id}/perfil`, data);
  }

  // --- GESTIÓN DE MENORES ---
  getMisMenores(): Observable<PADREMenorDTO[]> {
    const id = this.getPadreId();
    return this.http.get<PADREMenorDTO[]>(`${this.ruta_servidor}/${id}/menores`);
  }

  // NUEVO MÉTODO: Obtener menores para autoservicio de citas
  getMenoresDisponibles(): Observable<PADREMenorDTO[]> {
    const id = this.getPadreId();
    return this.http.get<PADREMenorDTO[]>(`${this.ruta_servidor}/${id}/menores-disponibles`);
  }

  // --- GESTIÓN DE ASIGNACIONES ---
  getMisAsignaciones(): Observable<ADMINAsignacionDTO[]> {
    const id = this.getPadreId();
    return this.http.get<ADMINAsignacionDTO[]>(`${this.ruta_servidor}/${id}/asignaciones`);
  }
  newMenor(data: PADREMenorDTO): Observable<PADREMenorDTO> {
    const id = this.getPadreId();
    data.padreId = id!;
    console.log('📤 POST /api/padres/' + id + '/menores');
    console.log('📦 Payload:', data);
    return this.http.post<PADREMenorDTO>(`${this.ruta_servidor}/${id}/menores`, data);
  }
  editMenor(menorId: number, data: PADREMenorDTO): Observable<PADREMenorDTO> {
    const id = this.getPadreId();
    return this.http.put<PADREMenorDTO>(`${this.ruta_servidor}/${id}/menores/${menorId}`, data);
  }
  deleteMenor(menorId: number): Observable<any> {
    const id = this.getPadreId();
    return this.http.delete<any>(`${this.ruta_servidor}/${id}/menores/${menorId}`);
  }

  // --- GESTIÓN DE CITAS ---
  getMisProximasCitas(): Observable<PADRECitaResponseDTO[]> {
    const id = this.getPadreId();
    return this.http.get<PADRECitaResponseDTO[]>(`${this.ruta_servidor}/${id}/citas/proximas`);
  }
  getMiHistorialCitas(): Observable<PADRECitaResponseDTO[]> {
    const id = this.getPadreId();
    return this.http.get<PADRECitaResponseDTO[]>(`${this.ruta_servidor}/${id}/citas/historial`);
  }
  solicitarCita(data: PADRECitaRequestDTO): Observable<PADRECitaResponseDTO> {
    const id = this.getPadreId();
    return this.http.post<PADRECitaResponseDTO>(`${this.ruta_servidor}/${id}/citas/solicitar`, data);
  }
  cancelarCita(citaId: number): Observable<PADRECitaResponseDTO> {
    const id = this.getPadreId();
    return this.http.delete<PADRECitaResponseDTO>(`${this.ruta_servidor}/${id}/citas/${citaId}`);
  }

  // NUEVOS MÉTODOS PARA AUTOSERVICIO DE CITAS

  // Obtener psicólogos disponibles (endpoint público)
  getPsicologosDisponibles(): Observable<PADREPsicologoDTO[]> {
    return this.http.get<PADREPsicologoDTO[]>('http://localhost:8080/api/public/psicologos');
  }

  // Solicitar cita directa (nuevo modelo autoservicio)
  solicitarCitaDirecta(data: PADRESolicitudCitaDTO): Observable<PADRECitaResponseDTO> {
    const id = this.getPadreId();
    console.log('📤 POST /api/padres/' + id + '/citas/solicitar-directa');
    console.log('📦 Payload:', data);
    return this.http.post<PADRECitaResponseDTO>(`${this.ruta_servidor}/${id}/citas/solicitar-directa`, data);
  }

  // NUEVO MÉTODO: Consultar disponibilidad de horarios
  getDisponibilidad(psicologoId: number, fecha: string): Observable<DisponibilidadSlotDTO> {
    console.log('📤 GET /api/public/disponibilidad - Psicólogo:', psicologoId, 'Fecha:', fecha);
    return this.http.get<DisponibilidadSlotDTO>(`http://localhost:8080/api/public/disponibilidad?psicologoId=${psicologoId}&fecha=${fecha}`);
  }

  // --- GESTIÓN DE PROGRESO Y EVALUACIONES ---
  getInformesDeMenor(menorId: number): Observable<PADREInformeDTO[]> {
    const id = this.getPadreId();
    // Endpoint centralizado: GET /api/informes/menor/{menorId}
    return this.http.get<PADREInformeDTO[]>(`http://localhost:8080/api/informes/menor/${menorId}`);
  }

  // NUEVO MÉTODO: Descargar informe PDF
  descargarInformePdf(informeId: number): Observable<Blob> {
    // Endpoint centralizado: GET /api/informes/{id}/pdf
    return this.http.get(`http://localhost:8080/api/informes/${informeId}/pdf`, { responseType: 'blob' });
  }

  // NUEVO MÉTODO: Obtener evaluación por cita
  getEvaluacionPorCita(citaId: number): Observable<PADREEvaluacionPsicologoDTO> {
    const id = this.getPadreId();
    return this.http.get<PADREEvaluacionPsicologoDTO>(`${this.ruta_servidor}/${id}/citas/${citaId}/evaluacion`);
  }

  getMisFavoritos(): Observable<ADMINRecursoEducativoDTO[]> {
    const id = this.getPadreId();
    return this.http.get<ADMINRecursoEducativoDTO[]>(`${this.ruta_servidor}/${id}/recursos/favoritos`);
  }

  marcarFavorito(recursoId: number): Observable<PADREFavoritoDTO> {
    const id = this.getPadreId();
    return this.http.post<PADREFavoritoDTO>(`${this.ruta_servidor}/${id}/recursos/${recursoId}/favorito`, {});
  }

  desmarcarFavorito(recursoId: number): Observable<any> {
    const id = this.getPadreId();
    return this.http.delete<any>(`${this.ruta_servidor}/${id}/recursos/${recursoId}/favorito`);
  }

  // Evaluar por Cita
  evaluarPsicologoPorCita(citaId: number, data: PADREEvaluacionPsicologoDTO): Observable<PADREEvaluacionPsicologoDTO> {
    const id = this.getPadreId();
    // Asegúrate de enviar el padreId en el body si el backend lo requiere
    data.padreId = id!;
    return this.http.post<PADREEvaluacionPsicologoDTO>(`${this.ruta_servidor}/${id}/citas/${citaId}/evaluar`, data);
  }

  // Buscar Recursos
  buscarRecursos(termino: string): Observable<ADMINRecursoEducativoDTO[]> {
    const id = this.getPadreId();
    return this.http.get<ADMINRecursoEducativoDTO[]>(`${this.ruta_servidor}/${id}/recursos/buscar?termino=${termino}`);
  }

}