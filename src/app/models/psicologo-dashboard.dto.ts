import { PSICOLOGOCitaResponseDTO } from './psicologo-cita-response.dto';

export interface PSICOLOGODashboardDTO {
  citasHoy: number;
  pacientesActivos: number;
  calificacionPromedio: number;
  totalEvaluaciones: number;
  listaCitasHoy: PSICOLOGOCitaResponseDTO[];
}

